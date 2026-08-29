import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for a single attempt with percentiles
export type ScoreWithPercentiles = {
  id: string;
  aim_score: number;
  aim_percentile: number;
  dex_score: number;
  movement_percentile: number;
  reax_score: number;
  reflex_percentile: number;
  composite_score: number;
  composite_percentile: number;
  created_at: string;
  gamer_tag: string;
};

// Fetch ALL attempts with percentiles for a user
export async function fetchUserScoresWithPercentiles(userId: string): Promise<ScoreWithPercentiles[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_percentiles', { p_user_id: userId });

    if (error) {
      console.error('Error fetching percentiles:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data as ScoreWithPercentiles[];
  } catch (err) {
    console.error('Unexpected error fetching percentiles:', err);
    return [];
  }
}

// Keep the old function for backward compatibility (returns latest only)
export type UserPercentiles = {
  aimPercentile: number;
  movementPercentile: number;
  reflexPercentile: number;
  compositePercentile: number;
};

export async function fetchUserPercentiles(userId: string): Promise<UserPercentiles | null> {
  try {
    const scores = await fetchUserScoresWithPercentiles(userId);
    if (scores.length === 0) return null;

    // Return the first (most recent) attempt
    const latest = scores[0];
    return {
      aimPercentile: latest.aim_percentile || 0,
      movementPercentile: latest.movement_percentile || 0,
      reflexPercentile: latest.reflex_percentile || 0,
      compositePercentile: latest.composite_percentile || 0,
    };
  } catch (err) {
    console.error('Error fetching percentiles:', err);
    return null;
  }
}

// Format percentile for display
export function formatPercentile(percentile: number): string {
  if (percentile >= 99) return 'Top 1%';
  if (percentile >= 95) return 'Top 5%';
  if (percentile >= 90) return 'Top 10%';
  if (percentile >= 75) return 'Top 25%';
  if (percentile >= 50) return 'Top 50%';
  if (percentile >= 25) return 'Top 75%';
  if (percentile > 0) return `Top ${Math.round(100 - percentile)}%`;
  return 'Bottom 100%';
}


export async function fetchPreviousBestScore(userId: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('user_scores')
      .select('composite_score')
      .eq('user_id', userId)
      .not('composite_score', 'is', null)
      .order('composite_score', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching previous best:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0].composite_score;
  } catch (err) {
    console.error('Unexpected error fetching previous best:', err);
    return null;
  }
} 