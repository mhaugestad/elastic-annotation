from fastapi import APIRouter, Depends, HTTPException, status, FastAPI, File, UploadFile
import io
import ast
import typing as t
from app.elastic.session import get_cluster_by_user, get_cluster_by_key
from elasticsearch.helpers import bulk
import elasticsearch

from app.elastic.schemas import (User, Token, Authenticated, ApiKey, 
                                Project, ProjectCreate, ProjectUpdate, Mapping, 
                                Query, Annotation, Annotations)

documentsrouter = r = APIRouter()

@r.post("/project/{project_id}/documents/")
async def get_documents(project_id, page:int =0, size: int = 10, query:Query = None, es=Depends(get_cluster_by_key)):
    if query:
        if query.query:
            q = {
                    "query": {
                        "query_string": {
                        "query": str(query.query),
                        }
                    }
                }
        else:
            q = {
            "query": {
                "match_all": {}
            }
        }
    
    else:
        q = {
            "query": {
                "match_all": {}
            }
        }
    
    try:
        results = es.search(
                    index=project_id, 
                    body = q, 
                    sort=['_id:asc'],
                    params={'from':page*size, 'size':size})
    
    except elasticsearch.exceptions.RequestError:
        results = {'hits':[]}
    
    return results['hits']

@r.put("/project/{project_id}/annotations/{doc_id}")
async def update_annotation(project_id, doc_id, annotation: Annotation, es=Depends(get_cluster_by_key)):
    es.update(index=project_id, id=doc_id, body={"doc": {"annotations": annotation.annotations}})

@r.put("/project/{project_id}/annotations")
async def update_annotations(project_id, annotations: Annotations, es=Depends(get_cluster_by_key)):
    out = []
    for item in annotations.annotations:
        out.append(
                {
                '_op_type': 'update',
                '_index': project_id,
                '_id': item.id,
                'doc': {"annotations": item.annotations}
                }
            )
    upload = bulk(es, out)

@r.post("/project/{project_id}/annotations_by_query/")
async def create_annotations_by_query(project_id, field: str, value: str, query: Query, es=Depends(get_cluster_by_key)):
    
    painless_script = {
        "script": {
            "source": "if (ctx._source.annotations.containsKey(params.field)) {ctx._source.annotations[params.field]=params.val} else {ctx._source.annotations = [params.field:params.val]}",
            "lang": "painless",
            "params": {
                "val": ast.literal_eval(value.title()),
                "field": field
                        }
                    }
            }
    query = {
                    "query": {
                        "query_string": {
                        "query": str(query.query),
                        }
                    }
                }
    body = {
        **painless_script,
        **query
    }
    res = es.update_by_query(index=project_id, body=body)
    return res['updated']