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
    const { messages, language = 'ru' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received messages:", messages?.length, "Language:", language);

    const systemPrompts = {
      ru: `Ты — AI-консультант DataHub, платформы для поиска университетов Казахстана. 
Твоя задача — помогать абитуриентам и студентам:
- Отвечать на вопросы об университетах Казахстана
- Помогать с выбором специальности и университета
- Объяснять процесс поступления, требования ЕНТ, гранты
- Давать советы по подготовке документов
- Информировать о стипендиях и общежитиях

Отвечай кратко, дружелюбно и по делу. Используй факты о казахстанских вузах.
Если не знаешь точного ответа — так и скажи, но постарайся направить к нужным ресурсам.`,
      
      kz: `Сен — DataHub AI-кеңесшісі, Қазақстан университеттерін іздеу платформасы.
Сенің міндетің — абитуриенттер мен студенттерге көмектесу:
- Қазақстан университеттері туралы сұрақтарға жауап беру
- Мамандық пен университет таңдауға көмектесу
- Түсу процесін, ҰБТ талаптарын, гранттарды түсіндіру
- Құжаттар дайындау бойынша кеңес беру
- Стипендиялар мен жатақханалар туралы ақпарат беру

Қысқа, достық және нақты жауап бер.`,

      en: `You are DataHub AI consultant, a platform for finding universities in Kazakhstan.
Your task is to help applicants and students:
- Answer questions about universities in Kazakhstan
- Help with choosing a specialty and university
- Explain the admission process, UNT requirements, grants
- Give advice on document preparation
- Inform about scholarships and dormitories

Answer briefly, friendly and to the point. Use facts about Kazakhstani universities.
If you don't know the exact answer, say so, but try to point to the right resources.`
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.ru;

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
    });

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
      
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
