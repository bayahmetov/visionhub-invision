export interface University {
  id: string;
  name_ru: string;
  name_kz: string;
  name_en: string;
  description_ru: string;
  description_kz: string;
  description_en: string;
  type: 'national' | 'state' | 'private' | 'international';
  founded_year: number;
  region: string;
  city: string;
  address: string;
  website: string;
  email: string;
  phone: string;
  logo_url: string;
  cover_image_url: string;
  ranking_national: number;
  ranking_international?: number;
  students_count: number;
  faculty_count: number;
  programs_count: number;
  fields: string[];
  has_grants: boolean;
  tuition_min: number;
  tuition_max: number;
  mission_ru: string;
  mission_kz: string;
  mission_en: string;
  history_ru: string;
  history_kz: string;
  history_en: string;
  has_3d_tour: boolean;
  tour_url?: string;
}

export interface Program {
  id: string;
  university_id: string;
  name_ru: string;
  name_kz: string;
  name_en: string;
  description_ru: string;
  description_kz: string;
  description_en: string;
  degree_level: 'bachelor' | 'master' | 'doctorate';
  duration_years: number;
  language: string[];
  tuition_fee: number;
  credits: number;
  field_of_study: string;
  employment_rate: number;
  has_grant: boolean;
}

export interface Partnership {
  id: string;
  university_id: string;
  partner_name: string;
  partner_country: string;
  partner_logo_url: string;
  partnership_type: 'exchange' | 'dual_degree' | 'research' | 'joint_program';
  description_ru: string;
  exchange_slots?: number;
}

