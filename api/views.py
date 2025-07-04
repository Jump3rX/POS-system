from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User,Permission
from django.contrib.auth import authenticate
from django.utils.timezone import timedelta,now
from django.utils import timezone
from django.db.models import Sum,Value,F,DateField,ExpressionWrapper, FloatField
from django.db.models.functions import Concat,TruncDate
from django.shortcuts import get_object_or_404
from django.db import models
from datetime import datetime
from decimal import Decimal, InvalidOperation
import io
from django.core.mail import EmailMessage

from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import autoEmailSerializer,ProductsSerializer,UserSerializer,ProfileSerializer,RoleSerializer,PermissionSerializer,UserProfileSerializer, addSalesSerializer, addSaleItemsSerializer,adminSalesViewSerializer, productRestockSerializer,restockDeliverySerializer, watchProductSerializer
from .models import products,Profile,counter_sales,sale_items,restock_orders,Role, auto_email_settings,WatchedProduct
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import isManagerRole

from reportlab.lib.pagesizes import A4, landscape,letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle,SimpleDocTemplate, Paragraph,Spacer

from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
import pandas as pd
# Create your views here.

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['role'] = (user.profile.role.name).lower()
        # ...

        return token
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer



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
@permission_classes([IsAuthenticated])
def products_list(request):
    all_products = products.objects.all()
    product_list = ProductsSerializer(all_products,many=True)

    return Response(product_list.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated,isManagerRole])
def add_product(request):
    product_data = request.data.get('product')
    print(f"Product Data: {product_data}")
    if not product_data:
        return Response({'message': 'Product data required!!'}, status=status.HTTP_400_BAD_REQUEST)
    
    product_serializer = ProductsSerializer(data=product_data)
    if product_serializer.is_valid():
        product_serializer.save()
        return Response({'message': 'Product added successfully','product': product_serializer.data}, status=status.HTTP_201_CREATED)
    else:
        return Response({'message': f'Invalid product data: {product_serializer.errors}'}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated, isManagerRole])
