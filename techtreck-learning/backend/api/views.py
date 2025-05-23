from django.shortcuts import render  # type: ignore
from .models import UserData, UserAuth, WorkLog
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

            UserAuth.objects.create(
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

            WorkLog.objects.create(id=user_data.id, work_log={"entries": []})

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


class WorkLogUpdateView(APIView):
    def put(self, request):
        try:
            id = request.data.get("id")
            work_log = request.data.get("data")

            WorkLog.objects.filter(id=id).update(work_log=work_log)
            return Response(
                {"detail": "Success"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class WorkLogGetView(APIView):
    def get(self, request, id):
        try:
            work_log = WorkLog.objects.get(id=id)
            return Response(
                work_log.work_log,
                status=status.HTTP_200_OK,
            )
        except WorkLog.DoesNotExist:
            return Response(
                {"detail": "fail"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
