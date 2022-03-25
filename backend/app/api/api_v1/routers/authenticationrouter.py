from fastapi import APIRouter, Depends, HTTPException, status
import typing as t
from app.elastic.session import get_cluster_by_user, get_cluster_by_key
from app.elastic.schemas import (User, Token, Authenticated, ApiKey)

authenticationrouter = r = APIRouter()

@r.post("/token", response_model=Token)
async def login(user: User, es=Depends(get_cluster_by_user))-> dict:
    try:
        token = es.security.create_api_key(body={'name':user.username, 'expiration':'1d'})
        api_key = token.get('api_key')
        api_key_id = token.get('id')
        return {"id": api_key_id, "api_key": api_key}
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

@r.get("/authenticate", response_model=Authenticated)
async def authenticate(es=Depends(get_cluster_by_key))->dict:
    try:
        resp = es.security.authenticate()
        return {'is_authenticated': True}
    except:
        return {'is_authenticated': False}