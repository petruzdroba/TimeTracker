from .auth_view import BaseAuthView
from ..models import WorkLog
from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore


class WorkLogUpdateView(BaseAuthView):
    def put(self, request):
        try:
            user_id = request.data.get("userId")
            token_user_id, _ = self.validate_token(request)
            access_check = self.check_user_access(token_user_id, user_id)
            if access_check:
                return access_check

            work_log = request.data.get("data")
            user_work_log = WorkLog.objects.get(id=user_id)
            user_work_log.work_log = work_log
            user_work_log.save()

            return Response(
                {"detail": "Success", "data": work_log},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WorkLogGetView(BaseAuthView):
    def get(self, request, id):
        try:
            user_id, _ = self.validate_token(request)
            access_check = self.check_user_access(user_id, id)
            if access_check:
                return access_check

            work_log = WorkLog.objects.get(id=id)
            return Response(work_log.work_log, status=status.HTTP_200_OK)
        except WorkLog.DoesNotExist:
            return Response({"detail": "fail"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