def bulk_upload(request):
    if 'file' not in request.FILES:
        return Response({'message': "File not found"}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    try:
        df = pd.read_csv(file, dtype=str).fillna("-")
        df.columns = df.columns.str.strip()
        
        required_columns = {
            "product_code", "name", "category", "selling_price",
            "cost_price", "quantity", "low_stock_level",
            "expiry_date", "batch_number"
        }

        if not required_columns.issubset(df.columns):
            missing = required_columns - set(df.columns)
            return Response(
                {"error": f"CSV file is missing required columns: {missing}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        products_added = 0
        products_updated = 0
        skipped_rows = []

        for index, row in df.iterrows():
            try:
                product_code = row['product_code'].strip()
                if not product_code.isdigit():
                    raise ValueError("Invalid product_code")

                product_code = int(product_code)
                name = row['name'].strip() or "-"
                category = row['category'].strip() or "-"
                batch_number = row['batch_number'].strip() or None

                # Parse prices and quantity safely
                try:
                    selling_price = Decimal(str(row['selling_price']).replace(',', '').strip())
                except:
                    selling_price = Decimal('0.00')

                try:
                    cost_price = Decimal(str(row['cost_price']).replace(',', '').strip())
                except:
                    cost_price = Decimal('0.00')

                try:
                    quantity = int(row['quantity']) if row['quantity'].isdigit() else 0
                except:
                    quantity = 0

                try:
                    low_stock_level = int(row['low_stock_level']) if row['low_stock_level'].isdigit() else 0
                except:
                    low_stock_level = 0

                # Parse expiry date
                expiry_date = None
                expiry_str = row.get('expiry_date', '').strip()
                if expiry_str and expiry_str != "-" and expiry_str.lower() != 'nan':
                    try:
                        expiry_date = datetime.strptime(expiry_str, '%Y-%m-%d').date()
                    except ValueError:
                        expiry_date = None  # fallback

                # Create or update product
                product, created = products.objects.update_or_create(
                    product_code=product_code,
                    defaults={
                        'product_name': name,
                        'product_category': category,
                        'selling_price': selling_price,
                        'cost_price': cost_price,
                        'quantity': quantity,
                        'low_stock_level': low_stock_level,
                        'expiry_date': expiry_date,
                        'batch_number': batch_number
                    }
                )
                if created:
                    products_added += 1
                else:
                    products_updated += 1

            except Exception as e:
                print(f"Row {index}: Skipped due to error: {e}")
                skipped_rows.append(index)
                continue

        return Response({
            "message": f"Successfully added {products_added} new products, updated {products_updated} products.",
            "skipped_rows": skipped_rows or "None"
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": f"Failed to process CSV file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_data(request):
    total = products.objects.all().count()
    low_stock = products.objects.filter(quantity__lte=models.F('low_stock_level')).count()
    low_stock_products = products.objects.filter(
        quantity__lte=F('low_stock_level')
    ).exclude(
        id__in=restock_orders.objects.filter(status='pending').values_list('product_id', flat=True)
    )

    pending_restock = products.objects.filter(quantity__lte=models.F('low_stock_level')).count()
    serialized_products = ProductsSerializer(low_stock_products,many=True).data

    data = {
        'total_stock':total,
        'low_stock':low_stock,
        'low_stock_products':serialized_products,
        'pending_restock':pending_restock,
    }

    return Response(data,status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def product_restock(request):
    if request.method == 'POST':
        try:
            product_instance = products.objects.get(id = request.data.get('product_id'))
        except product_instance.DoesNotExist:
            return Response({'message': 'Invalid product ID'}, status=status.HTTP_400_BAD_REQUEST)
        restock_data = {
            'product':product_instance.id,
            'quantity': request.data.get('quantity'),
            'approved_by':request.user.id
        }
        existing_request = restock_orders.objects.filter(product=product_instance, status="pending").first()
        if existing_request:
            return Response({'message': 'A pending restock request already exists for this product.'}, status=status.HTTP_400_BAD_REQUEST)

        data = productRestockSerializer(data = restock_data)
        if data.is_valid():
            data.save()
            print("data saved")
            return Response({'message':'Restock Order Placed!','data':data.data},status=status.HTTP_200_OK)
        else:
            print(f"Error:${data.errors}")
            return Response({'message':'Error','data':data.errors},status=status.HTTP_400_BAD_REQUEST)

    else:
        print("Bad request")
        return Response({'message':'Invalid request'},status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_restock_products(request):
    products = restock_orders.objects.filter(status='pending')
    serializer = productRestockSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def confirm_delivery(request):
    if request.method == 'POST':
        restock_order = restock_orders.objects.get(id=request.data.get("restock_order"))
        product = products.objects.get(id=request.data.get("product_id"))
        new_stock = int(request.data.get("quantity_delivered"))
        delivery_data = {
            "restock_order": restock_order.id,
            "expected_quantity": request.data.get("expected_quantity"),
            "quantity_delivered": request.data.get("quantity_delivered"),
            "delivery_status": request.data.get("delivery_status"),
            "receiver": request.user.id
        }
        serializer = restockDeliverySerializer(data = delivery_data)
        if serializer.is_valid():
            serializer.save()
            if restock_order.quantity == int(request.data.get("quantity_delivered")):
                restock_order.status = "delivered"
                restock_order.save()
            product.quantity += new_stock
            product.save() 
            return Response({"message": "Delivery confirmed", "data": serializer.data}, status=status.HTTP_200_OK)
        else:
            print(f"Error:{serializer.errors}")
            return Response({"message":"Error handling data", 'Error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def multi_confirm(request):
    if request.method == 'POST':
        data = request.data
        if not isinstance(data, list):
            return Response(
                {"error": "This endpoint expects a list of delivery items"},
                status=status.HTTP_400_BAD_REQUEST
            )

        results = []
        errors = []

        for item in data:
            try:
                # Fetch related objects
                restock_order = restock_orders.objects.get(id=item.get("restock_order"))
                product = products.objects.get(id=item.get("product_id"))

                # Prepare delivery data
                delivery_data = {
                    "restock_order": restock_order.id,
                    "expected_quantity": item.get("expected_quantity"),
                    "quantity_delivered": item.get("delivered_quantity"),  # Match frontend field name
                    "delivery_status": item.get("delivery_status"),
                    "receiver": request.user.id,
                }

                # Validate and save delivery data
                serializer = restockDeliverySerializer(data=delivery_data)
                if serializer.is_valid():
                    serializer.save()

                    # Update restock order status
                    quantity_delivered = int(item.get("delivered_quantity", 0))
                    if restock_order.quantity == quantity_delivered:
                        restock_order.status = "delivered"
                        restock_order.save()

                    # Update product stock
                    product.quantity += quantity_delivered
                    product.save()

                    # Add to results
                    results.append({"message": "Delivery confirmed", "data": serializer.data})
                else:
                    errors.append({"error": serializer.errors, "item": item})
            except restock_orders.DoesNotExist:
                errors.append({"error": f"Restock order {item.get('restock_order')} not found", "item": item})
            except products.DoesNotExist:
                errors.append({"error": f"Product {item.get('product_id')} not found", "item": item})
            except Exception as e:
                errors.append({"error": str(e), "item": item})

        # Return a single response after processing all items
        if errors:
            return Response(
                {"message": "Some deliveries failed", "results": results, "errors": errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            {"message": "All deliveries confirmed", "results": results},
            status=status.HTTP_200_OK
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated,isManagerRole])
def edit_product(request,id):
    product = products.objects.get(id=id)
    product_data = ProductsSerializer(instance=product,data=request.data)
    if product_data.is_valid():
        product_data.save()
    return Response(product_data.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated,isManagerRole])
def delete_product(request,id):
    product = products.objects.get(id=id)
    product.delete()

    return Response('Product Deleted!')

###############USER, ROLES & PERMISSIONS MANAGEMENT###############
@api_view(['POST'])
@permission_classes([IsAuthenticated,isManagerRole])
def create_user(request):
    user_data = {
        'username':request.data.get('username'),
        'first_name':request.data.get('first_name'),
        'last_name':request.data.get('last_name'),
        'password':request.data.get('password'),
    }
    role_id = request.data.get('role')
    role = get_object_or_404(Role, id=role_id) if role_id else None
    profile_data = {
        'phone':request.data.get('phone'),
        'role':role
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
                    "role": user.profile.role.name
                }
            },status=status.HTTP_201_CREATED)
        else:
            return Response(profile_serializer.error, status=status.HTTP_400_BAD_REQUEST)
    else:
        user.delete()
        return Response(user_serializer.error, status=status.HTTP_400_BAD_REQUEST)
        

@api_view(['POST'])
@permission_classes([IsAuthenticated,isManagerRole])
def deactivate_user(request,id):
    user = User.objects.get(id=id)
    user.is_active = False
    user.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated,isManagerRole])
def employees(request):
    excluded = ['root','customer']
    employees = User.objects.exclude(is_superuser=True).exclude(is_active=False)
    serializer = UserProfileSerializer(employees,many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated,isManagerRole])
def edit_employee(request,id):
    try:
        user = User.objects.get(id=id)
    except user.DoesNotExist:
        return Response({'error':'user not found'},status=status.HTTP_404_NOT_FOUND)
    
    try:
        profile = Profile.objects.get(user=user)
    except profile.DoesNotExist:
        print("Profile not found!")
    
    user_data = {
        'username':request.data.get('username'),
        'first_name':request.data.get('first_name'),
        'last_name':request.data.get('last_name')
    }
    user_serializer = UserSerializer(user,data=user_data,partial=True)
    if user_serializer.is_valid():
        user_serializer.save()
    else:
        return Response(user_serializer.error,status=status.HTTP_400_BAD_REQUEST)
    
    if profile:
        profile_data = {
            'phone':request.data.get('phone'),
            'role':request.data.get('role'),
        }
        profile_serializer = ProfileSerializer(profile,data=profile_data,partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
        else:
            return Response(profile_serializer.error,status=status.HTTP_400_BAD_REQUEST)
    else:
        profile_data = 'Profile not found'
    response_data = {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile": {
            "phone": profile_data['phone'] if profile_data else None,
            "role": profile_data['role'] if profile_data else None,
        } if profile_data else None,
    }
    
    return Response(response_data,status=status.HTTP_200_OK)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated, isManagerRole])
def manage_roles(request):
    if request.method == 'GET':
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_permissions(request):
    app_label = "api"
    permissions = Permission.objects.filter(content_type__app_label=app_label)
    serializer = PermissionSerializer(permissions, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, isManagerRole])
