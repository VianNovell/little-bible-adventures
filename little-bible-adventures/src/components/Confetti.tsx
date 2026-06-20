import { useEffect, useState } from 'react';
import './Confetti.css';

export default function Confetti() {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    // Generate 50 confetti pieces
    setPieces(Array.from({ length: 50 }).map((_, i) => i));
  }, []);

  return (
    <div className="confetti-container">
      {pieces.map((p) => {
        const style = {
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
        };
        return <div key={p} className="confetti-piece" style={style}></div>;
      })}
    </div>
  );
}
