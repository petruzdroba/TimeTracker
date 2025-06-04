from django.db import models  # type: ignore


class UserData(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    # stored in hours, as they are default and never changing
    work_hours = models.IntegerField()
    vacation_days = models.IntegerField()
    personal_time = models.IntegerField()  # in hours
    role = models.CharField(
        max_length=50, default="employee"
    )  # e.g., employee, manager, admin

    def __str__(self):
        return self.email


class UserAuth(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.email


class WorkLog(models.Model):
    id = models.IntegerField(primary_key=True)
    work_log = models.JSONField()

    def __str__(self):
        return str(id)


class Vacation(models.Model):
    id = models.AutoField(primary_key=True)
    future_vacation = models.JSONField()
    past_vacation = models.JSONField()
    remaining_vacation = models.IntegerField(default=14)  # in days

    def __str__(self):
        return str(id)


class LeaveSlip(models.Model):
    id = models.AutoField(primary_key=True)
    future_slip = models.JSONField()
    past_slip = models.JSONField()
    remaining_time = models.IntegerField(default=6)  # in time

    def __str__(self):
        return str(id)


class TimerData(models.Model):
    id = models.IntegerField(primary_key=True)
    start_time = models.CharField(max_length=100)
    end_time = models.CharField(max_length=100)
    remaining_time = models.IntegerField()  # in ms
    timer_type = models.CharField(max_length=4, default="OFF")

    def __str__(self):
        return str(self.id)