export const universities: University[] = [
  {
    id: '1',
    name_ru: 'Казахский национальный университет им. аль-Фараби',
    name_kz: 'Әл-Фараби атындағы Қазақ ұлттық университеті',
    name_en: 'Al-Farabi Kazakh National University',
    description_ru: 'Ведущий национальный университет Казахстана, основанный в 1934 году. Крупнейший научно-образовательный центр страны.',
    description_kz: 'Қазақстанның жетекші ұлттық университеті, 1934 жылы құрылған. Елдің ең ірі ғылыми-білім беру орталығы.',
    description_en: 'Leading national university of Kazakhstan, founded in 1934. The largest scientific and educational center of the country.',
    type: 'national',
    founded_year: 1934,
    region: 'Алматы',
    city: 'Алматы',
    address: 'пр. аль-Фараби, 71',
    website: 'https://www.kaznu.kz',
    email: 'info@kaznu.kz',
    phone: '+7 (727) 377-33-33',
    logo_url: 'https://www.kaznu.kz/content/images/pages/logo.png',
    cover_image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200',
    ranking_national: 1,
    ranking_international: 150,
    students_count: 25000,
    faculty_count: 2500,
    programs_count: 150,
    fields: ['it', 'medicine', 'law', 'economics', 'engineering', 'humanities', 'natural'],
    has_grants: true,
    tuition_min: 800000,
    tuition_max: 2500000,
    mission_ru: 'Подготовка высококвалифицированных специалистов, способных внести вклад в устойчивое развитие Казахстана и мирового сообщества.',
    mission_kz: 'Қазақстан мен әлемдік қоғамдастықтың тұрақты дамуына үлес қоса алатын жоғары білікті мамандар даярлау.',
    mission_en: 'Training highly qualified specialists capable of contributing to the sustainable development of Kazakhstan and the world community.',
    history_ru: 'Основан 15 января 1934 года как Казахский государственный университет. В 2001 году присвоен статус национального университета.',
    history_kz: '1934 жылы 15 қаңтарда Қазақ мемлекеттік университеті ретінде құрылған. 2001 жылы ұлттық университет мәртебесі берілді.',
    history_en: 'Founded on January 15, 1934 as Kazakh State University. In 2001, it was granted the status of a national university.',
    has_3d_tour: true,
    tour_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '2',
    name_ru: 'Назарбаев Университет',
    name_kz: 'Назарбаев Университеті',
    name_en: 'Nazarbayev University',
    description_ru: 'Автономный исследовательский университет, основанный в 2010 году. Партнерство с ведущими мировыми университетами.',
    description_kz: 'Автономды зерттеу университеті, 2010 жылы құрылған. Әлемнің жетекші университеттерімен серіктестік.',
    description_en: 'Autonomous research university founded in 2010. Partnership with leading world universities.',
    type: 'international',
    founded_year: 2010,
    region: 'Астана',
    city: 'Астана',
    address: 'ул. Кабанбай батыра, 53',
    website: 'https://nu.edu.kz',
    email: 'admissions@nu.edu.kz',
    phone: '+7 (7172) 70-66-88',
    logo_url: 'https://nu.edu.kz/wp-content/themes/developer/images/logo.svg',
    cover_image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200',
    ranking_national: 2,
    ranking_international: 100,
    students_count: 8000,
    faculty_count: 1200,
    programs_count: 60,
    fields: ['it', 'medicine', 'engineering', 'economics', 'natural'],
    has_grants: true,
    tuition_min: 0,
    tuition_max: 5000000,
    mission_ru: 'Создание передового образовательного и исследовательского центра мирового уровня в Казахстане.',
    mission_kz: 'Қазақстанда әлемдік деңгейдегі озық білім беру және зерттеу орталығын құру.',
    mission_en: 'Creating a world-class advanced educational and research center in Kazakhstan.',
    history_ru: 'Создан в 2010 году по инициативе Первого Президента. Обучение полностью на английском языке.',
    history_kz: '2010 жылы Тұңғыш Президенттің бастамасымен құрылған. Оқыту толығымен ағылшын тілінде.',
    history_en: 'Created in 2010 on the initiative of the First President. Teaching is entirely in English.',
    has_3d_tour: true,
    tour_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '3',
    name_ru: 'Казахстанско-Британский технический университет',
    name_kz: 'Қазақстан-Британ техникалық университеті',
    name_en: 'Kazakh-British Technical University',
    description_ru: 'Ведущий технический университет с британскими стандартами образования.',
    description_kz: 'Британ білім беру стандарттары бар жетекші техникалық университет.',
    description_en: 'Leading technical university with British education standards.',
    type: 'private',
    founded_year: 2001,
    region: 'Алматы',
    city: 'Алматы',
    address: 'ул. Толе би, 59',
    website: 'https://kbtu.edu.kz',
    email: 'info@kbtu.kz',
    phone: '+7 (727) 291-58-95',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/KBTU_Logo.png',
    cover_image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
    ranking_national: 3,
    ranking_international: 250,
    students_count: 5000,
    faculty_count: 800,
    programs_count: 45,
    fields: ['it', 'engineering', 'economics'],
    has_grants: true,
    tuition_min: 2000000,
    tuition_max: 4500000,
    mission_ru: 'Подготовка специалистов мирового класса в сфере технологий и бизнеса.',
    mission_kz: 'Технология және бизнес саласында әлемдік деңгейдегі мамандар даярлау.',
    mission_en: 'Training world-class specialists in technology and business.',
    history_ru: 'Основан в 2001 году при поддержке British Council. Двойные дипломы с британскими университетами.',
    history_kz: '2001 жылы British Council қолдауымен құрылған. Британ университеттерімен қос диплом.',
    history_en: 'Founded in 2001 with the support of British Council. Double degrees with British universities.',
    has_3d_tour: true,
    tour_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '4',
    name_ru: 'Евразийский национальный университет им. Л.Н. Гумилёва',
    name_kz: 'Л.Н. Гумилев атындағы Еуразия ұлттық университеті',
    name_en: 'L.N. Gumilyov Eurasian National University',
    description_ru: 'Крупнейший университет столицы, многопрофильный образовательный центр.',
    description_kz: 'Астананың ең ірі университеті, көпсалалы білім беру орталығы.',
    description_en: 'The largest university in the capital, a multidisciplinary educational center.',
    type: 'national',
    founded_year: 1996,
    region: 'Астана',
    city: 'Астана',
    address: 'ул. Сатпаева, 2',
    website: 'https://enu.kz',
    email: 'info@enu.kz',
    phone: '+7 (7172) 35-09-09',
    logo_url: 'https://enu.kz/images/logo.png',
    cover_image_url: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1200',
    ranking_national: 4,
    ranking_international: 350,
    students_count: 20000,
    faculty_count: 2000,
    programs_count: 120,
    fields: ['it', 'law', 'economics', 'humanities', 'natural', 'engineering'],
    has_grants: true,
    tuition_min: 700000,
    tuition_max: 2000000,
    mission_ru: 'Формирование интеллектуальной элиты нации через качественное образование и науку.',
    mission_kz: 'Сапалы білім мен ғылым арқылы ұлттың зияткерлік элитасын қалыптастыру.',
    mission_en: 'Forming the intellectual elite of the nation through quality education and science.',
    history_ru: 'Основан в 1996 году в новой столице Казахстана как флагманский университет региона.',
    history_kz: '1996 жылы Қазақстанның жаңа астанасында аймақтың жетекші университеті ретінде құрылған.',
    history_en: 'Founded in 1996 in the new capital of Kazakhstan as the flagship university of the region.',
    has_3d_tour: false,
  },
  {
    id: '5',
    name_ru: 'Международный университет информационных технологий',
    name_kz: 'Халықаралық ақпараттық технологиялар университеті',
    name_en: 'International IT University',
    description_ru: 'Специализированный IT-университет с фокусом на современные технологии и стартапы.',
    description_kz: 'Заманауи технологиялар мен стартаптарға бағытталған мамандандырылған IT-университет.',
    description_en: 'Specialized IT university focused on modern technologies and startups.',
    type: 'private',
    founded_year: 2009,
    region: 'Алматы',
    city: 'Алматы',
    address: 'ул. Манаса, 34/1',
    website: 'https://iitu.edu.kz',
    email: 'info@iitu.edu.kz',
    phone: '+7 (727) 330-85-85',
    logo_url: 'https://iitu.edu.kz/logo.png',
    cover_image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
    ranking_national: 8,
    students_count: 4000,
    faculty_count: 400,
    programs_count: 25,
    fields: ['it'],
    has_grants: true,
    tuition_min: 1500000,
    tuition_max: 3000000,
    mission_ru: 'Создание IT-специалистов нового поколения для цифровой экономики Казахстана.',
    mission_kz: 'Қазақстанның цифрлық экономикасы үшін жаңа буын IT-мамандарын даярлау.',
    mission_en: 'Creating a new generation of IT specialists for the digital economy of Kazakhstan.',
    history_ru: 'Основан в 2009 году как специализированный IT-университет. Акселератор стартапов.',
    history_kz: '2009 жылы мамандандырылған IT-университет ретінде құрылған. Стартап акселераторы.',
    history_en: 'Founded in 2009 as a specialized IT university. Startup accelerator.',
    has_3d_tour: true,
    tour_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '6',
    name_ru: 'Казахский национальный медицинский университет им. С.Д. Асфендиярова',
    name_kz: 'С.Ж. Асфендияров атындағы Қазақ ұлттық медицина университеті',
    name_en: 'Asfendiyarov Kazakh National Medical University',
    description_ru: 'Ведущий медицинский университет Казахстана с 90-летней историей.',
    description_kz: '90 жылдық тарихы бар Қазақстанның жетекші медицина университеті.',
    description_en: 'Leading medical university of Kazakhstan with 90 years of history.',
    type: 'national',
    founded_year: 1931,
    region: 'Алматы',
    city: 'Алматы',
    address: 'ул. Толе би, 94',
    website: 'https://kaznmu.kz',
    email: 'info@kaznmu.kz',
    phone: '+7 (727) 292-79-37',
    logo_url: 'https://kaznmu.kz/logo.png',
    cover_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200',
    ranking_national: 5,
    students_count: 12000,
    faculty_count: 1500,
    programs_count: 40,
    fields: ['medicine'],
    has_grants: true,
    tuition_min: 1200000,
    tuition_max: 3500000,
    mission_ru: 'Подготовка врачей мирового уровня для здоровья нации.',
    mission_kz: 'Ұлт денсаулығы үшін әлемдік деңгейдегі дәрігерлер даярлау.',
    mission_en: 'Training world-class doctors for the health of the nation.',
    history_ru: 'Основан в 1931 году. Первый медицинский ВУЗ Казахстана.',
    history_kz: '1931 жылы құрылған. Қазақстанның алғашқы медицина ЖОО.',
    history_en: 'Founded in 1931. The first medical university in Kazakhstan.',
    has_3d_tour: false,
  },
];

