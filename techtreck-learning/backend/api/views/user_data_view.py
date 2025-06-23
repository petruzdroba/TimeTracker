from .auth_view import BaseAuthView
from ..models import UserAuth, UserData, WorkLog, Vacation, LeaveSlip, TimerData
from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore
from django.contrib.auth.hashers import check_password  # type: ignore
from rest_framework.exceptions import AuthenticationFailed  # type: ignore


class UserDeleteView(BaseAuthView):
    def post(self, request):
        data = request.data

        user_id = data.get("userId")
        password = data.get("password")

        try:
            token_user_id, _ = self.validate_token(request)
            self.check_user_access(token_user_id, user_id)

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
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetUserDataView(BaseAuthView):
    def get(self, request, id):
        try:
            token_user_id, email = self.validate_token(request)

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
            print(f"User {id} not found")
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except AuthenticationFailed as e:
            print(f"Authentication failed: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as e:
            print(f"Error getting user data: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
