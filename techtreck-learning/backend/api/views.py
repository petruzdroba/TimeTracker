from django.shortcuts import render  # type: ignore
from .models import UserData, UserAuth, WorkLog, Vacation, LeaveSlip
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

            WorkLog.objects.create(id=user_data.id, work_log=[{}])
            Vacation.objects.create(
                id=user_data.id,
                future_vacation=[{}],
                past_vacation=[{}],
                remaining_vacation=user_data.vacation_days,
            )
            LeaveSlip.objects.create(
                id=user_data.id,
                future_slip=[{}],
                past_slip=[{}],
                remaining_time=user_data.personal_time,
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


class UserLogInView(APIView):
    def post(self, request):
        data = request.data
        email = data.get("email")
        password = data.get("password")

        try:
            user_auth = UserAuth.objects.get(email=email)
            if check_password(password, user_auth.password):
                user_data = UserData.objects.get(email=email)
                return Response(
                    {
                        "id": user_data.id,
                        "name": user_data.name,
                        "email": user_data.email,
                        "workHours": user_data.work_hours,
                        "vacationDays": user_data.vacation_days,
                        "personalTime": user_data.personal_time,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"detail": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        except UserAuth.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


class WorkLogUpdateView(APIView):
    def put(self, request):
        try:
            user_id = request.data.get("userId")
            work_log = request.data.get("data")

            user_work_log = WorkLog.objects.get(id=user_id)
            user_work_log.work_log = work_log
            user_work_log.save()

            return Response(
                {"detail": "Success", "data": work_log},
                status=status.HTTP_200_OK,
            )
        except WorkLog.DoesNotExist:
            return Response(
                {"detail": f"WorkLog not found for user {user_id}"},
                status=status.HTTP_404_NOT_FOUND,
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


class VacationGetView(APIView):
    def get(self, request, id):
        try:
            vacation = Vacation.objects.get(id=id)
            return Response(
                {
                    "futureVacations": vacation.future_vacation,
                    "pastVacations": vacation.past_vacation,
                    "remainingVacationDays": vacation.remaining_vacation,
                },
                status=status.HTTP_200_OK,
            )
        except Vacation.DoesNotExist:
            return Response(
                {"detail": "fail"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class VacationUpdateView(APIView):
    def put(self, request):
        try:
            user_id = request.data.get("userId")
            future_data = request.data.get("future")
            past_data = request.data.get("past")
            days_data = request.data.get("days")

            user_vacation = Vacation.objects.get(id=user_id)
            user_vacation.future_vacation = future_data
            user_vacation.past_vacation = past_data
            user_vacation.remaining_vacation = days_data
            user_vacation.save()

            return Response(
                {
                    "futureVacations": user_vacation.future_vacation,
                    "pastVacations": user_vacation.past_vacation,
                    "remainingVacationDays": user_vacation.remaining_vacation,
                },
                status=status.HTTP_200_OK,
            )
        except Vacation.DoesNotExist:
            return Response(
                {"detail": f"Vacation not found for user {user_id}"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
