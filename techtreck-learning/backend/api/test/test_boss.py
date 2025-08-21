from rest_framework.test import APITestCase  # type: ignore
from django.urls import reverse  # type: ignore
from api.models import UserAuth, UserData, Vacation, LeaveSlip
from django.contrib.auth.hashers import make_password  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore


def create_token(user_id, email):
    refresh = RefreshToken()
    refresh["user_id"] = user_id
    refresh["email"] = email
    return str(refresh.access_token)


class ManagerGetViewTestCase(APITestCase):
    def setUp(self):
        # Create a manager user
        self.manager_email = "manager@example.com"
        self.manager_password = "managerpass"
        self.manager_auth = UserAuth.objects.create(
            email=self.manager_email, password=make_password(self.manager_password)
        )
        self.manager_data = UserData.objects.create(
            id=self.manager_auth.id,
            name="Manager User",
            email=self.manager_email,
            work_hours=8,
            vacation_days=20,
            personal_time=10,
            role="manager",
        )
        self.manager_token = create_token(self.manager_data.id, self.manager_data.email)
        self.manager_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.manager_token}"}

        # Create a regular employee
        self.emp_email = "employee@example.com"
        self.emp_auth = UserAuth.objects.create(
            email=self.emp_email, password=make_password("emppass")
        )
        self.emp_data = UserData.objects.create(
            id=self.emp_auth.id,
            name="Employee User",
            email=self.emp_email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        Vacation.objects.create(
            id=self.manager_data.id,
            future_vacation=[{"date": "2025-12-01"}],
            past_vacation=[{"date": "2025-01-01"}],
            remaining_vacation=15,
        )
        Vacation.objects.create(
            id=self.emp_data.id,
            future_vacation=[{"date": "2025-11-01"}],
            past_vacation=[{"date": "2025-02-01"}],
            remaining_vacation=10,
        )
        LeaveSlip.objects.create(
            id=self.manager_data.id,
            future_slip=[{"date": "2025-12-10"}],
            past_slip=[{"date": "2025-01-10"}],
            remaining_time=3600000,
        )
        LeaveSlip.objects.create(
            id=self.emp_data.id,
            future_slip=[{"date": "2025-11-10"}],
            past_slip=[{"date": "2025-02-10"}],
            remaining_time=7200000,
        )
        self.url = reverse("manager_get")

    def test_manager_get_success(self):
        response = self.client.get(self.url, **self.manager_headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("vacations", response.data)
        self.assertIn("leaves", response.data)
        self.assertEqual(len(response.data["vacations"]), 2)
        self.assertEqual(len(response.data["leaves"]), 2)

    def test_manager_get_not_authorized(self):
        # Use employee token
        emp_token = create_token(self.emp_data.id, self.emp_data.email)
        emp_headers = {"HTTP_AUTHORIZATION": f"Bearer {emp_token}"}
        response = self.client.get(self.url, **emp_headers)
        self.assertEqual(response.status_code, 403)

    def test_manager_get_no_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 500)

    def test_manager_get_invalid_token(self):
        response = self.client.get(
            self.url, **{"HTTP_AUTHORIZATION": "Bearer invalidtoken"}
        )
        self.assertEqual(response.status_code, 500)


class AdminGetViewTestCase(APITestCase):
    def setUp(self):
        # Create an admin user
        self.admin_email = "admin@example.com"
        self.admin_password = "adminpass"
        self.admin_auth = UserAuth.objects.create(
            email=self.admin_email, password=make_password(self.admin_password)
        )
        self.admin_data = UserData.objects.create(
            id=self.admin_auth.id,
            name="Admin User",
            email=self.admin_email,
            work_hours=8,
            vacation_days=20,
            personal_time=10,
            role="admin",
        )
        self.admin_token = create_token(self.admin_data.id, self.admin_data.email)
        self.admin_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.admin_token}"}

        # Create a regular employee
        self.emp_email = "employee2@example.com"
        self.emp_auth = UserAuth.objects.create(
            email=self.emp_email, password=make_password("emppass2")
        )
        self.emp_data = UserData.objects.create(
            id=self.emp_auth.id,
            name="Employee User 2",
            email=self.emp_email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.url = reverse("admin_get")

    def test_admin_get_success(self):
        response = self.client.get(self.url, **self.admin_headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(response.data, list))
        self.assertGreaterEqual(len(response.data), 2)
        emails = [user["email"] for user in response.data]
        self.assertIn(self.admin_email, emails)
        self.assertIn(self.emp_email, emails)

    def test_admin_get_not_authorized(self):
        # Use employee token
        emp_token = create_token(self.emp_data.id, self.emp_data.email)
        emp_headers = {"HTTP_AUTHORIZATION": f"Bearer {emp_token}"}
        response = self.client.get(self.url, **emp_headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Not authorized", str(response.data))

    def test_admin_get_no_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 500)

    def test_admin_get_invalid_token(self):
        response = self.client.get(self.url, HTTP_AUTHORIZATION="Bearer invalidtoken")
        self.assertEqual(response.status_code, 500)


class UserUpdateDataViewTestCase(APITestCase):
    def setUp(self):
        # Create user and related models
        self.email = "updateuser@example.com"
        self.password = "updatepass"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Update User",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="manager",
        )
        self.vacation = Vacation.objects.create(
            id=self.user_data.id,
            future_vacation=[],
            past_vacation=[],
            remaining_vacation=10,
        )
        self.leave = LeaveSlip.objects.create(
            id=self.user_data.id, future_slip=[], past_slip=[], remaining_time=4
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.url = reverse("user_update")

    def test_user_update_success(self):
        payload = {
            "data": {
                "id": self.user_data.id,
                "role": "manager",
                "workHours": 9,
                "vacationDays": 20,
                "personalTime": 8,
            }
        }
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 201)
        self.user_data.refresh_from_db()
        self.assertEqual(self.user_data.role, "manager")
        self.assertEqual(self.user_data.work_hours, 9)
        self.assertEqual(self.user_data.vacation_days, 20)
        self.assertEqual(self.user_data.personal_time, 8)
        self.vacation.refresh_from_db()
        self.assertEqual(
            response.data["remainingVacation"], self.vacation.remaining_vacation
        )

    def test_user_update_not_found(self):
        payload = {
            "data": {
                "id": 9999,
                "role": "manager",
                "workHours": 9,
                "vacationDays": 20,
                "personalTime": 8,
            }
        }
        response = self.client.put(
            self.url, payload, format="json", **self.auth_headers
        )
        self.assertEqual(response.status_code, 500)

    def test_user_update_no_token(self):
        payload = {
            "data": {
                "id": self.user_data.id,
                "role": "manager",
                "workHours": 9,
                "vacationDays": 20,
                "personalTime": 8,
            }
        }
        response = self.client.put(self.url, payload, format="json")
        self.assertEqual(response.status_code, 500)

    def test_user_update_invalid_token(self):
        payload = {
            "data": {
                "id": self.user_data.id,
                "role": "manager",
                "workHours": 9,
                "vacationDays": 20,
                "personalTime": 8,
            }
        }
        response = self.client.put(
            self.url, payload, format="json", HTTP_AUTHORIZATION="Bearer invalid.token"
        )
        self.assertEqual(response.status_code, 500)


