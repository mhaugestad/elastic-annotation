from fastapi import APIRouter, Depends, HTTPException, status, FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
import io
import ast
import typing as t
from app.elastic.session import get_cluster_by_user, get_cluster_by_key
import elasticsearch
from elasticsearch.helpers import bulk
import pandas as pd

from app.elastic.schemas import (User, Token, Authenticated, ApiKey, 
                                Project, ProjectCreate, ProjectUpdate, Mapping, 
                                Query, Annotation, Annotations)

projectsrouter = r = APIRouter()
# Projects
@r.post("/project")
async def create_project(project:Project, es=Depends(get_cluster_by_key)):
    es.create('projects', project.project_name, 
             body = {
                "project_name": project.project_name,
                "description": project.description
                })
    es.indices.create(index=project.project_name)
    return project

@r.get("/project", response_model=t.List[Project])
async def get_projects(es=Depends(get_cluster_by_key)) -> t.List[Project]:
    res = es.search(index="projects", body = {'size' : 100, 
                                                'query': {'match_all' : {}}
        })
    output = list(map(lambda x: x.get('_source'), res['hits']['hits']))
    return output

@r.delete("/project/{project_id}")
async def delete_project(project_id, es=Depends(get_cluster_by_key)):
    es.delete(index='projects', id=project_id)
    es.indices.delete(index=project_id)

@r.get("/project/{project_id}", response_model = Project)
async def get_project(project_id, es=Depends(get_cluster_by_key)):
    try:
        project = es.get(index='projects', id=project_id)
        return project['_source']
    except elasticsearch.exceptions.NotFoundError:
        raise HTTPException(status_code=404, detail="Item not found")
    
@r.put("/project/{project_id}", response_model = Project)
async def update_project(project:Project, project_id, es=Depends(get_cluster_by_key)):
    es.index(index='projects', body=project.dict(), id=project_id)
    return project

@r.get("/project/{project_id}/mapping")
async def get_mapping(project_id, es=Depends(get_cluster_by_key)):
    mapping = es.indices.get_mapping(index=project_id)
    return mapping[project_id].get('mappings', {'properties':[]}).get('properties')

@r.get("/project/{project_id}/labels")
async def get_labels(project_id, es=Depends(get_cluster_by_key)):
    resp = es.get('projects', id=project_id)
    return resp['_source'].get('labels')

@r.put("/project/{project_id}/labels")
async def update_labels(project_id, labels: t.List[str], es=Depends(get_cluster_by_key)):
    es.update(index='projects', id=project_id, body={"doc":{"labels":labels}})
    mapping = es.indices.put_mapping(index=project_id, 
    body={
        "properties":{
            "annotations": {
                "properties": {
                    lab:  { "type": "boolean" } for lab in labels
                }
            }
        }
    })
    return None

@r.put("/project/{project_id}/mapping", response_model = Mapping)
async def update_mapping(mapping:Mapping, project_id, es=Depends(get_cluster_by_key)):
    elastic_mapping = {
                        'text': { "type": "text"},
                       'keyword': { "type": "keyword"},
                       'date': {"type": "date"},
                       'integer': { "type": "integer" } ,
                       'float': {"type": "float"}
                      }
    data_mapping = dict(map(lambda item: (item[0], elastic_mapping[item[1]]), mapping.dict().get('mapping').items()))
    es.indices.put_mapping(index=project_id, body={"properties":data_mapping})
    return mapping

@r.post("/project/{project_id}/upload_csv")
async def upload_file(project_id, csv_files: t.List[UploadFile] = File(...), es=Depends(get_cluster_by_key)):
    for csv_file in csv_files:
        contents = await csv_file.read()
        tmp = pd.read_csv(io.BytesIO(contents)).fillna("")
        out = []
        for i, row in tmp.iterrows():
            out.append(
                    {
                    '_index': project_id,
                    '_source': row.to_dict()
                    }
            )
        upload = bulk(es, out)
    return upload

@r.get("/project/{project_id}/download_csv")
async def download_file(project_id, es=Depends(get_cluster_by_key)):
    resp = es.search(index=project_id, body={'query': {"match_all": {}}}, size=1000)
    data = list(map(lambda x: x.get('_source'), resp.get('hits').get('hits')))
    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index = False)
    response = StreamingResponse(iter([stream.getvalue()]),media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=export.csv"
    return response