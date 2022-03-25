from sqlite3 import Date
from urllib.error import URLError
from pydantic import BaseModel
import typing as t

class User(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    id: str
    api_key: str

class Authenticated(BaseModel):
    is_authenticated: bool

class ApiKey(BaseModel):
    id: str
    api_key: str

class Space(BaseModel):
    id: str
    name: str
    disabledFeatures: t.Optional[t.List[t.Union[str, None]]]

class IndexPattern(BaseModel):
    id: str
    name: str

class CreateIndexPattern(IndexPattern):
    id: str
    name: str
    space_id: str

class Labels(BaseModel):
    label: str
    value: str
    color: t.Optional[str]

class IndexLabels(BaseModel):
    index: str
    labels: t.List[Labels]

class TaskRegister(BaseModel):
    task_id: str
    index: str
    onSuccess: str
    onFailure: str

class TaskStatus(BaseModel):
    task_id: str
    status: str

class Mapping(BaseModel):
    mapping: t.Optional[t.Dict[str, str]]

class Query(BaseModel):
    query: t.Optional[str]
    document_id: t.Optional[str]

class Annotation(BaseModel):
    id: str
    annotations: t.Dict[str, bool]

class Annotations(BaseModel):
    annotations: t.List[Annotation]
