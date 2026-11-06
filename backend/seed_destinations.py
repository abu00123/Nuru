import django, os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()

from information.models import Destination

destinations = [
    ('Buhumuza', 'Butaganzwa'), ('Buhumuza', 'Butihinda'), ('Buhumuza', 'Cankuzo'),
    ('Buhumuza', 'Gisagara'), ('Buhumuza', 'Gisuru'), ('Buhumuza', 'Muyinga'), ('Buhumuza', 'Ruyigi'),
    ('Bujumbura', 'Bubanza'), ('Bujumbura', 'Bukinanyana'), ('Bujumbura', 'Cibitoke'),
    ('Bujumbura', 'Isare'), ('Bujumbura', 'Mpanda'), ('Bujumbura', 'Mugere'),
    ('Bujumbura', 'Mugina'), ('Bujumbura', 'Muhuta'), ('Bujumbura', 'Mukaza'),
    ('Bujumbura', 'Ntahangwa'), ('Bujumbura', 'Rwibaga'),
    ('Burunga', 'Bururi'), ('Burunga', 'Makamba'), ('Burunga', 'Matana'),
    ('Burunga', 'Musongati'), ('Burunga', 'Nyanza-Lac'), ('Burunga', 'Rumonge'), ('Burunga', 'Rutana'),
    ('Butanyerera', 'Busoni'), ('Butanyerera', 'Kayanza'), ('Butanyerera', 'Kiremba'),
    ('Butanyerera', 'Kirundo'), ('Butanyerera', 'Matongo'), ('Butanyerera', 'Muhanga'),
    ('Butanyerera', 'Ngozi'), ('Butanyerera', 'Tangara'),
    ('Gitega', 'Bugendana'), ('Gitega', 'Gishubi'), ('Gitega', 'Gitega'),
    ('Gitega', 'Karuzi'), ('Gitega', 'Kiganda'), ('Gitega', 'Muramvya'),
    ('Gitega', 'Mwaro'), ('Gitega', 'Nyabihanga'), ('Gitega', 'Shombo'),
]

created = 0
for province, commune in destinations:
    _, new = Destination.objects.get_or_create(country='Burundi', province=province, commune=commune)
    if new:
        created += 1

print(f'Created {created} destinations. Total: {Destination.objects.count()}')
