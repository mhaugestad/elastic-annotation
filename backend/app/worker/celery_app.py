from celery import Celery

celery_app = Celery("worker", broker="redis://redis:6379/0", backend="redis://redis:6379/0")
celery_app.conf.task_routes = {"app.worker.tasks.*": "main-queue"}
celery_app.conf.worker_redirect_stdouts = False
