import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { awardStars } from '../../lib/rewards';
import { supabase } from '../../lib/supabaseClient';

interface MemoryVerseProps {
  onClose: () => void;
}

const defaultVerses = [
  {
    reference: "John 3:16",
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    difficulty: "Easy"
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all this through him who gives me strength.",
    difficulty: "Easy"
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    difficulty: "Medium"
  },
  {
    reference: "Psalm 119:105",
    text: "Your word is a lamp for my feet, a light on my path.",
    difficulty: "Easy"
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function MemoryVerse({ onClose }: MemoryVerseProps) {
  const [memorized, setMemorized] = useState<string[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<any | null>(null);
  const [liveVerses, setLiveVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerses = async () => {
      try {
        const { data } = await supabase.from('memory_verses').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setLiveVerses(data);
        } else {
          setLiveVerses(shuffleArray(defaultVerses));
        }
      } catch (err) {
        console.error(err);
        setLiveVerses(shuffleArray(defaultVerses));
      } finally {
        setLoading(false);
      }
    };
    fetchVerses();
  }, []);

  const toggleMemorized = (reference: string) => {
    if (memorized.includes(reference)) {
      setMemorized(memorized.filter(r => r !== reference));
    } else {
      setMemorized([...memorized, reference]);
      awardStars(2);
    }
  };

  return (
    <div className="act-modal-overlay" onClick={onClose}>
      <div className="act-modal card animate-float" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <button className="tp-modal-close" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        
        <h2>📖 Memory Verses</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>Hide God's word in your heart!</p>
        
        {selectedVerse ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <h3 style={{ fontSize: '1.8rem', color: '#553c9a', marginBottom: '1.5rem' }}>{selectedVerse.reference}</h3>
            <p style={{ fontSize: '1.4rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '2rem' }}>
              "{selectedVerse.text}"
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                className={`btn ${memorized.includes(selectedVerse.reference) ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => toggleMemorized(selectedVerse.reference)}
              >
                {memorized.includes(selectedVerse.reference) ? '✅ Memorized!' : 'Mark as Memorized'}
              </button>
              <button className="btn btn-outline" onClick={() => setSelectedVerse(null)}>
                Back to List
              </button>
            </div>
          </div>
        ) : loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading verses...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {liveVerses.map(verse => (
              <div 
                key={verse.reference} 
                className="card" 
                style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', border: memorized.includes(verse.reference) ? '2px solid #48bb78' : '1px solid #e2e8f0' }}
                onClick={() => setSelectedVerse(verse)}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {verse.reference}
                    {memorized.includes(verse.reference) && <CheckCircle size={18} color="#48bb78" />}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px' }}>{verse.difficulty}</span>
                </div>
                <div style={{ color: '#553c9a', fontWeight: 'bold' }}>Read ›</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
