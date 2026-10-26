from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('information', '0001_initial')]
    operations = [migrations.AddField(model_name='informationentry', name='translations', field=models.JSONField(blank=True, default=dict, help_text='Reviewed article translations by language code: rn, rw, sw. Each needs title, summary, content and reviewed: true.'))]
