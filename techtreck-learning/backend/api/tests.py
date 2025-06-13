from rest_framework.test import APITestCase  # type: ignore
from rest_framework import status  # type: ignore
from django.urls import reverse  # type: ignore
from django.contrib.auth.hashers import check_password, make_password  # type: ignore
from unittest.mock import patch

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


class AdminGetViewTests(APITestCase):
    def setUp(self):
        self.url = reverse("admin_get")

        self.user1 = UserData.objects.create(
            id=1,
            name="Alice",
            email="alice@example.com",
            work_hours=8,
            vacation_days=20,
            personal_time=5,
            role="employee",
        )
        self.user2 = UserData.objects.create(
            id=2,
            name="Bob",
            email="bob@example.com",
            work_hours=7,
            vacation_days=15,
            personal_time=3,
            role="admin",
        )

    def test_admin_get_success(self):
        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        user_ids = [user["id"] for user in response.data]
        self.assertIn(self.user1.id, user_ids)
        self.assertIn(self.user2.id, user_ids)

        self.assertEqual(response.data[0]["email"], self.user1.email)
        self.assertEqual(response.data[1]["role"], self.user2.role)

    def test_admin_get_handles_exception(self):
        # Simulate exception in the view
        with patch(
            "api.views.UserData.objects.all", side_effect=Exception("DB failure")
        ):
            response = self.client.get(self.url, format="json")

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "DB failure")


class UserUpdateDataTests(APITestCase):
    def setUp(self):
        self.url = reverse("user_update")

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

    def test_user_update_success(self):
        payload = {
            "data": {
                "id": 1,
                "role": "manager",
                "workHours": 9,
                "vacationDays": 20,
                "personalTime": 8,
            }
        }

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "manager")
        self.assertEqual(response.data["workHours"], 9)
        self.assertEqual(response.data["vacationDays"], 20)
        self.assertEqual(response.data["personalTime"], 8)

        # Verify database updated
        self.user_data.refresh_from_db()
        self.assertEqual(self.user_data.role, "manager")
        self.assertEqual(self.user_data.work_hours, 9)
        self.assertEqual(self.user_data.vacation_days, 20)
        self.assertEqual(self.user_data.personal_time, 8)

    def test_user_update_not_found(self):
        # Using a non-existing user id
        payload = {
            "data": {
                "id": 999,
                "role": "manager",
                "workHours": 9,
                "vacationDays": 20,
                "personalTime": 8,
            }
        }

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("detail", response.data)

    def test_user_update_invalid_payload(self):
        # Sending no data at all
        response = self.client.put(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("detail", response.data)


class VacationGetViewTests(APITestCase):
    def setUp(self):
        self.vacation = Vacation.objects.create(
            id=1,
            future_vacation=[{"startDate": "2025-07-01", "endDate": "2025-07-05"}],
            past_vacation=[{"startDate": "2025-06-01", "endDate": "2025-06-02"}],
            remaining_vacation=10,
        )
        self.url = reverse("vacation_get", args=[self.vacation.id])
        self.invalid_url = reverse("vacation_get", args=[999])  # Nonexistent ID

    def test_vacation_get_success(self):
        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("futureVacations", response.data)
        self.assertIn("pastVacations", response.data)
        self.assertIn("remainingVacationDays", response.data)
        self.assertEqual(response.data["remainingVacationDays"], 10)

    def test_vacation_get_not_found(self):
        response = self.client.get(self.invalid_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "fail")

    def test_vacation_get_handles_exception(self):
        with patch(
            "api.views.Vacation.objects.get", side_effect=Exception("Unexpected")
        ):
            response = self.client.get(self.url, format="json")

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "Unexpected")


class VacationUpdateViewTests(APITestCase):
    def setUp(self):
        self.vacation = Vacation.objects.create(
            id=1,
            future_vacation=[{"date": "2025-08-01", "description": "Trip"}],
            past_vacation=[{"date": "2025-05-01", "description": "Wedding"}],
            remaining_vacation=10,
        )
        self.url = reverse("vacation_update")
        self.valid_payload = {
            "userId": self.vacation.id,
            "data": {
                "futureVacations": [{"date": "2025-09-01", "description": "Holiday"}],
                "pastVacations": [{"date": "2025-06-01", "description": "Conference"}],
                "remainingVacationDays": 8,
            },
        }

    def test_vacation_update_success(self):
        response = self.client.put(self.url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["remainingVacationDays"], 8)
        self.assertEqual(response.data["futureVacations"][0]["description"], "Holiday")
        self.assertEqual(response.data["pastVacations"][0]["description"], "Conference")

    def test_vacation_update_not_found(self):
        payload = {
            "userId": 999,
            "data": {
                "futureVacations": [],
                "pastVacations": [],
                "remainingVacationDays": 0,
            },
        }
        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Vacation not found for user 999")

    def test_vacation_update_handles_exception(self):
        with patch("api.views.Vacation.objects.get", side_effect=Exception("DB crash")):
            response = self.client.put(self.url, self.valid_payload, format="json")

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "DB crash")


