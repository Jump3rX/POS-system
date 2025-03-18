from django.contrib import admin
from .models import products,Profile,purchase_orders,counter_sales,restock_orders,sale_items,restock_delivery
# Register your models here.
admin.site.register(products)
admin.site.register(Profile)
admin.site.register(purchase_orders)
admin.site.register(counter_sales)
admin.site.register(sale_items)
admin.site.register(restock_orders)
admin.site.register(restock_delivery)

