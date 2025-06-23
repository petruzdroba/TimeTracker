from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore
from .auth_view import BaseAuthView
from ..models import UserData, Vacation, LeaveSlip
from rest_framework.exceptions import AuthenticationFailed  # type: ignore


class ManagerGetView(BaseAuthView):
    def get(self, request):
        try:
            _, email = self.validate_token(request)
            user = UserData.objects.get(email=email)
            if user.role not in ["manager", "admin"]:
                return Response({"error": "Not authorized"}, status=403)

            vacations = []
            leaves = []

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
                except Exception as e:
                    continue

            return Response(
                {"vacations": vacations, "leaves": leaves}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminGetView(BaseAuthView):
    def get(self, request):
        try:
            _, email = self.validate_token(request)
            user = UserData.objects.get(email=email)
            if user.role != "admin":
                return Response({"error": "Not authorized"}, status=403)

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


class UserUpdateData(BaseAuthView):
    def put(self, request):
        try:
            # Add token validation
            token_user_id, _ = self.validate_token(request)
            data = request.data.get("data", {})
            access_check = self.check_user_access(token_user_id, data.get("id"))
            if access_check:
                return access_check

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


class GetUserBenefits(BaseAuthView):
    def get(self, request, id):
        try:
            # Add token validation
            token_user_id, _ = self.validate_token(request)
            access_check = self.check_user_access(token_user_id, id)
            if access_check:
                return access_check

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


class RestoreVacationView(BaseAuthView):
    def post(self, request):
        try:
            token_user_id, email = self.validate_token(request)
            id = request.data.get("userId")

            # Check if user is admin/manager
            requesting_user = UserData.objects.get(id=token_user_id)
            if requesting_user.role not in ["admin", "manager"]:
                access_check = self.check_user_access(token_user_id, id)
                if access_check:
                    return access_check

            user_data = UserData.objects.get(id=id)
            user_vacation = Vacation.objects.get(id=id)
            user_vacation.remaining_vacation = user_data.vacation_days
            user_vacation.save()

            return Response(
                {
                    "futureVacations": user_vacation.future_vacation,
                    "pastVacations": user_vacation.past_vacation,
                    "remainingVacationDays": user_vacation.remaining_vacation,
                },
                status=status.HTTP_200_OK,
            )
        except UserData.DoesNotExist:
            return Response(
                {"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Restore vacation error: {str(e)}")  # Debug print
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RestoreLeaveTimeView(BaseAuthView):
    def post(self, request):
        try:
            token_user_id, email = self.validate_token(request)
            id = request.data.get("userId")

            # Check if user is admin/manager
            requesting_user = UserData.objects.get(id=token_user_id)
            if requesting_user.role not in ["admin", "manager"]:
                access_check = self.check_user_access(token_user_id, id)
                if access_check:
                    return access_check

            user_data = UserData.objects.get(id=id)
            user_leave = LeaveSlip.objects.get(id=id)
            user_leave.remaining_time = user_data.personal_time * 3600000
            user_leave.save()

            return Response(
                {
                    "futureLeaves": user_leave.future_slip,
                    "pastLeaves": user_leave.past_slip,
                    "remainingTime": user_leave.remaining_time,
                },
                status=status.HTTP_200_OK,
            )
        except AuthenticationFailed as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except UserData.DoesNotExist:
            return Response(
                {"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Restore leave error: {str(e)}")
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
