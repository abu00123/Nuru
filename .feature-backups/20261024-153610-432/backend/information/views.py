from rest_framework import generics
from django.db.models import Q
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Category, Destination, InformationEntry
from .serializers import CategorySerializer, DestinationSerializer, InformationEntrySerializer


class InformationEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = InformationEntrySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            queryset = InformationEntry.objects.all()
        else:
            queryset = InformationEntry.objects.filter(is_published=True)

        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        destination = self.request.query_params.get('destination')

        if search:
            condition = Q(title__icontains=search) | Q(summary__icontains=search)
            for language in ('rn', 'rw', 'sw'):
                condition |= Q(**{f'translations__{language}__reviewed': True}) & (Q(**{f'translations__{language}__title__icontains': search}) | Q(**{f'translations__{language}__summary__icontains': search}))
            queryset = queryset.filter(condition)
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        if destination:
            queryset = queryset.filter(destination__commune__iexact=destination)

        return queryset


class InformationEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InformationEntry.objects.all()
    serializer_class = InformationEntrySerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAdminUser()]
        return [AllowAny()]


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]


class DestinationListView(generics.ListCreateAPIView):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]
