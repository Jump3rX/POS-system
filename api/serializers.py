from rest_framework import serializers
from .models import products, purchase_orders, counter_sales,restock_orders

class ProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = products
        fields = '__all__'