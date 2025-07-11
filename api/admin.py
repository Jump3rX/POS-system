from django.contrib import admin
from django.contrib.auth.models import Permission
from django.utils.translation import gettext_lazy as _
from .models import WatchedProduct,auto_email_settings,products,Profile,Role,purchase_orders,counter_sales,restock_orders,sale_items,restock_delivery, ScheduledPriceChanges
# Register your models here.


class CustomAdmin(admin.ModelAdmin):
    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        custom_permissions = {
            "add_role": _("Can Create Roles"),
            "change_role": _("Can Edit Roles"),
            "delete_role": _("Can Delete Roles"),
            "view_role": _("Can View Roles"),

            "add_profile": _("Can Create Profiles"),
            "change_profile": _("Can Edit Profiles"),
            "delete_profile": _("Can Delete Profiles"),
            "view_profile": _("Can View Profiles"),

            "add_product": _("Can Add Products"),
            "change_product": _("Can Edit Products"),
            "delete_product": _("Can Delete Products"),
            "view_product": _("Can View Products"),

            "add_counter_sales": _("Can Register Counter Sales"),
            "change_counter_sales": _("Can Modify Counter Sales"),
            "delete_counter_sales": _("Can Remove Counter Sales"),
            "view_counter_sales": _("Can View Counter Sales"),

            "add_sale_items": _("Can Add Sale Items"),
            "change_sale_items": _("Can Edit Sale Items"),
            "delete_sale_items": _("Can Delete Sale Items"),
            "view_sale_items": _("Can View Sale Items"),

            "add_purchase_orders": _("Can Create Purchase Orders"),
            "change_purchase_orders": _("Can Edit Purchase Orders"),
            "delete_purchase_orders": _("Can Delete Purchase Orders"),
            "view_purchase_orders": _("Can View Purchase Orders"),

            "add_restock_orders": _("Can Create Restock Orders"),
            "change_restock_orders": _("Can Edit Restock Orders"),
            "delete_restock_orders": _("Can Delete Restock Orders"),
            "view_restock_orders": _("Can View Restock Orders"),

            "add_restock_delivery": _("Can Create Restock Deliveries"),
            "change_restock_delivery": _("Can Edit Restock Deliveries"),
            "delete_restock_delivery": _("Can Delete Restock Deliveries"),
            "view_restock_delivery": _("Can View Restock Deliveries"),
        }

        # Replace the default permission names
        for key in list(perms.keys()):
            if key in custom_permissions:
                perms[key] = custom_permissions[key]

        return perms

admin.site.register(Role, CustomAdmin)
admin.site.register(Profile, CustomAdmin)
admin.site.register(products, CustomAdmin)
admin.site.register(counter_sales, CustomAdmin)
admin.site.register(sale_items, CustomAdmin)
admin.site.register(purchase_orders, CustomAdmin)
admin.site.register(restock_orders, CustomAdmin)
admin.site.register(restock_delivery, CustomAdmin)

admin.site.register(auto_email_settings)
admin.site.register(WatchedProduct)

admin.site.register(ScheduledPriceChanges, CustomAdmin)