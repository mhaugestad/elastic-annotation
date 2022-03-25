from app.api.api_v1.routers.spacesrouter import get_kibana_headers
from app.elastic.mappings import meltwater_mapping
from fastapi import APIRouter, Depends, HTTPException, FastAPI, File, UploadFile, Header
from fastapi.responses import StreamingResponse
import typing as t
from app.worker.tasks import *
import celery
from app.elastic.session import get_cluster_by_user, get_cluster_by_key
from app.elastic.schemas import (IndexPattern, CreateIndexPattern, TaskRegister, IndexLabels,
                                Query, Annotation, Annotations)
from app.elastic.dataframe_validation import validate_meltwater_data

import requests, json, os, io, ast
import elasticsearch
from elasticsearch.helpers import bulk
import pandas as pd


indexrouter = r = APIRouter()

@r.post("/index-patterns", response_model = IndexPattern)
async def create_index_pattern(index_pattern: CreateIndexPattern, api_key: str = Header(None), api_key_id: str = Header(None), es=Depends(get_cluster_by_key)) -> IndexPattern:
    headers = get_kibana_headers(api_key_id, api_key)
    headers['kbn-xsrf'] = 'reporting'
    # Get Meltwater mapping from elastic folder

    # Create index in elasticsearch
    try:
        es.indices.create(index=index_pattern.name, body=meltwater_mapping)
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.error)

    # Create index pattern in Kibana
    resp = requests.post(os.environ['KIBANA_URL'] + f"/s/{index_pattern.space_id}/api/index_patterns/index_pattern",
                        headers=headers,
                        json={"index_pattern": {
                                "title": index_pattern.name,
                                "timeFieldName": "Date",
                                }
                            })

    if resp.status_code !=200:
        raise HTTPException(status_code=resp.status_code, detail=json.loads(resp.text).get('message'))
    
    return {'id': index_pattern.id,'name': index_pattern.name}

@r.get("/index-patterns/labels", response_model=IndexLabels)
async def get_index_labels(index_pattern: str, es=Depends(get_cluster_by_key)) ->IndexLabels:
    try:
        resp = es.get(index='projects', id=index_pattern)
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.error)
    return {'index': index_pattern, 'labels': resp.get('_source').get('labels')}

@r.put("/index-patterns/labels", response_model=IndexLabels)
async def set_index_labels(index_labels: IndexLabels, es=Depends(get_cluster_by_key)) ->IndexLabels:
    if es.exists(index='projects', id=index_labels.index):
        es.update(index='projects', id=index_labels.index, body={'doc': {'labels': index_labels.dict().get('labels')}})
    else:
        es.index(index='projects', id=index_labels.index, body = {'labels': index_labels.dict().get('labels')})
    return index_labels

@r.post("/index-patterns/upload_data", response_model=t.List[TaskRegister])
async def upload_file(index_pattern: str, csv_files: t.List[UploadFile] = File(...), api_key_id: str = Header(None), api_key:str = Header(None)) -> t.List[TaskRegister]:
    tasks = []
    for csv_file in csv_files:
        try:
            contents = await csv_file.read()
            tmp = pd.read_csv(io.BytesIO(contents), encoding='utf-16', sep='\t').fillna("")
            tmp.columns = [col.replace(' ', '') for col in tmp.columns]
        except Exception as e:
            raise HTTPException(status_code=422, detail={'title': f'Failed to read {csv_file.filename}', 
                                                                    'color': 'danger' , 'text': 'Failed to read the csv file. Make sure it is a raw export from Meltwater!'})

        try:
            validate_meltwater_data(tmp)
            task = upload_meltwater_file.delay(index_pattern, tmp.to_dict(orient='records'), api_key_id, api_key)
            tasks.append({'task_id': task.id,
                          'index': index_pattern,
                          'onSuccess': f'{csv_file.filename} sucessfully uploaded to index: {index_pattern}', 
                          'onFailure': f'Failed to upload {csv_file.filename} to index: {index_pattern}'})
        except Exception as e:
                raise HTTPException(status_code=422, detail=json.loads({'title': f'Failed to read {csv_file.filename}', 
                                                                    'color': 'danger' , 'text': 'Failed to read the csv file. Make sure it is a raw export from Meltwater!'}))
    return tasks

@r.post("/index-patterns/topic_map", response_model = TaskRegister)
async def create_topic_map(index_pattern:str, field: str, api_key_id: str = Header(None), api_key:str = Header(None)) -> TaskRegister:
    task = create_topic_map_task.delay(index_pattern, field, api_key_id=api_key_id, api_key=api_key)
    return {'task_id': task.id, 'index': index_pattern, 'onSuccess': f'Topic map has been created for {index_pattern}', 'onFailure': f'Failed to create topic map for {index_pattern}'}


@r.get("/index-patterns/download_csv")
async def download_file(index_pattern:str, es=Depends(get_cluster_by_key)):
    resp = es.search(index=index_pattern, body={'query': {"match_all": {}}}, size=1000)
    data = list(map(lambda x: x.get('_source'), resp.get('hits').get('hits')))
    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index = False)
    response = StreamingResponse(iter([stream.getvalue()]),media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=export.csv"
    return response

@r.post("/index-patterns/scrape_articletext", response_model = TaskRegister)
async def scrape_articletext(index_pattern:str, api_key_id: str = Header(None), api_key:str = Header(None)) -> TaskRegister:
    print(api_key_id)
    task = scrape_urls_task.delay(index_pattern, api_key_id, api_key)
    return {'task_id': task.id, 'index': index_pattern, 'onSuccess': f'Article text has been scraped on index: {index_pattern}', 'onFailure': f'Failed to scrape articles for {index_pattern}'}


@r.get("/index-patterns/dummy_task")
async def dummy(es=Depends(get_cluster_by_key)):
    task = dummy_task.delay()
    return {'task_id': task.id}