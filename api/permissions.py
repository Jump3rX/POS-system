from rest_framework.permissions import BasePermission

class isManagerRole(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.profile.role.name == 'manager'