from rest_framework import generics
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
            queryset = queryset.filter(title__icontains=search) | queryset.filter(summary__icontains=search)
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
