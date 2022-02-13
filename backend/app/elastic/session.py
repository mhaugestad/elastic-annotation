from elasticsearch import Elasticsearch
import os
from fastapi import Header
import typing as t
from app.elastic.schemas import User, Token, Authenticated, ApiKey

def get_cluster_by_user(user: User):
    try:
        es = Elasticsearch(hosts=os.environ['ELASTIC_URL'], http_auth = (user.username, user.password))
        yield es
    finally:
        es.close()

def get_cluster_by_key(api_key_id= Header(None), api_key= Header(None)):
    try:
        es = Elasticsearch(hosts=os.environ['ELASTIC_URL'], api_key = (api_key_id, api_key))
        yield es
    finally:
        es.close()