def edit_role(request, id):
    try:
        role = Role.objects.get(id=id)
        serialier = RoleSerializer(instance=role, data=request.data)
        if serialier.is_valid():
            serialier.save()
            return Response({'message':'Role Edited Successfully!'}, status=status.HTTP_200_OK)
        else:
            return Response({f'message':{serialier.errors}}, status=status.HTTP_400_BAD_REQUEST)
    except role.DoesNotExist:
        return Response({'message':'Role not found!'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated, isManagerRole])
def delete_role(request, id):
    try:
        role = Role.objects.get(id=id)
        role.delete()
        return Response({'message':'Role Deleted!'},status=status.HTTP_200_OK)
    except role.DoesNotExist:
        return Response({'message':"Role doesnot exist!"},status=status.HTTP_404_NOT_FOUND)
    
#######################################################################################################

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_sale(request):
    sale_data = {
        'seller_id':request.user.id,
        'total':request.data.get('total'),
        'payment_method':request.data.get('payment_method'),
        'amount_tendered':request.data.get('amount_tendered'),
        'change':request.data.get('change_due')
    }
    sale_serailizer = addSalesSerializer(data=sale_data)
    if sale_serailizer.is_valid():
        sale_instance = sale_serailizer.save()
        sale_items = request.data.get('items',[])
        sales_item_list = []
        for item in sale_items:
            sale_item_data = {
                'sale':sale_instance.id,
                'product':item.get('product'),
                'quantity':item.get('quantity'),
                'price':item.get('price')
            }
            item_serializer = addSaleItemsSerializer(data=sale_item_data)
            if item_serializer.is_valid():
                item_serializer.save()
                
            else:
                return Response({'message':f'{item_serializer.errors}'},status=status.HTTP_400_BAD_REQUEST)
            product = products.objects.get(id = item.get('product'))
            product.quantity -= item.get('quantity')
            product.save()
            sales_item_list.append({
                'product_code': product.product_code,
                'product_name': product.product_name,
                'quantity': item.get('quantity'),
                'price': float(item.get('price'))
            })
        response_data = {
            'seller':request.user.first_name,
            'sale_id': sale_instance.id,
            'sale_date': sale_instance.sale_date,
            'total': float(sale_instance.total),
            'payment_method': sale_instance.payment_method,
            'amount_tendered': float(sale_instance.amount_tendered),
            'change': float(sale_instance.change),
            'items': sales_item_list
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    else:
        return Response({'message':f'{sale_serailizer.errors}'},status=status.HTTP_400_BAD_REQUEST)
    
    
    


@api_view(['POST'])
@permission_classes([IsAuthenticated,isManagerRole])
def all_sales(request):
    sales = counter_sales.objects.all().order_by('-sale_date')
    serializer = adminSalesViewSerializer(sales,many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated,isManagerRole])
def sale_details(request,id):
    try:
        sale = counter_sales.objects.get(id=id)
    except counter_sales.DoesNotExist:
        return Response({'message':'Sale not found!'},status=status.HTTP_404_NOT_FOUND)
    
    items = sale_items.objects.filter(sale=sale)
    serialized_items = addSaleItemsSerializer(items,many=True).data
    response_data = {
        'id':sale.id,
        'seller':sale.seller_id.first_name,
        'sale_date':sale.sale_date,
        'total':float(sale.total),
        'payment_method':sale.payment_method,
        'amount_tendered':float(sale.amount_tendered),
        'change':float(sale.change),
        'items':serialized_items
    }
    return Response(response_data,status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated,isManagerRole])
def chart_data(request):
    last_7_days = now().date() - timedelta(days=7)
    daily_sales = (
        counter_sales.objects
        .filter(sale_date__gte=last_7_days)
        .annotate(day=TruncDate('sale_date'))
        .values('day')
        .annotate(total_sales=Sum('total'))
        .order_by('day')
        
    )
    return Response(daily_sales)


