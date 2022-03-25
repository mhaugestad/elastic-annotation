from app.worker.celery_app import celery_app
from app.worker.scraper import *
from elasticsearch.helpers import bulk, scan
from elasticsearch import Elasticsearch
import os
import spacy
from sklearn.decomposition import PCA
import numpy as np
import time
import hashlib
from urllib.parse import urlparse
import pandas as pd
import datetime
import ray
from elasticsearch.helpers import bulk
from app.worker.elastic_queries import *

def chunks(lst,n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

@celery_app.task(acks_late=True)
def create_topic_map_task(index_pattern, field, api_key_id, api_key) -> None:
    es = Elasticsearch(cloud_id=os.environ['ELASTIC_CLOUD_ID'], api_key = (api_key_id, api_key))
    ray.init(address= os.environ['RAY_ADDRESS'], runtime_env={"pip": ["umap-learn==0.5.1"]})

    mapping = {
        "properties": {
            "document_embeddings": {
            "type": "dense_vector",
            "dims": 300
            }
        }
        }
    es.indices.put_mapping(index=index_pattern, body=mapping)

    nlp = spacy.load("en_core_web_md")
    data = []
    for hit in scan(es, index=index_pattern, query=match_all):
        data.append(hit)
    
    texts = list(map(lambda x: x.get('_source').get(field), data))
    ids = list(map(lambda x: x.get('_id'), data))
        
    X = np.array([doc.vector for doc in nlp.pipe(texts)])

    #topic_coords = PCA(n_components=2).fit_transform(X)
    @ray.remote
    def get_topic_coords(ids, X):
        import umap
        from sklearn.neighbors import NearestNeighbors
        import numpy as np
        topic_coords = umap.UMAP(n_neighbors=50, 
                                 metric='cosine', 
                                 init='random', 
                                 min_dist=0.10, 
                                 random_state=3123123).fit_transform(X)

        nn = NearestNeighbors(n_neighbors=50, algorithm='ball_tree').fit(X)
        distances, indices = nn.kneighbors(X)
        density = -1 * np.mean(distances, axis=1)

        output = list(map(lambda x: 
                            {'_op_type': 'update',
                            '_index': index_pattern,
                            '_id': x[0],
                            'doc': {'topic_map': {
                                        'x': x[1][0],
                                        'y': x[1][1],
                                        'density': x[3]
                                    },
                                    'document_embeddings': x[2]
                                    }
                            },
                        list(zip(ids, topic_coords.tolist(), X.tolist(), density))))
        return output
    output = ray.get(get_topic_coords.remote(ids, X))
    ray.shutdown()
    bulk(es, output)
    es.update(index='projects', id=index_pattern, body={"doc":{"analysis": {"topic-map": datetime.datetime.now()}}})
    es.close()
    return None

@celery_app.task(acks_late=True)
def upload_meltwater_file(index_pattern, mwdict, api_key_id, api_key) -> None:
    es = Elasticsearch(cloud_id=os.environ['ELASTIC_CLOUD_ID'], api_key = (api_key_id, api_key))
    nlp = spacy.load("en_core_web_md")
    try:
        df = pd.DataFrame(mwdict)
        df['id'] = df.URL.apply(lambda x: hashlib.md5(x.encode('utf-8')).hexdigest())
        df['KeyPhrases'] = df.KeyPhrases.str.split(",")
        df['Keywords'] = df.Keywords.str.split(",")
        texts = df.apply(lambda x: x['HitSentence'] if x['Source']=='Twitter' else x['Headline'] + " " + x['OpeningText'],axis=1).tolist()
        df['document_embeddings'] = [doc.vector.tolist() for doc in nlp.pipe(texts)]
        docs = list(map(lambda x: {'_index': index_pattern, '_id': x.get('id'), 
                        '_source': {**{k:v for k,v in x.items() if k !='id'}}}, 
                        df.to_dict(orient='records')))       
        for chunk in chunks(docs,1000):
            bulk(es, chunk)
    except:
        pass
    finally:
        es.close()
        return None

@celery_app.task(acks_late=True,bind=True)
def scrape_urls_task(self, index_pattern, api_key_id, api_key) -> None:
    es = Elasticsearch(cloud_id=os.environ['ELASTIC_CLOUD_ID'], api_key = (api_key_id, api_key))
    
    data = []
    for hit in scan(es, index=index_pattern, query=all_urls):
        data.append(hit)

    df = pd.DataFrame(map(lambda x: x.get('_source') ,data))
    df['DOMAIN_URL'] = df.URL.apply(lambda x: urlparse(x).netloc)
    url_dicts = df.groupby('DOMAIN_URL', as_index=False).agg(URLS = ('URL', lambda x: list(x))).to_dict(orient='records')
    
    output =[]
    with concurrent.futures.ThreadPoolExecutor() as executor:
        total = url_dicts.__len__()
        i = 0
        # Start the load operations and mark each future with its URL
        future_to_url = {executor.submit(fetch_urls, url, index_pattern): url for url in url_dicts}
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            i += url.get('URLS').__len__()
            try:
                data = future.result()
                output.extend(data)
                self.update_state(state='PROGRESS', meta={'done': i, 'total': total})

            except Exception as exc:
                print('%r generated an exception: %s' % (url, exc))
                self.update_state(state='PROGRESS', meta={'done': i, 'total': total})
            else:
                self.update_state(state='PROGRESS', meta={'done': i, 'total': total})
    
    for chunk in chunks(output,1000):
        bulk(es, chunk)
    
    return None


@celery_app.task(acks_late=True)
def dummy_task() -> None:
    ray.init(address= os.environ['RAY_ADDRESS'], runtime_env={"pip": ["umap-learn==0.5.1", "numpy"]})

    @ray.remote
    def remote_chain_function():
        import umap
        import numpy as np
        umap_model = umap.UMAP()
        data = np.random.uniform(size = 120).reshape(-1, 6)
        embs = umap_model.fit_transform(data)
        return embs.tolist()
    to = ray.get(remote_chain_function.remote())
    ray.shutdown()
    time.sleep(10)
    return to