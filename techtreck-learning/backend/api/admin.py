from django.contrib import admin  # type: ignore
from .models import UserData, UserAuth, WorkLog, Vacation, LeaveSlip, TimerData


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


class WorkLogAdmin(admin.ModelAdmin):
    list_display = ("id", "work_log")
    readonly_fields = ("id",)


class VacationAdmin(admin.ModelAdmin):
    list_display = ("id", "future_vacation", "past_vacation", "remaining_vacation")
    readonly_fields = ("id",)


class LeaveSlipAdmin(admin.ModelAdmin):
    list_display = ("id", "future_slip", "past_slip", "remaining_time")
    readonly_fields = ("id",)


class TimerDataAdmin(admin.ModelAdmin):
    list_display = ("id", "start_time", "end_time", "remaining_time")
    readonly_fields = ("id",)


admin.site.register(UserData, UserDataAdmin)
admin.site.register(UserAuth, UserAuthAdmin)
admin.site.register(WorkLog, WorkLogAdmin)
admin.site.register(Vacation, VacationAdmin)
admin.site.register(LeaveSlip, LeaveSlipAdmin)
admin.site.register(TimerData, TimerDataAdmin)
