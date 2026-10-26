from django.contrib import admin
from django import forms
from .models import Category, Destination, InformationEntry, SourceReview


class SourceReviewInline(admin.TabularInline):
    model = SourceReview
    extra = 1
    fields = ['outcome', 'notes', 'reviewed_by', 'reviewed_at', 'entry_version']
    readonly_fields = ['reviewed_by', 'reviewed_at', 'entry_version']
    can_delete = False

    def entry_version(self, obj):
        return obj.entry_version
    entry_version.short_description = 'Entry version'


class InformationTranslationForm(forms.ModelForm):
    rn_title = forms.CharField(label='Kirundi: title', required=False, widget=forms.TextInput)
    rn_summary = forms.CharField(label='Kirundi: summary', required=False, widget=forms.Textarea)
    rn_content = forms.CharField(label='Kirundi: content', required=False, widget=forms.Textarea)
    rn_reviewed = forms.BooleanField(label='Kirundi: reviewed for publication', required=False)
    rw_title = forms.CharField(label='Kinyarwanda: title', required=False, widget=forms.TextInput)
    rw_summary = forms.CharField(label='Kinyarwanda: summary', required=False, widget=forms.Textarea)
    rw_content = forms.CharField(label='Kinyarwanda: content', required=False, widget=forms.Textarea)
    rw_reviewed = forms.BooleanField(label='Kinyarwanda: reviewed for publication', required=False)
    sw_title = forms.CharField(label='Kiswahili: title', required=False, widget=forms.TextInput)
    sw_summary = forms.CharField(label='Kiswahili: summary', required=False, widget=forms.Textarea)
    sw_content = forms.CharField(label='Kiswahili: content', required=False, widget=forms.Textarea)
    sw_reviewed = forms.BooleanField(label='Kiswahili: reviewed for publication', required=False)

    class Meta:
        model = InformationEntry
        exclude = ['translations']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for code, label in [('rn', 'Kirundi'), ('rw', 'Kinyarwanda'), ('sw', 'Kiswahili')]:
            translation = (self.instance.translations or {}).get(code, {})
            for field in ('title', 'summary', 'content'):
                self.fields[f'{code}_{field}'].initial = translation.get(field, '')
            self.fields[f'{code}_reviewed'].initial = translation.get('reviewed', False)

    def clean(self):
        data = super().clean()
        for code in ('rn', 'rw', 'sw'):
            if data.get(f'{code}_reviewed') and not all(data.get(f'{code}_{field}', '').strip() for field in ('title', 'summary', 'content')):
                self.add_error(f'{code}_reviewed', 'Complete all three translated fields before marking reviewed.')

        if data.get('is_published'):
            errors = []
            if not (data.get('source_name') or '').strip():
                errors.append('Source name is missing. A source name is required before publishing — this confirms the entry reflects its supporting material.')
            if self.instance and self.instance.pk:
                from .models import SUBSTANTIVE_FIELDS
                # Calculate what the version will be after save
                old = InformationEntry.objects.filter(pk=self.instance.pk).values(*SUBSTANTIVE_FIELDS).first()
                will_bump = old and any(
                    data.get(f, getattr(self.instance, f)) != old[f]
                    for f in SUBSTANTIVE_FIELDS
                    if f in data
                )
                future_version = self.instance.content_version + (1 if will_bump else 0)
                review = self.instance.source_reviews.filter(
                    entry_version=future_version,
                    outcome='suitable',
                ).first()
                if not review:
                    errors.append(
                        f'No suitable source review exists for version {future_version} of this entry. '
                        'Add a source review marked "Suitable for publication" in the Source Reviews section below, save that first, then tick Published.'
                    )
            else:
                errors.append('Save the entry first, then record a source review before publishing.')
            if errors:
                raise forms.ValidationError(errors)
        return data

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.translations = {code: {field: self.cleaned_data.get(f'{code}_{field}', False if field == 'reviewed' else '') for field in ('title', 'summary', 'content', 'reviewed')} for code in ('rn', 'rw', 'sw')}
        if commit:
            instance.save()
            self.save_m2m()
        return instance


@admin.register(InformationEntry)
class InformationEntryAdmin(admin.ModelAdmin):
    form = InformationTranslationForm
    inlines = [SourceReviewInline]
    list_display = ['title', 'category', 'destination', 'verification_status', 'is_published', 'last_verified', 'content_version']
    list_filter = ['verification_status', 'is_published', 'category']
    search_fields = ['title', 'summary', 'content']
    readonly_fields = ['content_version']

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in instances:
            if not obj.pk:
                obj.reviewed_by = request.user
                obj.entry_version = obj.entry.content_version
            obj.save()
        formset.save_m2m()


admin.site.register(Category)
admin.site.register(Destination)