@api_view(['GET'])
@permission_classes([IsAuthenticated,isManagerRole])
def dashboard_data(request):
    seven_days = timezone.now() - timedelta(days=7)
    monthly_days = timezone.now().replace(day = 1)
    excluded = ['customer']

    stock_data = products.objects.all().count()
    employee_data = User.objects.exclude(is_superuser=True).exclude(is_active=False).count()
    weekly_sales = counter_sales.objects.filter(sale_date__gte=seven_days).aggregate(total=Sum('total'))['total']
    monthly_sales = counter_sales.objects.filter(sale_date__gte=monthly_days).aggregate(total=Sum('total'))['total']

    weekly_product_sales = counter_sales.objects.filter(sale_date__gte=seven_days).count()
    monthly_product_sales = counter_sales.objects.filter(sale_date__gte=monthly_days).count()
    dash_data = {
        'weekly_sales':weekly_sales,
        'monthly_sales':monthly_sales,
        'stock_data':stock_data,
        'employee_data':employee_data,
        'weekly_product_sales':weekly_product_sales,
        'monthly_product_sales':monthly_product_sales
    }

    return Response(dash_data,status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated,isManagerRole])
def reports_dashboard(request):
    seven_days = timezone.now() - timedelta(days=7)
    monthly_days = timezone.now().replace(day = 1)
    excluded = ['root','customer']

    stock_data = products.objects.all().count()
    employee_data = User.objects.exclude(is_superuser=True).exclude(is_active=False).count()
    weekly_sales = counter_sales.objects.filter(sale_date__gte=seven_days).aggregate(total=Sum('total'))['total']
    monthly_sales = counter_sales.objects.filter(sale_date__gte=monthly_days).aggregate(total=Sum('total'))['total']

    top_products = (
        sale_items.objects
        .values('product__product_code', 'product__product_name')  
        .annotate(total_quantity=Sum('quantity'))  
        .order_by('-total_quantity')  
        [:5]  
    )
    top_products_list = list(top_products)

    weekly_product_sales = counter_sales.objects.filter(sale_date__gte=seven_days).count()
    monthly_product_sales = counter_sales.objects.filter(sale_date__gte=monthly_days).count()
    dash_data = {
        'weekly_sales':weekly_sales,
        'monthly_sales':monthly_sales,
        'stock_data':stock_data,
        'employee_data':employee_data,
        'weekly_product_sales':weekly_product_sales,
        'monthly_product_sales':monthly_product_sales,
        'top_products':top_products_list
    }
    return Response(dash_data,status=status.HTTP_200_OK)

@permission_classes([IsAuthenticated,isManagerRole])
def inventory_report(request):
    reponse  = HttpResponse(content_type='application/pdf')
    reponse['Content-Disposition'] = 'attachment; filename="Inventory_Report.pdf"'
    pdf = canvas.Canvas(reponse,pagesize=A4)
    width,height = A4

    pdf.setFont("Helvetica-Bold",16)
    pdf.drawString(200,height-50,'Inventory Report')
    all_products = products.objects.all().values_list('product_code', 'product_name', 'unit_price', 'quantity')

    data = [["Code","Product Name","Price","Quantity"]]
    for product in all_products:
        data.append(list(product))
    
    table = Table(data,colWidths=[80,200,100,100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))

    table.wrapOn(pdf,width,height)
    table.drawOn(pdf,50,height-200)

    pdf.save()

    return reponse

@permission_classes([IsAuthenticated,isManagerRole])
def low_stock_products_report(request):
    reponse  = HttpResponse(content_type='application/pdf')
    reponse['Content-Disposition'] = 'attachment; filename="Low Stock Products.pdf"'
    pdf = canvas.Canvas(reponse,pagesize=A4)
    width,height = A4

    pdf.setFont("Helvetica-Bold",16)
    pdf.drawString(200,height-50,'Low Stock Products')
    all_products = products.objects.filter(quantity__lte=models.F('low_stock_level')).values_list('product_code', 'product_name', 'unit_price', 'quantity','low_stock_level')

    data = [["Code","Product Name","Price","Quantity","Low Stock Alert"]]
    for product in all_products:
        data.append(list(product))
    
    table = Table(data,colWidths=[80,150,100,100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))

    table.wrapOn(pdf,width,height)
    table.drawOn(pdf,50,height-200)

    pdf.save()

    return reponse



@permission_classes([IsAuthenticated,isManagerRole])
def sales_report(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Sales_Report.pdf"'

    # Create a PDF document
    doc = SimpleDocTemplate(response, pagesize=A4)
    elements = []

    # Title
    title = [["Sales Report"]]
    title_table = Table(title, colWidths=[500])
    title_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 16),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
    ]))
    elements.append(title_table)

    # Fetch sales data
    all_sales = counter_sales.objects.select_related("seller_id").annotate(
        seller_name=Concat("seller_id__first_name", Value(" "), "seller_id__last_name")
    ).values("sale_date", "seller_name", "total", "payment_method")

    # Define table headers
    data = [["Date", "Cashier", "Total", "Payment Method"]]

    # Add sales data to the table
    for sale in all_sales:
        data.append([
            sale["sale_date"].strftime("%Y-%m-%d %H:%M"),  # Format date
            sale["seller_name"],
            f"{sale['total']:.2f}",  # Format total to 2 decimal places
            sale["payment_method"]
        ])

    # Create table with styles
    table = Table(data, colWidths=[120, 150, 100, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),  # Header background color
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),  # Header text color
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (1, 1), (-1, -1), colors.beige),  # Row background
        ('GRID', (0, 0), (-1, -1), 1, colors.black)  # Table border
    ]))

    elements.append(table)

    # Build PDF
    doc.build(elements)

    return response


