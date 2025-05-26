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

urlpatterns = [
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
]
