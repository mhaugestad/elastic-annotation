from fastapi import APIRouter, Depends, HTTPException, status, FastAPI, File, UploadFile, Header
import typing as t
from app.elastic.session import get_cluster_by_user, get_cluster_by_key
from app.elastic.schemas import (Space, IndexPattern)
import os
import requests, base64
from requests.auth import HTTPBasicAuth
import base64

spacesrouter = r = APIRouter()

def get_kibana_headers(api_key_id, api_key):
    userpass = api_key_id + ':' + api_key
    encoded_u = base64.b64encode(userpass.encode()).decode()
    headers = {"Authorization" : "ApiKey %s" % encoded_u}
    return headers

@r.get("/spaces", response_model=t.List[Space])
async def get_spaces(api_key: str = Header(None), api_key_id: str = Header(None)) -> t.List[Space]:
    headers = get_kibana_headers(api_key_id, api_key)
    resp = requests.get(os.environ['KIBANA_URL'] + "/api/spaces/space", 
                        headers=headers)   
    output = resp.json()
    return output

# Get indices associated with space
@r.get("/spaces/index-patterns", response_model=t.List[IndexPattern])
async def get_index_patterns(space_id: str, api_key: str = Header(None), api_key_id: str = Header(None)) -> t.List[IndexPattern]:
    headers = get_kibana_headers(api_key_id, api_key)
    resp = requests.get(os.environ['KIBANA_URL'] + f"/s/{space_id}/api/saved_objects/_find",
                        params={'type':'index-pattern'},
                        headers=headers)
    index_patterns = list(map(lambda x: {'id': x.get('id'),
                                        'name': x.get('attributes').get('title')}, resp.json().get('saved_objects')))
    return index_patterns

# Get default index associated with space
@r.get("/spaces/default-index")
async def get_default_index(space_id: str, api_key: str = Header(None), api_key_id: str = Header(None)):
    headers = get_kibana_headers(api_key_id, api_key)
    resp = requests.get(os.environ['KIBANA_URL'] + f"/s/{space_id}/api/index_patterns/default",
                        headers=headers
        )
    resp = resp.json()
    output = {'id': resp.get('index_pattern_id'),
              'name': resp.get('index_pattern_id')}

    return output