@permission_classes([IsAuthenticated])
def monthly_sales_report(request):
    thirty_days = timezone.now() - timedelta(days=30)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Monthly Sales Report.pdf"'
    doc = SimpleDocTemplate(response, pagesize=landscape(A4), topMargin=50, bottomMargin=50, leftMargin=30, rightMargin=30)
    elements = []

    styles = getSampleStyleSheet()
    title = Paragraph("Monthly Sales Report", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 20))

    # Summary of total sales and products sold
    sales_in_period = counter_sales.objects.filter(sale_date__gte=thirty_days)
    total_sales_amount = sales_in_period.aggregate(Sum('total'))['total__sum'] or 0
    total_products_sold = sale_items.objects.filter(sale__sale_date__gte=thirty_days).count()

    summary_style = ParagraphStyle(
        name='Summary',
        parent=styles['Normal'],
        fontSize=14,
        leading=16,
    )

    summary_text = (
        f"This month, total sales amount to <b>Ksh {total_sales_amount:,.2f}</b> "
        f"and total products sold are <b>{total_products_sold}</b>."
    )
    summary = Paragraph(summary_text, summary_style)
    elements.append(summary)
    elements.append(Spacer(1, 20))

    # Main table: Individual sale items
    all_sales = sale_items.objects.filter(
        sale__sale_date__gte=thirty_days
    ).values_list(
        'product__product_code',
        'product__product_name',
        'sale__seller_id__username',
        'sale__total',
        'sale__payment_method',
        'sale__sale_date',
        'sale__amount_tendered',
        'sale__change',
        flat=False
    )

    data = [["Product Code", "Product Name", "Seller", "Total", "Payment Method", "Sale Date", "Amount Tendered", "Change"]]
    for sale_item in all_sales:
        product_code, product_name, seller, total, payment_method, sale_date, amount_tendered, change = sale_item
        data.append([
            product_code,
            product_name,
            seller,
            str(total),
            payment_method,
            sale_date.strftime('%Y-%m-%d %H:%M:%S'),
            str(amount_tendered) if amount_tendered is not None else "N/A",
            str(change) if change is not None else "N/A",
        ])

    table = Table(data, colWidths=[80, 180, 50, 80, 120, 100, 100, 50])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('WORDWRAP', (0, 0), (-1, -1), 'CJK'),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 30))  

    # Second table: Daily sales totals for the month
    daily_sales = (
        counter_sales.objects.filter(sale_date__gte=thirty_days)
        .annotate(day=TruncDate('sale_date', output_field=DateField()))
        .values('day')
        .annotate(daily_total=Sum('total'))
        .order_by('day')
    )

    daily_data = [["Day", "Total Sales Amount"]]
    for entry in daily_sales:
        day = entry['day']
        daily_total = entry['daily_total']
        daily_data.append([
            day.strftime('%Y-%m-%d'),
            f"Ksh {daily_total:,.2f}",
        ])

    if not daily_sales:
        daily_data.append(["No sales", "Ksh 0.00"])

    daily_table = Table(daily_data, colWidths=[150, 150])
    daily_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    daily_title = Paragraph("Daily Sales Totals for the Month", styles['Heading2'])
    elements.append(daily_title)
    elements.append(Spacer(1, 10))
    elements.append(daily_table)

    # Sales Profit Analysis
    profit_title = Paragraph("Sales Profit Analysis", styles['Heading2'])
    elements.append(profit_title)
    elements.append(Spacer(1, 10))

    profit_data = [["Product Code", "Product Name", "Total Revenue", "Total Cost", "Total Profit"]]

    sales_profit = (
        sale_items.objects.filter(sale__sale_date__gte=thirty_days)
        .values('product__product_code', 'product__product_name')
        .annotate(
            total_revenue=Sum('sale__total'),
            total_cost=Sum(F('quantity') * F('product__cost_price')),
            total_profit=Sum(F('sale__total') - (F('quantity') * F('product__cost_price')))
        )
    )

    for item in sales_profit:
        product_code = item['product__product_code']
        product_name = item['product__product_name']
        total_revenue = item['total_revenue'] or 0
        total_cost = item['total_cost'] or 0
        total_profit = item['total_profit'] or 0

        profit_data.append([
            product_code,
            product_name,
            f"Ksh {total_revenue:,.2f}",
            f"Ksh {total_cost:,.2f}",
            f"Ksh {total_profit:,.2f}"
        ])

    profit_table = Table(profit_data, colWidths=[100, 180, 120, 120, 120])
    profit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    elements.append(profit_table)

    total_profit_earned = sales_profit.aggregate(total=Sum('total_profit'))['total'] or 0

    profit_summary_text = (
        f"<b>Total profit earned this month:</b> Ksh {total_profit_earned:,.2f}"
    )
    profit_summary = Paragraph(profit_summary_text, summary_style)
    elements.append(Spacer(1, 10))
    elements.append(profit_summary)

    # Build the PDF
    doc.build(elements)
    return response



