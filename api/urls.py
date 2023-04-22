from django.urls import path
from . import views
from .views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("token", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("signup", views.signup, name="signup"),
    path("create", views.create, name="create"),
    path("template/<str:template_id>", views.get_template, name="get_template"),
    path("your-templates", views.your_templates, name="your_templates"),
    path("saved-templates", views.saved_templates, name="saved_templates"),
    path("search-results", views.search_results, name="search_results"),
    path("delete/<str:template_id>", views.delete_template, name="delete_template"),
    path("rate/<str:template_id>", views.rate_template, name="rate_template"),
    path("save/<str:template_id>", views.save_template, name="save_template"),
    path("unsave/<str:template_id>", views.unsave_template, name="unsave_template"),
    path("change-visibility/<str:template_id>", views.change_template_visbility, name="change_template_visbility")
]