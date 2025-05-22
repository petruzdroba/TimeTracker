from django.contrib import admin  # type: ignore
from .models import UserData, UserAuth


class UserDataAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "email",
        "work_hours",
        "vacation_days",
        "personal_time",
    )
    readonly_fields = ("id",)


class UserAuthAdmin(admin.ModelAdmin):
    list_display = ("id", "email")
    readonly_fields = ("id",)


admin.site.register(UserData, UserDataAdmin)
admin.site.register(UserAuth, UserAuthAdmin)
