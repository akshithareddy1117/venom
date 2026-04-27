import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400; // logical size
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const SNAKE_SPEED = 10; // Frames per second essentially

type Point = { x: number, y: number };

export default function SnakeGame({ score, setScore }: { score: number, setScore: React.Dispatch<React.SetStateAction<number>> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [started, setStarted] = useState(false);

  const snake = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dir = useRef<Point>({ x: 0, y: -1 });
  const nextDir = useRef<Point>({ x: 0, y: -1 });
  const food = useRef<Point>({ x: 5, y: 5 });
  
  const frameRef = useRef(0);
  const lastRenderTime = useRef(0);

  const placeFood = useCallback(() => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Make sure it doesn't spawn on the snake
      const onSnake = snake.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    food.current = newFood;
  }, []);

  const resetGame = useCallback(() => {
    snake.current = [{ x: 10, y: 10 }];
    dir.current = { x: 0, y: -1 };
    nextDir.current = { x: 0, y: -1 };
    placeFood();
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setStarted(true);
  }, [placeFood, setScore]);

  useEffect(() => {
    placeFood();
  }, [placeFood]);

  const update = useCallback(() => {
    if (gameOver || isPaused || !started) return;

    dir.current = nextDir.current;
    const head = snake.current[0];
    const newHead = { x: head.x + dir.current.x, y: head.y + dir.current.y };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      setGameOver(true);
      return;
    }

    // Self collision
    if (snake.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    snake.current.unshift(newHead);

    // Food collision
    if (newHead.x === food.current.x && newHead.y === food.current.y) {
       setScore(s => s + 10);
       placeFood();
    } else {
       snake.current.pop();
    }
  }, [gameOver, isPaused, started, placeFood, setScore]);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    // Clear background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid lines (optional, adds to aesthetic)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x=0; x<=CANVAS_SIZE; x+=CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_SIZE); ctx.stroke();
    }
    for (let y=0; y<=CANVAS_SIZE; y+=CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_SIZE, y); ctx.stroke();
    }

    // Draw Food (Neon Green)
    ctx.fillStyle = '#39ff14';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#39ff14';
    ctx.beginPath();
    ctx.arc(
        food.current.x * CELL_SIZE + CELL_SIZE / 2, 
        food.current.y * CELL_SIZE + CELL_SIZE / 2, 
        (CELL_SIZE / 2) - 2, 
        0, 
        2 * Math.PI
    );
    ctx.fill();

    // Draw Snake (Neon Magenta)
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff00ff';
    snake.current.forEach((segment, index) => {
      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + 1, 
        segment.y * CELL_SIZE + 1, 
        CELL_SIZE - 2, 
        CELL_SIZE - 2, 
        2
      );
      ctx.fill();
    });

    // Reset shadow
    ctx.shadowBlur = 0;
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    frameRef.current = requestAnimationFrame(gameLoop);

    const secondsSinceLastRender = (currentTime - lastRenderTime.current) / 1000;
    if (secondsSinceLastRender < 1 / SNAKE_SPEED) return; // limit framerate

    lastRenderTime.current = currentTime;

    update();
    draw();
  }, [update, draw]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) {
          if (e.key.toLowerCase() === 'r') resetGame();
          return;
      }

      if (!started && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w','a','s','d','W','A','S','D'].includes(e.key)) {
          setStarted(true);
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir.current.y === 0) nextDir.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir.current.y === 0) nextDir.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir.current.x === 0) nextDir.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir.current.x === 0) nextDir.current = { x: 1, y: 0 };
          break;
        case 'Escape':
        case ' ': // spacebar to pause
          if (started) {
              setIsPaused(p => !p);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, started, resetGame]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center p-2 group">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_SIZE} 
        height={CANVAS_SIZE} 
        className="block max-w-full max-h-full aspect-square rounded-xl"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {!started && !gameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 text-white">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00f3ff] to-white uppercase tracking-[0.2em] mb-4 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
               Terminal Ready
            </h2>
            <div className="px-6 py-2 border border-[#00f3ff]/50 text-[#00f3ff] font-mono text-sm animate-pulse rounded neon-border-cyan bg-[#00f3ff]/10">
                Press any arrow key to commence
            </div>
          </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 transition-all duration-300">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ff00ff] to-white uppercase tracking-[0.2em] mb-2 drop-shadow-[0_0_15px_rgba(255,0,255,0.5)]">
            System Failure
          </h2>
          <p className="text-gray-400 font-mono mb-8">Final Score: <span className="text-[#00f3ff] text-xl font-bold">{score}</span></p>
          <button 
            onClick={resetGame}
            className="px-8 py-3 bg-transparent border-2 border-[#ff00ff] text-[#ff00ff] font-bold tracking-widest uppercase hover:bg-[#ff00ff] hover:text-black hover:shadow-[0_0_20px_#ff00ff] transition-all duration-300 pointer-events-auto"
          >
            Reboot <span className="opacity-50 text-xs ml-2">[R]</span>
          </button>
        </div>
      )}

      {isPaused && !gameOver && started && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
          <h2 className="text-3xl font-bold text-white uppercase tracking-[0.2em] mb-2">
            Paused
          </h2>
          <p className="text-gray-400 font-mono text-sm">Press [SPACE] to resume</p>
        </div>
      )}
    </div>
  );
}
