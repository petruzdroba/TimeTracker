from rest_framework.test import APITestCase  # type: ignore
from django.urls import reverse  # type: ignore
from api.models import UserAuth, UserData, WorkLog, Vacation, LeaveSlip, TimerData
from django.contrib.auth.hashers import make_password  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore


def create_token(user_id, email):
    refresh = RefreshToken()
    refresh["user_id"] = user_id
    refresh["email"] = email
    return str(refresh.access_token)


class UserDeleteViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse("user_delete")
        self.email = "deleteuser@example.com"
        self.password = "deletepassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Delete User",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.work_log = WorkLog.objects.create(id=self.user_auth.id, work_log="")
        self.vacation = Vacation.objects.create(
            id=self.user_auth.id,
            future_vacation=[],
            past_vacation=[],
            remaining_vacation=14,
        )
        self.leave = LeaveSlip.objects.create(
            id=self.user_auth.id,
            future_slip=[],
            past_slip=[],
            remaining_time=21600000,
        )
        self.timer = TimerData.objects.create(
            id=self.user_auth.id,
            remaining_time=21600000,
            start_time="",
            end_time="",
            timer_type="OFF",
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_user_delete_success(self):
        response = self.client.post(
            self.url,
            {"userId": self.user_data.id, "password": self.password},
            **self.auth_headers,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["detail"], "User deleted")
        self.assertFalse(UserAuth.objects.filter(id=self.user_data.id).exists())
        self.assertFalse(UserData.objects.filter(id=self.user_data.id).exists())
        self.assertFalse(WorkLog.objects.filter(id=self.user_data.id).exists())
        self.assertFalse(Vacation.objects.filter(id=self.user_data.id).exists())
        self.assertFalse(LeaveSlip.objects.filter(id=self.user_data.id).exists())
        self.assertFalse(TimerData.objects.filter(id=self.user_data.id).exists())

    def test_user_delete_wrong_password(self):
        response = self.client.post(
            self.url,
            {"userId": self.user_data.id, "password": "wrongpassword"},
            **self.auth_headers,
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["detail"], "Invalid credentials")

    def test_user_delete_not_found(self):
        response = self.client.post(
            self.url, {"userId": 9999, "password": self.password}, **self.auth_headers
        )
        self.assertEqual(response.status_code, 500)

    def test_user_delete_no_token(self):
        response = self.client.post(
            self.url, {"userId": self.user_data.id, "password": self.password}
        )
        self.assertEqual(response.status_code, 500)


class GetUserDataViewTestCase(APITestCase):
    def setUp(self):
        self.email = "getuser@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email,
            password=make_password(self.password),
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Get User",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.url = reverse("user_get", args=[self.user_data.id])

    def test_get_user_data_success(self):
        response = self.client.get(self.url, **self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.user_data.id)
        self.assertEqual(response.data["email"], self.user_data.email)
        self.assertEqual(response.data["name"], self.user_data.name)

    def test_get_user_data_not_found(self):
        url = reverse("user_get", args=[9999])
        response = self.client.get(url, **self.auth_headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("User not found", response.data["detail"])

    def test_get_user_data_no_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_get_user_data_invalid_token(self):
        response = self.client.get(self.url, HTTP_AUTHORIZATION="Bearer invalid.token")
        self.assertEqual(response.status_code, 401)
