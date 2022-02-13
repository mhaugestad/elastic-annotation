from app.worker.celery_app import celery_app
from elasticsearch.helpers import bulk
from elasticsearch import Elasticsearch
import os
import spacy
from sklearn.decomposition import PCA
import numpy as np

q = {
    "query": {
        "match_all": {}
        }
    }

@celery_app.task(acks_late=True)
def create_topic_map_task(project_id, field, api_key_id, api_key) -> None:
    es = Elasticsearch(hosts=os.environ['ELASTIC_URL'], api_key = (api_key_id, api_key))
    nlp = spacy.load("en_core_web_sm")
    data = es.search(index=project_id, body=q, params={'size':8000})
    texts = list(map(lambda x: x.get('_source').get(field), data['hits']['hits']))
    ids = list(map(lambda x: x.get('_id'), data['hits']['hits']))
    
    X = np.array([doc.vector for doc in nlp.pipe(texts)])
    topic_coords = PCA(n_components=2).fit_transform(X)

    output = list(map(lambda x: 
                    {'_op_type': 'update',
                    '_index': project_id,
                    '_id': x[0],
                    'doc': {'topic_map': {
                                 'x': x[1][0],
                                 'y': x[1][1],
                                 'density': np.random.lognormal()
                             }
                            }
                    },
                  list(zip(ids, topic_coords.tolist()))))
    bulk(es, output)
    return None