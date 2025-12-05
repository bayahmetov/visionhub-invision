-- Insert programs for КазНУ (0f4d48d2-ba9b-462d-bf9e-c0768667f9aa)
INSERT INTO public.programs (university_id, name_ru, name_kz, name_en, description_ru, description_kz, description_en, degree_level, duration_years, language, tuition_fee_kzt, field_id, employment_rate, grants_available, ent_min_score) VALUES
('0f4d48d2-ba9b-462d-bf9e-c0768667f9aa', 'Информационные системы', 'Ақпараттық жүйелер', 'Information Systems', 'Подготовка IT-специалистов широкого профиля.', 'Кең профильді IT-мамандар даярлау.', 'Training broad-profile IT specialists.', 'bachelor', 4, ARRAY['ru', 'en'], 1200000, 'it', 96, true, 80),
('0f4d48d2-ba9b-462d-bf9e-c0768667f9aa', 'Общая медицина', 'Жалпы медицина', 'General Medicine', 'Подготовка врачей общей практики.', 'Жалпы тәжірибе дәрігерлерін даярлау.', 'Training general practitioners.', 'bachelor', 6, ARRAY['ru', 'kz'], 1500000, 'medicine', 98, true, 90),
('0f4d48d2-ba9b-462d-bf9e-c0768667f9aa', 'Юриспруденция', 'Құқықтану', 'Jurisprudence', 'Подготовка специалистов в области права.', 'Құқық саласындағы мамандар даярлау.', 'Training specialists in law.', 'bachelor', 4, ARRAY['ru', 'kz'], 1100000, 'law', 85, true, 85),

-- Programs for НУ (58cd8343-d530-4f4b-b417-bc28f8cd0504)
('58cd8343-d530-4f4b-b417-bc28f8cd0504', 'Computer Science', 'Computer Science', 'Computer Science', 'Программа мирового уровня по компьютерным наукам.', 'Компьютерлік ғылымдар бойынша әлемдік деңгейдегі бағдарлама.', 'World-class computer science program.', 'bachelor', 4, ARRAY['en'], 0, 'it', 99, true, 120),
('58cd8343-d530-4f4b-b417-bc28f8cd0504', 'Economics', 'Экономика', 'Economics', 'Международная программа по экономике.', 'Экономика бойынша халықаралық бағдарлама.', 'International economics program.', 'bachelor', 4, ARRAY['en'], 0, 'economics', 97, true, 115),
('58cd8343-d530-4f4b-b417-bc28f8cd0504', 'Medicine', 'Медицина', 'Medicine', 'Программа медицины с партнерами из США.', 'АҚШ серіктестерімен медицина бағдарламасы.', 'Medicine program with US partners.', 'bachelor', 6, ARRAY['en'], 0, 'medicine', 99, true, 125),

-- Programs for КБТУ (d0ef4f16-2ff4-40fe-88f0-65ffbf81b1fc)
('d0ef4f16-2ff4-40fe-88f0-65ffbf81b1fc', 'Нефтегазовое дело', 'Мұнай-газ ісі', 'Petroleum Engineering', 'Подготовка специалистов для нефтегазовой отрасли.', 'Мұнай-газ саласына мамандар даярлау.', 'Training specialists for the oil and gas industry.', 'bachelor', 4, ARRAY['en', 'ru'], 3500000, 'engineering', 95, true, 100),
('d0ef4f16-2ff4-40fe-88f0-65ffbf81b1fc', 'Информационные технологии', 'Ақпараттық технологиялар', 'Information Technology', 'IT-программа с британским дипломом.', 'Британ дипломы бар IT-бағдарлама.', 'IT program with British degree.', 'bachelor', 4, ARRAY['en'], 3200000, 'it', 94, true, 95),

-- Programs for ЕНУ (616bad49-2f4e-456e-9c40-a7bbad677183)
('616bad49-2f4e-456e-9c40-a7bbad677183', 'Международные отношения', 'Халықаралық қатынастар', 'International Relations', 'Подготовка дипломатов и специалистов по МО.', 'Дипломаттар мен халықаралық қатынастар мамандарын даярлау.', 'Training diplomats and IR specialists.', 'bachelor', 4, ARRAY['ru', 'kz', 'en'], 800000, 'humanities', 88, true, 85),
('616bad49-2f4e-456e-9c40-a7bbad677183', 'Физика', 'Физика', 'Physics', 'Фундаментальная программа по физике.', 'Физика бойынша іргелі бағдарлама.', 'Fundamental physics program.', 'bachelor', 4, ARRAY['ru', 'kz'], 750000, 'natural', 82, true, 80),