@permission_classes([IsAuthenticated, isManagerRole])
def weekly_sales_report(request):
    seven_days = timezone.now() - timedelta(days=7)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Weekly Sales Report.pdf"'
    doc = SimpleDocTemplate(response, pagesize=landscape(A4), topMargin=50, bottomMargin=50, leftMargin=30, rightMargin=30)
    elements = []
    styles = getSampleStyleSheet()
    
    title = Paragraph("Weekly Sales Report", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 20))
    
    sales_in_period = counter_sales.objects.filter(sale_date__gte=seven_days)
    total_sales_amount = sales_in_period.aggregate(Sum('total'))['total__sum'] or 0
    total_products_sold = sale_items.objects.filter(sale__sale_date__gte=seven_days).count()
    
    summary_style = ParagraphStyle(name='Summary', parent=styles['Normal'], fontSize=14, leading=16)
    summary_text = (
        f"This week, total sales amount to <b>Ksh {total_sales_amount:,.2f}</b> "
        f"and total products sold are <b>{total_products_sold}</b>."
    )
    summary = Paragraph(summary_text, summary_style)
    elements.append(summary)
    elements.append(Spacer(1, 20))
    
    all_sales = sale_items.objects.filter(sale__sale_date__gte=seven_days)
    data = [["Product Code", "Product Name", "Seller", "Total", "Payment Method", "Sale Date", "Amount Tendered", "Change"]]
    for sale_item in all_sales:
        data.append([
            sale_item.product.product_code,
            sale_item.product.product_name,
            sale_item.sale.seller_id.username,
            f"Ksh {sale_item.sale.total:,.2f}",
            sale_item.sale.payment_method,
            sale_item.sale.sale_date.strftime('%Y-%m-%d %H:%M:%S'),
            f"Ksh {sale_item.sale.amount_tendered:,.2f}" if sale_item.sale.amount_tendered else "N/A",
            f"Ksh {sale_item.sale.change:,.2f}" if sale_item.sale.change else "N/A",
        ])
    table = Table(data, colWidths=[80, 180, 50, 80, 120, 100, 100, 50])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 30))
    
    daily_sales = counter_sales.objects.filter(sale_date__gte=seven_days).annotate(day=TruncDate('sale_date', output_field=DateField())).values('day').annotate(daily_total=Sum('total')).order_by('day')
    daily_data = [["Day", "Total Sales Amount"]]
    for entry in daily_sales:
        daily_data.append([entry['day'].strftime('%Y-%m-%d'), f"Ksh {entry['daily_total']:,.2f}"])
    if not daily_sales:
        daily_data.append(["No sales", "Ksh 0.00"])
    daily_table = Table(daily_data, colWidths=[150, 150])
    daily_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(Paragraph("Daily Sales Totals for the Week", styles['Heading2']))
    elements.append(Spacer(1, 10))
    elements.append(daily_table)
    elements.append(Spacer(1, 30))
    
    # Sales Profit Analysis
    profit_data = [["Product Name", "Total Sales", "Total Cost", "Profit"]]
    total_profit = 0
    
    profit_query = sale_items.objects.filter(sale__sale_date__gte=seven_days).values('product__product_name').annotate(
        total_sales=Sum(F('quantity') * F('price')),
        total_cost=Sum(F('quantity') * F('product__cost_price'))
    )
    
    for entry in profit_query:
        profit = entry['total_sales'] - entry['total_cost']
        total_profit += profit
        profit_data.append([
            entry['product__product_name'],
            f"Ksh {entry['total_sales']:,.2f}",
            f"Ksh {entry['total_cost']:,.2f}",
            f"Ksh {profit:,.2f}",
        ])
    
    elements.append(Paragraph("Sales Profit Analysis", styles['Heading2']))
    elements.append(Spacer(1, 10))
    profit_table = Table(profit_data, colWidths=[200, 150, 150, 150])
    profit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(profit_table)
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Total Profit for the Week: <b>Ksh {total_profit:,.2f}</b>", summary_style))
    
    doc.build(elements)
    return response



@permission_classes([IsAuthenticated,isManagerRole])
def daily_sales_report(request):
    one_day = timezone.now() - timedelta(days=1)
    reponse  = HttpResponse(content_type='application/pdf')
    reponse['Content-Disposition'] = 'attachment; filename="Daily Sales Report.pdf"'
    doc = SimpleDocTemplate(reponse, pagesize=landscape(A4), topMargin=50, bottomMargin=50, leftMargin=30, rightMargin=30)
    elements = []

    styles = getSampleStyleSheet()
    title = Paragraph("Daily Sales Report", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 20))  
    
    sales_in_period = counter_sales.objects.filter(sale_date__gte=one_day)
    total_sales_amount = sales_in_period.aggregate(Sum('total'))['total__sum'] or 0
    total_products_sold = sale_items.objects.filter(sale__sale_date__gte=one_day).count()

    summary_style = ParagraphStyle(
        name='Summary',
        parent=styles['Normal'],
        fontSize=14,  
        leading=16,   
    )

    
    summary_text = (
        f"In the last 1(one) day, total sales amount to <b>Ksh {total_sales_amount:,.2f}</b> "
        f"and total products sold are <b>{total_products_sold}</b>."
    )
    summary = Paragraph(summary_text, summary_style)
    elements.append(summary)
    elements.append(Spacer(1, 20))  

    all_sales = sale_items.objects.filter(
        sale__sale_date__gte=one_day
    ).values_list(
        'product__product_code',
        'product__product_name',
        'sale__seller_id__username',
        'sale__total',
        'sale__payment_method',
        'sale__sale_date',
        'sale__amount_tendered',
        'sale__change',
        flat=False
    )


    data = [["Product Code", "Product Name", "Seller", "Total", "Payment Method", "Sale Date", "Amount Tendered", "Change"]]
    for sale_item in all_sales:
        product_code, product_name, seller, total, payment_method, sale_date, amount_tendered, change = sale_item
        data.append([
            product_code,
            product_name,
            seller,
            str(total),
            payment_method,
            sale_date.strftime('%Y-%m-%d %H:%M:%S'),  
            str(amount_tendered) if amount_tendered is not None else "N/A",
            str(change) if change is not None else "N/A",
        ])

    table = Table(data, colWidths=[80, 180, 50, 80, 120, 100, 100, 50])  
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),  
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), 
        ('WORDWRAP', (0, 0), (-1, -1), 'CJK'),  
    ]))

    elements.append(table)
    doc.build(elements)

    return reponse


