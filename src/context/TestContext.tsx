import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';
import { supabase } from '@/lib/supabase';
import { getOrCreateAnonId } from '@/lib/anonId';

type TestContextValue = {
  gamertag: string;
  setGamertag: Dispatch<SetStateAction<string>>;
  aimScore: number | null;
  setAimScore: Dispatch<SetStateAction<number | null>>;
  dexScore: number | null;
  setDexScore: Dispatch<SetStateAction<number | null>>;
  reaxScore: number | null;
  setReaxScore: Dispatch<SetStateAction<number | null>>;
  compositeScore: number | null;
  anonId: string;
};

const TestContext = createContext<TestContextValue | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [gamertag, setGamertag] = useState('');
  const [aimScore, setAimScore] = useState<number | null>(null);
  const [dexScore, setDexScore] = useState<number | null>(null);
  const [reaxScore, setReaxScore] = useState<number | null>(null);
  const [compositeScore, setCompositeScore] = useState<number | null>(null);
  const [anonId] = useState(getOrCreateAnonId);

  const hasSaved = useRef(false);

  // --- CALCULATE COMPOSITE SCORE ---
  // Runs whenever any individual score changes
  useEffect(() => {
    if (aimScore !== null && dexScore !== null && reaxScore !== null) {
      // Formula: (aim × 0.4) + (movement × 0.35) + (reflex × 0.25)
      const composite = Math.round(
        (aimScore * 0.4) + (dexScore * 0.35) + (reaxScore * 0.25)
      );
      setCompositeScore(composite);
      console.log(`📊 Composite score calculated: ${composite}`);
      console.log(`   (${aimScore} × 0.4) + (${dexScore} × 0.35) + (${reaxScore} × 0.25) = ${composite}`);
    } else {
      // Reset composite if any score is null
      if (compositeScore !== null) {
        setCompositeScore(null);
      }
    }
  }, [aimScore, dexScore, reaxScore]);

  // Debug: Log whenever scores change
  useEffect(() => {
    console.log('🔍 TestContext State Update:', {
      gamertag: gamertag || '(empty)',
      aimScore,
      dexScore,
      reaxScore,
      compositeScore,
    });
  }, [gamertag, aimScore, dexScore, reaxScore, compositeScore]);

  // Auto-save when all three scores are present
  useEffect(() => {
    console.log('🔄 Auto-save check triggered');
    console.log(`   aimScore: ${aimScore} (${aimScore === null ? 'null' : 'set'})`);
    console.log(`   dexScore: ${dexScore} (${dexScore === null ? 'null' : 'set'})`);
    console.log(`   reaxScore: ${reaxScore} (${reaxScore === null ? 'null' : 'set'})`);
    console.log(`   compositeScore: ${compositeScore} (${compositeScore === null ? 'null' : 'set'})`);
    console.log(`   gamertag: "${gamertag}" (${gamertag.trim() ? 'valid' : 'EMPTY'})`);
    console.log(`   hasSaved: ${hasSaved.current}`);

    // Condition 1: All scores non-null (including composite)
    if (aimScore === null || dexScore === null || reaxScore === null || compositeScore === null) {
      console.log('❌ Auto-save blocked: One or more scores are null');
      return;
    }

    // Condition 2: Gamertag not empty
    if (!gamertag.trim()) {
      console.log('❌ Auto-save blocked: Gamertag is empty');
      return;
    }

    // Condition 3: Not already saved
    if (hasSaved.current) {
      console.log('❌ Auto-save blocked: Already saved');
      return;
    }

    // All conditions met!
    console.log('✅ ALL CONDITIONS MET! Proceeding with save...');
    hasSaved.current = true;

    const saveScore = async () => {
      try {
        console.log('📤 Sending to Supabase:', {
          user_id: anonId,
          gamer_tag: gamertag.trim(),
          aim_score: aimScore,
          dex_score: dexScore,
          reax_score: reaxScore,
          composite_score: compositeScore,
        });

        const { error } = await supabase
          .from('user_scores')
          .insert({
            user_id: anonId,
            gamer_tag: gamertag.trim(),
            aim_score: aimScore,
            dex_score: dexScore,
            reax_score: reaxScore,
            composite_score: compositeScore,
          });

        if (error) {
          console.error('❌ Supabase insert error:', error);
        } else {
          console.log('✅ Score saved to Supabase:', {
            aimScore,
            dexScore,
            reaxScore,
            compositeScore,
          });
        }
      } catch (err) {
        console.error('❌ Unexpected error during save:', err);
      }
    };

    saveScore();
  }, [aimScore, dexScore, reaxScore, compositeScore, gamertag, anonId]);

  return (
    <TestContext.Provider
      value={{
        gamertag,
        setGamertag,
        aimScore,
        setAimScore,
        dexScore,
        setDexScore,
        reaxScore,
        setReaxScore,
        compositeScore,
        anonId,
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error('useTest must be used within a TestProvider');
  return ctx;
}