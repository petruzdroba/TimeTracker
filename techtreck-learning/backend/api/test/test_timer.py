from rest_framework.test import APITestCase  # type: ignore
from django.urls import reverse  # type: ignore
from api.models import UserAuth, UserData, TimerData
from django.contrib.auth.hashers import make_password  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore


def create_token(user_id, email):
    refresh = RefreshToken()
    refresh["user_id"] = user_id
    refresh["email"] = email
    return str(refresh.access_token)


class TimerDataSyncViewTestCase(APITestCase):
    def setUp(self):
        self.email = "timeruser@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            user=self.user_auth,
            name="Timer User",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.timer_data = TimerData.objects.create(
            id=self.user_data.id,
            user=self.user_auth,
            start_time="2025-01-01T09:00:00Z",
            end_time="2025-01-01T17:00:00Z",
            remaining_time=28800000,
            timer_type="ON",
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.url = reverse("timer_sync")

    def test_timer_sync_success(self):
        payload = {
            "userId": self.user_data.id,
            "data": {
                "startTime": "2025-01-02T09:00:00Z",
                "endTime": "2025-01-02T17:00:00Z",
                "requiredTime": 25200000,
                "timerType": "OFF",
            },
        }
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        self.timer_data.refresh_from_db()
        self.assertEqual(self.timer_data.start_time, "2025-01-02T09:00:00Z")
        self.assertEqual(self.timer_data.end_time, "2025-01-02T17:00:00Z")
        self.assertEqual(self.timer_data.remaining_time, 25200000)
        self.assertEqual(self.timer_data.timer_type, "OFF")

    def test_timer_sync_not_found(self):
        payload = {
            "userId": 9999,
            "data": {
                "startTime": "2025-01-02T09:00:00Z",
                "endTime": "2025-01-02T17:00:00Z",
                "requiredTime": 25200000,
                "timerType": "OFF",
            },
        }
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 500)

    def test_timer_sync_no_token(self):
        payload = {
            "userId": self.user_data.id,
            "data": {
                "startTime": "2025-01-02T09:00:00Z",
                "endTime": "2025-01-02T17:00:00Z",
                "requiredTime": 25200000,
                "timerType": "OFF",
            },
        }
        response = self.client.put(self.url, payload, format="json")
        self.assertEqual(response.status_code, 500)

    def test_timer_sync_invalid_token(self):
        payload = {
            "userId": self.user_data.id,
            "data": {
                "startTime": "2025-01-02T09:00:00Z",
                "endTime": "2025-01-02T17:00:00Z",
                "requiredTime": 25200000,
                "timerType": "OFF",
            },
        }
        response = self.client.put(
            self.url, payload, format="json", HTTP_AUTHORIZATION="Bearer invalid.token"
        )
        self.assertEqual(response.status_code, 500)
