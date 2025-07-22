from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.utils import timezone
from .models import products, ScheduledPriceChanges
from django.contrib.auth import get_user_model
from api.utils.activate_price_adjustement import run_scheduled_price_updates as activate_utils

User = get_user_model()

class ScheduledPriceChangeTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="testuser")
        self.product = products.objects.create(
            product_code=111111,
            product_name="Scheduled Product",
            product_category="Category",
            selling_price=100,
            cost_price=80,
            total_quantity=100,
            quantity=100,
            low_stock_level=10,
            batch_number="BATCH001",
            expiry_date="2025-12-31",
            original_selling_price=100,
            original_cost_price=80
        )

    def test_price_activation_and_reversion(self):
        ScheduledPriceChanges.objects.create(
            product=self.product,
            new_selling_price=150,
            new_cost_price=120,
            activation_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=1),
            created_by=self.user
        )

        activate_utils()
        self.product.refresh_from_db()
        self.assertEqual(self.product.selling_price, 150)
        self.assertEqual(self.product.cost_price, 120)

        # Simulate time passing
        ScheduledPriceChanges.objects.update(end_date=timezone.now().date() - timezone.timedelta(days=1))
        activate_utils()
        self.product.refresh_from_db()
        self.assertEqual(self.product.selling_price, 100)  # Original
        self.assertEqual(self.product.cost_price, 80)