export const programs: Program[] = [
  {
    id: 'p1',
    university_id: '1',
    name_ru: 'Информационные системы',
    name_kz: 'Ақпараттық жүйелер',
    name_en: 'Information Systems',
    description_ru: 'Подготовка IT-специалистов широкого профиля.',
    description_kz: 'Кең профильді IT-мамандар даярлау.',
    description_en: 'Training broad-profile IT specialists.',
    degree_level: 'bachelor',
    duration_years: 4,
    language: ['ru', 'en'],
    tuition_fee: 1200000,
    credits: 240,
    field_of_study: 'it',
    employment_rate: 96,
    has_grant: true,
  },
  {
    id: 'p2',
    university_id: '1',
    name_ru: 'Общая медицина',
    name_kz: 'Жалпы медицина',
    name_en: 'General Medicine',
    description_ru: 'Подготовка врачей общей практики.',
    description_kz: 'Жалпы тәжірибе дәрігерлерін даярлау.',
    description_en: 'Training general practitioners.',
    degree_level: 'bachelor',
    duration_years: 6,
    language: ['ru', 'kz'],
    tuition_fee: 1500000,
    credits: 360,
    field_of_study: 'medicine',
    employment_rate: 98,
    has_grant: true,
  },
  {
    id: 'p3',
    university_id: '2',
    name_ru: 'Computer Science',
    name_kz: 'Computer Science',
    name_en: 'Computer Science',
    description_ru: 'Программа мирового уровня по компьютерным наукам.',
    description_kz: 'Компьютерлік ғылымдар бойынша әлемдік деңгейдегі бағдарлама.',
    description_en: 'World-class computer science program.',
    degree_level: 'bachelor',
    duration_years: 4,
    language: ['en'],
    tuition_fee: 0,
    credits: 240,
    field_of_study: 'it',
    employment_rate: 99,
    has_grant: true,
  },
  {
    id: 'p4',
    university_id: '3',
    name_ru: 'Нефтегазовое дело',
    name_kz: 'Мұнай-газ ісі',
    name_en: 'Petroleum Engineering',
    description_ru: 'Подготовка специалистов для нефтегазовой отрасли.',
    description_kz: 'Мұнай-газ саласына мамандар даярлау.',
    description_en: 'Training specialists for the oil and gas industry.',
    degree_level: 'bachelor',
    duration_years: 4,
    language: ['en', 'ru'],
    tuition_fee: 3500000,
    credits: 240,
    field_of_study: 'engineering',
    employment_rate: 95,
    has_grant: true,
  },
];