-- Programs for МУИТ (054af66c-1e7e-4bf0-87c4-61973d823b20)
('054af66c-1e7e-4bf0-87c4-61973d823b20', 'Программная инженерия', 'Бағдарламалық инженерия', 'Software Engineering', 'Практико-ориентированная программа для разработчиков.', 'Әзірлеушілерге арналған практикаға бағытталған бағдарлама.', 'Practice-oriented program for developers.', 'bachelor', 4, ARRAY['ru', 'en'], 2000000, 'it', 97, true, 90),
('054af66c-1e7e-4bf0-87c4-61973d823b20', 'Data Science', 'Data Science', 'Data Science', 'Программа по анализу данных и машинному обучению.', 'Деректерді талдау және машиналық оқыту бағдарламасы.', 'Data analysis and machine learning program.', 'master', 2, ARRAY['en'], 2500000, 'it', 99, true, NULL),

-- Programs for КазНМУ (8fb02874-a69f-48fa-ba3b-caf62e10c560)
('8fb02874-a69f-48fa-ba3b-caf62e10c560', 'Общая медицина', 'Жалпы медицина', 'General Medicine', 'Классическая программа подготовки врачей.', 'Дәрігерлерді даярлаудың классикалық бағдарламасы.', 'Classic doctor training program.', 'bachelor', 6, ARRAY['ru', 'kz'], 1500000, 'medicine', 98, true, 95),
('8fb02874-a69f-48fa-ba3b-caf62e10c560', 'Стоматология', 'Стоматология', 'Dentistry', 'Программа подготовки стоматологов.', 'Стоматологтарды даярлау бағдарламасы.', 'Dentistry training program.', 'bachelor', 5, ARRAY['ru', 'kz'], 1800000, 'medicine', 96, true, 90);

-- Insert partnerships
INSERT INTO public.partnerships (university_id, partner_name, partner_country, partnership_type, description_ru, description_kz, description_en) VALUES
('0f4d48d2-ba9b-462d-bf9e-c0768667f9aa', 'Moscow State University', 'Россия', 'exchange', 'Программа обмена студентами и преподавателями.', 'Студенттер мен оқытушылар алмасу бағдарламасы.', 'Student and faculty exchange program.'),
('0f4d48d2-ba9b-462d-bf9e-c0768667f9aa', 'Peking University', 'Китай', 'research', 'Совместные исследовательские проекты.', 'Бірлескен зерттеу жобалары.', 'Joint research projects.'),
('58cd8343-d530-4f4b-b417-bc28f8cd0504', 'MIT', 'США', 'dual_degree', 'Программа двойного диплома в области инженерии.', 'Инженерия саласында қос диплом бағдарламасы.', 'Dual degree program in engineering.'),
('58cd8343-d530-4f4b-b417-bc28f8cd0504', 'Cambridge University', 'Великобритания', 'research', 'Научное партнерство в области медицины.', 'Медицина саласындағы ғылыми серіктестік.', 'Scientific partnership in medicine.'),
('d0ef4f16-2ff4-40fe-88f0-65ffbf81b1fc', 'Imperial College London', 'Великобритания', 'dual_degree', 'Двойной диплом по инженерным специальностям.', 'Инженерлік мамандықтар бойынша қос диплом.', 'Double degree in engineering.'),
('d0ef4f16-2ff4-40fe-88f0-65ffbf81b1fc', 'Shell', 'Нидерланды', 'research', 'Исследовательское партнерство в нефтегазовой сфере.', 'Мұнай-газ саласындағы зерттеу серіктестігі.', 'Research partnership in oil and gas.'),
('616bad49-2f4e-456e-9c40-a7bbad677183', 'Saint Petersburg University', 'Россия', 'exchange', 'Академический обмен по гуманитарным наукам.', 'Гуманитарлық ғылымдар бойынша академиялық алмасу.', 'Academic exchange in humanities.'),
('054af66c-1e7e-4bf0-87c4-61973d823b20', 'Google', 'США', 'research', 'Партнерство в области AI и машинного обучения.', 'AI және машиналық оқыту саласындағы серіктестік.', 'Partnership in AI and machine learning.');