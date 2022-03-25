from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
import uvicorn
import os

from app.api.api_v1.routers.authenticationrouter import authenticationrouter
from app.api.api_v1.routers.spacesrouter import spacesrouter
from app.api.api_v1.routers.indexrouter import indexrouter
from app.api.api_v1.routers.documentsrouter import documentsrouter
from app.api.api_v1.routers.tasksrouter import tasksrouter


app = FastAPI(
    title="Elastic Annotator", docs_url="/api/docs", openapi_url="/api"
)

origins = [
    os.environ['ELASTIC_CLOUD_ID'],
    os.environ['KIBANA_URL'],
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#@app.middleware("http")
#async def db_session_middleware(request: Request, call_next):
#    request.state.db = SessionLocal()
#    response = await call_next(request)
#    request.state.db.close()
#    return response


@app.get("/api/v1")
async def root():
    return {"message": "Hello World"}

# Routers
app.include_router(
    authenticationrouter,
    prefix="/api/v1",
    tags=["authentication"]
)

app.include_router(
    spacesrouter,
    prefix="/api/v1",
    tags=["spaces"]
)

app.include_router(
    indexrouter,
    prefix="/api/v1",
    tags=["indices"]
)

app.include_router(
    documentsrouter,
    prefix="/api/v1",
    tags=["documents"]
)

app.include_router(
    tasksrouter,
    prefix="/api/v1",
    tags=["tasks"]
)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", reload=True, port=8888)