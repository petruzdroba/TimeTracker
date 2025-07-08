from rest_framework.views import APIView  # type: ignore
from rest_framework.permissions import AllowAny  # type: ignore
from rest_framework.exceptions import AuthenticationFailed  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore
from django.utils.decorators import method_decorator  # type: ignore
from django.views.decorators.csrf import csrf_exempt  # type: ignore
from django.contrib.auth.hashers import make_password, check_password  # type: ignore
from ..models import TimerData, UserData, UserAuth, WorkLog, Vacation, LeaveSlip


class BaseAuthView(APIView):
    permission_classes = [AllowAny]

    def validate_token(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise AuthenticationFailed("No token provided")

        token = auth_header.split(" ")[1]
        try:
            decoded_token = AccessToken(token)
            user_id = decoded_token.get("user_id")
            email = decoded_token.get("email")
            return user_id, email
        except Exception as e:
            raise AuthenticationFailed(f"Token validation failed: {str(e)}")

    def check_user_access(self, token_user_id, requested_id):
        if not token_user_id or not requested_id:
            raise AuthenticationFailed("Missing user ID")

        if str(token_user_id) != str(requested_id):
            raise AuthenticationFailed("Not authorized to access this resource")


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


@method_decorator(csrf_exempt, name="dispatch")
class UserLogInView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = data.get("email")
        password = data.get("password")

        try:
            user_auth = UserAuth.objects.get(email=email)
            if check_password(password, user_auth.password):
                user_data = UserData.objects.get(email=email)

                # Create JWT tokens
                refresh = RefreshToken()
                refresh["email"] = email
                refresh["user_id"] = user_data.id

                return Response(
                    {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "user": {
                            "id": user_data.id,
                            "name": user_data.name,
                            "email": user_data.email,
                            "workHours": user_data.work_hours,
                            "vacationDays": user_data.vacation_days,
                            "personalTime": user_data.personal_time,
                            "role": user_data.role,
                        },
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


class UserMeView(APIView):
    permission_classes = [AllowAny]  # Temporarily allow all to debug

    def get(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"error": "No token provided"}, status=401)

        token = auth_header.split(" ")[1]
        try:
            # Manually decode the token
            from rest_framework_simplejwt.tokens import AccessToken  # type: ignore

            decoded_token = AccessToken(token)

            # Get user data directly from token claims
            user_id = decoded_token.get("user_id")
            email = decoded_token.get("email")

            user_data = UserData.objects.get(id=user_id)

            return Response(
                {
                    "id": user_data.id,
                    "name": user_data.name,
                    "email": user_data.email,
                    "workHours": user_data.work_hours,
                    "vacationDays": user_data.vacation_days,
                    "personalTime": user_data.personal_time,
                    "role": user_data.role,
                }
            )
        except Exception as e:
            print(f"Token decode error: {str(e)}")
            return Response({"error": str(e)}, status=401)
