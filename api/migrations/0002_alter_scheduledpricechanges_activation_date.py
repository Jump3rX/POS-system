# Generated by Django 4.0.4 on 2025-07-07 11:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scheduledpricechanges',
            name='activation_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
