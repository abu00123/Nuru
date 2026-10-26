from django.core.exceptions import ValidationError
from django.core.validators import validate_email, URLValidator


def text(value, name, maximum=5000, required=False):
    if not isinstance(value, str) or len(value) > maximum or (required and not value.strip()):
        raise ValidationError(f'{name}: enter text up to {maximum} characters' + (' (required).' if required else '.'))


def validate_guide(value):
    if not isinstance(value, dict) or set(value) - {'eligibility', 'documents', 'steps', 'contacts'}:
        raise ValidationError('A guide must contain only eligibility, documents, steps and contacts.')
    if 'eligibility' in value:
        text(value['eligibility'], 'Eligibility')
    for name, limit in [('documents', 50), ('steps', 30), ('contacts', 20)]:
        items = value.get(name, [])
        if not isinstance(items, list) or len(items) > limit:
            raise ValidationError(f'{name}: provide a list of at most {limit} items.')
        for item in items:
            if name == 'documents':
                text(item, 'Document', 500, required=True)
            elif name == 'steps':
                if not isinstance(item, dict) or set(item) != {'title', 'description'}:
                    raise ValidationError('Each step needs a title and description.')
                text(item['title'], 'Step title', 255, required=True)
                text(item['description'], 'Step instructions', required=True)
            else:
                if not isinstance(item, dict) or set(item) - {'name', 'phone', 'email', 'url'}:
                    raise ValidationError('Contacts may contain name, phone, email and url only.')
                text(item.get('name'), 'Contact name', 255, required=True)
                for key in ('phone', 'email', 'url'):
                    if key in item:
                        text(item[key], f'Contact {key}', 2048 if key == 'url' else 255)
                if item.get('email'):
                    validate_email(item['email'])
                if item.get('url'):
                    URLValidator(schemes=['http', 'https'])(item['url'])


def validate_guide_translations(value):
    if not isinstance(value, dict) or set(value) - {'rn', 'rw', 'sw'}:
        raise ValidationError('Guide translations must use rn, rw or sw.')
    for translation in value.values():
        if not isinstance(translation, dict) or set(translation) != {'guide', 'reviewed'} or not isinstance(translation['reviewed'], bool):
            raise ValidationError('Each guide translation needs a guide object and reviewed true or false.')
        validate_guide(translation['guide'])
