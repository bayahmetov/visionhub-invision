import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'ru', userProfile, mode = 'general' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("AI Chat - Mode:", mode, "Language:", language, "Has profile:", !!userProfile, "Messages count:", messages?.length);

    // Build context from user profile
    let profileContext = '';
    if (userProfile) {
      const parts = [];
      if (userProfile.ent_score) parts.push(`Балл ЕНТ: ${userProfile.ent_score}`);
      if (userProfile.expected_ent_score) parts.push(`Ожидаемый балл ЕНТ: ${userProfile.expected_ent_score}`);
      if (userProfile.english_level) parts.push(`Уровень английского: ${userProfile.english_level}`);
      if (userProfile.target_degree) parts.push(`Целевая степень: ${userProfile.target_degree}`);
      if (userProfile.budget_max_kzt) parts.push(`Максимальный бюджет: ${userProfile.budget_max_kzt} тг/год`);
      if (userProfile.interests?.length) parts.push(`Интересы: ${userProfile.interests.join(', ')}`);
      if (userProfile.preferred_cities?.length) parts.push(`Предпочтительные города: ${userProfile.preferred_cities.join(', ')}`);
      if (userProfile.willing_to_relocate !== undefined) parts.push(`Готов к переезду: ${userProfile.willing_to_relocate ? 'да' : 'нет'}`);
      
      if (parts.length > 0) {
        profileContext = `\n\nПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:\n${parts.join('\n')}`;
      }
    }

    const systemPrompts = {
      ru: {
        general: `Ты — AI-консультант DataHub, платформы для поиска университетов Казахстана. 
Твоя задача — помогать абитуриентам и студентам:
- Отвечать на вопросы об университетах Казахстана
- Помогать с выбором специальности и университета
- Объяснять процесс поступления, требования ЕНТ, гранты
- Давать советы по подготовке документов
- Информировать о стипендиях и общежитиях

Отвечай кратко, дружелюбно и по делу. Используй факты о казахстанских вузах.
Если не знаешь точного ответа — так и скажи, но постарайся направить к нужным ресурсам.${profileContext}`,

        twin: `Ты — персональный "Образовательный близнец" — AI-советник, который анализирует профиль абитуриента и помогает построить оптимальный образовательный путь.

ТВОИ ФУНКЦИИ:
1. АНАЛИЗ ШАНСОВ: Оценивай реальные шансы поступления на основе баллов ЕНТ
2. РЕКОМЕНДАЦИИ: Предлагай подходящие программы и вузы под профиль
3. ПЛАН Б: Если шансы низкие — предлагай альтернативные пути
4. ПОДГОТОВКА: Советуй, что подтянуть (предметы, язык)
5. СИМУЛЯЦИЯ: Описывай, как будет выглядеть обучение

ВАЖНО:
- Будь честным о шансах, но мотивируй
- Предлагай конкретные вузы Казахстана
- Учитывай бюджет и предпочтения по городам
- Если профиль неполный — спрашивай недостающую информацию${profileContext}`,

        alternatives: `Ты — AI-проводник по образовательной системе Казахстана. Твоя главная задача — показать АЛЬТЕРНАТИВНЫЕ ПУТИ к образованию.

ТВОЯ РОЛЬ:
Когда пользователь называет целевой вуз/программу, ты:
1. Анализируешь его профиль и шансы
2. Предлагаешь ПЛАН А, Б, В:
   - План А: Целевой вуз (если реалистично)
   - План Б: Похожие программы в других вузах
   - План В: Смежные специальности с хорошими перспективами
3. Объясняешь траектории:
   - Колледж → вуз (если баллы низкие)
   - Обмен программы
   - Перевод между вузами
4. Даёшь план действий на год для улучшения шансов

Будь конструктивным и показывай, что путей много!${profileContext}`,

        career: `Ты — AI-симулятор карьеры после обучения. Твоя задача — показать карьерные перспективы выпускников разных программ.

ТВОИ ФУНКЦИИ:
1. Для каждой программы описывай типичные карьерные пути:
   - Через 1 год после выпуска
   - Через 3 года
   - Через 5 лет
2. Называй конкретные позиции и примерные зарплаты в Казахстане
3. Показывай "ветви судьбы" — разные сценарии развития
4. Учитывай город и готовность к переезду

Используй реальные данные о рынке труда Казахстана.${profileContext}`
      },
      kz: {
        general: `Сен — DataHub AI-кеңесшісі, Қазақстан университеттерін іздеу платформасы.
Сенің міндетің — абитуриенттер мен студенттерге көмектесу.
Қысқа, достық және нақты жауап бер.${profileContext}`,
        twin: `Сен — жеке "Білім беру егізі" — абитуриенттің профилін талдайтын AI-кеңесші.${profileContext}`,
        alternatives: `Сен — Қазақстанның білім беру жүйесі бойынша AI-жолсерік.${profileContext}`,
        career: `Сен — оқудан кейінгі мансап симуляторы.${profileContext}`
      },
      en: {
        general: `You are DataHub AI consultant for finding universities in Kazakhstan.
Answer briefly, friendly and to the point.${profileContext}`,
        twin: `You are a personal "Educational Twin" — an AI advisor analyzing applicant profiles.${profileContext}`,
        alternatives: `You are an AI guide through Kazakhstan's educational system, showing alternative paths.${profileContext}`,
        career: `You are an AI career simulator showing career prospects after graduation.${profileContext}`
      }
    };

    const langPrompts = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.ru;
    const systemPrompt = langPrompts[mode as keyof typeof langPrompts] || langPrompts.general;

    console.log("Calling AI gateway with model google/gemini-2.5-flash");

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        return new Response(JSON.stringify({ error: "AI gateway error: " + response.status }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Successfully connected to AI gateway, streaming response");

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error("AI request timed out");
        return new Response(JSON.stringify({ error: "Request timed out. Please try again." }), {
          status: 504,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
