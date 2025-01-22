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

    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]

