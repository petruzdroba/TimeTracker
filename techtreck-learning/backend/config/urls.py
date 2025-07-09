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
from api.views.auth_view import (
    UserMeView,
    UserSignInView,
    UserLogInView,
    ServerStatusView,
)
from api.views.user_data_view import (
    GetUserDataView,
    UserDeleteView,
)
from api.views.work_log_view import WorkLogUpdateView, WorkLogGetView
from api.views.vacation_view import VacationGetView, VacationUpdateView
from api.views.leave_slip_view import LeaveSlipGetView, LeaveSlipUpdateView
from api.views.timer_view import TimerDataSyncView, TimerGetView
from api.views.boss_view import (
    ManagerGetView,
    AdminGetView,
    UserUpdateData,
    GetUserBenefits,
    RestoreVacationView,
    RestoreLeaveTimeView,
)

urlpatterns = [
    path("auth/me/", UserMeView.as_view(), name="user-me"),
    path("admin/", admin.site.urls),
    path("auth/signup/", UserSignInView.as_view(), name="user_signup"),
    path("auth/login/", UserLogInView.as_view(), name="user_login"),
    path("auth/getuser/<int:id>/", GetUserDataView.as_view(), name="user_get"),
    path("worklog/update/", WorkLogUpdateView.as_view(), name="worklog_update"),
    path("worklog/get/<int:id>/", WorkLogGetView.as_view(), name="worklog_get"),
    path("vacation/get/<int:id>/", VacationGetView.as_view(), name="vacation_get"),
    path("vacation/update/", VacationUpdateView.as_view(), name="vacation_update"),
    path("leaveslip/get/<int:id>/", LeaveSlipGetView.as_view(), name="leaveslip_get"),
    path("leaveslip/update/", LeaveSlipUpdateView.as_view(), name="leaveslip_update"),
    path("timer/sync/", TimerDataSyncView.as_view(), name="timer_sync"),
    path("timer/get/<int:id>/", TimerGetView.as_view(), name="timer_get"),
    path("manager/get/", ManagerGetView.as_view(), name="manager_get"),
    path("adminfe/get/", AdminGetView.as_view(), name="admin_get"),
    path("user/update/", UserUpdateData.as_view(), name="user_update"),
    path("user/delete/", UserDeleteView.as_view(), name="user_delete"),
    path("adminfe/benefits/<int:id>/", GetUserBenefits.as_view(), name="user_benefits"),
    path("vacation/restore/", RestoreVacationView.as_view(), name="vacation_restore"),
    path("leaveslip/restore/", RestoreLeaveTimeView.as_view(), name="leave_restore"),
    path("server/status/", ServerStatusView.as_view(), name="server_status"),
]
