from .auth_view import BaseAuthView
from ..models import LeaveSlip
from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore


class LeaveSlipGetView(BaseAuthView):
    def get(self, request, id):
        try:
            user_id, _ = self.validate_token(request)
            access_check = self.check_user_access(user_id, id)
            if access_check:
                return access_check

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
            return Response({"detail": "fail"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LeaveSlipUpdateView(BaseAuthView):
    def put(self, request):
        try:
            user_id = request.data.get("userId")
            token_user_id, _ = self.validate_token(request)
            access_check = self.check_user_access(token_user_id, user_id)
            if access_check:
                return access_check

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
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
