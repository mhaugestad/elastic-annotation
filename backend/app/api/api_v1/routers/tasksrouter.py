from fastapi import APIRouter
import typing as t
from app.worker.celery_app import celery_app
from app.elastic.schemas import TaskStatus

tasksrouter = r = APIRouter()

#@r.get("/tasks/{task_id}", response_model = TaskStatus)
#async def get_task_status(task_id: str) -> TaskStatus:
#    return {'task_id':result.task_id, 'status': result.status}
#    result = celery_app.AsyncResult(task_id, )

@r.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    result = celery_app.AsyncResult(task_id)
    output = {'task_id':result.task_id, 'status': result.state}
    if result.info:
        output.update(result.info)
    return output