@permission_classes([IsAuthenticated])
def single_product_report(request):
    # one_day = timezone.now() - timedelta(days=1)
    product_code = request.GET.get('product_code')
    try:
        product = products.objects.get(product_code=product_code)
        product_id = product.id
    except product.DoesNotExist:
        return Response(
            {"error": f"Product with code {product_code} not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    reponse  = HttpResponse(content_type='application/pdf')
    reponse['Content-Disposition'] = 'attachment; filename="Single Product Sales Report.pdf"'
    doc = SimpleDocTemplate(reponse, pagesize=landscape(A4), topMargin=50, bottomMargin=50, leftMargin=30, rightMargin=30)
    elements = []

    styles = getSampleStyleSheet()
    title = Paragraph("Single Product Sales Report", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 20))  
    
    # sales_in_period = counter_sales.objects.filter(s)
    # total_sales_amount = sales_in_period.aggregate(Sum('total'))['total__sum'] or 0
    total_products_sold = sale_items.objects.filter(product= product_id).count()

    summary_style = ParagraphStyle(
        name='Summary',
        parent=styles['Normal'],
        fontSize=14,  
        leading=16,   
    )

    
    summary_text = (
        #f"In the last 1(one) day, total sales amount to <b>Ksh {total_sales_amount:,.2f}</b> "
        f"Total product sales add up to <b>{total_products_sold}</b>."
    )
    summary = Paragraph(summary_text, summary_style)
    elements.append(summary)
    elements.append(Spacer(1, 20))  

    all_sales = sale_items.objects.filter(
        product = product_id
    ).values_list(
        'product__product_code',
        'product__product_name',
        'sale__seller_id__username',
        'sale__sale_date',
        'quantity',
        flat=False
    )


    data = [["Product Code", "Product Name", "Seller", "Sale Date", "Quantity Sold"]]
    for sale_item in all_sales:
        product_code, product_name, seller, sale_date,quantity = sale_item
        data.append([
            product_code,
            product_name,
            seller,    
            sale_date.strftime('%Y-%m-%d %H:%M:%S'),  
            quantity,
        ])

    table = Table(data, colWidths=[80, 180, 50, 120, 120])  
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),  
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), 
        ('WORDWRAP', (0, 0), (-1, -1), 'CJK'),  
    ]))

    elements.append(table)
    doc.build(elements)

    return reponse
    



@permission_classes([IsAuthenticated,isManagerRole])
def custom_dates_report(request):
    from_date_str = request.GET.get('from')
    to_date_str = request.GET.get('to')

    if not from_date_str or not to_date_str:
        return Response(
            {"error": "Both 'from' and 'to' dates are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        from_date = datetime.strptime(from_date_str, '%Y-%m-%d')
        to_date = datetime.strptime(to_date_str, '%Y-%m-%d')
        to_date = to_date.replace(hour=23, minute=59, second=59)
    except ValueError:
        return Response(
            {"error": "Invalid date format. Use YYYY-MM-DD (e.g., 2025-01-01)"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if from_date > to_date:
        return Response(
            {"error": "'from' date must be before or equal to 'to' date"},
            status=status.HTTP_400_BAD_REQUEST
        )

    from_date = timezone.make_aware(from_date)
    to_date = timezone.make_aware(to_date)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="sales_report_{from_date_str}_to_{to_date_str}.pdf"'
    doc = SimpleDocTemplate(response, pagesize=landscape(A4), topMargin=50, bottomMargin=50, leftMargin=30, rightMargin=30)
    elements = []

    styles = getSampleStyleSheet()
    title = Paragraph(f"Sales Report from {from_date_str} to {to_date_str}", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 20))

    sales_in_period = counter_sales.objects.filter(
        sale_date__gte=from_date,
        sale_date__lte=to_date
    )
    total_sales_amount = sales_in_period.aggregate(Sum('total'))['total__sum'] or 0
    total_products_sold = sale_items.objects.filter(
        sale__sale_date__gte=from_date,
        sale__sale_date__lte=to_date
    ).count()

    summary_style = ParagraphStyle(
        name='Summary',
        parent=styles['Normal'],
        fontSize=14,
        leading=16,
    )

    summary_text = (
        f"From {from_date_str} to {to_date_str}, total sales amount to <b>Ksh {total_sales_amount:,.2f}</b> "
        f"and total products sold are <b>{total_products_sold}</b>."
    )
    summary = Paragraph(summary_text, summary_style)
    elements.append(summary)
    elements.append(Spacer(1, 20))

    all_sales = sale_items.objects.filter(
        sale__sale_date__gte=from_date,
        sale__sale_date__lte=to_date
    ).values_list(
        'product__product_code',
        'product__product_name',
        'sale__seller_id__username',
        'sale__total',
        'sale__payment_method',
        'sale__sale_date',
        'sale__amount_tendered',
        'sale__change',
        flat=False
    )

    if not all_sales:
        summary_text = f"No sales found between {from_date_str} and {to_date_str}."
        summary = Paragraph(summary_text, summary_style)
        elements.append(summary)
        doc.build(elements)
        return response

    data = [["Product Code", "Product Name", "Seller", "Total", "Payment Method", "Sale Date", "Amount Tendered", "Change"]]
    for sale_item in all_sales:
        product_code, product_name, seller, total, payment_method, sale_date, amount_tendered, change = sale_item
        data.append([
            product_code,
            product_name,
            seller,
            str(total),
            payment_method,
            sale_date.strftime('%Y-%m-%d %H:%M:%S'),
            str(amount_tendered) if amount_tendered is not None else "N/A",
            str(change) if change is not None else "N/A",
        ])

    table = Table(data, colWidths=[80, 180, 50, 80, 120, 100, 100, 50])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('WORDWRAP', (0, 0), (-1, -1), 'CJK'),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 30))

    # Profit Analysis Table

    profit_table_title = Paragraph(f"Profit Report from {from_date_str} to {to_date_str}", styles['Title'])
    elements.append(profit_table_title)
    elements.append(Spacer(1, 20))
    profit_data = [["Product Code", "Product Name", "Quantity Sold", "Selling Price", "Cost Price", "Profit"]]
    total_profit = 0
    for item in sale_items.objects.filter(sale__sale_date__gte=from_date, sale__sale_date__lte=to_date):
        profit = (item.price - item.product.cost_price) * item.quantity
        total_profit += profit
        profit_data.append([
            item.product.product_code,
            item.product.product_name,
            str(item.quantity),
            f"Ksh {item.price:,.2f}",
            f"Ksh {item.product.cost_price:,.2f}",
            f"Ksh {profit:,.2f}",
        ])

    profit_table = Table(profit_data, colWidths=[80, 130, 80, 100, 100, 100])
    profit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(profit_table)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"<b>Total Profit Earned: Ksh {total_profit:,.2f}</b>", styles['Normal']))
    
    doc.build(elements)
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_confirm(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if username!= "" and password!="":
        is_authenticated = authenticate(request, username=username,password=password)
        if is_authenticated is not None:
            if is_authenticated.profile.role.name == 'manager':
                return Response({'message':'authorized'},status=status.HTTP_200_OK)
            else:
                return Response({'message':'not authorized'},status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'message':'user not found'},status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'message':'missing credentials'},status=status.HTTP_400_BAD_REQUEST)
    


