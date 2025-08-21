from pathlib import Path
from datetime import timedelta
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


if os.environ.get("DJANGO_SECRET_KEY") is None:
    # We're probably local dev, so import env.py to set env vars
    import env

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
DEBUG = os.environ.get("DJANGO_DEBUG", "False") == "True"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")


# Application definition

INSTALLED_APPS = [
"django.contrib.admin",
"django.contrib.auth",
"django.contrib.contenttypes",
"django.contrib.sessions",
"django.contrib.messages",
"django.contrib.staticfiles",
"rest_framework",
"rest_framework_simplejwt",
"corsheaders",
"core.apps.CoreConfig",
"api.apps.ApiConfig",
]

MIDDLEWARE = [
"corsheaders.middleware.CorsMiddleware",
"django.middleware.security.SecurityMiddleware",
"django.contrib.sessions.middleware.SessionMiddleware",
"django.middleware.common.CommonMiddleware",
"django.middleware.csrf.CsrfViewMiddleware",
"django.contrib.auth.middleware.AuthenticationMiddleware",
"django.contrib.messages.middleware.MessageMiddleware",
"django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
{
"BACKEND": "django.template.backends.django.DjangoTemplates",
"DIRS": [],
"APP_DIRS": True,
"OPTIONS": {
"context_processors": [
"django.template.context_processors.request",
"django.contrib.auth.context_processors.auth",
"django.contrib.messages.context_processors.messages",
],
},
},
]

WSGI_APPLICATION = "config.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
'default': {
'ENGINE': 'django.db.backends.postgresql',
'NAME': 'postgres',
'USER': 'postgres',
'PASSWORD': os.environ.get("SUPABASE_DB_PASSWORD", ""),
'HOST': 'db.hihdbvjzciwfoklcalvw.supabase.co',
'PORT': '5432',
'OPTIONS': {
            'sslmode': 'require',
        },
}
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
{
"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
},
{
"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
},
{
"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
},
{
"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
},
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS settings
CORS_ALLOW_ALL_ORIGINS = (
False  # Only for development! Configure properly for production
)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:4200",
    "http://localhost:4200",
]
CORS_ALLOWED_ORIGINS = os.getenv("DJANGO_CORS_ALLOWED_ORIGINS", "").split(",")


# Allow Authorization header
CORS_ALLOW_HEADERS = [
"accept",
"accept-encoding",
"authorization",
"content-type",
"dnt",
"origin",
"user-agent",
"x-csrftoken",
"x-requested-with",
]

CORS_EXPOSE_HEADERS = ["authorization"]

REST_FRAMEWORK = {
"DEFAULT_AUTHENTICATION_CLASSES": (
"rest_framework_simplejwt.authentication.JWTAuthentication",
),
}

SIMPLE_JWT = {
"ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
"REFRESH_TOKEN_LIFETIME": timedelta(days=1),
"AUTH_HEADER_TYPES": ("Bearer",),
"AUTH_HEADER_NAME": "Authorization",  # default, keep this
"SIGNING_KEY": SECRET_KEY,
"USER_ID_FIELD": "id",
"USER_ID_CLAIM": "user_id",
}

CSRF_TRUSTED_ORIGINS = os.environ.get("AZURE_DOMAIN", "").split(",")