class LeaveSlipGetViewTests(APITestCase):
    def setUp(self):
        self.leave_slip = LeaveSlip.objects.create(
            id=1,
            future_slip=[{"date": "2025-07-01", "description": "Doctor"}],
            past_slip=[{"date": "2025-06-01", "description": "Errand"}],
            remaining_time=21600000,
        )
        self.url = reverse("leaveslip_get", args=[self.leave_slip.id])
        self.invalid_url = reverse("leaveslip_get", args=[999])  # Nonexistent ID

    def test_leaveslip_get_success(self):
        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("futureLeaves", response.data)
        self.assertIn("pastLeaves", response.data)
        self.assertIn("remainingTime", response.data)
        self.assertEqual(response.data["remainingTime"], 21600000)

    def test_leaveslip_get_not_found(self):
        response = self.client.get(self.invalid_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "fail")

    def test_leaveslip_get_handles_exception(self):
        with patch(
            "api.views.LeaveSlip.objects.get", side_effect=Exception("Unexpected")
        ):
            response = self.client.get(self.url, format="json")

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "Unexpected")


class LeaveSlipUpdateViewTests(APITestCase):
    def setUp(self):
        self.leave_slip = LeaveSlip.objects.create(
            id=1,
            future_slip=[{"date": "2025-07-15", "description": "Beach"}],
            past_slip=[{"date": "2025-04-01", "description": "Workshop"}],
            remaining_time=21600000,
        )
        self.url = reverse("leaveslip_update")
        self.valid_payload = {
            "userId": self.leave_slip.id,
            "data": {
                "futureLeaves": [{"date": "2025-08-01", "description": "Trip"}],
                "pastLeaves": [{"date": "2025-05-01", "description": "Seminar"}],
                "remainingTime": 18000000,
            },
        }

    def test_leaveslip_update_success(self):
        response = self.client.put(self.url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["remainingTime"], 18000000)
        self.assertEqual(response.data["futureLeaves"][0]["description"], "Trip")
        self.assertEqual(response.data["pastLeaves"][0]["description"], "Seminar")

    def test_leaveslip_update_not_found(self):
        payload = {
            "userId": 999,
            "data": {
                "futureLeaves": [],
                "pastLeaves": [],
                "remainingTime": 0,
            },
        }
        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "LeaveSlip not found for user 999")

    def test_leaveslip_update_handles_exception(self):
        with patch(
            "api.views.LeaveSlip.objects.get",
            side_effect=Exception("Unexpected DB failure"),
        ):
            response = self.client.put(self.url, self.valid_payload, format="json")

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "Unexpected DB failure")


class TimerGetViewTests(APITestCase):
    def setUp(self):
        self.timer = TimerData.objects.create(
            id=1,
            start_time="2024-01-01T08:00:00Z",
            end_time="2024-01-01T10:00:00Z",
            remaining_time=7200,
            timer_type="work",
        )
        self.valid_url = reverse("timer_get", args=[self.timer.id])
        self.invalid_url = reverse("timer_get", args=[999])

    def test_timer_get_success(self):
        response = self.client.get(self.valid_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.timer.id)
        self.assertEqual(response.data["startTime"], self.timer.start_time)
        self.assertEqual(response.data["endTime"], self.timer.end_time)
        self.assertEqual(response.data["requiredTime"], self.timer.remaining_time)
        self.assertEqual(response.data["timerType"], self.timer.timer_type)

    def test_timer_get_not_found(self):
        response = self.client.get(self.invalid_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "fail")

    def test_timer_get_handles_exception(self):
        from unittest.mock import patch

        with patch(
            "api.views.TimerData.objects.get", side_effect=Exception("DB error")
        ):
            response = self.client.get(self.valid_url, format="json")

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "DB error")


