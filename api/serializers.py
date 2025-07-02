from rest_framework import serializers
from django.contrib.auth.models import User, Permission
from .models import products,WatchedProduct, auto_email_settings,Role,purchase_orders, counter_sales,restock_orders,Profile,sale_items,restock_delivery


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','first_name','last_name']
        extra_kwargs = {"password":{"write_only":True}}

class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.SlugRelatedField(slug_field="name", queryset=Role.objects.all())
    class Meta:
        model = Profile
        fields = ['phone', 'role']

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

class productRestockSerializer(serializers.ModelSerializer):
    product_id = serializers.CharField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    product_code = serializers.CharField(source='product.product_code', read_only=True)
    class Meta:
        model = restock_orders
        fields = ['id','product','product_id','product_code', 'product_name','quantity','approved_by','approval_date']
        

class restockDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = restock_delivery
        fields = '__all__'

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.ListField(write_only=True, child=serializers.IntegerField(), required=False)

    class Meta:
        model = Role
        fields = ['id','name','permissions', 'permission_ids']

    def create(self, validated_data):
        permission_ids = validated_data.pop('permission_ids', [])
        role = Role.objects.create(**validated_data)
        role.permissions.set(permission_ids)  
        return role

class autoEmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = auto_email_settings
        fields = '__all__'

class watchProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = WatchedProduct
        fields = '__all__'