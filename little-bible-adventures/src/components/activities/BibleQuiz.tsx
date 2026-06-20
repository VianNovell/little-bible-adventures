import { useState } from 'react';
import { X } from 'lucide-react';
import Confetti from '../Confetti';
import { awardStars, awardBadge } from '../../lib/rewards';

interface BibleQuizProps {
  onClose: () => void;
}

const quizQuestions = [
  {
    question: "Who built the ark?",
    options: ["Moses", "David", "Noah", "Abraham"],
    answer: "Noah"
  },
  {
    question: "How many days and nights did it rain during the flood?",
    options: ["10", "40", "100", "7"],
    answer: "40"
  },
  {
    question: "Who was swallowed by a great fish?",
    options: ["Jonah", "Peter", "Paul", "John"],
    answer: "Jonah"
  },
  {
    question: "What is the first book of the Bible?",
    options: ["Exodus", "Matthew", "Genesis", "Revelation"],
    answer: "Genesis"
  },
  {
    question: "Who defeated Goliath?",
    options: ["Samson", "David", "Saul", "Solomon"],
    answer: "David"
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

export default function BibleQuiz({ onClose }: BibleQuizProps) {
  const [questions, setQuestions] = useState(() => 
    shuffleArray(quizQuestions).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }))
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswerOptionClick = (selectedAnswer: string) => {
    if (selectedAnswer === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      const finalScore = selectedAnswer === questions[currentQuestion].answer ? score + 1 : score;
      
      // Award stars: 1 per correct answer
      if (finalScore > 0) {
        awardStars(finalScore);
      }
      
      // Perfect score bonus: +5 stars, +1 badge
      if (finalScore === questions.length) {
        awardStars(5);
        awardBadge(1);
      }
      
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setQuestions(
      shuffleArray(quizQuestions).map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }))
    );
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
  };

  return (
    <div className="act-modal-overlay" onClick={onClose}>
      {showScore && score === questions.length && <Confetti />}
      <div className="act-modal card animate-float" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <button className="tp-modal-close" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        
        <h2>🎯 Bible Quiz</h2>
        
        {showScore ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
            <h3>You scored {score} out of {questions.length}!</h3>
            <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
              {score === questions.length ? "Perfect score! You earned a bonus badge and 5 extra stars!" : `Great job! You earned ${score} stars!`}
            </p>
            <button className="btn btn-primary" onClick={restartQuiz}>Play Again</button>
          </div>
        ) : (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.5rem', fontWeight: 'bold', color: '#666' }}>
              Question {currentQuestion + 1} / {questions.length}
            </div>
            <h3 style={{ marginBottom: '2rem', fontSize: '1.4rem' }}>
              {questions[currentQuestion].question}
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  className="btn btn-outline"
                  style={{ textAlign: 'left', padding: '1rem', fontSize: '1.1rem' }}
                  onClick={() => handleAnswerOptionClick(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
