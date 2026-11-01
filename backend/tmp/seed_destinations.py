from information.models import Destination

destinations = [
    # Bujumbura
    ('Burundi', 'Bujumbura', 'Bubanza'),
    ('Burundi', 'Bujumbura', 'Bukinanyana'),
    ('Burundi', 'Bujumbura', 'Cibitoke'),
    ('Burundi', 'Bujumbura', 'Isare'),
    ('Burundi', 'Bujumbura', 'Mpanda'),
    ('Burundi', 'Bujumbura', 'Mugere'),
    ('Burundi', 'Bujumbura', 'Mugina'),
    ('Burundi', 'Bujumbura', 'Muhuta'),
    ('Burundi', 'Bujumbura', 'Mukaza'),
    ('Burundi', 'Bujumbura', 'Ntahangwa'),
    ('Burundi', 'Bujumbura', 'Rwibaga'),
    # Gitega
    ('Burundi', 'Gitega', 'Bugendana'),
    ('Burundi', 'Gitega', 'Gishubi'),
    ('Burundi', 'Gitega', 'Gitega'),
    ('Burundi', 'Gitega', 'Karusi'),
    ('Burundi', 'Gitega', 'Kiganda'),
    ('Burundi', 'Gitega', 'Muramvya'),
    ('Burundi', 'Gitega', 'Mwaro'),
    ('Burundi', 'Gitega', 'Nyabihanga'),
    # Butanyerera
    ('Burundi', 'Butanyerera', 'Busoni'),
    ('Burundi', 'Butanyerera', 'Kayanza'),
    ('Burundi', 'Butanyerera', 'Kiremba'),
    ('Burundi', 'Butanyerera', 'Kirundo'),
    ('Burundi', 'Butanyerera', 'Matongo'),
    ('Burundi', 'Butanyerera', 'Muhanga'),
    ('Burundi', 'Butanyerera', 'Ngozi'),
    ('Burundi', 'Butanyerera', 'Tangara'),
    # Burunga
    ('Burundi', 'Burunga', 'Bururi'),
    ('Burundi', 'Burunga', 'Makamba'),
    ('Burundi', 'Burunga', 'Matana'),
    ('Burundi', 'Burunga', 'Musongati'),
    ('Burundi', 'Burunga', 'Nyanza-Lac'),
    ('Burundi', 'Burunga', 'Rumonge'),
    ('Burundi', 'Burunga', 'Rutana'),
    # Buhumuza
    ('Burundi', 'Buhumuza', 'Butaganzwa'),
    ('Burundi', 'Buhumuza', 'Butihinda'),
    ('Burundi', 'Buhumuza', 'Cankuzo'),
    ('Burundi', 'Buhumuza', 'Gisagara'),
    ('Burundi', 'Buhumuza', 'Gisuru'),
    ('Burundi', 'Buhumuza', 'Muyinga'),
    ('Burundi', 'Buhumuza', 'Ruyigi'),
    ('Burundi', 'Buhumuza', 'Shombo'),
]

created = 0
for country, province, commune in destinations:
    _, made = Destination.objects.get_or_create(country=country, province=province, commune=commune)
    if made:
        created += 1
        print(f'  + {province} / {commune}')
    else:
        print(f'  = {province} / {commune} (already exists)')

print(f'\nDone. {created} new destinations added.')
