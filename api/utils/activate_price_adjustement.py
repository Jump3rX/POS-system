from django.utils import timezone
from django.db import transaction
from django.db.models import F
from api.models import ScheduledPriceChanges, products

def run_scheduled_price_updates():
    today = timezone.now().date()

    # STEP 1: Activate price changes whose activation_date is today or earlier AND prices are not yet applied
    pending_changes = ScheduledPriceChanges.objects.filter(
    activation_date__lte=today).exclude(is_active=True)

    for change in pending_changes:
        product = change.product

        try:
            with transaction.atomic():
                # Store current prices in original fields before applying new ones
                product.selling_price = change.new_selling_price
                product.cost_price = change.new_cost_price
                change.is_active = True
                change.save()
                product.save()
                print(f"✔ Activated price change for {product.product_name}")
        except Exception as e:
            print(f"❌ Error applying price change for {product.product_name}: {e}")

    # STEP 2: Revert prices whose end_date is in the past
    expired_changes = ScheduledPriceChanges.objects.filter(end_date__lt=today)

    for change in expired_changes:
        product = change.product

        try:
            with transaction.atomic():
                # Revert to original prices
                product.selling_price = product.original_selling_price or product.selling_price
                product.cost_price = product.original_cost_price or product.cost_price
                change.is_active = False
                change.save()
                product.save()
                # Clean up the schedule if you wish
                change.delete()
                print(f"🔄 Reverted prices for {product.product_name} and removed schedule")
        except Exception as e:
            print(f"❌ Error reverting price for {product.product_name}: {e}")
