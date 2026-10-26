from rest_framework import serializers

def validate_translations(value):
    if not isinstance(value, dict) or set(value) - {'rn', 'rw', 'sw'}:
        raise serializers.ValidationError('Use an object keyed by rn, rw, or sw.')
    for language, article in value.items():
        if not isinstance(article, dict) or set(article) - {'title', 'summary', 'content', 'reviewed'}:
            raise serializers.ValidationError(f'{language}: use title, summary, content and reviewed only.')
        for field in ('title', 'summary', 'content'):
            if field in article and not isinstance(article[field], str):
                raise serializers.ValidationError(f'{language}.{field} must be text.')
        if 'reviewed' in article and not isinstance(article['reviewed'], bool):
            raise serializers.ValidationError(f'{language}.reviewed must be true or false.')
        if article.get('reviewed') and not all(article.get(field, '').strip() for field in ('title', 'summary', 'content')):
            raise serializers.ValidationError(f'{language}: reviewed translations require title, summary and content.')
