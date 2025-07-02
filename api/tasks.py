# your_app/tasks.py
from celery import shared_task
from django.test import RequestFactory
from django.contrib.auth.models import User
from .views import auto_send_email

@shared_task
def send_low_stock_email_task():
    factory = RequestFactory()
    users = User.objects.filter(low_stock_email_settings__auto_send=True)
    for user in users:
        request = factory.get('/api/send-email')
        request.user = user  # Attach the user to the request
        auto_send_email(request)