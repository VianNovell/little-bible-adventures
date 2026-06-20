import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Confetti from '../Confetti';
import { awardStars } from '../../lib/rewards';

interface BibleGamesProps {
  onClose: () => void;
}

const CROSSWORD_CELLS = [
  { id: '0-3', row: 0, col: 3, answer: 'S', number: 1 },
  { id: '1-0', row: 1, col: 0, answer: 'J', number: 2 },
  { id: '1-1', row: 1, col: 1, answer: 'E', number: 3 },
  { id: '1-2', row: 1, col: 2, answer: 'R' },
  { id: '1-3', row: 1, col: 3, answer: 'I' },
  { id: '1-4', row: 1, col: 4, answer: 'C' },
  { id: '1-5', row: 1, col: 5, answer: 'H' },
  { id: '1-6', row: 1, col: 6, answer: 'O' },
  { id: '2-1', row: 2, col: 1, answer: 'D' },
  { id: '2-3', row: 2, col: 3, answer: 'N' },
  { id: '3-0', row: 3, col: 0, answer: 'C', number: 4 },
  { id: '3-1', row: 3, col: 1, answer: 'E' },
  { id: '3-2', row: 3, col: 2, answer: 'D' },
  { id: '3-3', row: 3, col: 3, answer: 'A' },
  { id: '3-4', row: 3, col: 4, answer: 'R' },
  { id: '4-1', row: 4, col: 1, answer: 'N' },
  { id: '4-3', row: 4, col: 3, answer: 'I' },
];

export default function BibleGames({ onClose }: BibleGamesProps) {
  const [grid, setGrid] = useState<Record<string, string>>({});
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    // Reset grid
    setGrid({});
    setIsWon(false);
  }, []);

  const handleChange = (id: string, value: string) => {
    if (isWon) return;
    const letter = value.toUpperCase().slice(-1); // only take the last typed character
    
    const newGrid = { ...grid, [id]: letter };
    setGrid(newGrid);

    // Check win condition
    const hasWon = CROSSWORD_CELLS.every(cell => newGrid[cell.id] === cell.answer);
    if (hasWon) {
      setIsWon(true);
      awardStars(5);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    // Basic navigation
    if (e.key === 'ArrowRight') document.getElementById(`cell-${row}-${col + 1}`)?.focus();
    if (e.key === 'ArrowLeft') document.getElementById(`cell-${row}-${col - 1}`)?.focus();
    if (e.key === 'ArrowDown') document.getElementById(`cell-${row + 1}-${col}`)?.focus();
    if (e.key === 'ArrowUp') document.getElementById(`cell-${row - 1}-${col}`)?.focus();
  };

  const renderGrid = () => {
    const rows = 5;
    const cols = 7;
    const gridUI = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellData = CROSSWORD_CELLS.find(cell => cell.row === r && cell.col === c);
        
        if (cellData) {
          const isCorrect = grid[cellData.id] === cellData.answer;
          
          gridUI.push(
            <div key={`${r}-${c}`} style={{ position: 'relative', width: '40px', height: '40px' }}>
              {cellData.number && (
                <span style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px', fontWeight: 'bold', zIndex: 1 }}>
                  {cellData.number}
                </span>
              )}
              <input
                id={`cell-${r}-${c}`}
                type="text"
                value={grid[cellData.id] || ''}
                onChange={(e) => handleChange(cellData.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, r, c)}
                maxLength={1}
                disabled={isWon}
                style={{
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  border: '2px solid #333',
                  backgroundColor: isWon ? '#d4edda' : 'white',
                  color: isWon ? '#155724' : (grid[cellData.id] && !isCorrect ? '#721c24' : 'black'),
                  outline: 'none',
                  padding: 0,
                  margin: 0
                }}
              />
            </div>
          );
        } else {
          // Empty block
          gridUI.push(
            <div key={`${r}-${c}`} style={{ width: '40px', height: '40px', backgroundColor: 'transparent' }}></div>
          );
        }
      }
    }
    return gridUI;
  };

  return (
    <div className="act-modal-overlay" onClick={onClose}>
      {isWon && <Confetti />}
      <div className="act-modal card animate-float" style={{ maxWidth: '700px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <button className="tp-modal-close" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        
        <h2>🧩 Bible Places Crossword</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>Fill in the crossword using the clues below!</p>

        {isWon && (
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h3>🎉 You did it!</h3>
            <p>You have earned 5 stars!</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 40px)', 
            gridTemplateRows: 'repeat(5, 40px)', 
            gap: '0px',
            backgroundColor: '#edf2f7',
            padding: '10px',
            borderRadius: '8px',
            border: '2px solid #cbd5e1'
          }}>
            {renderGrid()}
          </div>

          <div style={{ display: 'flex', gap: '2rem', width: '100%', justifyContent: 'center', textAlign: 'left' }}>
            <div style={{ flex: 1, maxWidth: '250px' }}>
              <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Across</h3>
              <ol style={{ paddingLeft: '1.2rem', margin: 0, listStyle: 'none' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>2.</strong> City with walls that came tumbling down (7)</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>4.</strong> Type of tree famously grown in Lebanon (5)</li>
              </ol>
            </div>
            
            <div style={{ flex: 1, maxWidth: '250px' }}>
              <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Down</h3>
              <ol style={{ paddingLeft: '1.2rem', margin: 0, listStyle: 'none' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>1.</strong> Mountain where Moses received the Ten Commandments (5)</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>3.</strong> The first garden (4)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
