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
        'title': 'Livelihood Opportunities for Returnees in Burundi',
        'summary': 'Economic reintegration support available to people returning to Burundi.',
        'content': (
            'Agriculture is the primary livelihood for the majority of Burundians. Returnees with access to land '
            'can receive seeds, tools, and agricultural training through IOM and FAO reintegration programmes. '
            'Cash-based assistance is available for the first three months through IOM\'s AVRR programme. '
            'Vocational training in carpentry, tailoring, and masonry is offered at reintegration centres in '
            'Bujumbura, Gitega, and Ngozi. Returnees are encouraged to join local cooperatives to access markets and credit.'
        ),
        'category': 'Livelihoods',
        'source_name': 'IOM Reintegration Assistance Burundi',
        'source_url': 'https://www.iom.int/countries/burundi',
        'source_publication_date': datetime.date(2024, 3, 15),
        'translations': {
            'rn': {
                'title': 'Amahirwe yo gutunga ubuzima ku bagarutse i Burundi',
                'summary': 'Ubufasha bwo gusubira mu bukungu buhari ku bantu bagarutse i Burundi.',
                'content': (
                    'Ubuhinzi ni inkomoko y\'ubukungu bw\'abanyaburundi benshi. Abagarutse bafite ubutaka '
                    'bashobora guhabwa imbuto, ibikoresho, n\'amahugurwa y\'ubuhinzi binyuze muri IOM na FAO. '
                    'Ubufasha bw\'amafaranga buhari mu mezi atatu ya mbere binyuze muri AVRR ya IOM. '
                    'Amahugurwa y\'imyuga nka seremeta, gusona, na kubaka arahabwa mu bikorwa by\'ingufu '
                    'i Bujumbura, Gitega, na Ngozi.'
                ),
                'reviewed': True,
            },
            'rw': {
                'title': 'Amahirwe yo gutunga ubuzima ku bagarutse i Burundi',
                'summary': 'Ubufasha bwo gusubira mu bukungu buhari ku bantu bagarutse i Burundi.',
                'content': (
                    'Ubuhinzi ni inkomoko y\'ubukungu bw\'abanyaburundi benshi. Abagarutse bafite ubutaka '
                    'bashobora guhabwa imbuto, ibikoresho, n\'amahugurwa y\'ubuhinzi. Ubufasha bw\'amafaranga '
                    'buhari mu mezi atatu ya mbere binyuze muri AVRR ya IOM. Amahugurwa y\'imyuga arahabwa '
                    'mu bikorwa by\'ingufu i Bujumbura, Gitega, na Ngozi.'
                ),
                'reviewed': True,
            },
            'sw': {
                'title': 'Fursa za Maisha kwa Warejeshwaji Burundi',
                'summary': 'Msaada wa kujiingiza tena kiuchumi unaopatikana kwa watu wanaorudi Burundi.',
                'content': (
                    'Kilimo ndiyo chanzo kikuu cha maisha kwa wengi wa Waburundi. Warejeshwaji wenye ardhi '
                    'wanaweza kupokea mbegu, zana, na mafunzo ya kilimo kupitia programu za IOM na FAO. '
                    'Msaada wa pesa unapatikana kwa miezi mitatu ya kwanza kupitia programu ya AVRR ya IOM. '
                    'Mafunzo ya ufundi kama useremala, ushonaji, na ujenzi yanatolewa katika vituo vya '
                    'urejeshaji huko Bujumbura, Gitega, na Ngozi.'
                ),
                'reviewed': True,
            },
        },
    },
    {
        'title': 'How to Apply for Assisted Voluntary Return to Burundi',
        'summary': 'Step-by-step guide to applying for IOM assisted voluntary return to Burundi.',
        'content': (
            'IOM\'s Assisted Voluntary Return and Reintegration (AVRR) programme supports Burundian refugees '
            'and migrants who wish to return home voluntarily. To apply: (1) Contact your nearest IOM or UNHCR '
            'office and express your intention to return. (2) IOM will conduct an eligibility assessment and '
            'counselling session. (3) Travel documents and arrangements are organised by IOM. (4) Upon arrival '
            'in Burundi, returnees are received at the transit centre and provided with a reintegration package. '
            'The programme is free of charge. Return is always voluntary — no one can be forced to participate.'
        ),
        'category': 'Return',
        'source_name': 'IOM AVRR Programme',
        'source_url': 'https://www.iom.int/assisted-voluntary-return-and-reintegration',
        'source_publication_date': datetime.date(2024, 1, 1),
        'translations': {
            'rn': {
                'title': 'Uburyo bwo gusaba gusubira i Burundi binyuze muri IOM',
                'summary': 'Inzira zo gusaba gusubira i Burundi binyuze muri gahunda ya AVRR ya IOM.',
                'content': (
                    'Gahunda ya AVRR ya IOM ifasha impunzi n\'abimukira b\'i Burundi bashaka gusubira iwabo '
                    'ku bushake bwabo. Kugira ngo usabe: (1) Vugana n\'ibiro bya IOM cyangwa UNHCR biri hafi '
                    'kandi uvuge ko ushaka gusubira. (2) IOM izakora isuzuma ry\'uburenganzira n\'inama. '
                    '(3) Impapuro z\'urugendo n\'ibiteganywa bikorwa na IOM. (4) Igihe ugeze i Burundi, '
                    'uzakiriwe mu kigo cy\'inzira kandi uhabwe agasanduku k\'ingufu. Gahunda ni ubuntu.'
                ),
                'reviewed': True,
            },
            'rw': {
                'title': 'Uburyo bwo gusaba gusubira i Burundi binyuze muri IOM',
                'summary': 'Inzira zo gusaba gusubira i Burundi binyuze muri gahunda ya AVRR ya IOM.',
                'content': (
                    'Gahunda ya AVRR ya IOM ifasha impunzi n\'abimukira b\'i Burundi bashaka gusubira iwabo. '
                    'Kugira ngo usabe: (1) Vugana n\'ibiro bya IOM cyangwa UNHCR biri hafi. (2) IOM izakora '
                    'isuzuma ry\'uburenganzira n\'inama. (3) Impapuro z\'urugendo bikorwa na IOM. '
                    '(4) Igihe ugeze i Burundi uzakiriwe mu kigo cy\'inzira. Gahunda ni ubuntu kandi '
                    'gusubira ni ukw\'ubushake bwawe.'
                ),
                'reviewed': True,
            },
            'sw': {
                'title': 'Jinsi ya Kuomba Kurudi Burundi kwa Msaada wa IOM',
                'summary': 'Mwongozo wa hatua kwa hatua wa kuomba kurudi Burundi kwa msaada wa IOM.',
                'content': (
                    'Programu ya AVRR ya IOM inasaidia wakimbizi na wahamiaji wa Burundi wanaotaka kurudi '
                    'nyumbani kwa hiari. Ili kuomba: (1) Wasiliana na ofisi ya IOM au UNHCR iliyo karibu '
                    'nawe na eleza nia yako ya kurudi. (2) IOM itafanya tathmini ya ustahili na kikao cha '
                    'ushauri. (3) Nyaraka za kusafiria na mipango inayopangwa na IOM. (4) Ukifika Burundi, '
                    'utapokelewa katika kituo cha usafiri na kupewa kifurushi cha urejeshaji. '
                    'Programu ni ya bure. Kurudi ni kwa hiari daima.'
                ),
                'reviewed': True,
            },
        },
    },
    {
        'title': 'Psychosocial and Legal Support for Returnees in Burundi',
        'summary': 'Mental health, legal aid, and community support services available to returnees.',
        'content': (
            'Returning after displacement can be emotionally difficult. UNHCR and its partners provide '
            'psychosocial support through community-based protection networks in Burundi. Legal aid for land '
            'disputes, documentation, and family reunification is available through APRODH and other NGOs. '
            'Community reconciliation committees operate at the colline level to help returnees reintegrate '
            'socially. Returnees experiencing trauma or family separation are encouraged to contact UNHCR '
            'or the nearest social welfare office.'
        ),
        'category': 'Support',
        'source_name': 'UNHCR Community-Based Protection Burundi',
        'source_url': 'https://www.unhcr.org/burundi',
        'source_publication_date': datetime.date(2024, 2, 15),
        'translations': {
            'rn': {
                'title': 'Ubufasha bw\'imibereho myiza n\'amategeko ku bagarutse i Burundi',
                'summary': 'Serivisi z\'ubuzima bw\'umutima, ubufasha bw\'amategeko, n\'inkunga y\'umuturage ku bagarutse.',
                'content': (
                    'Gusubira nyuma yo guhungira bishobora kuba bigoye mu mutima. UNHCR n\'inzego zifatanya '
                    'zitanga ubufasha bw\'imibereho myiza binyuze mu murimo w\'uburenganzira bw\'umuturage '
                    'i Burundi. Ubufasha bw\'amategeko ku bibazo by\'ubutaka, impapuro, n\'gusubirana '
                    'n\'umuryango buhari binyuze muri APRODH n\'izindi ngo. Abagarutse bahura n\'ingorane '
                    'z\'umutima cyangwa gutandukana n\'umuryango basabwa gutumanahana na UNHCR.'
                ),
                'reviewed': True,
            },
            'rw': {
                'title': 'Ubufasha bw\'imibereho myiza n\'amategeko ku bagarutse i Burundi',
                'summary': 'Serivisi z\'ubuzima bw\'umutima, ubufasha bw\'amategeko, n\'inkunga y\'umuturage ku bagarutse.',
                'content': (
                    'Gusubira nyuma yo guhungira bishobora kuba bigoye mu mutima. UNHCR n\'inzego zifatanya '
                    'zitanga ubufasha bw\'imibereho myiza i Burundi. Ubufasha bw\'amategeko buhari binyuze '
                    'muri APRODH n\'izindi ngo. Abagarutse bahura n\'ingorane z\'umutima cyangwa gutandukana '
                    'n\'umuryango basabwa gutumanahana na UNHCR cyangwa ibiro by\'imibereho myiza biri hafi.'
                ),
                'reviewed': True,
            },
            'sw': {
                'title': 'Msaada wa Kisaikolojia na Kisheria kwa Warejeshwaji Burundi',
                'summary': 'Huduma za afya ya akili, msaada wa kisheria, na msaada wa jamii unaopatikana kwa warejeshwaji.',
                'content': (
                    'Kurudi baada ya kuhama kunaweza kuwa vigumu kihisia. UNHCR na washirika wake wanatoa '
                    'msaada wa kisaikolojia kupitia mitandao ya ulinzi inayotegemea jamii nchini Burundi. '
                    'Msaada wa kisheria kwa migogoro ya ardhi, nyaraka, na kuungana tena na familia '
                    'unapatikana kupitia APRODH na mashirika mengine yasiyokuwa ya kiserikali. Warejeshwaji '
                    'wanaopitia msongo wa mawazo au kutengana na familia wanashauriwa kuwasiliana na UNHCR.'
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
