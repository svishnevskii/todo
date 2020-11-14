
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name = "index"),
    path("main", views.main, name = "main"),

    path("register", views.register_view, name = "register"),
    path("login", views.login_view, name = "login"),
    path("logout", views.logout_view, name = "logout"),

    path("add_task", views.add_task, name = "add_task"),
    path("edit_task/<int:id>", views.edit_task, name = "edit_task"),
    path("check/<int:id>", views.check, name = "check"),
    path("delete/<int:id>", views.delete, name = "delete"),

    path("teams", views.get_teams),
    path("create_team", views.create_team),
    path("leave_team/<int:id>", views.leave_team),
    path("join_team", views.join_team),
    path("add_team_task" ,views.add_team_task)

]