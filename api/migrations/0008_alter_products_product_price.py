# Generated by Django 4.0.4 on 2025-03-10 08:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_products_low_stock_level'),
    ]

    operations = [
        migrations.AlterField(
            model_name='products',
            name='product_price',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
    ]