export const partnerships: Partnership[] = [
  {
    id: 'part1',
    university_id: '1',
    partner_name: 'Moscow State University',
    partner_country: 'Russia',
    partner_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/MSU_building_2015.jpg/200px-MSU_building_2015.jpg',
    partnership_type: 'exchange',
    description_ru: 'Программа обмена студентами на 1 семестр',
    exchange_slots: 20,
  },
  {
    id: 'part2',
    university_id: '2',
    partner_name: 'MIT',
    partner_country: 'USA',
    partner_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png',
    partnership_type: 'research',
    description_ru: 'Совместные исследовательские проекты',
  },
  {
    id: 'part3',
    university_id: '3',
    partner_name: 'University of London',
    partner_country: 'UK',
    partner_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/University_of_London_logo.svg/200px-University_of_London_logo.svg.png',
    partnership_type: 'dual_degree',
    description_ru: 'Программа двойных дипломов',
    exchange_slots: 50,
  },
];

export const fieldsOfStudy = [
  { id: 'it', icon: '💻', color: 'bg-blue-500' },
  { id: 'medicine', icon: '⚕️', color: 'bg-red-500' },
  { id: 'law', icon: '⚖️', color: 'bg-amber-500' },
  { id: 'economics', icon: '📊', color: 'bg-green-500' },
  { id: 'engineering', icon: '⚙️', color: 'bg-purple-500' },
  { id: 'humanities', icon: '📚', color: 'bg-pink-500' },
  { id: 'natural', icon: '🔬', color: 'bg-cyan-500' },
  { id: 'arts', icon: '🎨', color: 'bg-orange-500' },
];

export const regions = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Атырау',
  'Павлодар',
  'Костанай',
  'Петропавловск',
  'Семей',
];
