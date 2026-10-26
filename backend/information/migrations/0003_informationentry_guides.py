from django.db import migrations, models
import information.guides


class Migration(migrations.Migration):
    dependencies = [('information', '0002_informationentry_translations')]
    operations = [
        migrations.AddField(model_name='informationentry', name='guide', field=models.JSONField(blank=True, default=dict, validators=[information.guides.validate_guide], help_text='Optional eligibility, documents, ordered steps and useful contacts.')),
        migrations.AddField(model_name='informationentry', name='guide_translations', field=models.JSONField(blank=True, default=dict, validators=[information.guides.validate_guide_translations], help_text='Translated guides by rn/rw/sw, each containing guide and reviewed.')),
    ]
