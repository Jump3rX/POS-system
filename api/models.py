from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=13)
    role = models.CharField(max_length=20)

    class Meta:
        verbose_name_plural = "profile"

    def __str__(self):
        return self.user.username


class products(models.Model):
    product_code = models.IntegerField(unique=True)
    product_name = models.CharField(max_length=100)
    product_category = models.CharField(max_length=100)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField()
    low_stock_level = models.IntegerField()

    class Meta:
        verbose_name_plural = "products"

    def __str__(self):
        return str(self.product_code)

class counter_sales(models.Model):
    seller_id = models.ForeignKey(User,on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=10,decimal_places=2)
    payment_method = models.CharField(max_length=100)
    sale_date = models.DateTimeField(auto_now_add=True)
    amount_tendered = models.PositiveIntegerField(null=True)
    change = models.PositiveIntegerField(null=True)

    class Meta:
        verbose_name_plural = "counter_sales"

    def __str__(self):
        return str(self.sale_date)
    
class sale_items(models.Model):
    sale = models.ForeignKey(counter_sales,on_delete=models.CASCADE)
    product = models.ForeignKey(products,on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10,decimal_places=2)

    class Meta:
        verbose_name_plural = 'sale_items'

    def __str__(self):
        return str(self.sale)



class purchase_orders(models.Model):
    product = models.ForeignKey(products,on_delete=models.CASCADE)
    customer = models.ForeignKey(User,on_delete=models.CASCADE)
    quantity = models.IntegerField()
    total = models.DecimalField(max_digits=5,decimal_places=2)
    status = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "purchase_orders"

    def __str__(self):
        return self.customer.username

class restock_orders(models.Model):
    product = models.ForeignKey(products,on_delete=models.CASCADE)
    quantity = models.IntegerField()
    status = models.CharField(max_length=100,default='pending')
    approved_by = models.ForeignKey(User,on_delete=models.CASCADE)
    approval_date = models.DateTimeField(auto_now_add=True)


    class Meta:
        verbose_name_plural = "restock_orders"

    def __str__(self):
        return str(self.product)

class restock_delivery(models.Model):
    restock_order = models.ForeignKey(restock_orders,on_delete=models.CASCADE)
    expected_quantity = models.IntegerField()
    quantity_delivered = models.IntegerField()
    delivery_status = models.CharField(max_length=20)
    delivery_date = models.DateTimeField(auto_now_add=True)
    receiver = models.ForeignKey(User,on_delete=models.CASCADE)
    supplier_name = models.CharField(max_length=255, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Delivery for {self.restock_order.product.product_name} - {self.delivery_status}"