class RestoreVacationViewTestCase(APITestCase):
    def setUp(self):
        # Create admin user
        self.admin_email = "adminrestore@example.com"
        self.admin_password = "adminpass"
        self.admin_auth = UserAuth.objects.create(
            email=self.admin_email, password=make_password(self.admin_password)
        )
        self.admin_data = UserData.objects.create(
            id=self.admin_auth.id,
            name="Admin Restore",
            email=self.admin_email,
            work_hours=8,
            vacation_days=20,
            personal_time=10,
            role="admin",
        )
        self.admin_token = create_token(self.admin_data.id, self.admin_data.email)
        self.admin_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.admin_token}"}

        # Create regular user with less remaining vacation
        self.user_email = "vacrestore@example.com"
        self.user_auth = UserAuth.objects.create(
            email=self.user_email, password=make_password("userpass")
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Vacation Restore",
            email=self.user_email,
            work_hours=8,
            vacation_days=15,
            personal_time=6,
            role="employee",
        )
        self.vacation = Vacation.objects.create(
            id=self.user_data.id,
            future_vacation=[],
            past_vacation=[],
            remaining_vacation=5,
        )
        self.url = reverse("vacation_restore")

    def test_restore_vacation_success_admin(self):
        payload = {"userId": self.user_data.id}
        response = self.client.post(
            self.url, payload, format="json", **self.admin_headers
        )
        self.assertEqual(response.status_code, 200)
        self.vacation.refresh_from_db()
        self.assertEqual(self.vacation.remaining_vacation, self.user_data.vacation_days)

    def test_restore_vacation_not_found(self):
        payload = {"userId": 9999}
        response = self.client.post(
            self.url, payload, format="json", **self.admin_headers
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("User not found", response.data["detail"])

    def test_restore_vacation_no_token(self):
        payload = {"userId": self.user_data.id}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, 500)

    def test_restore_vacation_invalid_token(self):
        payload = {"userId": self.user_data.id}
        response = self.client.post(
            self.url, payload, format="json", HTTP_AUTHORIZATION="Bearer invalid.token"
        )
        self.assertEqual(response.status_code, 500)


