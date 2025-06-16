from django.shortcuts import render  # type: ignore
from .models import TimerData, UserData, UserAuth, WorkLog, Vacation, LeaveSlip
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

            WorkLog.objects.create(id=user_data.id, work_log=[])
            Vacation.objects.create(
                id=user_data.id,
                future_vacation=[],
                past_vacation=[],
                remaining_vacation=user_data.vacation_days,
            )
            LeaveSlip.objects.create(
                id=user_data.id,
                future_slip=[],
                past_slip=[],
                remaining_time=user_data.personal_time
                * 3600000,  # Convert hours to milliseconds,
            )

            TimerData.objects.create(
                id=user_data.id,
                end_time="",
                remaining_time=user_data.personal_time * 3600000,
                start_time="",
                timer_type="OFF",
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
                    "role": user_data.role,
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
                        "role": user_data.role,
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


class UserDeleteView(APIView):
    def post(self, request):
        data = request.data

        user_id = data.get("userId")
        password = data.get("password")

        try:
            user_auth = UserAuth.objects.get(id=user_id)
            if check_password(password, user_auth.password):
                work_log = WorkLog.objects.get(id=user_id)
                vacation = Vacation.objects.get(id=user_id)
                leave = LeaveSlip.objects.get(id=user_id)
                timer = TimerData.objects.get(id=user_id)
                user_data = UserData.objects.get(id=user_id)

                work_log.delete()
                vacation.delete()
                leave.delete()
                timer.delete()
                user_data.delete()
                user_auth.delete()
                return Response(
                    {"detail": "User deleted"},
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


class GetUserDataView(APIView):
    def get(self, request, id):
        try:
            user_data = UserData.objects.get(id=id)
            return Response(
                {
                    "id": user_data.id,
                    "name": user_data.name,
                    "email": user_data.email,
                    "workHours": user_data.work_hours,
                    "vacationDays": user_data.vacation_days,
                    "personalTime": user_data.personal_time,
                    "role": user_data.role,
                },
                status=status.HTTP_200_OK,
            )
        except UserData.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
            data = request.data.get("data")

            user_vacation = Vacation.objects.get(id=user_id)
            user_vacation.future_vacation = data.get("futureVacations")
            user_vacation.past_vacation = data.get("pastVacations")
            user_vacation.remaining_vacation = data.get("remainingVacationDays")
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


class LeaveSlipGetView(APIView):
    def get(self, request, id):
        try:
            leave_slip = LeaveSlip.objects.get(id=id)
            return Response(
                {
                    "futureLeaves": leave_slip.future_slip,
                    "pastLeaves": leave_slip.past_slip,
                    "remainingTime": leave_slip.remaining_time,
                },
                status=status.HTTP_200_OK,
            )
        except LeaveSlip.DoesNotExist:
            return Response(
                {"detail": "fail"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LeaveSlipUpdateView(APIView):
    def put(self, request):
        try:
            user_id = request.data.get("userId")
            data = request.data.get("data")

            user_leave_slip = LeaveSlip.objects.get(id=user_id)
            user_leave_slip.future_slip = data.get("futureLeaves")
            user_leave_slip.past_slip = data.get("pastLeaves")
            user_leave_slip.remaining_time = data.get("remainingTime")
            user_leave_slip.save()

            return Response(
                {
                    "futureLeaves": user_leave_slip.future_slip,
                    "pastLeaves": user_leave_slip.past_slip,
                    "remainingTime": user_leave_slip.remaining_time,
                },
                status=status.HTTP_200_OK,
            )
        except LeaveSlip.DoesNotExist:
            return Response(
                {"detail": f"LeaveSlip not found for user {user_id}"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TimerDataSyncView(APIView):
    def put(self, request):
        try:
            user_id = request.data.get("userId")
            data = request.data.get("data")

            # print("Received data:", data)

            timer_data = TimerData.objects.get(id=user_id)
            timer_data.start_time = data.get("startTime")
            timer_data.end_time = data.get("endTime")
            timer_data.remaining_time = data.get("requiredTime")
            timer_data.timer_type = data.get("timerType")
            timer_data.save()

            return Response(
                {
                    "startTime": timer_data.start_time,
                    "endTime": timer_data.end_time,
                    "remainingTime": timer_data.remaining_time,
                    "timerType": timer_data.timer_type,
                },
                status=status.HTTP_200_OK,
            )
        except TimerData.DoesNotExist:
            return Response(
                {"detail": f"TimerData not found for user {user_id}"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TimerGetView(APIView):
    def get(self, request, id):
        try:
            timer_data = TimerData.objects.get(id=id)
            return Response(
                {
                    "id": id,
                    "startTime": timer_data.start_time,
                    "endTime": timer_data.end_time,
                    "requiredTime": timer_data.remaining_time,
                    "timerType": timer_data.timer_type,
                },
                status=status.HTTP_200_OK,
            )
        except TimerData.DoesNotExist:
            return Response(
                {"detail": "fail"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ManagerGetView(APIView):
    def get(self, request):
        vacations = []
        leaves = []

        try:
            for user_id in UserData.objects.all().values_list("id", flat=True):
                try:
                    vacation = Vacation.objects.get(id=user_id)
                    leave = LeaveSlip.objects.get(id=user_id)

                    vacations.append(
                        {
                            "id": user_id,
                            "futureVacations": vacation.future_vacation,
                            "pastVacations": vacation.past_vacation,
                            "remainingVacationDays": vacation.remaining_vacation,
                        }
                    )

                    leaves.append(
                        {
                            "id": user_id,
                            "futureLeaves": leave.future_slip,
                            "pastLeaves": leave.past_slip,
                            "remainingTime": leave.remaining_time,
                        }
                    )
                except (Vacation.DoesNotExist, LeaveSlip.DoesNotExist) as e:
                    return Response(
                        {"detail": str(e)}, status=status.HTTP_404_NOT_FOUND
                    )
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {"vacations": vacations, "leaves": leaves}, status=status.HTTP_200_OK
        )


class AdminGetView(APIView):
    def get(self, request):
        try:
            users = UserData.objects.all()
            return Response(
                [
                    {
                        "id": user.id,
                        "name": user.name,
                        "email": user.email,
                        "workHours": user.work_hours,
                        "vacationDays": user.vacation_days,
                        "personalTime": user.personal_time,
                        "role": user.role,
                    }
                    for user in users
                ],
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserUpdateData(APIView):

    def put(self, request):
        try:
            data = request.data.get("data", {})

            current_user = UserData.objects.get(id=data.get("id"))
            vacation = Vacation.objects.get(id=data.get("id"))
            leave = LeaveSlip.objects.get(id=data.get("id"))

            # how many days have already been consumed
            consumed = current_user.vacation_days - vacation.remaining_vacation

            new_remaining = data.get("vacationDays") - consumed
            if new_remaining < 0:
                new_remaining = 0

            vacation.remaining_vacation = new_remaining
            vacation.save()

            # consumed time
            used_time = current_user.personal_time - leave.remaining_time
            new_time = data.get("personalTime") - used_time
            if new_time < 0:
                new_time = 0
            leave.remaining_time = new_time
            leave.save()

            # update the user record
            current_user.role = data.get("role")
            current_user.vacation_days = data.get("vacationDays")
            current_user.personal_time = data.get("personalTime")
            current_user.work_hours = data.get("workHours")
            current_user.save()

            return Response(
                {
                    "role": current_user.role,
                    "workHours": current_user.work_hours,
                    "vacationDays": current_user.vacation_days,
                    "personalTime": current_user.personal_time,
                    "remainingVacation": vacation.remaining_vacation,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GetUserBenefits(APIView):
    def get(self, request, id):
        try:
            user_vacations = Vacation.objects.get(id=id).remaining_vacation
            user_leave = LeaveSlip.objects.get(id=id).remaining_time

            return Response(
                {
                    "id": id,
                    "vacations": user_vacations,
                    "leave": user_leave,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
