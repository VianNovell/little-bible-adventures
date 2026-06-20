import { supabase } from './supabaseClient';

export const awardStars = async (amount: number) => {
  const currentStars = parseInt(localStorage.getItem('starsEarned') || '0');
  const newStars = currentStars + amount;
  localStorage.setItem('starsEarned', newStars.toString());
  
  // Dispatch custom event to notify UI
  window.dispatchEvent(new CustomEvent('rewardsUpdated', { detail: { stars: newStars } }));

  // Sync to cloud
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data?.session?.user?.id;
    if (userId) {
      await supabase.from('achievements').update({ stars_earned: newStars }).eq('user_id', userId);
    }
  } catch (err) {
    console.warn('Failed to sync stars:', err);
  }
};

export const awardBadge = async (badgeCount: number = 1) => {
  const currentBadges = parseInt(localStorage.getItem('badgesEarned') || '1');
  const newBadges = currentBadges + badgeCount;
  localStorage.setItem('badgesEarned', newBadges.toString());
  
  // Dispatch custom event to notify UI
  window.dispatchEvent(new CustomEvent('rewardsUpdated', { detail: { badges: newBadges } }));

  // Sync to cloud
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data?.session?.user?.id;
    if (userId) {
      await supabase.from('achievements').update({ badges_earned: newBadges }).eq('user_id', userId);
    }
  } catch (err) {
    console.warn('Failed to sync badges:', err);
  }
};
