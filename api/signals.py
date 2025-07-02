from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import AutoEmailSettings
from django_celery_beat.models import PeriodicTask, CrontabSchedule

@receiver(post_save, sender=AutoEmailSettings)
def update_email_schedule(sender, instance, created, **kwargs):
    task_name = 'send_low_stock_email_task'
    # Schedule to run at 5 PM (17:00) every day
    schedule, _ = CrontabSchedule.objects.get_or_create(
        minute='*',         # Minute 0
        hour='*',          # Hour 17 (5 PM in 24-hour format)
        day_of_week='*',    # Every day of the week
        day_of_month='*',   # Every day of the month
        month_of_year='*'   # Every month
    )
    
    PeriodicTask.objects.update_or_create(
        name=task_name,
        defaults={
            'crontab': schedule,
            'task': 'your_app.tasks.send_low_stock_email_task',
            'enabled': AutoEmailSettings.objects.filter(auto_send=True).exists(),
        }
    )