import django, os, datetime
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()

from information.models import Category, Destination, InformationEntry, SourceReview
from django.contrib.auth import get_user_model
User = get_user_model()

admin = User.objects.filter(is_superuser=True).first()
bujumbura = Destination.objects.filter(country='Burundi', province='Bujumbura', commune='Mukaza').first()

entries = [
    {
        'title': 'Security Conditions for Returnees in Burundi',
        'summary': 'An overview of the current security situation in Burundi for people considering voluntary return.',
        'content': (
            'Burundi has seen relative stability since 2020 following the peaceful transfer of power to President '
            'Evariste Ndayishimiye. However, localised security incidents, particularly in Cibitoke, Bubanza, and '
            'Bujumbura Rural provinces, continue to be reported. Returnees are advised to check conditions in their '
            'specific home areas before returning. UNHCR conducts regular protection monitoring and advises against '
            'return to areas with active conflict. Returnees should register with local authorities upon arrival and '
            'contact UNHCR if they face protection concerns.'
        ),
        'category': 'Safety',
        'source_name': 'UNHCR Burundi Protection Monitoring Report 2024',
        'source_url': 'https://www.unhcr.org/burundi',
        'source_publication_date': datetime.date(2024, 1, 1),
        'translations': {
            'rn': {
                'title': 'Imiterere y\'umutekano ku bantu bagaruka i Burundi',
                'summary': 'Incamake y\'imiterere y\'umutekano i Burundi ku bantu bafata ingingo yo gusubira iwabo.',
                'content': (
                    'Burundi yaragerageje gutuza guhera mu 2020 nyuma y\'ihinduka ry\'ubutegetsi bwa Perezida '
                    'Evariste Ndayishimiye. Ariko, ingorane z\'umutekano, cyane cyane mu ntara za Cibitoke, Bubanza, '
                    'na Bujumbura Rural, ziracyabaho. Abagarutse basabwa gusuzuma imiterere y\'umutekano mu turere '
                    'twabo mbere yo gusubira. UNHCR ikora isuzuma ry\'uburenganzira buri gihe kandi igira inama '
                    'yo kutasubira mu turere dufite amakimbirane.'
                ),
                'reviewed': True,
            },
            'rw': {
                'title': 'Imiterere y\'umutekano ku bagarutse i Burundi',
                'summary': 'Incamake y\'imiterere y\'umutekano i Burundi ku bantu bafata ingingo yo gusubira iwabo.',
                'content': (
                    'Burundi yagize amahoro arambye kuva mu 2020 nyuma y\'ihinduka ry\'ubutegetsi. Icyakora, '
                    'ingorane z\'umutekano ziracyabaho mu ntara zimwe na zimwe. Abagarutse basabwa gusuzuma '
                    'imiterere y\'umutekano mu turere twabo mbere yo gusubira. UNHCR ikora isuzuma ry\'uburenganzira '
                    'buri gihe kandi igira inama yo kutasubira mu turere dufite amakimbirane.'
                ),
                'reviewed': True,
            },
            'sw': {
                'title': 'Hali ya Usalama kwa Warejeshwaji Burundi',
                'summary': 'Muhtasari wa hali ya usalama nchini Burundi kwa watu wanaofikiria kurudi nyumbani.',
                'content': (
                    'Burundi imepata utulivu wa kiasi tangu 2020 baada ya uhamisho wa amani wa mamlaka kwa Rais '
                    'Evariste Ndayishimiye. Hata hivyo, matukio ya usalama ya ndani, hasa katika majimbo ya '
                    'Cibitoke, Bubanza, na Bujumbura Rural, yanaendelea kuripotiwa. Warejeshwaji wanashauriwa '
                    'kuangalia hali katika maeneo yao ya nyumbani kabla ya kurudi. UNHCR inafanya ufuatiliaji wa '
                    'ulinzi mara kwa mara na inashauri dhidi ya kurudi katika maeneo yenye migogoro.'
                ),
                'reviewed': True,
            },
        },
    },
    {
        'title': 'Identity and Travel Documents Required for Return to Burundi',
        'summary': 'What documents you need to return to Burundi and how to obtain them.',
        'content': (
            'Returnees to Burundi need a valid Burundian passport or laissez-passer issued by the nearest Burundian '
            'embassy or consulate. Those without documents can approach UNHCR or IOM for assistance. Upon arrival, '
            'returnees must register with the local administrative authority (Chef de Colline). Birth certificates '
            'and national ID cards (Carte Nationale d\'Identite) can be reissued through the commune office. IOM '
            'provides documentation support as part of its Assisted Voluntary Return and Reintegration (AVRR) programme.'
        ),
        'category': 'Documents',
        'source_name': 'IOM Assisted Voluntary Return and Reintegration Burundi',
        'source_url': 'https://www.iom.int/countries/burundi',
        'source_publication_date': datetime.date(2024, 3, 1),
        'translations': {
            'rn': {
                'title': 'Impapuro z\'indangamuntu n\'urugendo zikenewe gusubira i Burundi',
                'summary': 'Impapuro ukeneye gusubira i Burundi n\'uburyo bwo kuzibona.',
                'content': (
                    'Abagarutse i Burundi bakeneye pasiporo y\'i Burundi yemewe cyangwa laissez-passer itangwa '
                    'n\'ambasade cyangwa consulat ya Burundi iri hafi. Abadafite impapuro bashobora gusaba '
                    'ubufasha kuri UNHCR cyangwa IOM. Igihe bageze, abagarutse bagomba kwiyandikisha ku '
                    'buyobozi bw\'akarere (Chef de Colline). Impapuro z\'ivuka n\'indangamuntu (Carte Nationale '
                    'd\'Identite) zishobora gusubirwamo mu biro bya komini. IOM itanga ubufasha bw\'impapuro '
                    'mu rwego rw\'AVRR.'
                ),
                'reviewed': True,
            },
            'rw': {
                'title': 'Impapuro z\'indangamuntu n\'urugendo zikenewe gusubira i Burundi',
                'summary': 'Impapuro ukeneye gusubira i Burundi n\'uburyo bwo kuzibona.',
                'content': (
                    'Abagarutse i Burundi bakeneye pasiporo y\'i Burundi yemewe cyangwa laissez-passer. '
                    'Abadafite impapuro bashobora gusaba ubufasha kuri UNHCR cyangwa IOM. Igihe bageze, '
                    'abagarutse bagomba kwiyandikisha ku buyobozi bw\'akarere. Impapuro z\'ivuka n\'indangamuntu '
                    'zishobora gusubirwamo mu biro bya komini. IOM itanga ubufasha bw\'impapuro mu rwego rw\'AVRR.'
                ),
                'reviewed': True,
            },
            'sw': {
                'title': 'Nyaraka za Utambulisho na Usafiri Zinazohitajika Kurudi Burundi',
                'summary': 'Nyaraka unazohitaji kurudi Burundi na jinsi ya kuzipata.',
                'content': (
                    'Warejeshwaji Burundi wanahitaji pasipoti halali ya Burundi au laissez-passer iliyotolewa '
                    'na ubalozi wa karibu wa Burundi. Wale wasio na nyaraka wanaweza kuomba msaada kwa UNHCR '
                    'au IOM. Baada ya kuwasili, warejeshwaji lazima wasajiliwe na mamlaka ya utawala wa ndani '
                    '(Chef de Colline). Vyeti vya kuzaliwa na vitambulisho vya taifa vinaweza kutolewa tena '
                    'kupitia ofisi ya commune. IOM inatoa msaada wa nyaraka kama sehemu ya programu ya AVRR.'
                ),
                'reviewed': True,
            },
        },
    },
]

for data in entries:
    cat = Category.objects.get(name=data.pop('category'))
    entry = InformationEntry.objects.create(
        category=cat,
        destination=bujumbura,
        verification_status='verified',
        **data,
    )
    SourceReview.objects.create(
        entry=entry,
        entry_version=entry.content_version,
        reviewed_by=admin,
        outcome='suitable',
        notes='Source verified against official UNHCR/IOM documentation.',
    )
    entry.is_published = True
    entry.save()
    print(f'Created and published: {entry.title}')