class TimerDataSyncViewTests(APITestCase):
    def setUp(self):
        self.url = reverse("timer_sync")
        self.timer = TimerData.objects.create(
            id=1,
            start_time="2023-01-01T08:00:00Z",
            end_time="2023-01-01T16:00:00Z",
            remaining_time=28800000,
            timer_type="work",
        )

    def test_sync_timer_data_success(self):
        payload = {
            "userId": self.timer.id,
            "data": {
                "startTime": "2023-01-02T09:00:00Z",
                "endTime": "2023-01-02T17:00:00Z",
                "requiredTime": 32400000,
                "timerType": "break",
            },
        }

        response = self.client.put(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.timer.refresh_from_db()
        self.assertEqual(self.timer.start_time, "2023-01-02T09:00:00Z")
        self.assertEqual(self.timer.end_time, "2023-01-02T17:00:00Z")
        self.assertEqual(self.timer.remaining_time, 32400000)
        self.assertEqual(self.timer.timer_type, "break")

    def test_sync_timer_data_not_found(self):
        response = self.client.put(
            self.url,
            data={
                "userId": 999,
                "data": {
                    "startTime": "2023-01-02T09:00:00Z",
                    "endTime": "2023-01-02T17:00:00Z",
                    "requiredTime": 32400000,
                    "timerType": "break",
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "TimerData not found for user 999")

    def test_sync_timer_data_handles_exception(self):
        from unittest.mock import patch

        with patch(
            "api.views.TimerData.objects.get", side_effect=Exception("DB error")
        ):
            response = self.client.put(
                self.url,
                data={
                    "userId": self.timer.id,
                    "data": {
                        "startTime": "2023-01-02T09:00:00Z",
                        "endTime": "2023-01-02T17:00:00Z",
                        "requiredTime": 32400000,
                        "timerType": "break",
                    },
                },
                format="json",
            )

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "DB error")


class WorkLogGetViewTests(APITestCase):
    def setUp(self):
        self.work_log = WorkLog.objects.create(
            id=1, work_log=[{"date": "2025-06-11", "timeWorked": 3600}]
        )
        self.valid_url = reverse("worklog_get", args=[self.work_log.id])
        self.invalid_url = reverse("worklog_get", args=[99999])  # non-existent ID

    def test_worklog_get_success(self):
        response = self.client.get(self.valid_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, self.work_log.work_log)

    def test_worklog_get_not_found(self):
        response = self.client.get(self.invalid_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "fail")

    def test_worklog_get_handles_exception(self):
        with patch("api.views.WorkLog.objects.get", side_effect=Exception("DB error")):
            response = self.client.get(self.valid_url, format="json")

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "DB error")


class WorkLogUpdateViewTests(APITestCase):
    def setUp(self):
        self.work_log = WorkLog.objects.create(
            id=1,
            work_log=[{"date": "2025-06-11", "timeWorked": 3600}],
        )
        self.url = reverse("worklog_update")

    def test_worklog_update_success(self):
        new_data = [{"date": "2025-06-12", "timeWorked": 7200}]
        payload = {"userId": self.work_log.id, "data": new_data}

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Success")
        self.assertEqual(response.data["data"], new_data)

        self.work_log.refresh_from_db()
        self.assertEqual(self.work_log.work_log, new_data)

    def test_worklog_update_not_found(self):
        payload = {"userId": 9999, "data": [{"date": "2025-06-12", "timeWorked": 7200}]}

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "WorkLog not found for user 9999")

    def test_worklog_update_handles_exception(self):
        payload = {
            "userId": self.work_log.id,
            "data": [{"date": "2025-06-12", "timeWorked": 7200}],
        }

        with patch("api.views.WorkLog.objects.get", side_effect=Exception("DB error")):
            response = self.client.put(self.url, payload, format="json")

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "DB error")


class ManagerGetViewTests(APITestCase):
    def setUp(self):
        self.user = UserData.objects.create(
            id=1,
            name="Test User",
            email="test@example.com",
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="Employee",
        )

        # Create corresponding Vacation and LeaveSlip for this user
        self.vacation = Vacation.objects.create(
            id=self.user.id,
            future_vacation=[{"startDate": "2025-07-01", "endDate": "2025-07-05"}],
            past_vacation=[{"startDate": "2025-06-01", "endDate": "2025-06-02"}],
            remaining_vacation=10,
        )
        self.leave = LeaveSlip.objects.create(
            id=self.user.id,
            future_slip=[{"date": "2025-07-01"}],
            past_slip=[{"date": "2025-06-01"}],
            remaining_time=14400000,
        )

        self.url = reverse("manager_get")

    def test_manager_get_success(self):
        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("vacations", response.data)
        self.assertIn("leaves", response.data)

        self.assertEqual(len(response.data["vacations"]), 1)
        self.assertEqual(len(response.data["leaves"]), 1)

        vacation = response.data["vacations"][0]
        leave = response.data["leaves"][0]

        self.assertEqual(vacation["id"], self.user.id)
        self.assertEqual(vacation["remainingVacationDays"], 10)

        self.assertEqual(leave["id"], self.user.id)
        self.assertEqual(leave["remainingTime"], 14400000)

    def test_manager_get_not_found(self):
        # Remove the vacation to simulate missing data
        self.vacation.delete()

        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)

    def test_manager_get_handles_exception(self):
        with patch(
            "api.views.Vacation.objects.get", side_effect=Exception("Unexpected")
        ):
            response = self.client.get(self.url, format="json")

            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            self.assertIn("detail", response.data)
            self.assertEqual(response.data["detail"], "Unexpected")


class GetUserBenefitsTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = UserData.objects.create(
            id=1,
            name="Test User",
            email="test@example.com",
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="Employee",
        )

        # Create related vacation and leave slip entries
        self.vacation = Vacation.objects.create(
            id=self.user.id,
            remaining_vacation=12,
            future_vacation=[],
            past_vacation=[],
        )
        self.leave = LeaveSlip.objects.create(
            id=self.user.id,
            remaining_time=7200000,
            future_slip=[],
            past_slip=[],
        )

        self.url = reverse("user_benefits", args=[self.user.id])
        self.invalid_url = reverse("user_benefits", args=[999])  # Invalid ID

    def test_get_user_benefits_success(self):
        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["vacations"], 12)
        self.assertEqual(response.data["leave"], 7200000)

    def test_get_user_benefits_not_found(self):
        # Delete vacation to simulate missing data
        self.vacation.delete()

        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("detail", response.data)

    def test_get_user_benefits_invalid_id(self):
        response = self.client.get(self.invalid_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("detail", response.data)
