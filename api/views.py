from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.utils.timezone import timedelta,now
from django.utils import timezone
from django.db.models import Sum
from django.db.models import Value
from django.db.models.functions import Concat,TruncDate

from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import ProductsSerializer, UserSerializer,ProfileSerializer,UserProfileSerializer, addSalesSerializer, addSaleItemsSerializer,adminSalesViewSerializer
from .models import products,Profile,counter_sales,sale_items
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import isAdminRole

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle,SimpleDocTemplate
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
        sale_items_objects = []
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
        return Response({'messsage':'SALE ADDED!!'},status=status.HTTP_201_CREATED)
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

