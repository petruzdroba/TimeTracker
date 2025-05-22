from django.shortcuts import render  # type: ignore
from .models import UserData, UserAuth
from django.contrib.auth.hashers import make_password, check_password  # type: ignore
from django.http import JsonResponse, HttpResponse  # type: ignore
from rest_framework.views import APIView  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore


class UserSignInView(APIView):
    def post(self, request):
        data = request.data
        email = data.get("email")

        # Check if email already exists in either table
        if (
            UserAuth.objects.filter(email=email).exists()
            or UserData.objects.filter(email=email).exists()
        ):
            return Response(
                {"detail": "Email already exists"},
                status=status.HTTP_409_CONFLICT,
            )

        try:
            hashed_password = make_password(data.get("password"))

            user_auth = UserAuth.objects.create(
                email=email,
                password=hashed_password,
            )

            user_data = UserData.objects.create(
                name=data.get("name"),
                email=email,
                work_hours=8,
                vacation_days=14,
                personal_time=6,
            )

            # Return the created user data
            return Response(
                {
                    "id": user_data.id,
                    "name": user_data.name,
                    "email": user_data.email,
                    "workHours": user_data.work_hours,
                    "vacationDays": user_data.vacation_days,
                    "personalTime": user_data.personal_time,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            UserAuth.objects.filter(email=email).delete()
            UserData.objects.filter(email=email).delete()
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
