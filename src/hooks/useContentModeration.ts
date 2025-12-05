import { supabase } from '@/integrations/supabase/client';

interface ModerationResult {
  isClean: boolean;
  reason?: string;
  detectedWords?: string[];
}

export async function moderateContent(text: string, type?: string): Promise<ModerationResult> {
  if (!text || text.trim().length === 0) {
    return { isClean: true };
  }

  try {
    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: { text, type },
    });

    if (error) {
      console.error('Content moderation error:', error);
      // On error, allow the content (fail open)
      return { isClean: true };
    }

    return data as ModerationResult;
  } catch (err) {
    console.error('Content moderation error:', err);
    return { isClean: true };
  }
}

export function useContentModeration() {
  return { moderateContent };
}
