from django.urls import path
from . import views
from .views import MyTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('api/',views.index, name='index'),
    path('api/products',views.products_list, name='products_list'),
    path('api/add-product',views.add_product, name='add_product'),
    path('api/edit-product/<int:id>',views.edit_product, name='edit_product'),
    path('api/delete-product/<int:id>',views.delete_product, name='delete_product'),
    path('api/create-user',views.create_user, name='create_user'),
    path('api/deactivate-user/<int:id>',views.deactivate_user, name='delete_user'),
    path('api/employees',views.employees, name='employees'),
    path('api/edit-employee/<int:id>',views.edit_employee, name='edit-employee'),
    path('api/add-sale',views.add_sale,name='add-sale'),
    path('api/get-sales',views.all_sales),
    path('api/dashboard-data',views.dashboard_data),
    path('api/reports-dashboard',views.reports_dashboard),
    path("api/inventory-report", views.inventory_report, name="inventory-report"),
    path("api/sales-report", views.sales_report, name="sales-report"),
    path("api/monthly-sales-report", views.monthly_sales_report, name="sales-report"),
    path("api/weekly-sales-report", views.weekly_sales_report),
    path("api/daily-sales-report", views.daily_sales_report),
    path("api/single-product-report", views.single_product_report),
    path("api/custom-dates-report", views.custom_dates_report),


    path("api/low-stock-report", views.low_stock_products_report),
    path("api/admin-confirm", views.admin_confirm, name="admin-confirm"),
    path("api/chart-data", views.chart_data, name="sales-report"),
    path("api/stock-data", views.stock_data, name="stock-data"),
    path("api/bulk-upload", views.bulk_upload, name="bulk-upload"),
    path("api/product-restock", views.product_restock, name="product-restock"),
    path("api/restock-delivery", views.get_restock_products, name="product-restock"),
    path("api/confirm-delivery", views.confirm_delivery),
    path("api/multi-confirm", views.multi_confirm),
    

    

    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]

