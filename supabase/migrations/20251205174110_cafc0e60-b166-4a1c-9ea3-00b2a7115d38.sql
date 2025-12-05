-- Allow all authenticated users to create articles
CREATE POLICY "Authenticated users can create articles" 
ON public.articles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own articles
CREATE POLICY "Users can update own articles" 
ON public.articles 
FOR UPDATE 
USING (auth.uid() = author_id);

-- Allow users to delete their own articles
CREATE POLICY "Users can delete own articles" 
ON public.articles 
FOR DELETE 
USING (auth.uid() = author_id);

-- Insert initial blog articles
INSERT INTO public.articles (slug, title_ru, title_en, title_kz, excerpt_ru, content_ru, category, is_published, published_at, views_count) VALUES
('kak-postupit-v-kaznu', 'Как поступить в КазНУ: полный гайд для абитуриентов 2025', 'How to Enroll in KazNU: Complete Guide for 2025', 'ҚазҰУ-ға қалай түсуге болады: 2025 жылғы толық нұсқаулық', 'Пошаговая инструкция для поступления в главный университет страны', 'В этом гайде мы расскажем все этапы поступления в КазНУ им. аль-Фараби...', 'guide', true, NOW(), 156),
('istoriya-vypusknika-it', 'История успеха: от студента КБТУ до Google', 'Success Story: From KBTU Student to Google', 'Табыс тарихы: ҚБТУ студентінен Google-ға дейін', 'Как выпускник казахстанского вуза попал в топовую IT-компанию', 'Интервью с Асланом, который начал свой путь в КБТУ и сейчас работает в Google...', 'story', true, NOW() - INTERVAL '2 days', 324),
('grant-ent-2025', 'Всё о грантах ЕНТ 2025: требования и проходные баллы', 'Everything About ENT Grants 2025', 'ЕНТ гранттары туралы барлығы 2025', 'Какие баллы нужны для получения образовательного гранта', 'Государственные гранты — один из главных способов получить бесплатное образование...', 'guide', true, NOW() - INTERVAL '3 days', 892),
('nazarbayev-university-interview', 'Интервью с деканом Назарбаев Университета', 'Interview with Nazarbayev University Dean', 'Назарбаев Университеті деканымен сұхбат', 'О новых программах и будущем университета', 'Мы поговорили с деканом инженерной школы о планах развития...', 'interview', true, NOW() - INTERVAL '5 days', 445),
('it-professii-kazakhstan', 'Топ-10 IT профессий в Казахстане 2025', 'Top 10 IT Jobs in Kazakhstan 2025', 'Қазақстандағы ең танымал 10 IT мамандық 2025', 'Самые востребованные специальности и зарплаты', 'Рынок IT в Казахстане активно растёт. Мы собрали данные о самых востребованных профессиях...', 'news', true, NOW() - INTERVAL '1 day', 678);