# your_project/celery.py
from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'POS.settings')
app = Celery('POS')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()