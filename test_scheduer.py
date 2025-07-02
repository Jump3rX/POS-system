import os
import django
import time
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'POS.settings')
django.setup()

from api.utils.auto_emailer import auto_send_email

def run_every(interval_seconds):
    while True:
        print(f"[{datetime.now()}] Running auto_send_email...")
        auto_send_email()
        print(f"[{datetime.now()}] Sleeping for {interval_seconds} seconds...\n")
        time.sleep(interval_seconds)

if __name__ == '__main__':
    run_every(120)  # Change to 86400 for daily
