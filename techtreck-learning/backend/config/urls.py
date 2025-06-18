"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin  # type: ignore
from django.urls import path  # type: ignore
from api import views as api_views
from rest_framework_simplejwt.views import (  # type: ignore
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path(
        "api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"
    ),  # login endpoint
    path(
        "api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),  # refresh token endpoint
    path("auth/me/", api_views.UserMeView.as_view(), name="user-me"),
    path("admin/", admin.site.urls),
    path("auth/signup/", api_views.UserSignInView.as_view(), name="user_signup"),
    path("auth/login/", api_views.UserLogInView.as_view(), name="user_login"),
    path(
        "auth/getuser/<int:id>/", api_views.GetUserDataView.as_view(), name="user_get"
    ),
    path(
        "worklog/update/", api_views.WorkLogUpdateView.as_view(), name="worklog_update"
    ),
    path(
        "worklog/get/<int:id>/", api_views.WorkLogGetView.as_view(), name="worklog_get"
    ),
    path(
        "vacation/get/<int:id>/",
        api_views.VacationGetView.as_view(),
        name="vacation_get",
    ),
    path(
        "vacation/update/",
        api_views.VacationUpdateView.as_view(),
        name="vacation_update",
    ),
    path(
        "leaveslip/get/<int:id>/",
        api_views.LeaveSlipGetView.as_view(),
        name="leaveslip_get",
    ),
    path(
        "leaveslip/update/",
        api_views.LeaveSlipUpdateView.as_view(),
        name="leaveslip_update",
    ),
    path("timer/sync/", api_views.TimerDataSyncView.as_view(), name="timer_sync"),
    path("timer/get/<int:id>/", api_views.TimerGetView.as_view(), name="timer_get"),
    path("manager/get/", api_views.ManagerGetView.as_view(), name="manager_get"),
    path("adminfe/get/", api_views.AdminGetView.as_view(), name="admin_get"),
    path("user/update/", api_views.UserUpdateData.as_view(), name="user_update"),
    path("user/delete/", api_views.UserDeleteView.as_view(), name="user_delete"),
    path(
        "adminfe/benefits/<int:id>/",
        api_views.GetUserBenefits.as_view(),
        name="user_benefits",
    ),
    path(
        "vacation/restore/",
        api_views.RestoreVacationView.as_view(),
        name="vacation_restore",
    ),
    path(
        "leaveslip/restore/",
        api_views.RestoreLeaveTimeView.as_view(),
        name="leave_restore",
    ),
]