class RestoreLeaveTimeViewTestCase(APITestCase):
    def setUp(self):
        # Create admin user
        self.admin_email = "adminrestoretime@example.com"
        self.admin_password = "adminpass"
        self.admin_auth = UserAuth.objects.create(
            email=self.admin_email, password=make_password(self.admin_password)
        )
        self.admin_data = UserData.objects.create(
            id=self.admin_auth.id,
            name="Admin Restore Time",
            email=self.admin_email,
            work_hours=8,
            vacation_days=20,
            personal_time=10,
            role="admin",
        )
        self.admin_token = create_token(self.admin_data.id, self.admin_data.email)
        self.admin_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.admin_token}"}

        # Create regular user with less remaining time
        self.user_email = "timerestore@example.com"
        self.user_auth = UserAuth.objects.create(
            email=self.user_email, password=make_password("userpass")
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Time Restore",
            email=self.user_email,
            work_hours=8,
            vacation_days=15,
            personal_time=6,
            role="employee",
        )
        self.leave = LeaveSlip.objects.create(
            id=self.user_data.id,
            future_slip=[],
            past_slip=[],
            remaining_time=1000,  # less than default
        )
        self.url = reverse("leave_restore")

    def test_restore_leave_time_success_admin(self):
        payload = {"userId": self.user_data.id}
        response = self.client.post(
            self.url, payload, format="json", **self.admin_headers
        )
        self.assertEqual(response.status_code, 200)
        self.leave.refresh_from_db()
        self.assertEqual(
            self.leave.remaining_time, self.user_data.personal_time * 3600000
        )

    def test_restore_leave_time_not_found(self):
        payload = {"userId": 9999}
        response = self.client.post(
            self.url, payload, format="json", **self.admin_headers
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("User not found", response.data["detail"])

    def test_restore_leave_time_no_token(self):
        payload = {"userId": self.user_data.id}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, 401)

    def test_restore_leave_time_invalid_token(self):
        payload = {"userId": self.user_data.id}
        response = self.client.post(
            self.url, payload, format="json", HTTP_AUTHORIZATION="Bearer invalid.token"
        )
        self.assertEqual(response.status_code, 401)
