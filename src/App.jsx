import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [divValues, setDivValues] = useState(Array(9).fill(null));
  const [showNumbers, setShowNumbers] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const [gameActive, setGameActive] = useState(true);
  const [nextNumber, setNextNumber] = useState(null);
  const [divColors, setDivColors] = useState(Array(9).fill("#ffffff"));
  const [revealedNumbers, setRevealedNumbers] = useState(Array(9).fill(null));
  const [gameWon, setGameWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem("bestScore");
    return saved ? parseInt(saved) : 0;
  });
  const [difficulty, setDifficulty] = useState("medium");
  const [currentNumbers, setCurrentNumbers] = useState([]);
  const [memorizeTime, setMemorizeTime] = useState(3);

  // Difficulty settings
  const difficultySettings = {
    easy: { time: 2.5, count: 3, maxNumber: 50 },
    medium: { time: 2, count: 4, maxNumber: 100 },
    hard: { time: 1.5, count: 5, maxNumber: 200 },
    expert: { time: 1, count: 6, maxNumber: 500 },
    extreme: { time: 0.8, count: 7, maxNumber: 999 },
  };

  // Save best score to localStorage
  useEffect(() => {
    if (bestScore > 0) {
      localStorage.setItem("bestScore", bestScore);
    }
  }, [bestScore]);

  const generateRandomNumbers = () => {
    const settings = difficultySettings[difficulty];
    const numbers = [];
    const maxAttempts = 100;
    let attempts = 0;

    while (numbers.length < settings.count && attempts < maxAttempts) {
      const num = Math.floor(Math.random() * settings.maxNumber) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
      attempts++;
    }

    // Sort numbers in ascending order for sequential gameplay
    numbers.sort((a, b) => a - b);
    return numbers;
  };

  const assignRandomNumbers = () => {
    // Reset game state
    setGameActive(true);
    setGameWon(false);
    const numbers = generateRandomNumbers();
    setCurrentNumbers(numbers);
    setNextNumber(numbers[0]);
    setDivColors(Array(9).fill("#ffffff"));
    setRevealedNumbers(Array(9).fill(null));
    setScore(0);

    // Clear existing timer if any
    if (timerId) {
      clearTimeout(timerId);
    }

    // Create a copy of the array to shuffle
    const numbersToAssign = [...numbers];

    // Shuffle the array randomly
    for (let i = numbersToAssign.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbersToAssign[i], numbersToAssign[j]] = [
        numbersToAssign[j],
        numbersToAssign[i],
      ];
    }

    // Create an array of available indices (0-8)
    const availableIndices = Array.from({ length: 9 }, (_, i) => i);

    // Shuffle available indices
    for (let i = availableIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableIndices[i], availableIndices[j]] = [
        availableIndices[j],
        availableIndices[i],
      ];
    }

    // Create new values array (all null initially)
    const newValues = Array(9).fill(null);

    // Assign numbers to random indices
    for (let i = 0; i < numbersToAssign.length; i++) {
      newValues[availableIndices[i]] = numbersToAssign[i];
    }

    setDivValues(newValues);

    // Show the numbers for memorization time
    setShowNumbers(true);

    // Set timer to hide numbers based on difficulty
    const memorizeTimeMs = difficultySettings[difficulty].time * 1000;
    setMemorizeTime(difficultySettings[difficulty].time);

    const newTimerId = setTimeout(() => {
      setShowNumbers(false);
    }, memorizeTimeMs);

    setTimerId(newTimerId);
  };

  const handleDivClick = (index, value) => {
    // Only process if game is active and numbers are hidden and game not won
    if (!gameActive || showNumbers || gameWon) return;

    // Check if this div has a number
    if (value === null) {
      // Clicked on empty div - wrong move
      setDivColors((prev) => {
        const newColors = [...prev];
        newColors[index] = "#ffebee";
        return newColors;
      });
      setGameActive(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Check if the number matches the next expected number
    if (value === nextNumber) {
      // Correct guess
      setDivColors((prev) => {
        const newColors = [...prev];
        newColors[index] = "#e8f5e9";
        return newColors;
      });

      setRevealedNumbers((prev) => {
        const newRevealed = [...prev];
        newRevealed[index] = value;
        return newRevealed;
      });

      // Update score
      setScore((prev) => prev + 1);

      // Find current index in numbers array
      const currentIndex = currentNumbers.indexOf(nextNumber);

      // Check if game is complete (all numbers found)
      if (currentIndex === currentNumbers.length - 1) {
        setGameWon(true);
        setGameActive(false);

        // Update best score based on difficulty and count
        const newScore = score + 1;
        const difficultyMultiplier = {
          easy: 1,
          medium: 2,
          hard: 3,
          expert: 5,
          extreme: 8,
        };
        const finalScore = newScore * difficultyMultiplier[difficulty];

        if (finalScore > bestScore) {
          setBestScore(finalScore);
        }
      } else {
        setNextNumber(currentNumbers[currentIndex + 1]);
      }
    } else {
      // Wrong guess
      setDivColors((prev) => {
        const newColors = [...prev];
        newColors[index] = "#ffebee";
        return newColors;
      });
      setGameActive(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const getDisplayValue = (index) => {
    // If number is revealed (correctly guessed), show it
    if (revealedNumbers[index] !== null) {
      return revealedNumbers[index];
    }
    // If showing initial preview, show the number
    if (showNumbers && divValues[index] !== null) {
      return divValues[index];
    }
    // Otherwise show empty
    return "";
  };

  const getDifficultyColor = () => {
    const colors = {
      easy: "#4caf50",
      medium: "#ff9800",
      hard: "#f44336",
      expert: "#9c27b0",
      extreme: "#000000",
    };
    return colors[difficulty];
  };

  return (
    <div className="app">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-icon">🎯</span>
            Memory Match Extreme
          </h1>
          <div className="stats">
            <div className="stat-card">
              <span className="stat-label">Score</span>
              <span className="stat-value">
                {score}/{currentNumbers.length || 4}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Best</span>
              <span className="stat-value">{bestScore}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="difficulty-selector">
          <button
            className={`difficulty-btn ${difficulty === "easy" ? "active" : ""}`}
            onClick={() => setDifficulty("easy")}
            style={{ borderColor: difficulty === "easy" ? "#4caf50" : "#ddd" }}
          >
            Easy (3 nums, 2.5s)
          </button>
          <button
            className={`difficulty-btn ${difficulty === "medium" ? "active" : ""}`}
            onClick={() => setDifficulty("medium")}
            style={{
              borderColor: difficulty === "medium" ? "#ff9800" : "#ddd",
            }}
          >
            Medium (4 nums, 2s)
          </button>
          <button
            className={`difficulty-btn ${difficulty === "hard" ? "active" : ""}`}
            onClick={() => setDifficulty("hard")}
            style={{ borderColor: difficulty === "hard" ? "#f44336" : "#ddd" }}
          >
            Hard (5 nums, 1.5s)
          </button>
          <button
            className={`difficulty-btn ${difficulty === "expert" ? "active" : ""}`}
            onClick={() => setDifficulty("expert")}
            style={{
              borderColor: difficulty === "expert" ? "#9c27b0" : "#ddd",
            }}
          >
            Expert (6 nums, 1s)
          </button>
          <button
            className={`difficulty-btn ${difficulty === "extreme" ? "active" : ""}`}
            onClick={() => setDifficulty("extreme")}
            style={{
              borderColor: difficulty === "extreme" ? "#000000" : "#ddd",
            }}
          >
            Extreme (7 nums, 0.8s)
          </button>
        </div>

        {/* Game Status */}
        <div className={`game-status ${shake ? "shake" : ""}`}>
          {gameWon ? (
            <div className="status-message success">
              <span>🎉</span>
              <span>
                Perfect Memory! You Won! +
                {difficultySettings[difficulty].count *
                  (difficulty === "easy"
                    ? 1
                    : difficulty === "medium"
                      ? 2
                      : difficulty === "hard"
                        ? 3
                        : difficulty === "expert"
                          ? 5
                          : 8)}{" "}
                points!
              </span>
              <span>🏆</span>
            </div>
          ) : !gameActive && !showNumbers && !gameWon ? (
            <div className="status-message error">
              <span>💀</span>
              <span>Game Over! Wrong Move!</span>
              <span>💀</span>
            </div>
          ) : showNumbers ? (
            <div className="status-message info">
              <span>🧠</span>
              <span>
                Memorize {currentNumbers.length} numbers... ({memorizeTime}s)
              </span>
              <div
                className="timer-bar"
                style={{ animationDuration: `${memorizeTime}s` }}
              ></div>
            </div>
          ) : gameActive && nextNumber !== null ? (
            <div className="status-message playing">
              <span>🔍</span>
              <span>Find number</span>
              <span
                className="next-number"
                style={{ fontSize: "24px", fontWeight: "bold" }}
              >
                {nextNumber}
              </span>
            </div>
          ) : null}
        </div>

        {/* Game Grid */}
        <div className="game-grid">
          {divValues.map((value, index) => (
            <div
              key={index}
              onClick={() => handleDivClick(index, value)}
              className={`game-card ${!gameActive || showNumbers || gameWon ? "disabled" : ""} ${
                divColors[index] === "#e8f5e9" ? "correct" : ""
              } ${divColors[index] === "#ffebee" ? "wrong" : ""}`}
              style={{
                backgroundColor: divColors[index],
              }}
            >
              <div className="card-content">
                {getDisplayValue(index) && (
                  <span
                    className={`card-number ${showNumbers ? "preview" : "revealed"}`}
                    style={{
                      fontSize: getDisplayValue(index) > 99 ? "20px" : "28px",
                    }}
                  >
                    {getDisplayValue(index)}
                  </span>
                )}
              </div>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="action-section">
          <button
            className={`new-game-btn ${showNumbers || !gameActive || gameWon ? "pulse" : ""}`}
            onClick={assignRandomNumbers}
            style={{ backgroundColor: getDifficultyColor() }}
          >
            <span className="btn-icon">🔄</span>
            {showNumbers ? "Memorizing..." : "New Game"}
          </button>

          {!gameActive && !gameWon && !showNumbers && (
            <p className="hint-text">Click "New Game" to try again!</p>
          )}

          {!showNumbers && gameActive && !gameWon && nextNumber !== null && (
            <p className="hint-text">Find the number: {nextNumber}</p>
          )}
        </div>

        {/* Instructions */}
        <div className="instructions">
          <div className="instruction-item">
            <span className="instruction-icon">🎲</span>
            <span>Random numbers from 1-999 (difficulty based)</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">⏱️</span>
            <span>
              Memorize time: {difficultySettings[difficulty].time} seconds
            </span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">1️⃣</span>
            <span>Click numbers in ascending order</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">⭐</span>
            <span>Higher difficulty = More points!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
