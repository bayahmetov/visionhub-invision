import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Profanity word lists for Russian, Kazakh, and English
// These are common offensive words - expanded list for better coverage
const profanityListRu = [
  'блять', 'бля', 'блядь', 'блядина', 'сука', 'сучка', 'хуй', 'хуйня', 'хуёвый', 'хуйло',
  'пизда', 'пиздец', 'пиздато', 'пиздёж', 'ебать', 'ебаный', 'ебанутый', 'ёб', 'ебал',
  'ебло', 'заебал', 'заебись', 'наебать', 'отъебись', 'поебать', 'уёбок', 'уёбище',
  'мудак', 'мудила', 'долбоёб', 'дебил', 'идиот', 'придурок', 'мразь', 'тварь',
  'гандон', 'пидор', 'пидорас', 'педик', 'чмо', 'лох', 'говно', 'срань', 'жопа',
  'залупа', 'хер', 'херня', 'член', 'елда', 'письки', 'сиськи', 'дрочить', 'дрочка',
  'шлюха', 'проститутка', 'шалава', 'потаскуха', 'курва'
];

const profanityListKz = [
  'сасық', 'сатқын', 'масқара', 'ақымақ', 'есек', 'итбала', 'қотақбас',
  'мақау', 'жынды', 'надан', 'зиялы емес', 'арсыз', 'бетсіз', 'ұятсыз',
  'кемтар', 'мылжың', 'қорқақ', 'қу', 'қаңғыбас', 'маскүнем'
];

const profanityListEn = [
  'fuck', 'fucking', 'fucker', 'fucked', 'motherfucker', 'shit', 'shitty', 'bullshit',
  'ass', 'asshole', 'bastard', 'bitch', 'damn', 'dick', 'dickhead', 'cock', 'cunt',
  'pussy', 'whore', 'slut', 'retard', 'retarded', 'idiot', 'moron', 'dumbass',
  'nigger', 'nigga', 'faggot', 'fag', 'dyke', 'crap', 'piss', 'pissed',
  'wanker', 'twat', 'bollocks', 'arse', 'bloody', 'bugger', 'sodoff'
];

// Additional inappropriate content patterns
const inappropriatePatterns = [
  /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // Phone numbers
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
  /(https?:\/\/[^\s]+)/g, // URLs
  /\b(telegram|whatsapp|viber|instagram|facebook|vk|tiktok)\s*[:\/@]\s*\S+/gi, // Social media handles
];

function normalizeText(text: string): string {
  // Normalize common letter substitutions
  return text
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/@/g, 'a')
    .replace(/[*_\-.,!?]/g, '');
}

function checkProfanity(text: string): { isClean: boolean; reason?: string; detectedWords?: string[] } {
  if (!text || text.trim().length === 0) {
    return { isClean: true };
  }

  const normalizedText = normalizeText(text);
  const detectedWords: string[] = [];

  // Check Russian profanity
  for (const word of profanityListRu) {
    const normalizedWord = normalizeText(word);
    if (normalizedText.includes(normalizedWord)) {
      detectedWords.push(word);
    }
  }

  // Check Kazakh profanity
  for (const word of profanityListKz) {
    const normalizedWord = normalizeText(word);
    if (normalizedText.includes(normalizedWord)) {
      detectedWords.push(word);
    }
  }

  // Check English profanity
  for (const word of profanityListEn) {
    const normalizedWord = normalizeText(word);
    // Use word boundaries for English
    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
    if (regex.test(normalizedText)) {
      detectedWords.push(word);
    }
  }

  if (detectedWords.length > 0) {
    return {
      isClean: false,
      reason: 'Обнаружена нецензурная лексика / Нецензурлық сөздер табылды / Profanity detected',
      detectedWords: [...new Set(detectedWords)]
    };
  }

  // Check for inappropriate patterns
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(text)) {
      return {
        isClean: false,
        reason: 'Обнаружена контактная информация или ссылки / Байланыс ақпараты немесе сілтемелер табылды / Contact information or links detected'
      };
    }
  }

  return { isClean: true };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type } = await req.json();

    console.log(`[moderate-content] Checking ${type || 'text'}: "${text?.substring(0, 50)}..."`);

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ isClean: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = checkProfanity(text);

    console.log(`[moderate-content] Result: isClean=${result.isClean}${result.detectedWords ? `, detected: ${result.detectedWords.join(', ')}` : ''}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[moderate-content] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, isClean: true }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