@api_view(['GET'])
def send_low_stock_email(request):
    now = datetime.now()
    try:
        # Get user's email preference
        # pref = EmailPreference.objects.get(user=user)
        # if not pref.is_active:
        #     print(f"Email notifications disabled for {user.username}")
        #     return

        # Get low stock items
        low_stock_items = products.objects.filter(
            quantity__lte=models.F('low_stock_level')
        )
        
        if not low_stock_items.exists():
            print("No low stock items to report")
            return Response({'message': 'No low stock items to report'}, status=status.HTTP_200_OK)
            return

        # Generate PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        styles = getSampleStyleSheet()

        title_text = f'Current Low Stock Products on {now.strftime("%Y-%m-%d")}'
        title = Paragraph(title_text, styles['Title'])
        elements.append(title)
        elements.append(Spacer(1, 20))

        data = [['Product Code','Product Name', 'Current Quantity', 'Low Stock Level']]
        for item in low_stock_items:
            data.append([item.product_code,item.product_name, item.quantity, item.low_stock_level])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        doc.build(elements)
        buffer.seek(0)

        # Prepare email
        subject = f'Low Stock Report - {datetime.now().strftime("%Y-%m-%d")}'
        message = 'Please find attached the low stock report.'
        from_email = 'conradmax5@gmail.com'  # Should match your settings.py
        recipient_list = ['njoraconrad@gmail.com']

        # Send email
        email = EmailMessage(
            subject,
            message,
            from_email,
            recipient_list,
        )
        email.attach(
            f'low_stock_report_{datetime.now().strftime("%Y%m%d")}.pdf',
            buffer.getvalue(),
            'application/pdf'
        )
        email.send()

        print('Email sent!')
        return Response({'message': 'Email sent!'}, status=status.HTTP_200_OK)

    # except EmailPreference.DoesNotExist:
    #     print(f"No email preference set for user {user.username}")
    except Exception as e:
        print('Email not sent!',e)
        return Response({'message': 'Email not sent!', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)





@api_view(['GET','PUT'])
@permission_classes([IsAuthenticated, isManagerRole])
def auto_send_settings(request):
    settings, created = auto_email_settings.objects.get_or_create(user=request.user,defaults={'auto_send': False, 'frequency': 'daily'})

    if request.method == 'GET':
        settings_data = autoEmailSerializer(settings)
        return Response(settings_data.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        try:
            serializer = autoEmailSerializer(instance=settings, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Settings updated'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Check Settings and try again!','errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': 'Error updating settings', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'message': 'Invalid method!'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated, isManagerRole])
def set_watch_product(request):
    if request.method == 'GET':
        watched_products = WatchedProduct.objects.filter(user=request.user)
        serializer = watchProductSerializer(watched_products,many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        item_data = {
            'user':request.user.id,
            'product':int(request.data.get('product')),
            'threshold':int(request.data.get('threshold'))
        }
        watched_product_data = watchProductSerializer(data = item_data)
        if watched_product_data.is_valid():
            watched_product_data.save()
            print("SAVED")
            return Response({'message': 'Product saved!'}, status=status.HTTP_200_OK)
        else:
            print(watched_product_data.errors)
            return Response({'message': 'check detailes and try again!','error':str(watched_product_data.errors)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        print("BAD METHOD!!")
        return Response({'message': 'Bad request!'}, status=status.HTTP_400_BAD_REQUEST)
        