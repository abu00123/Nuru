from django.urls import path
from .views import (
    InformationEntryListCreateView,
    InformationEntryDetailView,
    CategoryListView,
    DestinationListView,
)

urlpatterns = [
    path('information/', InformationEntryListCreateView.as_view()),
    path('information/<int:pk>/', InformationEntryDetailView.as_view()),
    path('categories/', CategoryListView.as_view()),
    path('destinations/', DestinationListView.as_view()),
]
