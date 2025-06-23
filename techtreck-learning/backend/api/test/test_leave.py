from rest_framework.test import APITestCase  # type: ignore
from django.urls import reverse  # type: ignore
from api.models import UserAuth, UserData, LeaveSlip
from django.contrib.auth.hashers import make_password  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore


def create_token(user_id, email):
    refresh = RefreshToken()
    refresh["user_id"] = user_id
    refresh["email"] = email
    return str(refresh.access_token)


class LeaveSlipGetViewTestCase(APITestCase):
    def setUp(self):
        self.email = "leaveuser@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Leave User",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.leave_slip = LeaveSlip.objects.create(
            id=self.user_data.id,
            future_slip=[{"date": "2025-09-01"}],
            past_slip=[{"date": "2025-02-01"}],
            remaining_time=7200000,
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.url = reverse("leaveslip_get", args=[self.user_data.id])

    def test_leave_get_success(self):
        response = self.client.get(self.url, **self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["futureLeaves"], [{"date": "2025-09-01"}])
        self.assertEqual(response.data["pastLeaves"], [{"date": "2025-02-01"}])
        self.assertEqual(response.data["remainingTime"], 7200000)

    def test_leave_get_not_found(self):
        url = reverse("leaveslip_get", args=[9999])
        response = self.client.get(url, **self.auth_headers)
        self.assertEqual(response.status_code, 500)

    def test_leave_get_no_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 500)

    def test_leave_get_invalid_token(self):
        response = self.client.get(self.url, HTTP_AUTHORIZATION="Bearer invalid.token")
        self.assertEqual(response.status_code, 500)


class LeaveSlipUpdateViewTestCase(APITestCase):
    def setUp(self):
        self.email = "leaveupdate@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Leave Updater",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.leave_slip = LeaveSlip.objects.create(
            id=self.user_data.id,
            future_slip=[],
            past_slip=[],
            remaining_time=7200000,
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.url = reverse("leaveslip_update")

    def test_leave_update_success(self):
        payload = {
            "userId": self.user_data.id,
            "data": {
                "futureLeaves": [{"date": "2025-10-01"}],
                "pastLeaves": [{"date": "2025-03-01"}],
                "remainingTime": 3600000,
            },
        }
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        self.leave_slip.refresh_from_db()
        self.assertEqual(self.leave_slip.future_slip, [{"date": "2025-10-01"}])
        self.assertEqual(self.leave_slip.past_slip, [{"date": "2025-03-01"}])
        self.assertEqual(self.leave_slip.remaining_time, 3600000)

    def test_leave_update_not_found(self):
        payload = {
            "userId": 9999,
            "data": {
                "futureLeaves": [],
                "pastLeaves": [],
                "remainingTime": 0,
            },
        }
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 500)

    def test_leave_update_no_token(self):
        payload = {
            "userId": self.user_data.id,
            "data": {
                "futureLeaves": [],
                "pastLeaves": [],
                "remainingTime": 0,
            },
        }
        response = self.client.put(self.url, payload, format="json")
        self.assertEqual(response.status_code, 500)

    def test_leave_update_invalid_token(self):
        payload = {
            "userId": self.user_data.id,
            "data": {
                "futureLeaves": [],
                "pastLeaves": [],
                "remainingTime": 0,
            },
        }
        response = self.client.put(
            self.url,
            payload,
            format="json",
            HTTP_AUTHORIZATION="Bearer invalid.token<vscode_annotation details='%5B%7B%22title%22%3A%22hardcoded-credentials%22%2C%22description%22%3A%22Embedding%20credentials%20in%20source%20code%20risks%20unauthorized%20access%22%7D%5D'>",
        )
        self.assertEqual(response.status_code, 500)
