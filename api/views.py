from django.shortcuts import render
from django.http import HttpResponse,FileResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils.timezone import timedelta,now
from django.utils import timezone
from django.db.models import Sum,Value,F
from django.db.models.functions import Concat,TruncDate
from django.db import models
from decimal import Decimal, InvalidOperation

from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import ProductsSerializer, UserSerializer,ProfileSerializer,UserProfileSerializer, addSalesSerializer, addSaleItemsSerializer,adminSalesViewSerializer, productRestockSerializer,restockDeliverySerializer
from .models import products,Profile,counter_sales,sale_items,restock_orders
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import isAdminRole

from reportlab.lib.pagesizes import A4,letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle,SimpleDocTemplate
from reportlab.lib.units import inch
import io
import pandas as pd
# Create your views here.

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['role'] = user.profile.role 
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
@permission_classes([IsAuthenticated,isAdminRole])
def add_product(request):
    save_data = ProductsSerializer(data=request.data)
    if save_data.is_valid():
        save_data.save()

    return Response(save_data.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, isAdminRole])
def bulk_upload(request):
    if 'file' not in request.FILES:
        print("No file provided in request")
        return Response({'message': "File not found"}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    try:
        # Read CSV, handle NaN by filling with empty string
        df = pd.read_csv(file, dtype=str, na_values=['', 'NA', 'N/A'], keep_default_na=False)
        df.columns = df.columns.str.strip()
        required_columns = {"product_code", "name", "category", "price", "stock_quantity", "low_stock_level"}

        if not required_columns.issubset(df.columns):
            missing = required_columns - set(df.columns)
            print(f"Missing required columns: {missing}")
            return Response({"error": f"CSV file is missing required columns: {missing}"}, status=status.HTTP_400_BAD_REQUEST)

        products_added = 0
        products_updated = 0
        skipped_rows = []

        for index, row in df.iterrows():
            product_code = str(row['product_code']).strip()
            if not product_code or not product_code.isdigit():
                print(f"Row {index}: Invalid product_code '{product_code}' - skipping")
                skipped_rows.append(index)
                continue

            try:
                # Handle price conversion
                price_str = str(row['price']).replace(',', '').strip()
                product_price = Decimal(price_str) if price_str else Decimal('0.00')

                # Handle stock quantity
                stock_str = str(row['stock_quantity']).strip()
                stock_quantity = int(stock_str) if stock_str.isdigit() else 0

                # Handle low stock level
                low_stock_str = str(row['low_stock_level']).strip()
                low_stock_level = int(low_stock_str) if low_stock_str.isdigit() else 0

            except (InvalidOperation, ValueError) as e:
                print(f"Row {index}: Invalid data format for product_code '{product_code}' - {str(e)}")
                skipped_rows.append(index)
                continue

            try:
                product, created = products.objects.update_or_create(
                    product_code=product_code,
                    defaults={
                        'product_name': str(row['name']).strip(),
                        'product_category': str(row['category']).strip(),
                        'product_price': product_price,
                        'stock_quantity': stock_quantity,
                        'low_stock_level': low_stock_level,
                    }
                )
                if created:
                    products_added += 1
                    print(f"Added new product: {product_code}")
                else:
                    products_updated += 1
                    print(f"Updated product: {product_code}")
            except Exception as e:
                print(f"Row {index}: Failed to save product_code '{product_code}' - {str(e)}")
                skipped_rows.append(index)
                continue

        response_data = {
            "message": f"Successfully added {products_added} new products, updated {products_updated} products.",
            "skipped_rows": skipped_rows if skipped_rows else "None",
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Failed to process CSV file: {str(e)}")
        return Response({"error": f"Failed to process CSV file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_data(request):
    total = products.objects.all().count()
    low_stock = products.objects.filter(stock_quantity__lte=models.F('low_stock_level')).count()
    low_stock_products = products.objects.filter(
        stock_quantity__lte=F('low_stock_level')
    ).exclude(
        id__in=restock_orders.objects.filter(status='pending').values_list('product_id', flat=True)
    )

    pending_restock = products.objects.filter(stock_quantity__lte=models.F('low_stock_level')).count()
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
            product.stock_quantity += new_stock
            product.save() 
            return Response({"message": "Delivery confirmed", "data": serializer.data}, status=status.HTTP_200_OK)
        else:
            print(f"Error:{serializer.errors}")
            return Response({"message":"Error handling data", 'Error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated,isAdminRole])
def edit_product(request,id):
    product = products.objects.get(id=id)
    product_data = ProductsSerializer(instance=product,data=request.data)
    if product_data.is_valid():
        product_data.save()
    return Response(product_data.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated,isAdminRole])
def delete_product(request,id):
    product = products.objects.get(id=id)
    product.delete()

    return Response('Product Deleted!')


@api_view(['POST'])
@permission_classes([IsAuthenticated,isAdminRole])
def create_user(request):
    user_data = {
        'username':request.data.get('username'),
        'first_name':request.data.get('first_name'),
        'last_name':request.data.get('last_name'),
        'password':request.data.get('password'),
    }
    profile_data = {
        'phone':request.data.get('phone'),
        'role':request.data.get('role').lower()
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
@permission_classes([IsAuthenticated,isAdminRole])
def deactivate_user(request,id):
    user = User.objects.get(id=id)
    user.is_active = False
    user.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated,isAdminRole])
def employees(request):
    excluded = ['root','customer']
    employees = User.objects.exclude(profile__role__in = excluded).exclude(is_superuser=True).exclude(is_active=False)
    serializer = UserProfileSerializer(employees,many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated,isAdminRole])
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
            product.stock_quantity -= item.get('quantity')
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
@permission_classes([IsAuthenticated,isAdminRole])
def all_sales(request):
    sales = counter_sales.objects.all().order_by('-sale_date')
    serializer = adminSalesViewSerializer(sales,many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated,isAdminRole])
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
@permission_classes([IsAuthenticated,isAdminRole])
def dashboard_data(request):
    seven_days = timezone.now() - timedelta(days=7)
    monthly_days = timezone.now().replace(day = 1)
    excluded = ['root','customer']

    stock_data = products.objects.all().count()
    employee_data = User.objects.exclude(profile__role__in = excluded).exclude(is_superuser=True).exclude(is_active=False).count()
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
@permission_classes([IsAuthenticated,isAdminRole])
def reports_dashboard(request):
    seven_days = timezone.now() - timedelta(days=7)
    monthly_days = timezone.now().replace(day = 1)
    excluded = ['root','customer']

    stock_data = products.objects.all().count()
    employee_data = User.objects.exclude(profile__role__in = excluded).exclude(is_superuser=True).exclude(is_active=False).count()
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

@permission_classes([IsAuthenticated,isAdminRole])
def inventory_report(request):
    reponse  = HttpResponse(content_type='application/pdf')
    reponse['Content-Disposition'] = 'attachment; filename="Inventory_Report.pdf"'
    pdf = canvas.Canvas(reponse,pagesize=A4)
    width,height = A4

    pdf.setFont("Helvetica-Bold",16)
    pdf.drawString(200,height-50,'Inventory Report')
    all_products = products.objects.all().values_list('product_code', 'product_name', 'product_price', 'stock_quantity')

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



@permission_classes([IsAuthenticated,isAdminRole])
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_confirm(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if username!= "" and password!="":
        is_authenticated = authenticate(request, username=username,password=password)
        if is_authenticated is not None:
            if is_authenticated.profile.role == 'admin':
                return Response({'message':'authorized'},status=status.HTTP_200_OK)
            else:
                return Response({'message':'not authorized'},status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'message':'user not found'},status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'message':'missing credentials'},status=status.HTTP_400_BAD_REQUEST)
    








