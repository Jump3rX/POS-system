# Generated by Django 4.0.4 on 2025-03-12 07:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_alter_products_product_price'),
    ]

    operations = [
        migrations.AlterField(
            model_name='restock_orders',
            name='status',
            field=models.CharField(default='pending', max_length=100),
        ),
    ]
