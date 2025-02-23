from rest_framework import serializers
from django.contrib.auth.models import User
from .models import products, purchase_orders, counter_sales,restock_orders,Profile,sale_items


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','first_name','last_name']
        extra_kwargs = {"password":{"write_only":True}}

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone','role']

class UserProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    class Meta:
        model = User
        fields = ['id','username','first_name','last_name','profile','is_active'] 

class ProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = products
        fields = '__all__'

class addSalesSerializer(serializers.ModelSerializer):
    class Meta:
        model =counter_sales
        fields = ['id','seller_id','total','payment_method','amount_tendered','change']

class addSaleItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = sale_items
        fields = '__all__'

class adminSalesViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = counter_sales
        fields = '__all__'