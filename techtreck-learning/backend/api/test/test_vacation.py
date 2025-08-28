from rest_framework.test import APITestCase  # type: ignore
from django.urls import reverse  # type: ignore
from api.models import UserAuth, UserData, Vacation
from django.contrib.auth.hashers import make_password  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore


def create_token(user_id, email):
    refresh = RefreshToken()
    refresh["user_id"] = user_id
    refresh["email"] = email
    return str(refresh.access_token)


class VacationGetViewTestCase(APITestCase):
    def setUp(self):
        self.email = "vacationuser@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            user=self.user_auth,
            name="Vacation User",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.vacation = Vacation.objects.create(
            id=self.user_data.id,
            user=self.user_auth,
            future_vacation=[{"date": "2025-07-01"}],
            past_vacation=[{"date": "2025-01-01"}],
            remaining_vacation=10,
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.url = reverse("vacation_get", args=[self.user_data.id])

    def test_vacation_get_success(self):
        response = self.client.get(self.url, **self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["futureVacations"], [{"date": "2025-07-01"}])
        self.assertEqual(response.data["pastVacations"], [{"date": "2025-01-01"}])
        self.assertEqual(response.data["remainingVacationDays"], 10)

    def test_vacation_get_not_found(self):
        url = reverse("vacation_get", args=[9999])
        response = self.client.get(url, **self.auth_headers)
        self.assertEqual(response.status_code, 500)

    def test_vacation_get_no_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 500)

    def test_vacation_get_invalid_token(self):
        response = self.client.get(self.url, HTTP_AUTHORIZATION="Bearer invalid.token")
        self.assertEqual(response.status_code, 500)
        self.assertIn("detail", response.data)


class VacationUpdateViewTestCase(APITestCase):
    def setUp(self):
        self.email = "vacupdate@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            user=self.user_auth,
            name="Vacation Updater",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.vacation = Vacation.objects.create(
            id=self.user_data.id,
            user=self.user_auth,
            future_vacation=[],
            past_vacation=[],
            remaining_vacation=14,
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.url = reverse("vacation_update")

    def test_vacation_update_success(self):
        payload = {
            "userId": self.user_data.id,
            "data": {
                "futureVacations": [{"date": "2025-08-01"}],
                "pastVacations": [{"date": "2025-01-01"}],
                "remainingVacationDays": 12,
            },
        }
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        self.vacation.refresh_from_db()
        self.assertEqual(self.vacation.future_vacation, [{"date": "2025-08-01"}])
        self.assertEqual(self.vacation.past_vacation, [{"date": "2025-01-01"}])
        self.assertEqual(self.vacation.remaining_vacation, 12)

    def test_vacation_update_not_found(self):
        payload = {
            "userId": 9999,
            "data": {
                "futureVacations": [],
                "pastVacations": [],
                "remainingVacationDays": 10,
            },
        }
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 500)

    def test_vacation_update_no_token(self):
        payload = {
            "userId": self.user_data.id,
            "data": {
                "futureVacations": [],
                "pastVacations": [],
                "remainingVacationDays": 10,
            },
        }
        response = self.client.put(self.url, payload, format="json")
        self.assertEqual(response.status_code, 500)

    def test_vacation_update_invalid_token(self):
        payload = {
            "userId": self.user_data.id,
            "data": {
                "futureVacations": [],
                "pastVacations": [],
                "remainingVacationDays": 10,
            },
        }
        response = self.client.put(
            self.url, payload, format="json", HTTP_AUTHORIZATION="Bearer invalid.token"
        )
        self.assertEqual(response.status_code, 500)
        self.assertIn("detail", response.data)
