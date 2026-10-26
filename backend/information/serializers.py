from rest_framework import serializers
from .models import Category, Destination, InformationEntry, SourceReview


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'


class SourceReviewSerializer(serializers.ModelSerializer):
    reviewed_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = SourceReview
        fields = ['id', 'entry_version', 'reviewed_by', 'reviewed_at', 'outcome', 'notes']
        read_only_fields = ['id', 'entry_version', 'reviewed_by', 'reviewed_at']


class InformationEntrySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    destination_name = serializers.CharField(source='destination.__str__', read_only=True)
    latest_review = serializers.SerializerMethodField()

    def get_latest_review(self, obj):
        review = obj.source_reviews.first()
        return SourceReviewSerializer(review).data if review else None

    def validate(self, attrs):
        # Guide translation completeness check (existing)
        base = attrs.get('guide', self.instance.guide if self.instance else {})
        translations = attrs.get('guide_translations', self.instance.guide_translations if self.instance else {})
        for language, translation in translations.items():
            if not translation.get('reviewed'):
                continue
            guide = translation['guide']
            missing = bool(base.get('eligibility', '').strip()) and not guide.get('eligibility', '').strip()
            missing = missing or any(len(guide.get(key, [])) < len(base.get(key, [])) for key in ('documents', 'steps', 'contacts'))
            if missing:
                raise serializers.ValidationError({'guide_translations': f'{language}: complete all English guide sections before marking the translation reviewed.'})

        # Publication enforcement (FR09)
        publishing = attrs.get('is_published', getattr(self.instance, 'is_published', False))
        if publishing:
            errors = {}
            source_name = attrs.get('source_name', getattr(self.instance, 'source_name', ''))
            if not (source_name or '').strip():
                errors['source_name'] = 'A source name is required before publishing. This confirms the entry reflects its supporting material.'
            if self.instance:
                current_version = self.instance.content_version
                review = self.instance.source_reviews.filter(
                    entry_version=current_version,
                    outcome='suitable',
                ).first()
                if not review:
                    errors['is_published'] = (
                        f'A source review marked “suitable for publication” is required for version {current_version} '
                        'of this entry. Record a review before publishing.'
                    )
            else:
                errors['is_published'] = 'Save the entry first, then record a source review before publishing.'
            if errors:
                raise serializers.ValidationError(errors)

        return attrs

    def validate_translations(self, value):
        from .translation_validation import validate_translations
        validate_translations(value)
        return value

    class Meta:
        model = InformationEntry
        fields = '__all__'
        read_only_fields = ['content_version']
