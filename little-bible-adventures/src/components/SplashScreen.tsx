import { useEffect, useState } from 'react';
import './SplashScreen.css';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fade out after 4.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 4500);

    // Unmount after fade animation completes (5s total)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className={`splash-content ${isFading ? 'fade-out' : ''}`}>
        <div className="header-container-flex animate-pulse">
          <img src="/logo.png" alt="Little Bible Adventures Logo" className="header-logo-img" />
          <div className="header-text-group">
            <h1 className="text-white" style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>Little Bible Adventures</h1>
            <p className="text-white" style={{ opacity: 0.9, margin: 0, fontSize: '0.9rem' }}>A Christian Faith-Based Platform for Kids.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
