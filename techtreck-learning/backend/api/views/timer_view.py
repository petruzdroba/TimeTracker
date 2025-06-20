from .auth_view import BaseAuthView
from ..models import TimerData
from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore


class TimerDataSyncView(BaseAuthView):
    def put(self, request):
        try:
            token_user_id, _ = self.validate_token(request)
            user_id = request.data.get("userId")
            access_check = self.check_user_access(token_user_id, user_id)
            if access_check:
                return access_check

            data = request.data.get("data")
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


class TimerGetView(BaseAuthView):
    def get(self, request, id):
        try:
            token_user_id, _ = self.validate_token(request)
            access_check = self.check_user_access(token_user_id, id)
            if access_check:
                return access_check

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
                {"detail": "Timer not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
