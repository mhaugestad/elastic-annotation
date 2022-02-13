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

class Project(BaseModel):
    project_name: str
    description: str
    labels: t.Optional[t.List[str]]
    
class ProjectCreate(Project):
    description: str

class ProjectUpdate(Project):
    description: str
    labels: t.List[str]

class Mapping(BaseModel):
    mapping: t.Optional[t.Dict[str, str]]

class Query(BaseModel):
    query: t.Optional[str]

class Annotation(BaseModel):
    id: str
    annotations: t.Dict[str, bool]

class Annotations(BaseModel):
    annotations: t.List[Annotation]
