import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 12;
const CELL_SIZE = 40;

// Game elements
const EMPTY = 0;
const WALL = 1;
const CHIP = 2;
const EXIT = 3;
const PLAYER = 4;
const BOT = 5;
const TELEPORTER = 6;
const FORCE_FIELD = 7;

const GameBoard = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [chipsCollected, setChipsCollected] = useState(0);
  const [totalChips, setTotalChips] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won, dead
  const [bots, setBots] = useState([]);
  const [board, setBoard] = useState([]);
  const [playerLevel, setPlayerLevel] = useState(0);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [totalChipsEver, setTotalChipsEver] = useState(0); // Track chips across all levels

  // Level designs with increasing complexity
  const levels = [
    {
      name: "INITIALIZATION",
      board: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,4,0,2,0,0,0,0,0,2,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1],
        [1,2,0,0,0,0,0,0,0,0,2,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,2,2,0,0,0,0,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,2,0,0,0,0,0,0,0,0,2,1],
        [1,0,1,1,0,1,1,1,0,1,0,1],
        [1,0,0,2,0,0,0,0,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,3,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      bots: []
    },
    {
      name: "SECURITY BREACH",
      board: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,4,0,0,0,1,1,0,0,0,2,1],
        [1,2,1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,5,0,0,0,0,1],
        [1,0,1,1,1,0,0,0,1,1,1,1],
        [1,0,0,2,0,0,2,0,0,2,0,1],
        [1,1,1,0,0,1,0,0,0,1,0,1],
        [1,0,0,0,1,1,5,1,1,0,0,1],
        [1,0,1,0,0,0,0,0,0,0,1,1],
        [1,2,0,0,0,2,0,2,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,3,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      bots: [{x: 6, y: 3, direction: 1}, {x: 6, y: 7, direction: -1}]
    },
    {
      name: "QUANTUM MAZE",
      board: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,4,0,1,2,6,0,1,2,0,0,1],
        [1,0,0,1,0,1,0,1,0,1,0,1],
        [1,2,1,1,0,0,0,1,0,1,2,1],
        [1,0,0,0,0,1,5,0,0,0,0,1],
        [1,1,0,1,0,1,1,1,0,1,0,1],
        [1,6,0,1,0,0,2,0,0,1,0,1],
        [1,0,0,1,1,0,5,0,1,1,0,1],
        [1,0,1,1,0,0,0,0,0,1,1,1],
        [1,2,0,0,0,1,2,1,0,0,2,1],
        [1,0,0,1,0,0,0,0,1,0,3,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      bots: [{x: 6, y: 4, direction: 1}, {x: 6, y: 7, direction: -1}]
    }
  ];

  const initLevel = useCallback(() => {
    const level = levels[currentLevel];
    setBoard(level.board.map(row => [...row]));
    setBots(level.bots.map(bot => ({...bot})));
    
    // Find player starting position
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (level.board[y][x] === PLAYER) {
          setPlayerPos({x, y});
          break;
        }
      }
    }
    
    // Count total chips
    let chips = 0;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (level.board[y][x] === CHIP) chips++;
      }
    }
    setTotalChips(chips);
    setChipsCollected(0);
    setGameState('playing');
  }, [currentLevel]);

  useEffect(() => {
    initLevel();
  }, [initLevel]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const moveBots = setInterval(() => {
      if (gameState !== 'playing') return;
      
      setBots(prevBots => prevBots.map(bot => {
        let newX = bot.x + bot.direction;
        let newY = bot.y;
        
        // Check boundaries and walls
        if (newX < 1 || newX >= GRID_SIZE - 1 || board[newY] && board[newY][newX] === WALL) {
          return {...bot, direction: -bot.direction};
        }
        
        return {...bot, x: newX};
      }));
    }, 800);
    
    return () => clearInterval(moveBots);
  }, [gameState, board]);

  useEffect(() => {
    // Check for collision with bots
    bots.forEach(bot => {
      if (bot.x === playerPos.x && bot.y === playerPos.y) {
        setGameState('dead');
      }
    });
  }, [playerPos, bots]);

  const handleKeyPress = useCallback((e) => {
    if (gameState !== 'playing') {
      if (e.key === ' ' && gameState === 'won') {
        if (currentLevel < levels.length - 1) {
          setCurrentLevel(prev => prev + 1);
          setPlayerLevel(prev => prev + 1);
        }
      } else if (e.key === ' ' && gameState === 'dead') {
        initLevel();
      }
      return;
    }

    let newX = playerPos.x;
    let newY = playerPos.y;

    switch(e.key) {
      case 'ArrowUp': newY--; break;
      case 'ArrowDown': newY++; break;
      case 'ArrowLeft': newX--; break;
      case 'ArrowRight': newX++; break;
      default: return;
    }

    // Check bounds
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;

    const targetCell = board[newY][newX];
    
    // Check walls
    if (targetCell === WALL) return;

    // Check exit (only if all chips collected)
    if (targetCell === EXIT && chipsCollected < totalChips) return;

    // Update position
    setPlayerPos({x: newX, y: newY});

    // Collect chip
    if (targetCell === CHIP) {
      setChipsCollected(prev => prev + 1);
      setTotalChipsEver(prev => prev + 1); // Track total chips ever collected
      setBoard(prev => {
        const newBoard = prev.map(row => [...row]);
        newBoard[newY][newX] = EMPTY;
        return newBoard;
      });
    }

    // Handle teleporter
    if (targetCell === TELEPORTER) {
      // Find other teleporter
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (board[y][x] === TELEPORTER && (x !== newX || y !== newY)) {
            setPlayerPos({x, y});
            return;
          }
        }
      }
    }

    // Check win condition
    if (targetCell === EXIT && chipsCollected + (board[newY][newX] === CHIP ? 1 : 0) >= totalChips) {
      setGameState('won');
    }
  }, [gameState, playerPos, board, chipsCollected, totalChips, currentLevel, initLevel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const getCellStyle = (cellType, x, y) => {
    const baseStyle = {
      width: CELL_SIZE,
      height: CELL_SIZE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontSize: '20px',
      fontWeight: 'bold'
    };

    const glowIntensity = Math.sin(animationFrame * 0.3) * 0.3 + 0.7;

    switch(cellType) {
      case WALL:
        return {
          ...baseStyle,
          background: `linear-gradient(45deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)`,
          border: '1px solid #00ffff',
          boxShadow: `inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 5px rgba(0, 255, 255, 0.2)`
        };
      case CHIP:
        return {
          ...baseStyle,
          background: 'radial-gradient(circle, #ff1493, #ff69b4)',
          borderRadius: '50%',
          boxShadow: `0 0 ${10 * glowIntensity}px #ff1493, inset 0 0 10px rgba(255, 20, 147, 0.5)`,
          animation: 'pulse 1s infinite'
        };
      case EXIT:
        const exitGlow = chipsCollected >= totalChips ? glowIntensity : 0.3;
        return {
          ...baseStyle,
          background: `radial-gradient(circle, #00ff00 0%, #32cd32 100%)`,
          boxShadow: `0 0 ${20 * exitGlow}px #00ff00`,
          border: '2px solid #00ff00',
          opacity: chipsCollected >= totalChips ? 1 : 0.5
        };
      case TELEPORTER:
        return {
          ...baseStyle,
          background: `conic-gradient(from ${animationFrame * 10}deg, #9400d3, #4b0082, #0000ff, #9400d3)`,
          borderRadius: '50%',
          boxShadow: `0 0 ${15 * glowIntensity}px #9400d3`
        };
      case FORCE_FIELD:
        return {
          ...baseStyle,
          background: `linear-gradient(90deg, transparent 0%, rgba(255, 0, 0, 0.7) 50%, transparent 100%)`,
          boxShadow: '0 0 10px #ff0000'
        };
      default:
        return {
          ...baseStyle,
          background: '#000011',
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(0, 255, 255, 0.05) 0%, transparent 50%),
            linear-gradient(45deg, rgba(0, 255, 255, 0.02) 0%, transparent 100%)
          `
        };
    }
  };

  const getPlayerStyle = () => {
    const chipCount = totalChipsEver;
    const glowIntensity = Math.sin(animationFrame * 0.5) * 0.4 + 0.8;
    const rotationSpeed = animationFrame * (2 + chipCount * 0.5);
    
    // Evolution stages based on total chips collected
    const getAvatarStage = () => {
      if (chipCount === 0) return 'basic';
      if (chipCount <= 2) return 'energy';
      if (chipCount <= 5) return 'rings';
      if (chipCount <= 8) return 'geometric';
      if (chipCount <= 12) return 'crystalline';
      return 'ultimate';
    };

    const stage = getAvatarStage();
    
    // Color progression
    const getColors = () => {
      switch(stage) {
        case 'basic': return { primary: '#00ffff', secondary: '#0099cc' };
        case 'energy': return { primary: '#ff1493', secondary: '#00ffff' };
        case 'rings': return { primary: '#00ff00', secondary: '#ff1493' };
        case 'geometric': return { primary: '#ff6b00', secondary: '#ffff00' };
        case 'crystalline': return { primary: '#9400d3', secondary: '#ff00ff' };
        case 'ultimate': return { 
          primary: `hsl(${(animationFrame * 3) % 360}, 100%, 50%)`,
          secondary: `hsl(${(animationFrame * 3 + 180) % 360}, 100%, 50%)`
        };
        default: return { primary: '#00ffff', secondary: '#0099cc' };
      }
    };

    const colors = getColors();
    const baseSize = 25 + chipCount * 2;

    // Base avatar styles
    const baseAvatarStyle = {
      width: baseSize,
      height: baseSize,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%)`,
      zIndex: 10,
      pointerEvents: 'none'
    };

    // Create the complex avatar based on stage
    const createAvatar = () => {
      const elements = [];

      // Core - always present
      elements.push(
        <div
          key="core"
          style={{
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
            borderRadius: stage === 'geometric' ? '20%' : '50%',
            boxShadow: `
              0 0 ${20 * glowIntensity}px ${colors.primary},
              0 0 ${40 * glowIntensity}px ${colors.primary},
              inset 0 0 20px rgba(255, 255, 255, 0.3)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#000',
            textShadow: `0 0 5px ${colors.primary}`,
            position: 'relative'
          }}
        >
          {stage === 'ultimate' ? '⚡' : stage === 'crystalline' ? '◈' : stage === 'geometric' ? '◆' : chipCount > 0 ? '●' : '○'}
        </div>
      );

      // Energy stage - pulsing outer ring
      if (stage !== 'basic') {
        elements.push(
          <div
            key="energy-ring"
            style={{
              position: 'absolute',
              width: baseSize + 10,
              height: baseSize + 10,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${0.8 + Math.sin(animationFrame * 0.3) * 0.2})`,
              border: `2px solid ${colors.secondary}`,
              borderRadius: '50%',
              boxShadow: `0 0 ${15 * glowIntensity}px ${colors.secondary}`,
              opacity: 0.7
            }}
          />
        );
      }

      // Rings stage - multiple rotating rings
      if (chipCount >= 3) {
        for (let i = 0; i < Math.min(3, Math.floor(chipCount / 2)); i++) {
          elements.push(
            <div
              key={`ring-${i}`}
              style={{
                position: 'absolute',
                width: baseSize + 15 + (i * 8),
                height: baseSize + 15 + (i * 8),
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${rotationSpeed + (i * 60)}deg)`,
                border: `1px solid ${i % 2 === 0 ? colors.primary : colors.secondary}`,
                borderRadius: '50%',
                borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
                opacity: 0.6 - (i * 0.1),
                boxShadow: `0 0 ${10 * glowIntensity}px ${i % 2 === 0 ? colors.primary : colors.secondary}`
              }}
            />
          );
        }
      }

      // Geometric stage - floating particles
      if (chipCount >= 6) {
        for (let i = 0; i < Math.min(4, chipCount - 5); i++) {
          const angle = (i * 90) + (animationFrame * 2);
          const distance = 20 + Math.sin(animationFrame * 0.2 + i) * 5;
          elements.push(
            <div
              key={`particle-${i}`}
              style={{
                position: 'absolute',
                width: 4,
                height: 4,
                background: colors.secondary,
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${distance}px)`,
                boxShadow: `0 0 ${8 * glowIntensity}px ${colors.secondary}`,
                opacity: 0.8
              }}
            />
          );
        }
      }

      // Crystalline stage - complex geometric overlay
      if (chipCount >= 9) {
        elements.push(
          <div
            key="crystal-overlay"
            style={{
              position: 'absolute',
              width: baseSize + 5,
              height: baseSize + 5,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${rotationSpeed * 0.5}deg)`,
              background: `conic-gradient(from 0deg, transparent, ${colors.secondary}66, transparent, ${colors.primary}66, transparent)`,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              opacity: 0.4
            }}
          />
        );
      }

      // Ultimate stage - energy trails
      if (stage === 'ultimate') {
        for (let i = 0; i < 6; i++) {
          const trailAngle = (i * 60) + (animationFrame * 3);
          elements.push(
            <div
              key={`trail-${i}`}
              style={{
                position: 'absolute',
                width: 30,
                height: 2,
                background: `linear-gradient(90deg, ${colors.primary}, transparent)`,
                top: '50%',
                left: '50%',
                transformOrigin: '0 50%',
                transform: `translate(-50%, -50%) rotate(${trailAngle}deg)`,
                opacity: 0.6,
                boxShadow: `0 0 ${5 * glowIntensity}px ${colors.primary}`
              }}
            />
          );
        }
      }

      return elements;
    };

    return (
      <div style={baseAvatarStyle}>
        {createAvatar()}
      </div>
    );
  };

  const getBotStyle = () => {
    const glowIntensity = Math.sin(animationFrame * 0.4) * 0.3 + 0.7;
    return {
      width: CELL_SIZE * 0.7,
      height: CELL_SIZE * 0.7,
      background: 'radial-gradient(circle, #ff0000 0%, #cc0000 100%)',
      borderRadius: '10%',
      boxShadow: `0 0 ${15 * glowIntensity}px #ff0000`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      color: '#fff'
    };
  };

  const getEvolutionStage = () => {
    const chipCount = totalChipsEver;
    if (chipCount === 0) return "BASIC PROTOCOL";
    if (chipCount <= 2) return "ENERGY INFUSED";
    if (chipCount <= 5) return "QUANTUM RINGS";
    if (chipCount <= 8) return "GEOMETRIC MATRIX";
    if (chipCount <= 12) return "CRYSTALLINE FORM";
    return "ULTIMATE AVATAR";
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'monospace',
      color: '#00ffff'
    }}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(180deg); }
            100% { transform: scale(1) rotate(360deg); }
          }
        `}
      </style>
      
      <div style={{ 
        marginBottom: '20px', 
        textAlign: 'center',
        textShadow: '0 0 10px #00ffff'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 10px 0',
          background: 'linear-gradient(45deg, #00ffff, #ff1493)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none'
        }}>
          QUANTUM PROTOCOL
        </h1>
        <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>
          LEVEL {currentLevel + 1}: {levels[currentLevel].name}
        </div>
        <div style={{ fontSize: '1rem', marginBottom: '5px' }}>
          AI CHIPS: {chipsCollected}/{totalChips} | TOTAL COLLECTED: {totalChipsEver}
        </div>
        <div style={{ 
          fontSize: '0.9rem',
          color: totalChipsEver >= 15 ? '#ff00ff' : totalChipsEver >= 9 ? '#9400d3' : totalChipsEver >= 6 ? '#ff6b00' : totalChipsEver >= 3 ? '#00ff00' : '#ff1493',
          fontWeight: 'bold',
          textShadow: `0 0 10px ${totalChipsEver >= 15 ? '#ff00ff' : totalChipsEver >= 9 ? '#9400d3' : totalChipsEver >= 6 ? '#ff6b00' : totalChipsEver >= 3 ? '#00ff00' : '#ff1493'}`
        }}>
          AVATAR STATUS: {getEvolutionStage()}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        gap: '1px',
        border: '2px solid #00ffff',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)',
        background: '#000011',
        position: 'relative'
      }}>
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div key={`${x}-${y}`} style={getCellStyle(cell, x, y)}>
              {cell === CHIP && '💎'}
              {cell === EXIT && '🚪'}
              {cell === TELEPORTER && '🌀'}
              {playerPos.x === x && playerPos.y === y && getPlayerStyle()}
              {bots.some(bot => bot.x === x && bot.y === y) && (
                <div style={getBotStyle()}>🤖</div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center',
        fontSize: '1rem',
        textShadow: '0 0 5px #00ffff'
      }}>
        {gameState === 'playing' && 'Use arrow keys to move. Each chip evolves your avatar!'}
        {gameState === 'won' && (
          <div>
            <div style={{ color: '#00ff00', fontSize: '1.5rem', marginBottom: '10px' }}>
              LEVEL COMPLETE! AVATAR EVOLVED!
            </div>
            {currentLevel < levels.length - 1 ? 'Press SPACE for next level' : 'GAME COMPLETE!'}
          </div>
        )}
        {gameState === 'dead' && (
          <div style={{ color: '#ff0000', fontSize: '1.2rem' }}>
            SECURITY BOT DETECTED! Press SPACE to restart
          </div>
        )}
      </div>

      {totalChipsEver > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: 'rgba(0, 255, 255, 0.1)',
          border: '1px solid #00ffff',
          borderRadius: '5px',
          textAlign: 'center',
          fontSize: '0.8rem'
        }}>
          <div>EVOLUTION PROGRESS:</div>
          <div style={{ 
            background: `linear-gradient(90deg, #00ffff 0%, #ff1493 ${(totalChipsEver / 15) * 100}%, transparent ${(totalChipsEver / 15) * 100}%)`,
            height: '5px',
            marginTop: '5px',
            borderRadius: '2px'
          }} />
          <div style={{ marginTop: '5px' }}>
            Next Evolution: {totalChipsEver >= 15 ? 'MAX LEVEL!' : `${Math.min(15, [3, 6, 9, 12, 15].find(x => x > totalChipsEver) || 15) - totalChipsEver} chips needed`}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;