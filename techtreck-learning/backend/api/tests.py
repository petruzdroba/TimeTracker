from rest_framework.test import APITestCase  # type: ignore
from rest_framework import status  # type: ignore
from django.urls import reverse  # type: ignore
from django.contrib.auth.hashers import check_password, make_password  # type: ignore

from api.models import UserAuth, UserData, WorkLog, Vacation, LeaveSlip, TimerData


class UserSignInViewTests(APITestCase):
    def setUp(self):
        self.url = reverse("user_signup")
        self.user_data = {
            "email": "test@example.com",
            "password": "securepassword123",
            "name": "Test User",
        }

    def test_successful_signup(self):
        response = self.client.post(self.url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check user data creation
        user_auth = UserAuth.objects.get(email=self.user_data["email"])
        self.assertTrue(check_password(self.user_data["password"], user_auth.password))

        user_data = UserData.objects.get(email=self.user_data["email"])
        self.assertEqual(user_data.name, self.user_data["name"])

        # Check related records
        self.assertTrue(WorkLog.objects.filter(id=user_data.id).exists())
        self.assertTrue(Vacation.objects.filter(id=user_data.id).exists())
        self.assertTrue(LeaveSlip.objects.filter(id=user_data.id).exists())
        self.assertTrue(TimerData.objects.filter(id=user_data.id).exists())

    def test_conflict_existing_email(self):
        # Create an initial user
        self.client.post(self.url, self.user_data, format="json")

        # Try signing up again with the same email
        response = self.client.post(self.url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data["detail"], "Email already exists")

    def test_creation_rollback_on_error(self):
        # Patch UserData.objects.create to raise an exception
        from unittest.mock import patch

        with patch(
            "api.views.UserData.objects.create",
            side_effect=Exception("Test error"),
        ):
            response = self.client.post(self.url, self.user_data, format="json")
            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertEqual(response.data["detail"], "Test error")

        # Ensure no partial data remains
        self.assertFalse(
            UserAuth.objects.filter(email=self.user_data["email"]).exists()
        )
        self.assertFalse(
            UserData.objects.filter(email=self.user_data["email"]).exists()
        )


class UserLogInViewTests(APITestCase):
    def setUp(self):
        self.url = reverse("user_login")
        self.email = "testuser@example.com"
        self.password = "testpassword123"

        # Create test user
        UserAuth.objects.create(email=self.email, password=make_password(self.password))
        self.user_data = UserData.objects.create(
            name="Test User",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="Employee",
        )

    def test_login_success(self):
        response = self.client.post(
            self.url, {"email": self.email, "password": self.password}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.email)
        self.assertEqual(response.data["name"], self.user_data.name)

    def test_login_invalid_password(self):
        response = self.client.post(
            self.url, {"email": self.email, "password": "wrongpassword"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["detail"], "Invalid credentials")

    def test_login_user_not_found(self):
        response = self.client.post(
            self.url,
            {"email": "nonexistent@example.com", "password": "any"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "User not found")


class UserDeleteViewTests(APITestCase):
    def setUp(self):
        self.url = reverse("user_delete")

        self.email = "testuser@example.com"
        self.password = "testpassword123"

        # Create user and related data
        self.user_auth = UserAuth.objects.create(
            id=1,
            email=self.email,
            password=make_password(self.password),
        )
        self.user_data = UserData.objects.create(
            id=1,
            email=self.email,
            name="Test User",
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.work_log = WorkLog.objects.create(id=1, work_log={})
        self.vacation = Vacation.objects.create(
            id=1,
            future_vacation={},
            past_vacation={},
            remaining_vacation=14,
        )
        self.leave = LeaveSlip.objects.create(
            id=1,
            future_slip={},
            past_slip={},
            remaining_time=6,
        )
        self.timer = TimerData.objects.create(
            id=1,
            start_time="00:00",
            end_time="00:00",
            remaining_time=0,
            timer_type="OFF",  # default is "OFF"
        )

    def test_user_deletion_success(self):
        response = self.client.post(
            self.url,
            {"userId": 1, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "User deleted")

        self.assertFalse(UserAuth.objects.filter(id=1).exists())
        self.assertFalse(UserData.objects.filter(id=1).exists())
        self.assertFalse(WorkLog.objects.filter(id=1).exists())
        self.assertFalse(Vacation.objects.filter(id=1).exists())
        self.assertFalse(LeaveSlip.objects.filter(id=1).exists())
        self.assertFalse(TimerData.objects.filter(id=1).exists())

    def test_user_deletion_invalid_password(self):
        response = self.client.post(
            self.url,
            {"userId": 1, "password": "wrongpassword"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["detail"], "Invalid credentials")

    def test_user_deletion_user_not_found(self):
        response = self.client.post(
            self.url,
            {"userId": 999, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "User not found")
