from django_cron import CronJobBase, Schedule
from django.test import RequestFactory
from django.contrib.auth.models import User
from .views import auto_send_email
from .models import auto_email_settings

class SendLowStockEmailCronJob(CronJobBase):
    #RUN_AT_TIMES = ['*']  # 5 PM daily
    schedule = Schedule(run_every_mins=1)
    code = 'api.auto_send_email'  # Unique identifier

    def do(self):
        try:
            print("Cron job started")
            factory = RequestFactory()
            emails = auto_email_settings.objects.filter(auto_send=True)
            if not emails.exists():
                print("No users with auto_send enabled")
                return
            for email in emails:
                request = factory.get('api/auto-send-mail')  # Match your URL
                # request.user = user
                auto_send_email(request)
                print(f"Email sent!")
        except Exception as e:
            print(f"Error in cron job: {str(e)}")
            raise  # Re-raise to ensure django-cron logs it