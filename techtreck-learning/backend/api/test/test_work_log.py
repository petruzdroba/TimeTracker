from rest_framework.test import APITestCase  # type: ignore
from django.urls import reverse  # type: ignore
from api.models import UserAuth, UserData, WorkLog
from django.contrib.auth.hashers import make_password  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore


def create_token(user_id, email):
    refresh = RefreshToken()
    refresh["user_id"] = user_id
    refresh["email"] = email
    return str(refresh.access_token)


class WorkLogGetViewTestCase(APITestCase):
    def setUp(self):
        self.email = "workloguser@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            user=self.user_auth,
            name="WorkLog User",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.work_log = WorkLog.objects.create(
            id=self.user_data.id,user=self.user_auth, work_log=[{"date": "2025-11-01", "hours": 8}]
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.url = reverse("worklog_get", args=[self.user_data.id])

    def test_work_log_get_success(self):
        response = self.client.get(self.url, **self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [{"date": "2025-11-01", "hours": 8}])

    def test_work_log_get_not_found(self):
        url = reverse("worklog_get", args=[9999])
        response = self.client.get(url, **self.auth_headers)
        self.assertEqual(response.status_code, 500)

    def test_work_log_get_no_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 500)

    def test_work_log_get_invalid_token(self):
        response = self.client.get(self.url, HTTP_AUTHORIZATION="Bearer invalid.token")
        self.assertEqual(response.status_code, 500)


class WorkLogUpdateViewTestCase(APITestCase):
    def setUp(self):
        self.email = "worklogupdate@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            user=self.user_auth,
            name="WorkLog Updater",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.work_log = WorkLog.objects.create(
            id=self.user_data.id,user=self.user_auth, work_log=[{"date": "2025-11-01", "hours": 8}]
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.url = reverse("worklog_update")

    def test_work_log_update_success(self):
        payload = {
            "userId": self.user_data.id,
            "data": [
                {"date": "2025-11-02", "hours": 7},
                {"date": "2025-11-03", "hours": 6},
            ],
        }
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        self.work_log.refresh_from_db()
        self.assertEqual(
            self.work_log.work_log,
            [{"date": "2025-11-02", "hours": 7}, {"date": "2025-11-03", "hours": 6}],
        )
        self.assertEqual(response.data["detail"], "Success")

    def test_work_log_update_not_found(self):
        payload = {"userId": 9999, "data": [{"date": "2025-11-04", "hours": 5}]}
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 500)

    def test_work_log_update_no_token(self):
        payload = {
            "userId": self.user_data.id,
            "data": [{"date": "2025-11-05", "hours": 4}],
        }
        response = self.client.put(self.url, payload, format="json")
        self.assertEqual(response.status_code, 500)

    def test_work_log_update_invalid_token(self):
        payload = {
            "userId": self.user_data.id,
            "data": [{"date": "2025-11-06", "hours": 3}],
        }
        response = self.client.put(
            self.url, payload, format="json", HTTP_AUTHORIZATION="Bearer invalid.token"
        )
