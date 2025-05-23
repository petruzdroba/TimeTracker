from django.db import models  # type: ignore


# Create your models here.
class UserData(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    # stored in hours, as they are default and never changing
    work_hours = models.IntegerField()
    vacation_days = models.IntegerField()
    personal_time = models.IntegerField()  # in hours

    def __str__(self):
        return self.email


class UserAuth(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=128)  # Increased for hashed passwords

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

    def __str__(self):
        return str(id)


class LeaveSlip(models.Model):
    id = models.AutoField(primary_key=True)
    future_slip = models.JSONField()
    past_slip = models.JSONField()

    def __str__(self):
        return str(id)
