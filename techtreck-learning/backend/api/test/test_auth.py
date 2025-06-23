from rest_framework.test import APITestCase, APIRequestFactory  # type: ignore
from rest_framework import status  # type: ignore
from api.views.auth_view import BaseAuthView
from api.models import UserAuth, UserData
from django.contrib.auth.hashers import make_password  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore
from rest_framework.response import Response  # type: ignore
from django.urls import reverse  # type: ignore


class DummyView(BaseAuthView):
    def get(self, request, id=None):
        try:
            token_user_id, email = self.validate_token(request)
            if id:
                self.check_user_access(token_user_id, id)
            return Response({"user_id": token_user_id, "email": email}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=401)


def create_token(user_id, email):
    refresh = RefreshToken()
    refresh["user_id"] = user_id
    refresh["email"] = email
    return str(refresh.access_token)


class TestBaseAuthViewCase(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user_auth = UserAuth.objects.create(
            email="test@example.com", password=make_password("testpass123")
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Test User",
            email="test@example.com",
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.view = DummyView.as_view()

    def test_validate_token_success(self):
        request = self.factory.get("/dummy/", HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user_id"], self.user_data.id)
        self.assertEqual(response.data["email"], self.user_data.email)

    def test_validate_token_missing(self):
        request = self.factory.get("/dummy/")
        response = self.view(request)
        self.assertEqual(response.status_code, 401)
        self.assertIn("No token provided", str(response.data["error"]))

    def test_validate_token_invalid(self):
        request = self.factory.get("/dummy/", HTTP_AUTHORIZATION="Bearer invalid.token")
        response = self.view(request)
        self.assertEqual(response.status_code, 401)
        self.assertIn("Token validation failed", str(response.data["error"]))

    def test_check_user_access_success(self):
        request = self.factory.get(
            "/dummy/1", HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        response = self.view(request, id=str(self.user_data.id))
        self.assertEqual(response.status_code, 200)

    def test_check_user_access_forbidden(self):
        request = self.factory.get(
            "/dummy/999", HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        response = self.view(request, id="999")
        self.assertEqual(response.status_code, 401)
        self.assertIn("Not authorized", str(response.data["error"]))


class UserSignInViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse("user_signup")
        self.signup_data = {
            "name": "Test User",
            "email": "testuser@example.com",
            "password": "testpassword123",
        }

    def test_sign_up_success(self):
        response = self.client.post(self.url, self.signup_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["email"], self.signup_data["email"])
        self.assertEqual(response.data["name"], self.signup_data["name"])
        self.assertTrue(
            UserAuth.objects.filter(email=self.signup_data["email"]).exists()
        )
        self.assertTrue(
            UserData.objects.filter(email=self.signup_data["email"]).exists()
        )

    def test_sign_up_duplicate_email(self):
        # Create user first
        self.client.post(self.url, self.signup_data)
        # Try to sign up again with the same email
        response = self.client.post(self.url, self.signup_data)
        self.assertEqual(response.status_code, 409)
        self.assertIn("Email already exists", response.data["detail"])


class UserLogInViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse("user_login")
        self.email = "testlogin@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Test Login",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )

    def test_login_success(self):
        response = self.client.post(
            self.url, {"email": self.email, "password": self.password}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], self.email)

    def test_login_wrong_password(self):
        response = self.client.post(
            self.url, {"email": self.email, "password": "wrongpassword"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid credentials", response.data["detail"])

    def test_login_user_not_found(self):
        response = self.client.post(
            self.url, {"email": "nouser@example.com", "password": "irrelevant"}
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("User not found", response.data["detail"])


class UserMeViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse("user-me")
        self.email = "meuser@example.com"
        self.password = "testpassword123"
        self.user_auth = UserAuth.objects.create(
            email=self.email, password=make_password(self.password)
        )
        self.user_data = UserData.objects.create(
            id=self.user_auth.id,
            name="Me User",
            email=self.email,
            work_hours=8,
            vacation_days=14,
            personal_time=6,
            role="employee",
        )
        self.token = create_token(self.user_data.id, self.user_data.email)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_user_me_success(self):
        response = self.client.get(self.url, **self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.user_data.id)
        self.assertEqual(response.data["email"], self.user_data.email)
        self.assertEqual(response.data["name"], self.user_data.name)

    def test_user_me_no_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)
        self.assertIn("No token provided", str(response.data))

    def test_user_me_invalid_token(self):
        response = self.client.get(self.url, HTTP_AUTHORIZATION="Bearer invalid.token")
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.data)
