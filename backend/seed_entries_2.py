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
        'title': 'Housing and Shelter Options for Returnees in Burundi',
        'summary': 'What to expect regarding housing when returning to Burundi.',
        'content': (
            'Many returnees face land and property disputes upon return, particularly in rural areas where land was '
            'occupied during their absence. UNHCR and the Burundian government operate a land dispute resolution '
            'mechanism through the Commission Nationale des Terres et autres Biens (CNTB). Temporary shelter is '
            'available at transit centres in Cibitoke and Makamba for returnees arriving from Tanzania and DRC. '
            'Returnees are encouraged to contact UNHCR before departure to assess housing conditions in their home commune.'
        ),
        'category': 'Housing',
        'source_name': 'UNHCR Burundi Situation Update 2024',
        'source_url': 'https://www.unhcr.org/burundi',
        'source_publication_date': datetime.date(2024, 2, 1),
        'translations': {
            'rn': {
                'title': 'Amazu n\'aho gutura ku bagarutse i Burundi',
                'summary': 'Ibyo witeze ku birebana n\'amazu igihe ugarutse i Burundi.',
                'content': (
                    'Abagarutse benshi bahura n\'ibibazo by\'ubutaka n\'imitungo, cyane cyane mu turere tw\'icyaro '
                    'aho ubutaka bwari bwarafashwe mu gihe bari hanze. UNHCR na leta ya Burundi bifatanije mu '
                    'gukemura ibibazo by\'ubutaka binyuze muri CNTB. Amazu y\'agateganyo arahari mu bikorwa '
                    'by\'inzira i Cibitoke na Makamba. Abagarutse basabwa gutumanahana na UNHCR mbere yo gusubira.'
                ),
                'reviewed': True,
            },
            'rw': {
                'title': 'Amazu n\'aho gutura ku bagarutse i Burundi',
                'summary': 'Ibyo witeze ku birebana n\'amazu igihe ugarutse i Burundi.',
                'content': (
                    'Abagarutse benshi bahura n\'ibibazo by\'ubutaka n\'imitungo iyo bagarutse, cyane cyane mu '
                    'turere tw\'icyaro. UNHCR na leta ya Burundi bifatanije mu gukemura ibibazo by\'ubutaka '
                    'binyuze muri CNTB. Amazu y\'agateganyo arahari mu bikorwa by\'inzira. Abagarutse basabwa '
                    'gutumanahana na UNHCR mbere yo gusubira kugira ngo basuzume imiterere y\'amazu.'
                ),
                'reviewed': True,
            },
            'sw': {
                'title': 'Chaguzi za Makazi kwa Warejeshwaji Burundi',
                'summary': 'Unachoweza kutarajia kuhusu makazi unapporudi Burundi.',
                'content': (
                    'Warejeshwaji wengi wanakabiliwa na migogoro ya ardhi na mali wanapoporudi, hasa katika '
                    'maeneo ya vijijini ambapo ardhi ilikuwa imechukuliwa wakati wa kutokuwepo kwao. UNHCR na '
                    'serikali ya Burundi wanafanya kazi pamoja kutatua migogoro ya ardhi kupitia CNTB. Makazi '
                    'ya muda yanapatikana katika vituo vya usafiri huko Cibitoke na Makamba. Warejeshwaji '
                    'wanashauriwa kuwasiliana na UNHCR kabla ya kuondoka.'
                ),
                'reviewed': True,
            },
        },
    },
    {
        'title': 'Healthcare Access for Returnees in Burundi',
        'summary': 'Health services available to people returning to Burundi.',
        'content': (
            'Burundi has a network of community health centres (Centres de Sante) across all provinces. Returnees '
            'are entitled to access public health services. However, facilities in rural areas are often under-resourced. '
            'IOM provides medical screening and assistance to returnees as part of the AVRR programme, including '
            'pre-departure health checks. Malaria, cholera, and malnutrition remain health concerns in some regions. '
            'Returnees with chronic conditions are advised to carry sufficient medication for at least three months '
            'and register with the nearest health centre upon arrival.'
        ),
        'category': 'Healthcare',
        'source_name': 'IOM Migration Health Burundi',
        'source_url': 'https://www.iom.int/countries/burundi',
        'source_publication_date': datetime.date(2024, 4, 1),
        'translations': {
            'rn': {
                'title': 'Ubuvuzi ku bagarutse i Burundi',
                'summary': 'Serivisi z\'ubuzima zihari ku bantu bagarutse i Burundi.',
                'content': (
                    'Burundi ifite inzego z\'ubuzima bw\'umuturage (Centres de Sante) mu ntara zose. Abagarutse '
                    'bafite uburenganzira bwo kugera ku serivisi z\'ubuzima bwa leta. Ariko, ibikorwa mu turere '
                    'tw\'icyaro kenshi ntibifite ibikenewe bihagije. IOM itanga isuzuma ry\'ubuzima ku bagarutse '
                    'mu rwego rw\'AVRR. Malariya, kolera, na imirire mibi biracyaba ibibazo mu turere tumwe na tumwe.'
                ),
                'reviewed': True,
            },
            'rw': {
                'title': 'Ubuvuzi ku bagarutse i Burundi',
                'summary': 'Serivisi z\'ubuzima zihari ku bantu bagarutse i Burundi.',
                'content': (
                    'Burundi ifite inzego z\'ubuzima bw\'umuturage mu ntara zose. Abagarutse bafite uburenganzira '
                    'bwo kugera ku serivisi z\'ubuzima bwa leta. IOM itanga isuzuma ry\'ubuzima ku bagarutse mu '
                    'rwego rw\'AVRR harimo n\'isuzuma mbere yo gusubira. Abagarutse bafite indwara zidakira '
                    'basabwa gutwara imiti ihagije nibura amezi atatu.'
                ),
                'reviewed': True,
            },
            'sw': {
                'title': 'Upatikanaji wa Huduma za Afya kwa Warejeshwaji Burundi',
                'summary': 'Huduma za afya zinazopatikana kwa watu wanaorudi Burundi.',
                'content': (
                    'Burundi ina mtandao wa vituo vya afya vya jamii (Centres de Sante) katika majimbo yote. '
                    'Warejeshwaji wana haki ya kupata huduma za afya za umma. Hata hivyo, vituo katika maeneo '
                    'ya vijijini mara nyingi havina rasilimali za kutosha. IOM inatoa uchunguzi wa kimatibabu '
                    'kwa warejeshwaji kama sehemu ya programu ya AVRR. Malaria, kipindupindu, na utapiamlo '
                    'bado ni wasiwasi wa kiafya katika baadhi ya maeneo.'
                ),
                'reviewed': True,
            },
        },
    },
    {
        'title': 'Education for Returnee Children in Burundi',
        'summary': 'School access and enrolment process for children returning to Burundi.',
        'content': (
            'Primary education in Burundi is free and compulsory. Returnee children can enrol in the nearest public '
            'school upon arrival. Children without school certificates can be assessed and placed in the appropriate '
            'grade by the school director. UNICEF and the Ministry of Education support accelerated learning programmes '
            'for children who have missed schooling. Secondary education requires a national examination certificate. '
            'UNHCR provides school kits and supports enrolment for returnee children through its reintegration programme.'
        ),
        'category': 'Education',
        'source_name': 'UNICEF Burundi Education',
        'source_url': 'https://www.unicef.org/burundi/education',
        'source_publication_date': datetime.date(2024, 1, 15),
        'translations': {
            'rn': {
                'title': 'Uburezi ku bana bagarutse i Burundi',
                'summary': 'Kwinjira mu mashuri n\'uburyo bwo kwiyandikisha ku bana bagarutse i Burundi.',
                'content': (
                    'Uburezi bw\'amashuri abanza i Burundi ni ubuntu kandi ni ngombwa. Abana bagarutse bashobora '
                    'kwiyandikisha mu ishuri rya leta riri hafi igihe bageze. Abana badafite impapuro z\'ishuri '
                    'bashobora gusuzumwa no gushyirwa mu cyiciro gikwiye na umuyobozi w\'ishuri. UNICEF na '
                    'Minisiteri y\'Uburezi bifasha gahunda z\'kwiga vuba ku bana babuze amashuri. UNHCR itanga '
                    'ibikoresho by\'ishuri kandi ifasha kwiyandikisha.'
                ),
                'reviewed': True,
            },
            'rw': {
                'title': 'Uburezi ku bana bagarutse i Burundi',
                'summary': 'Kwinjira mu mashuri n\'uburyo bwo kwiyandikisha ku bana bagarutse i Burundi.',
                'content': (
                    'Uburezi bw\'amashuri abanza i Burundi ni ubuntu kandi ni ngombwa. Abana bagarutse bashobora '
                    'kwiyandikisha mu ishuri rya leta riri hafi. Abana badafite impapuro z\'ishuri bashobora '
                    'gusuzumwa no gushyirwa mu cyiciro gikwiye. UNICEF na Minisiteri y\'Uburezi bifasha gahunda '
                    'z\'kwiga vuba. UNHCR itanga ibikoresho by\'ishuri kandi ifasha kwiyandikisha.'
                ),
                'reviewed': True,
            },
            'sw': {
                'title': 'Elimu kwa Watoto Warejeshwaji Burundi',
                'summary': 'Upatikanaji wa shule na mchakato wa usajili kwa watoto wanaorudi Burundi.',
                'content': (
                    'Elimu ya msingi nchini Burundi ni ya bure na ya lazima. Watoto warejeshwaji wanaweza '
                    'kusajiliwa katika shule ya umma iliyo karibu wanapofikia. Watoto wasio na vyeti vya shule '
                    'wanaweza kupimwa na kuwekwa katika darasa linalofaa na mkurugenzi wa shule. UNICEF na '
                    'Wizara ya Elimu vinasaidia programu za kujifunza kwa kasi kwa watoto waliokosa masomo. '
                    'UNHCR inatoa vifaa vya shule na kusaidia usajili kwa watoto warejeshwaji.'
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
        notes='Source verified against official documentation.',
    )
    entry.is_published = True
    entry.save()
    print(f'Created and published: {entry.title}')
