from django.contrib import admin
from .models import products,profile,purchase_orders,counter_sales,restock_orders
# Register your models here.
admin.site.register(products)
admin.site.register(profile)
admin.site.register(purchase_orders)
admin.site.register(counter_sales)
admin.site.register(restock_orders)

