from rest_framework import serializers
from .models import Category, Destination, InformationEntry


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'


class InformationEntrySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    destination_name = serializers.CharField(source='destination.__str__', read_only=True)

    class Meta:
        model = InformationEntry
        fields = '__all__'
