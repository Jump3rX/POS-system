from django.db import models
from django.contrib.auth.models import User

class profile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    phone = models.CharField(max_length=13)
    role = models.CharField(max_length=20)


class products(models.Model):
    product_name = models.CharField(max_length=100)
    product_category = models.CharField(max_length=100)
    product_price = models.DecimalField(max_digits=5, decimal_places=2)
    stock_quantity = models.IntegerField()

class counter_sales(models.Model):
    product = models.ForeignKey(products, on_delete=models.CASCADE)
    seller_id = models.ForeignKey(User,on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=5,decimal_places=2)
    payment_method = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)

class purchase_orders(models.Model):
    product = models.ForeignKey(products,on_delete=models.CASCADE)
    customer = models.ForeignKey(User,on_delete=models.CASCADE)
    quantity = models.IntegerField()
    total = models.DecimalField(max_digits=5,decimal_places=2)
    status = models.CharField(max_length=100)

class restock_orders(models.Model):
    product = models.ForeignKey(products,on_delete=models.CASCADE)
    quantity = models.IntegerField()
    status = models.CharField(max_length=100)
    approved_by = models.ForeignKey(User,on_delete=models.CASCADE)
    approval_date = models.DateTimeField(auto_now_add=True)
