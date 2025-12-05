import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type } = await req.json();

    console.log(`[moderate-content] Checking ${type || 'text'}: "${text?.substring(0, 50)}..."`);

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ isClean: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[moderate-content] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ isClean: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a content moderation AI for an educational platform about universities in Kazakhstan.
Your task is to analyze text and determine if it contains inappropriate content.

Check for:
1. Profanity or vulgar language in Russian, Kazakh, or English
2. Insults, hate speech, or discriminatory language
3. Personal contact information (phone numbers, emails, social media handles)
4. URLs or external links
5. Spam or promotional content
6. Off-topic content not related to education or universities
7. Attempts to bypass moderation (like using similar-looking characters)

Respond ONLY with a JSON object in this exact format:
{"isClean": true} - if the content is appropriate
{"isClean": false, "reason": "Brief explanation in Russian"} - if the content is inappropriate

Be strict but fair. Educational discussions, constructive criticism of universities, and honest reviews are allowed.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this ${type || 'text'}: "${text}"` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('[moderate-content] Rate limited');
        return new Response(
          JSON.stringify({ isClean: true, warning: 'Rate limited, content not checked' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('[moderate-content] AI gateway error:', response.status);
      return new Response(
        JSON.stringify({ isClean: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log(`[moderate-content] AI response: ${aiResponse}`);

    // Parse AI response
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log(`[moderate-content] Result: isClean=${result.isClean}${result.reason ? `, reason: ${result.reason}` : ''}`);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError) {
      console.error('[moderate-content] Failed to parse AI response:', parseError);
    }

    // Default to clean if parsing fails
    return new Response(
      JSON.stringify({ isClean: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[moderate-content] Error:', error);
    return new Response(
      JSON.stringify({ isClean: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
