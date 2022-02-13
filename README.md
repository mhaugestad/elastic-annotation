# elastic-annotation
PoC to build a full-stack text-annotation app powered by elasticsearch. 

# Core Stack
* Elasticsearch as backend database
* FastAPI as interface between database and frontend
* React as frontend

# Additional services
* Nginx - Reverse proxy to get api and frontend router on the same port
* Celery - For background tasks
* Flower - To monitor the background tasks
