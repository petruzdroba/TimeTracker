from .auth_view import BaseAuthView
from ..models import Vacation
from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore


class VacationGetView(BaseAuthView):
    def get(self, request, id):
        try:
            user_id, _ = self.validate_token(request)
            access_check = self.check_user_access(user_id, id)
            if access_check:
                return access_check

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
            return Response({"detail": "fail"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VacationUpdateView(BaseAuthView):
    def put(self, request):
        try:
            user_id = request.data.get("userId")
            token_user_id, _ = self.validate_token(request)
            access_check = self.check_user_access(token_user_id, user_id)
            if access_check:
                return access_check

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
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
