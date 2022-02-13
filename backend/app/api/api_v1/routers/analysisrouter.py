from fastapi import APIRouter, Depends, HTTPException, status, FastAPI,Header
import typing as t
import celery
from app.elastic.session import get_cluster_by_user, get_cluster_by_key
from app.tasks import create_topic_map_task
from elasticsearch.helpers import bulk
import elasticsearch

from app.elastic.schemas import (User, Token, Authenticated, ApiKey, 
                                Project, ProjectCreate, ProjectUpdate, Mapping, 
                                Query, Annotation, Annotations)

analysisrouter = r = APIRouter()

@r.post("/project/{project_id}/topic_map")
async def create_topic_map(project_id, api_key_id: str = Header(None), api_key:str = Header(None)):
    task = create_topic_map_task.delay(project_id, field='text', api_key_id=api_key_id, api_key=api_key)
    return {'task_id': task.id}

@r.get("/project/{project_id}/topic_map/{task_id}")
async def create_topic_map(project_id, task_id):
    result = celery.result.AsyncResult(task_id)
    return {'task_id':result.task_id, 'status': result.status}