import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface PrayerCornerProps {
  onClose: () => void;
}

export default function PrayerCorner({ onClose }: PrayerCornerProps) {
  const [newPrayer, setNewPrayer] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSharePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.trim() || !newAuthor.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('prayers').insert([
        { text: newPrayer.trim(), author: newAuthor.trim() }
      ]);
      
      if (error) {
        console.error("Error submitting prayer:", error);
        alert("Failed to send prayer. Make sure the database table exists.");
      } else {
        setSuccess(true);
        setNewPrayer("");
        setNewAuthor("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="act-modal-overlay" onClick={onClose}>
      <div className="act-modal card animate-float" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button className="tp-modal-close" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        
        <h2>🙏 Prayer Corner</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>Share your prayer requests and pray for others.</p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#f0fff4', borderRadius: '12px', color: '#2f855a' }}>
            <h3 style={{ marginBottom: '1rem' }}>Sent! 🙏</h3>
            <p>Your prayer request has been securely sent to Mrs. Sa'rah.</p>
            <button onClick={() => setSuccess(false)} className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Send another</button>
          </div>
        ) : (
          <form onSubmit={handleSharePrayer} style={{ padding: '1rem', background: '#f7fafc', borderRadius: '12px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <input 
                type="text" 
                placeholder="Your first name" 
                value={newAuthor}
                onChange={e => setNewAuthor(e.target.value)}
                className="input-control"
                required
                style={{ width: '100%', marginBottom: '0.5rem' }}
                disabled={isSubmitting}
              />
              <textarea 
                placeholder="What would you like us to pray for?" 
                value={newPrayer}
                onChange={e => setNewPrayer(e.target.value)}
                className="input-control"
                rows={4}
                required
                style={{ width: '100%', resize: 'vertical' }}
                disabled={isSubmitting}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send to Teacher"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
