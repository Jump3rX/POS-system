from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import ProductsSerializer, UserSerializer,ProfileSerializer,UserProfileSerializer
from .models import products
# Create your views here.

@api_view(['GET'])
def index(request):

    url = {
        'product list':'api/products',
        'add new product':'api/add-product',
        'edit product':'api/edit-product/<id>',
        'delete product':'api/delete-product/<id>',
        'create employee/user': 'api/create-user',
        'view employees/users':'api/employees',
        'deactivate users':'api/deactivate-user/<id>',
    }

    return Response(url)


@api_view(['GET'])
def products_list(request):
    all_products = products.objects.all()
    product_list = ProductsSerializer(all_products,many=True)

    return Response(product_list.data)


@api_view(['POST'])
def add_product(request):
    save_data = ProductsSerializer(data=request.data)
    if save_data.is_valid():
        save_data.save()

    return Response(save_data.data)


@api_view(['POST'])
def edit_product(request,id):
    product = products.objects.get(id=id)
    product_data = ProductsSerializer(instance=product,data=request.data)
    if product_data.is_valid():
        product_data.save()
    return Response(product_data.data)

@api_view(['DELETE'])
def delete_product(request,id):
    product = products.objects.get(id=id)
    product.delete()

    return Response('Product Deleted!')


@api_view(['POST'])
def create_user(request):
    user_data = {
        'username':request.data.get('username'),
        'first_name':request.data.get('first_name'),
        'last_name':request.data.get('last_name'),
        'password':request.data.get('password'),
    }
    profile_data = {
        'phone':request.data.get('phone'),
        'role':request.data.get('role')
    }
    user_serializer = UserSerializer(data=user_data)
    if user_serializer.is_valid():
        user = user_serializer.save()
        user.set_password(user_data['password'])
        user.save()

        
        profile_serializer = ProfileSerializer(data = profile_data)
        if profile_serializer.is_valid():
            profile_serializer.save(user=user)
            return Response({
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile": {
                    "phone":user.profile.phone,
                    "role": user.profile.role
                }
            },status=status.HTTP_201_CREATED)
        else:
            return Response(profile_serializer.error, status=status.HTTP_400_BAD_REQUEST)
    else:
        user.delete()
        return Response(user_serializer.error, status=status.HTTP_400_BAD_REQUEST)
        

@api_view(['POST'])
def deactivate_user(request,id):
    user = User.objects.get(id=id)
    user.is_active = False
    user.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['GET'])
def employees(request):
    excluded = ['root','customer']
    employees = User.objects.exclude(profile__role__in = excluded).exclude(is_superuser=True).exclude(is_active=False)
    serializer = UserProfileSerializer(employees,many=True)
    return Response(serializer.data)

@api_view()
def edit_employee(request,id):
    
    pass