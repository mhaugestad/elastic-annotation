from fastapi import APIRouter, Depends, HTTPException, status, FastAPI, File, UploadFile
import io
import ast
import typing as t
from app.elastic.session import get_cluster_by_user, get_cluster_by_key
from elasticsearch.helpers import bulk, scan
import elasticsearch

from app.elastic.schemas import (User, Token, Authenticated, ApiKey, 
                                 Mapping, 
                                Query, Annotation, Annotations)

documentsrouter = r = APIRouter()

@r.post("/documents")
async def get_documents(index_pattern:str, page:int =0, size: int = 10, query:Query = None, es=Depends(get_cluster_by_key)):
    
    q = {"query": {}}
    if all([query.query, query.document_id]):
        doc = es.get(index=index_pattern, id=query.document_id, _source_includes=['document_embeddings'])
        query_vector = doc.get('_source').get('document_embeddings')
        q['query'] = {"script_score": {"query": {"query_string": {"query": str(query.query)}},"script": {
                        "source": "cosineSimilarity(params.query_vector, 'document_embeddings') + 1.0",
                        "params": {"query_vector": query_vector}
                        }}}
        sorting = '_score:desc'

    elif all([(not query.query), query.document_id]):
        doc = es.get(index=index_pattern, id=query.document_id, _source_includes=['document_embeddings'])
        query_vector = doc.get('_source').get('document_embeddings')
        q['query'] = {"script_score": {"query": {"match_all": {}},"script": {
                        "source": "cosineSimilarity(params.query_vector, 'document_embeddings') + 1.0",
                        "params": {"query_vector": query_vector}
                        }}}
        sorting = '_score:desc'

    elif all([query.query, (not query.document_id)]):
        q['query'] = {"query_string": {"query": str(query.query)}}
        sorting = '_id:asc'
    elif all([(not query.query),(not query.document_id)]):
        q['query'] = {"match_all": {}}
        sorting = '_id:asc'
    else:
        q['query'] = {"match_all": {}}
        sorting =  '_id:asc'
    
    try:
        results = es.search(
                    index=index_pattern, 
                    body = q, 
                    sort=[sorting],
                    params={'from':page*size, 'size':size})
    
    except elasticsearch.exceptions.RequestError as e:
        results = {'hits':[]}
    
    return results['hits']

@r.post("/documents/all")
async def get_all_documents(index_pattern: str, query:Query = None, es=Depends(get_cluster_by_key)):
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
    
    data = []
    for hit in scan(es, index=index_pattern, query=q):
        data.append(hit)
    return data


@r.put("/documents/annotate/{doc_id}")
async def update_annotation(index_pattern: str, doc_id: str, annotation: Annotation, es=Depends(get_cluster_by_key)):
    es.update(index=index_pattern, id=doc_id, body={"doc": {"annotations": annotation.annotations}})

@r.put("/documents/annotate")
async def update_annotations(index_pattern: str, annotations: Annotations, es=Depends(get_cluster_by_key)):
    out = []
    for item in annotations.annotations:
        out.append(
                {
                '_op_type': 'update',
                '_index': index_pattern,
                '_id': item.id,
                'doc': {"annotations": item.annotations}
                }
            )
    upload = bulk(es, out)

@r.post("/documents/annotate_by_query")
async def create_annotations_by_query(index_pattern: str, field: str, value: str, query: Query, es=Depends(get_cluster_by_key)):
    
    painless_script = {
          "script": {
            "source": "if (ctx._source.annotations==null) {ctx._source.annotations = [params.field:params.val]} else {ctx._source.annotations[params.field]=params.val}",
            "lang": "painless",
            "params": {
                "val": ast.literal_eval(value.title()),
                "field": field
                        }
                    }
            }
    es_query = {
                    "query": {
                        "query_string": {
                        "query": str(query.query),
                        }
                    }
                }
    body = {
        **painless_script,
        **es_query
    }

    try:
        res = es.update_by_query(index=index_pattern, body=body)
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.error)
    
    return res['updated']