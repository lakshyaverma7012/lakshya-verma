import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Shield, Zap, Sparkles, Trophy, Crosshair, Award, Skull, AlertTriangle } from 'lucide-react';

// --- Sound Synthesizer via Web Audio API (Zero external assets) ---
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playLaser(type: 'player' | 'rapid' | 'enemy' | 'boss' = 'player') {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'boss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
      return;
    }

    osc.type = type === 'enemy' ? 'sawtooth' : 'triangle';
    const startFreq = type === 'rapid' ? 1100 : type === 'enemy' ? 450 : 880;
    const endFreq = type === 'rapid' ? 300 : type === 'enemy' ? 150 : 220;
    const duration = type === 'rapid' ? 0.07 : 0.11;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  public playExplosion(intensity: 'small' | 'medium' | 'large' | 'boss' = 'medium') {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = intensity === 'boss' ? 1.0 : intensity === 'large' ? 0.6 : intensity === 'medium' ? 0.35 : 0.2;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const startCutoff = intensity === 'boss' ? 500 : intensity === 'large' ? 650 : intensity === 'medium' ? 900 : 1200;
    filter.frequency.setValueAtTime(startCutoff, now);
    filter.frequency.exponentialRampToValueAtTime(30, now + duration);

    const gain = this.ctx.createGain();
    const vol = intensity === 'boss' ? 0.45 : intensity === 'large' ? 0.35 : intensity === 'medium' ? 0.22 : 0.15;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  public playHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playPowerup() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.12);
    });
  }

  public playBossWarning() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Deep alternating klaxon siren
    [0, 0.28, 0.56].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + offset;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.24);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  public playBossVictory() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  public playGameOver() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [330, 293.66, 261.63, 196];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = now + idx * 0.14;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.22);
    });
  }
}

const sounds = new SoundManager();

// --- Game Constants & Interfaces ---
const VIRTUAL_WIDTH = 800;
const VIRTUAL_HEIGHT = 920;

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  layer: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  maxLife: number;
  life: number;
  glow?: boolean;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Laser {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isEnemy?: boolean;
  damage: number;
  isHeavy?: boolean;
}

type EnemyType = 'scout' | 'cruiser' | 'heavy' | 'asteroid' | 'boss';

interface Enemy {
  id: number;
  x: number;
  y: number;
  type: EnemyType;
  width: number;
  height: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  scoreValue: number;
  angle: number;
  rotSpeed: number;
  birthTime: number;
  initialX: number;
  shootCooldown: number;
  polyPoints?: { x: number; y: number }[]; // For jagged asteroids

  // Boss specific attributes
  isBoss?: boolean;
  targetY?: number;
  bossPhase?: number; // 0: Dual Cannons, 1: Spiral Nova, 2: Mortar Barrage
  phaseTimer?: number;
  coreRotation?: number;
  phaseCharge?: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'spread' | 'rapid' | 'shield' | 'nuke';
  radius: number;
  vy: number;
  pulseAngle: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('START');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('neon_void_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [health, setHealth] = useState<number>(100);
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [spreadTimer, setSpreadTimer] = useState<number>(0);
  const [rapidTimer, setRapidTimer] = useState<number>(0);
  const [enemiesDefeated, setEnemiesDefeated] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [wave, setWave] = useState<number>(1);

  // Boss state for HUD
  const [bossInfo, setBossInfo] = useState<{ active: boolean; hp: number; maxHp: number; name: string } | null>(null);
  const [bossWarningBanner, setBossWarningBanner] = useState<boolean>(false);

  // References to keep mutable game state in requestAnimationFrame loop
  const stateRef = useRef({
    gameState: 'START' as 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER',
    score: 0,
    highScore: highScore,
    health: 100,
    maxHealth: 100,
    enemiesDefeated: 0,
    wave: 1,
    screenShake: 0,
    bossSpawnedForWave: 0,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      fire: false,
    },
    player: {
      x: VIRTUAL_WIDTH / 2,
      y: VIRTUAL_HEIGHT - 120,
      vx: 0,
      vy: 0,
      speed: 6.8,
      radius: 20,
      width: 44,
      height: 48,
      tilt: 0, // Visual tilt angle when banking left/right
      invulnerableTimer: 0,
      lastFireTime: 0,
      spreadDuration: 0,
      rapidDuration: 0,
      hasShield: false,
    },
    lasers: [] as Laser[],
    enemies: [] as Enemy[],
    powerUps: [] as PowerUp[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    stars: [] as Star[],
    nextEnemyId: 1,
    nextPowerUpId: 1,
    spawnTimer: 0,
    lastFrameTime: performance.now(),
  });

  // Keep stateRef synced with external setters
  useEffect(() => {
    stateRef.current.highScore = highScore;
  }, [highScore]);

  useEffect(() => {
    sounds.enabled = !soundMuted;
  }, [soundMuted]);

  // Initialize stars once
  useEffect(() => {
    const stars: Star[] = [];
    // 3 parallax layers: Layer 1 (slow, dim), Layer 2 (medium), Layer 3 (fast, bright)
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * VIRTUAL_WIDTH,
        y: Math.random() * VIRTUAL_HEIGHT,
        size: Math.random() * 1.0 + 0.6,
        speed: Math.random() * 0.6 + 0.4,
        alpha: Math.random() * 0.4 + 0.2,
        layer: 1,
      });
    }
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * VIRTUAL_WIDTH,
        y: Math.random() * VIRTUAL_HEIGHT,
        size: Math.random() * 1.4 + 1.2,
        speed: Math.random() * 1.4 + 1.2,
        alpha: Math.random() * 0.4 + 0.5,
        layer: 2,
      });
    }
    for (let i = 0; i < 20; i++) {
      stars.push({
        x: Math.random() * VIRTUAL_WIDTH,
        y: Math.random() * VIRTUAL_HEIGHT,
        size: Math.random() * 2.0 + 2.0,
        speed: Math.random() * 2.5 + 3.0,
        alpha: Math.random() * 0.3 + 0.7,
        layer: 3,
      });
    }
    stateRef.current.stars = stars;
  }, []);

  // Helper to start or restart the game
  const startGame = () => {
    const s = stateRef.current;
    s.score = 0;
    s.health = 100;
    s.enemiesDefeated = 0;
    s.wave = 1;
    s.bossSpawnedForWave = 0;
    s.screenShake = 0;
    s.player.x = VIRTUAL_WIDTH / 2;
    s.player.y = VIRTUAL_HEIGHT - 120;
    s.player.vx = 0;
    s.player.vy = 0;
    s.player.tilt = 0;
    s.player.invulnerableTimer = 60; // 1 second spawn shield
    s.player.lastFireTime = 0;
    s.player.spreadDuration = 0;
    s.player.rapidDuration = 0;
    s.player.hasShield = false;
    s.lasers = [];
    s.enemies = [];
    s.powerUps = [];
    s.particles = [];
    s.floatingTexts = [];
    s.spawnTimer = 0;
    s.gameState = 'PLAYING';

    setScore(0);
    setHealth(100);
    setShieldActive(false);
    setSpreadTimer(0);
    setRapidTimer(0);
    setEnemiesDefeated(0);
    setWave(1);
    setBossInfo(null);
    setBossWarningBanner(false);
    setGameState('PLAYING');

    sounds.playLaser('rapid');
  };

  const togglePause = () => {
    if (stateRef.current.gameState === 'PLAYING') {
      stateRef.current.gameState = 'PAUSED';
      setGameState('PAUSED');
    } else if (stateRef.current.gameState === 'PAUSED') {
      stateRef.current.gameState = 'PLAYING';
      setGameState('PLAYING');
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling from arrow keys / space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const key = e.key.toLowerCase();
      const s = stateRef.current;

      if (key === 'arrowleft' || key === 'a') s.keys.left = true;
      if (key === 'arrowright' || key === 'd') s.keys.right = true;
      if (key === 'arrowup' || key === 'w') s.keys.up = true;
      if (key === 'arrowdown' || key === 's') s.keys.down = true;
      if (key === ' ' || e.code === 'Space') s.keys.fire = true;

      if (key === 'enter') {
        if (s.gameState === 'START' || s.gameState === 'GAMEOVER') {
          startGame();
        }
      }

      if (key === 'p' || key === 'escape') {
        if (s.gameState === 'PLAYING' || s.gameState === 'PAUSED') {
          togglePause();
        }
      }

      if (key === 'm') {
        setSoundMuted((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const s = stateRef.current;

      if (key === 'arrowleft' || key === 'a') s.keys.left = false;
      if (key === 'arrowright' || key === 'd') s.keys.right = false;
      if (key === 'arrowup' || key === 'w') s.keys.up = false;
      if (key === 'arrowdown' || key === 's') s.keys.down = false;
      if (key === ' ' || e.code === 'Space') s.keys.fire = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Render & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const createExplosion = (x: number, y: number, color: string, count = 24, speedMult = 1) => {
      const s = stateRef.current;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 4 + 1.5) * speedMult;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: Math.random() * 3.5 + 1.5,
          life: 0,
          maxLife: Math.random() * 25 + 20,
          glow: true,
        });
      }
    };

    const createFloatingText = (x: number, y: number, text: string, color: string) => {
      stateRef.current.floatingTexts.push({
        x,
        y,
        text,
        color,
        alpha: 1,
        life: 0,
        maxLife: 45,
      });
    };

    // --- Spawn Boss Function ---
    const spawnBoss = (now: number, currentWave: number) => {
      const s = stateRef.current;
      const bossTier = Math.floor(currentWave / 5);
      const bossHp = 80 + (bossTier - 1) * 55;

      sounds.playBossWarning();
      setBossWarningBanner(true);
      setTimeout(() => setBossWarningBanner(false), 3800);

      s.screenShake = 18;

      const bossEnemy: Enemy = {
        id: s.nextEnemyId++,
        x: VIRTUAL_WIDTH / 2,
        y: -150,
        targetY: 175,
        type: 'boss',
        isBoss: true,
        width: 148,
        height: 110,
        radius: 68,
        hp: bossHp,
        maxHp: bossHp,
        speed: 1.8,
        scoreValue: 5000 + (bossTier - 1) * 2500,
        angle: 0,
        rotSpeed: 0,
        birthTime: now,
        initialX: VIRTUAL_WIDTH / 2,
        shootCooldown: 90,
        bossPhase: 0,
        phaseTimer: 0,
        coreRotation: 0,
        phaseCharge: 0,
      };

      s.enemies.push(bossEnemy);
      setBossInfo({
        active: true,
        hp: bossHp,
        maxHp: bossHp,
        name: `OMEGA DREADNOUGHT MK-${bossTier}`,
      });

      createFloatingText(VIRTUAL_WIDTH / 2, 260, 'WARNING: TITAN CLASS DETECTED!', '#ef4444');
    };

    const spawnEnemy = (now: number) => {
      const s = stateRef.current;

      // Check if Boss is currently active
      const hasBoss = s.enemies.some((e) => e.isBoss);
      if (hasBoss) {
        // Only spawn rare light drone fodder during boss encounter
        if (Math.random() < 0.85) return;
      }

      const waveMult = 1 + (s.wave - 1) * 0.15;
      const rand = Math.random();

      let type: EnemyType = 'scout';
      let hp = 1;
      let width = 36;
      let height = 36;
      let speed = (Math.random() * 1.5 + 2.5) * waveMult;
      let scoreValue = 100;

      if (rand < 0.45) {
        // Scout: Straight dive, agile
        type = 'scout';
        hp = 1;
        width = 34;
        height = 38;
        speed = (Math.random() * 1.8 + 3.0) * waveMult;
        scoreValue = 100;
      } else if (rand < 0.75) {
        // Cruiser: Sine-wave weaving craft
        type = 'cruiser';
        hp = 2;
        width = 46;
        height = 42;
        speed = (Math.random() * 0.8 + 2.0) * waveMult;
        scoreValue = 250;
      } else if (rand < 0.9) {
        // Heavy: Tough dreadnought
        type = 'heavy';
        hp = 5;
        width = 62;
        height = 56;
        speed = (Math.random() * 0.5 + 1.2) * waveMult;
        scoreValue = 600;
      } else {
        // Asteroid: Rotating space rock
        type = 'asteroid';
        hp = 3;
        width = 48;
        height = 48;
        speed = (Math.random() * 1.0 + 1.6) * waveMult;
        scoreValue = 180;
      }

      const spawnX = Math.random() * (VIRTUAL_WIDTH - width - 60) + 30;

      // Generate polygon vertices if asteroid
      let polyPoints: { x: number; y: number }[] | undefined;
      if (type === 'asteroid') {
        const sides = 8;
        polyPoints = [];
        for (let i = 0; i < sides; i++) {
          const theta = (i / sides) * Math.PI * 2;
          const variance = 0.75 + Math.random() * 0.5;
          const r = (width / 2) * variance;
          polyPoints.push({
            x: Math.cos(theta) * r,
            y: Math.sin(theta) * r,
          });
        }
      }

      s.enemies.push({
        id: s.nextEnemyId++,
        x: spawnX,
        y: -height - 10,
        type,
        width,
        height,
        radius: width / 2,
        hp,
        maxHp: hp,
        speed,
        scoreValue,
        angle: 0,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        birthTime: now,
        initialX: spawnX,
        shootCooldown: Math.random() * 90 + 60,
        polyPoints,
      });
    };

    const maybeSpawnPowerUp = (x: number, y: number, guaranteed = false, forcedType?: PowerUp['type']) => {
      const s = stateRef.current;
      if (!guaranteed && Math.random() > 0.22) return;

      const types: Array<'spread' | 'rapid' | 'shield' | 'nuke'> = ['spread', 'rapid', 'shield', 'nuke'];
      const chosen = forcedType || types[Math.floor(Math.random() * types.length)];

      s.powerUps.push({
        id: s.nextPowerUpId++,
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 20,
        type: chosen,
        radius: 16,
        vy: 1.8,
        pulseAngle: 0,
      });
    };

    const fireLasers = (now: number) => {
      const s = stateRef.current;
      const isRapid = s.player.rapidDuration > 0;
      const cooldown = isRapid ? 85 : 160;

      if (now - s.player.lastFireTime < cooldown) return;
      s.player.lastFireTime = now;

      sounds.playLaser(isRapid ? 'rapid' : 'player');

      const isSpread = s.player.spreadDuration > 0;
      const py = s.player.y - 12;

      if (isSpread) {
        // Triple spread cannons
        s.lasers.push({
          x: s.player.x,
          y: py - 8,
          vx: 0,
          vy: -13,
          radius: 4,
          color: '#00f0ff',
          damage: 1,
        });
        s.lasers.push({
          x: s.player.x - 18,
          y: py,
          vx: -2.8,
          vy: -12.5,
          radius: 3.5,
          color: '#38bdf8',
          damage: 1,
        });
        s.lasers.push({
          x: s.player.x + 18,
          y: py,
          vx: 2.8,
          vy: -12.5,
          radius: 3.5,
          color: '#38bdf8',
          damage: 1,
        });
      } else {
        // Dual laser wing cannons
        s.lasers.push({
          x: s.player.x - 14,
          y: py,
          vx: 0,
          vy: -13,
          radius: 3.5,
          color: isRapid ? '#10b981' : '#00f0ff',
          damage: 1,
        });
        s.lasers.push({
          x: s.player.x + 14,
          y: py,
          vx: 0,
          vy: -13,
          radius: 3.5,
          color: isRapid ? '#10b981' : '#00f0ff',
          damage: 1,
        });
      }
    };

    const triggerNuke = () => {
      const s = stateRef.current;
      s.screenShake = 22;
      sounds.playExplosion('large');

      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const enemy = s.enemies[i];
        if (enemy.isBoss) {
          // Boss takes massive chunk damage instead of instant kill
          enemy.hp -= 35;
          createExplosion(enemy.x, enemy.y, '#f59e0b', 35, 2.0);
          if (enemy.hp <= 0) {
            defeatBoss(enemy);
            s.enemies.splice(i, 1);
          }
        } else {
          createExplosion(enemy.x, enemy.y, '#f59e0b', 30, 1.8);
          s.score += enemy.scoreValue;
          s.enemiesDefeated++;
          s.enemies.splice(i, 1);
        }
      }
      createFloatingText(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2, 'EMP DETONATED!', '#fbbf24');
    };

    // --- Boss Defeat Handling ---
    const defeatBoss = (boss: Enemy) => {
      const s = stateRef.current;
      sounds.playBossVictory();
      sounds.playExplosion('boss');
      s.screenShake = 32;

      // Massive chain explosion
      for (let k = 0; k < 6; k++) {
        setTimeout(() => {
          createExplosion(
            boss.x + (Math.random() - 0.5) * boss.width * 0.8,
            boss.y + (Math.random() - 0.5) * boss.height * 0.8,
            k % 2 === 0 ? '#ef4444' : '#f59e0b',
            35,
            2.5
          );
          s.screenShake = 20;
        }, k * 120);
      }

      s.score += boss.scoreValue;
      s.enemiesDefeated++;
      setScore(s.score);
      setEnemiesDefeated(s.enemiesDefeated);
      setBossInfo(null);

      // Guaranteed Power-Up Cache Drop (Triple + Shield + Rapid)
      maybeSpawnPowerUp(boss.x - 45, boss.y, true, 'spread');
      maybeSpawnPowerUp(boss.x, boss.y - 20, true, 'shield');
      maybeSpawnPowerUp(boss.x + 45, boss.y, true, 'rapid');

      createFloatingText(VIRTUAL_WIDTH / 2, boss.y, 'TITAN OBLITERATED! +5000', '#38bdf8');
      createFloatingText(VIRTUAL_WIDTH / 2, boss.y + 35, 'SECTOR CLEARED', '#fbbf24');
    };

    // --- Main Update & Draw Loop ---
    const loop = (timestamp: number) => {
      animId = requestAnimationFrame(loop);

      const s = stateRef.current;
      const dt = Math.min((timestamp - s.lastFrameTime) / 1000, 0.1);
      s.lastFrameTime = timestamp;

      // Handle Screen Shake
      ctx.save();
      if (s.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.screenShake;
        const shakeY = (Math.random() - 0.5) * s.screenShake;
        ctx.translate(shakeX, shakeY);
        s.screenShake = Math.max(0, s.screenShake - 0.8);
      }

      // 1. Clear & Background
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Deep space ambient nebula glow
      const nebulaGrad = ctx.createRadialGradient(
        VIRTUAL_WIDTH * 0.3,
        VIRTUAL_HEIGHT * 0.4,
        50,
        VIRTUAL_WIDTH * 0.3,
        VIRTUAL_HEIGHT * 0.4,
        450
      );
      nebulaGrad.addColorStop(0, 'rgba(30, 27, 75, 0.35)');
      nebulaGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.15)');
      nebulaGrad.addColorStop(1, 'rgba(6, 8, 20, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      const nebulaGrad2 = ctx.createRadialGradient(
        VIRTUAL_WIDTH * 0.75,
        VIRTUAL_HEIGHT * 0.7,
        40,
        VIRTUAL_WIDTH * 0.75,
        VIRTUAL_HEIGHT * 0.7,
        380
      );
      nebulaGrad2.addColorStop(0, 'rgba(56, 18, 64, 0.28)');
      nebulaGrad2.addColorStop(0.7, 'rgba(15, 23, 42, 0.1)');
      nebulaGrad2.addColorStop(1, 'rgba(6, 8, 20, 0)');
      ctx.fillStyle = nebulaGrad2;
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Red Alert overlay pulse if boss warning
      const activeBoss = s.enemies.find((e) => e.isBoss);
      if (activeBoss) {
        ctx.fillStyle = `rgba(239, 68, 68, ${0.04 + Math.sin(timestamp * 0.005) * 0.03})`;
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      }

      // 2. Parallax Starfield
      s.stars.forEach((star) => {
        // Move stars downward
        star.y += star.speed;
        if (star.y > VIRTUAL_HEIGHT) {
          star.y = -4;
          star.x = Math.random() * VIRTUAL_WIDTH;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        if (star.layer === 3) {
          ctx.fillStyle = `rgba(224, 242, 254, ${star.alpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#38bdf8';
        } else if (star.layer === 2) {
          ctx.fillStyle = `rgba(186, 230, 253, ${star.alpha})`;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(148, 163, 184, ${star.alpha})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Gameplay Updates (only if PLAYING)
      if (s.gameState === 'PLAYING') {
        // Wave Progression: dynamic difficulty scales with score
        const currentWave = Math.floor(s.score / 1500) + 1;
        if (currentWave !== s.wave) {
          s.wave = currentWave;
          setWave(currentWave);
          createFloatingText(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT * 0.35, `WAVE ${currentWave} ENGAGED`, '#38bdf8');
          sounds.playPowerup();
        }

        // --- RARE BOSS SPAWN CHECK (Every 5 waves) ---
        if (s.wave % 5 === 0 && s.bossSpawnedForWave !== s.wave) {
          s.bossSpawnedForWave = s.wave;
          spawnBoss(timestamp, s.wave);
        }

        // Power-up durations countdown
        if (s.player.spreadDuration > 0) {
          s.player.spreadDuration -= dt;
          if (s.player.spreadDuration <= 0) s.player.spreadDuration = 0;
          setSpreadTimer(Math.ceil(s.player.spreadDuration));
        } else {
          setSpreadTimer(0);
        }

        if (s.player.rapidDuration > 0) {
          s.player.rapidDuration -= dt;
          if (s.player.rapidDuration <= 0) s.player.rapidDuration = 0;
          setRapidTimer(Math.ceil(s.player.rapidDuration));
        } else {
          setRapidTimer(0);
        }

        if (s.player.invulnerableTimer > 0) {
          s.player.invulnerableTimer--;
        }

        // Player Movement & Smooth Inertia
        let moveX = 0;
        let moveY = 0;
        if (s.keys.left) moveX -= 1;
        if (s.keys.right) moveX += 1;
        if (s.keys.up) moveY -= 1;
        if (s.keys.down) moveY += 1;

        // Normalize diagonal speed
        if (moveX !== 0 && moveY !== 0) {
          moveX *= 0.7071;
          moveY *= 0.7071;
        }

        const targetVx = moveX * s.player.speed;
        const targetVy = moveY * s.player.speed;
        s.player.vx += (targetVx - s.player.vx) * 0.28;
        s.player.vy += (targetVy - s.player.vy) * 0.28;

        s.player.x += s.player.vx;
        s.player.y += s.player.vy;

        // Visual banking tilt
        const targetTilt = (s.player.vx / s.player.speed) * 0.35;
        s.player.tilt += (targetTilt - s.player.tilt) * 0.2;

        // Constrain player within bounds
        const padX = s.player.width / 2 + 8;
        const padY = s.player.height / 2 + 10;
        if (s.player.x < padX) {
          s.player.x = padX;
          s.player.vx = 0;
        }
        if (s.player.x > VIRTUAL_WIDTH - padX) {
          s.player.x = VIRTUAL_WIDTH - padX;
          s.player.vx = 0;
        }
        if (s.player.y < VIRTUAL_HEIGHT * 0.35) {
          s.player.y = VIRTUAL_HEIGHT * 0.35;
          s.player.vy = 0;
        }
        if (s.player.y > VIRTUAL_HEIGHT - padY) {
          s.player.y = VIRTUAL_HEIGHT - padY;
          s.player.vy = 0;
        }

        // Engine Thruster Particle Emission
        if (Math.random() < 0.8) {
          for (let offset of [-10, 10]) {
            s.particles.push({
              x: s.player.x + offset + (Math.random() - 0.5) * 3,
              y: s.player.y + 20,
              vx: (Math.random() - 0.5) * 1.0,
              vy: Math.random() * 3 + 4,
              color: s.player.rapidDuration > 0 ? '#10b981' : '#00f0ff',
              size: Math.random() * 2.5 + 1.5,
              life: 0,
              maxLife: 16,
              glow: true,
            });
          }
        }

        // Weapons Firing
        if (s.keys.fire) {
          fireLasers(timestamp);
        }

        // Enemy Spawning
        s.spawnTimer++;
        const baseInterval = Math.max(30, 85 - s.wave * 7);
        if (s.spawnTimer >= baseInterval) {
          s.spawnTimer = 0;
          spawnEnemy(timestamp);
        }

        // Update Enemies
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const enemy = s.enemies[i];

          // --- BOSS BEHAVIOR & ATTACK PATTERNS ---
          if (enemy.isBoss) {
            // Smooth entrance down to combat zone
            if (enemy.targetY && enemy.y < enemy.targetY) {
              enemy.y += 1.5;
            } else {
              // Boss tactical movement: horizontal sinusoidal weave & vertical bobbing
              const elapsed = (timestamp - enemy.birthTime) / 1000;
              enemy.x = VIRTUAL_WIDTH / 2 + Math.sin(elapsed * 0.85) * 200;
              enemy.y = (enemy.targetY || 175) + Math.sin(elapsed * 1.7) * 22;
            }

            enemy.coreRotation = (enemy.coreRotation || 0) + 0.05;
            enemy.phaseTimer = (enemy.phaseTimer || 0) + 1;

            // Cycle attack patterns every 180 frames (~3 seconds)
            if (enemy.phaseTimer > 180) {
              enemy.phaseTimer = 0;
              enemy.bossPhase = ((enemy.bossPhase || 0) + 1) % 3;
            }

            enemy.shootCooldown--;

            // Attack Pattern 1: Heavy Dual Wing Plasma Blasters (every 45 frames)
            if (enemy.bossPhase === 0) {
              if (enemy.shootCooldown <= 0) {
                enemy.shootCooldown = 45;
                sounds.playLaser('boss');

                // Dual heavy forward bolts from wing cannons
                s.lasers.push({
                  x: enemy.x - 52,
                  y: enemy.y + 40,
                  vx: -0.5,
                  vy: 6.5,
                  radius: 6,
                  color: '#ef4444',
                  isEnemy: true,
                  isHeavy: true,
                  damage: 22,
                });
                s.lasers.push({
                  x: enemy.x + 52,
                  y: enemy.y + 40,
                  vx: 0.5,
                  vy: 6.5,
                  radius: 6,
                  color: '#ef4444',
                  isEnemy: true,
                  isHeavy: true,
                  damage: 22,
                });
              }
            }
            // Attack Pattern 2: Rotating Spiral Nova Barrage (every 70 frames)
            else if (enemy.bossPhase === 1) {
              if (enemy.shootCooldown <= 0) {
                enemy.shootCooldown = 70;
                sounds.playLaser('enemy');
                s.screenShake = 6;

                // 12-bullet radial burst with angular spin
                const bulletCount = 12;
                const baseAngle = (enemy.coreRotation || 0);
                for (let b = 0; b < bulletCount; b++) {
                  const angle = baseAngle + (b / bulletCount) * Math.PI * 2;
                  s.lasers.push({
                    x: enemy.x,
                    y: enemy.y + 10,
                    vx: Math.cos(angle) * 4.8,
                    vy: Math.sin(angle) * 4.8,
                    radius: 5,
                    color: '#d946ef',
                    isEnemy: true,
                    damage: 16,
                  });
                }
              }
            }
            // Attack Pattern 3: Triple Heavy Plasma Mortars (every 60 frames)
            else if (enemy.bossPhase === 2) {
              if (enemy.shootCooldown <= 0) {
                enemy.shootCooldown = 60;
                sounds.playLaser('boss');

                // 3 heavy spreading explosive plasma charges aimed toward player
                const dx = s.player.x - enemy.x;
                const dy = s.player.y - enemy.y;
                const angleToPlayer = Math.atan2(dy, dx);

                [-0.35, 0, 0.35].forEach((spreadAngle) => {
                  const finalAngle = angleToPlayer + spreadAngle;
                  s.lasers.push({
                    x: enemy.x,
                    y: enemy.y + 45,
                    vx: Math.cos(finalAngle) * 5.2,
                    vy: Math.sin(finalAngle) * 5.2,
                    radius: 7,
                    color: '#f59e0b',
                    isEnemy: true,
                    isHeavy: true,
                    damage: 25,
                  });
                });
              }
            }

            // Boss damage sparks & smoke plumes when injured
            if (enemy.hp < enemy.maxHp * 0.6 && Math.random() < 0.6) {
              s.particles.push({
                x: enemy.x + (Math.random() - 0.5) * enemy.width * 0.7,
                y: enemy.y + (Math.random() - 0.5) * enemy.height * 0.5,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * -2 - 1,
                color: enemy.hp < enemy.maxHp * 0.3 ? '#ef4444' : '#64748b',
                size: Math.random() * 3 + 2,
                life: 0,
                maxLife: 20,
              });
            }

            // Sync Boss HUD state
            setBossInfo({
              active: true,
              hp: enemy.hp,
              maxHp: enemy.maxHp,
              name: `OMEGA DREADNOUGHT MK-${Math.floor(s.wave / 5)}`,
            });
          }
          // --- STANDARD ENEMY PATTERNS ---
          else if (enemy.type === 'cruiser') {
            // Sine-wave flight path
            const elapsed = (timestamp - enemy.birthTime) / 1000;
            enemy.x = enemy.initialX + Math.sin(elapsed * 2.8) * 85;
            enemy.y += enemy.speed;

            // Occasional enemy shot
            enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0) {
              enemy.shootCooldown = 110 + Math.random() * 40;
              s.lasers.push({
                x: enemy.x,
                y: enemy.y + enemy.height / 2,
                vx: 0,
                vy: 5.5,
                radius: 4.5,
                color: '#ec4899',
                isEnemy: true,
                damage: 18,
              });
              sounds.playLaser('enemy');
            }
          } else if (enemy.type === 'heavy') {
            enemy.y += enemy.speed;
            enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0) {
              enemy.shootCooldown = 140;
              s.lasers.push({
                x: enemy.x - 15,
                y: enemy.y + enemy.height / 2,
                vx: -1.2,
                vy: 4.8,
                radius: 4,
                color: '#f59e0b',
                isEnemy: true,
                damage: 15,
              });
              s.lasers.push({
                x: enemy.x + 15,
                y: enemy.y + enemy.height / 2,
                vx: 1.2,
                vy: 4.8,
                radius: 4,
                color: '#f59e0b',
                isEnemy: true,
                damage: 15,
              });
              sounds.playLaser('enemy');
            }
          } else {
            // Scout & Asteroid fall straight
            enemy.y += enemy.speed;
            enemy.angle += enemy.rotSpeed;
          }

          // Off-screen removal (non-boss)
          if (!enemy.isBoss && enemy.y > VIRTUAL_HEIGHT + 60) {
            s.enemies.splice(i, 1);
            continue;
          }

          // Enemy collision with Player
          const distToPlayer = Math.hypot(enemy.x - s.player.x, enemy.y - s.player.y);
          if (distToPlayer < enemy.radius + s.player.radius - 4) {
            if (s.player.invulnerableTimer <= 0) {
              if (s.player.hasShield) {
                s.player.hasShield = false;
                setShieldActive(false);
                createFloatingText(s.player.x, s.player.y - 20, 'SHIELD BROKEN!', '#38bdf8');
                sounds.playExplosion('small');
                s.player.invulnerableTimer = 40;
              } else {
                const damageTaken = enemy.isBoss ? 45 : 28;
                s.health -= damageTaken;
                s.screenShake = 18;
                sounds.playExplosion('medium');
                sounds.playHit();
                createFloatingText(s.player.x, s.player.y - 20, `-${damageTaken} HP`, '#ef4444');
                s.player.invulnerableTimer = 50;

                if (s.health <= 0) {
                  s.health = 0;
                  setHealth(0);
                  s.gameState = 'GAMEOVER';
                  setGameState('GAMEOVER');
                  sounds.playGameOver();
                  createExplosion(s.player.x, s.player.y, '#00f0ff', 40, 2.5);
                  if (s.score > s.highScore) {
                    s.highScore = s.score;
                    setHighScore(s.score);
                    try {
                      localStorage.setItem('neon_void_highscore', s.score.toString());
                    } catch {
                      // ignore
                    }
                  }
                  break;
                }
                setHealth(s.health);
              }
            }

            // Non-boss enemies are destroyed upon impact; Boss takes slight collision damage
            if (enemy.isBoss) {
              enemy.hp -= 20;
              createExplosion(enemy.x, enemy.y, '#ef4444', 25);
              if (enemy.hp <= 0) {
                defeatBoss(enemy);
                s.enemies.splice(i, 1);
              }
            } else {
              createExplosion(enemy.x, enemy.y, enemy.type === 'heavy' ? '#f59e0b' : '#ef4444', 20);
              s.enemies.splice(i, 1);
            }
            continue;
          }
        }

        // Update Lasers
        for (let lIdx = s.lasers.length - 1; lIdx >= 0; lIdx--) {
          const laser = s.lasers[lIdx];
          laser.x += laser.vx;
          laser.y += laser.vy;

          // Remove lasers off screen
          if (laser.y < -30 || laser.y > VIRTUAL_HEIGHT + 30 || laser.x < -20 || laser.x > VIRTUAL_WIDTH + 20) {
            s.lasers.splice(lIdx, 1);
            continue;
          }

          // Enemy Laser hitting Player
          if (laser.isEnemy) {
            const dist = Math.hypot(laser.x - s.player.x, laser.y - s.player.y);
            if (dist < laser.radius + s.player.radius - 2) {
              s.lasers.splice(lIdx, 1);
              if (s.player.invulnerableTimer <= 0) {
                if (s.player.hasShield) {
                  s.player.hasShield = false;
                  setShieldActive(false);
                  createFloatingText(s.player.x, s.player.y - 20, 'SHIELD ABSORBED', '#38bdf8');
                  sounds.playHit();
                  s.player.invulnerableTimer = 30;
                } else {
                  s.health -= laser.damage;
                  s.screenShake = laser.isHeavy ? 14 : 10;
                  sounds.playHit();
                  createFloatingText(s.player.x, s.player.y - 20, `-${laser.damage} HP`, '#ef4444');
                  s.player.invulnerableTimer = 40;

                  if (s.health <= 0) {
                    s.health = 0;
                    setHealth(0);
                    s.gameState = 'GAMEOVER';
                    setGameState('GAMEOVER');
                    sounds.playGameOver();
                    createExplosion(s.player.x, s.player.y, '#00f0ff', 40, 2.5);
                    if (s.score > s.highScore) {
                      s.highScore = s.score;
                      setHighScore(s.score);
                      try {
                        localStorage.setItem('neon_void_highscore', s.score.toString());
                      } catch {
                        // ignore
                      }
                    }
                    break;
                  }
                  setHealth(s.health);
                }
              }
              continue;
            }
          } else {
            // Player Laser hitting Enemies
            let laserHit = false;
            for (let eIdx = s.enemies.length - 1; eIdx >= 0; eIdx--) {
              const enemy = s.enemies[eIdx];
              const dist = Math.hypot(laser.x - enemy.x, laser.y - enemy.y);

              if (dist < laser.radius + enemy.radius) {
                laserHit = true;
                enemy.hp -= laser.damage;

                // Hit spark particle
                for (let k = 0; k < 4; k++) {
                  s.particles.push({
                    x: laser.x,
                    y: laser.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    color: '#ffffff',
                    size: 2,
                    life: 0,
                    maxLife: 8,
                  });
                }

                if (enemy.hp <= 0) {
                  if (enemy.isBoss) {
                    defeatBoss(enemy);
                    s.enemies.splice(eIdx, 1);
                  } else {
                    // Enemy destroyed!
                    const burstColor =
                      enemy.type === 'heavy'
                        ? '#f59e0b'
                        : enemy.type === 'cruiser'
                        ? '#c084fc'
                        : enemy.type === 'asteroid'
                        ? '#94a3b8'
                        : '#ef4444';

                    createExplosion(enemy.x, enemy.y, burstColor, enemy.type === 'heavy' ? 32 : 18);
                    sounds.playExplosion(enemy.type === 'heavy' ? 'large' : 'small');

                    s.score += enemy.scoreValue;
                    s.enemiesDefeated++;
                    setScore(s.score);
                    setEnemiesDefeated(s.enemiesDefeated);
                    createFloatingText(enemy.x, enemy.y, `+${enemy.scoreValue}`, '#38bdf8');

                    maybeSpawnPowerUp(enemy.x, enemy.y);
                    s.enemies.splice(eIdx, 1);
                  }
                } else {
                  sounds.playHit();
                }

                break; // Laser consumed
              }
            }

            if (laserHit) {
              s.lasers.splice(lIdx, 1);
              continue;
            }
          }
        }

        // Update Power-ups
        for (let pIdx = s.powerUps.length - 1; pIdx >= 0; pIdx--) {
          const power = s.powerUps[pIdx];
          power.y += power.vy;
          power.pulseAngle += 0.08;

          if (power.y > VIRTUAL_HEIGHT + 30) {
            s.powerUps.splice(pIdx, 1);
            continue;
          }

          // Check pickup by player
          const dist = Math.hypot(power.x - s.player.x, power.y - s.player.y);
          if (dist < power.radius + s.player.radius) {
            sounds.playPowerup();
            createExplosion(power.x, power.y, '#38bdf8', 16, 1.2);

            if (power.type === 'spread') {
              s.player.spreadDuration = 10;
              setSpreadTimer(10);
              createFloatingText(s.player.x, s.player.y - 30, 'TRIPLE LASERS!', '#00f0ff');
            } else if (power.type === 'rapid') {
              s.player.rapidDuration = 8;
              setRapidTimer(8);
              createFloatingText(s.player.x, s.player.y - 30, 'HYPER DRIVE!', '#10b981');
            } else if (power.type === 'shield') {
              s.player.hasShield = true;
              s.health = Math.min(100, s.health + 30);
              setHealth(s.health);
              setShieldActive(true);
              createFloatingText(s.player.x, s.player.y - 30, 'PLASMA SHIELD!', '#38bdf8');
            } else if (power.type === 'nuke') {
              triggerNuke();
            }

            s.powerUps.splice(pIdx, 1);
          }
        }
      }

      // 4. Draw Lasers
      s.lasers.forEach((laser) => {
        ctx.save();
        ctx.beginPath();
        ctx.shadowBlur = laser.isHeavy ? 18 : 12;
        ctx.shadowColor = laser.color;
        ctx.fillStyle = laser.color;

        if (laser.isEnemy) {
          // Circular plasma ball with glow
          ctx.arc(laser.x, laser.y, laser.radius, 0, Math.PI * 2);
          ctx.fill();
          // Inner core
          ctx.beginPath();
          ctx.fillStyle = '#ffffff';
          ctx.arc(laser.x, laser.y, laser.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Elongated neon bolt
          ctx.rect(laser.x - laser.radius * 0.6, laser.y - 12, laser.radius * 1.2, 22);
          ctx.fill();
          // Hot white center line
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(laser.x - laser.radius * 0.25, laser.y - 10, laser.radius * 0.5, 18);
        }
        ctx.restore();
      });

      // 5. Draw Power-ups
      s.powerUps.forEach((power) => {
        ctx.save();
        ctx.translate(power.x, power.y);
        const pulse = 1 + Math.sin(power.pulseAngle) * 0.15;
        ctx.scale(pulse, pulse);

        let iconColor = '#00f0ff';
        let label = 'W';
        if (power.type === 'spread') {
          iconColor = '#00f0ff';
          label = '3X';
        } else if (power.type === 'rapid') {
          iconColor = '#10b981';
          label = 'RAPID';
        } else if (power.type === 'shield') {
          iconColor = '#60a5fa';
          label = 'SHIELD';
        } else if (power.type === 'nuke') {
          iconColor = '#fbbf24';
          label = 'EMP';
        }

        ctx.shadowBlur = 14;
        ctx.shadowColor = iconColor;

        // Outer ring
        ctx.beginPath();
        ctx.arc(0, 0, power.radius, 0, Math.PI * 2);
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 2.5;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);

        ctx.restore();
      });

      // 6. Draw Enemies (Procedural Vector Designs)
      s.enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle);

        // ==========================================
        // --- MULTI-LAYERED RARE BOSS RENDERING ---
        // ==========================================
        if (enemy.isBoss) {
          const w = enemy.width;
          const h = enemy.height;
          const hpRatio = enemy.hp / enemy.maxHp;

          // LAYER 1: Heavy Vector Thrusters & Plasma Flames
          ctx.save();
          [-42, -22, 22, 42].forEach((tx) => {
            const flameLen = 18 + Math.random() * 12 + Math.sin(timestamp * 0.02) * 6;
            const gradFlame = ctx.createLinearGradient(tx, -h / 2, tx, -h / 2 - flameLen);
            gradFlame.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
            gradFlame.addColorStop(0.5, 'rgba(217, 70, 239, 0.7)');
            gradFlame.addColorStop(1, 'rgba(244, 63, 94, 0)');

            ctx.fillStyle = gradFlame;
            ctx.beginPath();
            ctx.moveTo(tx - 6, -h / 2);
            ctx.lineTo(tx, -h / 2 - flameLen);
            ctx.lineTo(tx + 6, -h / 2);
            ctx.closePath();
            ctx.fill();
          });
          ctx.restore();

          // LAYER 2: Heavy Wing Mantles & Armor Plates
          ctx.shadowBlur = 24;
          ctx.shadowColor = hpRatio < 0.3 ? '#ef4444' : '#d946ef';

          // Outer Wing Mantle (Dark Titanium alloy with Neon border)
          ctx.beginPath();
          ctx.moveTo(0, h * 0.52); // Forward armored ram
          ctx.lineTo(-w * 0.28, h * 0.32);
          ctx.lineTo(-w * 0.52, h * 0.08); // Outer left wingtip
          ctx.lineTo(-w * 0.48, -h * 0.42); // Rear left outer
          ctx.lineTo(-w * 0.22, -h * 0.48); // Rear engine deck
          ctx.lineTo(0, -h * 0.35); // Center rear spine
          ctx.lineTo(w * 0.22, -h * 0.48);
          ctx.lineTo(w * 0.48, -h * 0.42);
          ctx.lineTo(w * 0.52, h * 0.08);
          ctx.lineTo(w * 0.28, h * 0.32);
          ctx.closePath();

          ctx.fillStyle = '#0f0c1b';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = hpRatio < 0.3 ? '#ef4444' : '#d946ef';
          ctx.stroke();

          // Symmetrical Reinforced Armor Plates
          ctx.fillStyle = '#1c1530';
          ctx.beginPath();
          ctx.moveTo(0, h * 0.35);
          ctx.lineTo(-w * 0.32, h * 0.05);
          ctx.lineTo(-w * 0.35, -h * 0.28);
          ctx.lineTo(0, -h * 0.15);
          ctx.lineTo(w * 0.35, -h * 0.28);
          ctx.lineTo(w * 0.32, h * 0.05);
          ctx.closePath();
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#c084fc';
          ctx.stroke();

          // Heavy Side Rotary Cannons
          ctx.fillStyle = '#334155';
          ctx.fillRect(-w * 0.52 - 4, -4, 8, 32);
          ctx.fillRect(w * 0.52 - 4, -4, 8, 32);
          // Glowing barrel tips
          ctx.fillStyle = enemy.bossPhase === 0 ? '#ef4444' : '#38bdf8';
          ctx.fillRect(-w * 0.52 - 3, 20, 6, 8);
          ctx.fillRect(w * 0.52 - 3, 20, 6, 8);

          // LAYER 3: Rotating Quantum Reactor Core
          ctx.save();
          ctx.translate(0, 0);

          // Reactor Outer Ring
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.strokeStyle = hpRatio < 0.3 ? '#ef4444' : '#00f0ff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Spinning Energy Blades inside the Core
          ctx.rotate(enemy.coreRotation || 0);
          for (let blade = 0; blade < 4; blade++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = enemy.bossPhase === 1 ? '#d946ef' : enemy.bossPhase === 2 ? '#f59e0b' : '#00f0ff';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-4, 18);
            ctx.lineTo(4, 18);
            ctx.closePath();
            ctx.fill();
          }

          // Central Pulsing Singularity
          ctx.beginPath();
          const coreGlow = 8 + Math.sin(timestamp * 0.01) * 3;
          ctx.arc(0, 0, coreGlow, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffffff';
          ctx.fill();
          ctx.restore();

          // LAYER 4: Real-time Damage Arc Sparks if Low HP
          if (hpRatio < 0.35) {
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const sx = (Math.random() - 0.5) * w * 0.6;
            const sy = (Math.random() - 0.5) * h * 0.6;
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + (Math.random() - 0.5) * 20, sy + (Math.random() - 0.5) * 20);
            ctx.stroke();
          }
        }
        // --- STANDARD ENEMIES ---
        else if (enemy.type === 'scout') {
          // Sleek aggressive red needle fighter
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#ef4444';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.fillStyle = '#1e111a';

          ctx.beginPath();
          ctx.moveTo(0, enemy.height / 2);
          ctx.lineTo(-enemy.width / 2, -enemy.height / 2);
          ctx.lineTo(-enemy.width / 4, -enemy.height / 4);
          ctx.lineTo(0, -enemy.height / 3);
          ctx.lineTo(enemy.width / 4, -enemy.height / 4);
          ctx.lineTo(enemy.width / 2, -enemy.height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Core cockpit eye
          ctx.fillStyle = '#f87171';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (enemy.type === 'cruiser') {
          // Wide-wing alien cruiser, magenta/violet
          ctx.shadowBlur = 16;
          ctx.shadowColor = '#d946ef';
          ctx.strokeStyle = '#d946ef';
          ctx.lineWidth = 2;
          ctx.fillStyle = '#21102e';

          ctx.beginPath();
          ctx.moveTo(0, enemy.height / 2);
          ctx.lineTo(-enemy.width / 2, 0);
          ctx.lineTo(-enemy.width / 3, -enemy.height / 2);
          ctx.lineTo(0, -enemy.height / 4);
          ctx.lineTo(enemy.width / 3, -enemy.height / 2);
          ctx.lineTo(enemy.width / 2, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Wing cannons
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(-enemy.width / 2, -4, 4, 10);
          ctx.fillRect(enemy.width / 2 - 4, -4, 4, 10);

          // Center pulsing core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 4, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (enemy.type === 'heavy') {
          // Armored dreadnought, gold/amber
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#f59e0b';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.fillStyle = '#2d1f04';

          ctx.beginPath();
          ctx.moveTo(0, enemy.height / 2);
          ctx.lineTo(-enemy.width / 2, enemy.height / 4);
          ctx.lineTo(-enemy.width / 2.2, -enemy.height / 2);
          ctx.lineTo(0, -enemy.height / 3);
          ctx.lineTo(enemy.width / 2.2, -enemy.height / 2);
          ctx.lineTo(enemy.width / 2, enemy.height / 4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Heavy armor plates
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-enemy.width / 4, -6, enemy.width / 2, 8);

          // Health bar above heavy
          if (enemy.hp < enemy.maxHp) {
            const barW = enemy.width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(-barW / 2, -enemy.height / 2 - 12, barW, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-barW / 2, -enemy.height / 2 - 12, barW * (enemy.hp / enemy.maxHp), 4);
          }
        } else if (enemy.type === 'asteroid') {
          // Jagged asteroid polygon
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#94a3b8';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.fillStyle = '#1e293b';

          if (enemy.polyPoints && enemy.polyPoints.length > 0) {
            ctx.beginPath();
            ctx.moveTo(enemy.polyPoints[0].x, enemy.polyPoints[0].y);
            for (let p = 1; p < enemy.polyPoints.length; p++) {
              ctx.lineTo(enemy.polyPoints[p].x, enemy.polyPoints[p].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Inner surface crater line
            ctx.beginPath();
            ctx.arc(enemy.polyPoints[1].x * 0.4, enemy.polyPoints[1].y * 0.4, 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      // 7. Draw Player Ship (Procedural Futuristic Interceptor)
      if (s.gameState === 'PLAYING' || s.gameState === 'PAUSED') {
        const p = s.player;
        const isFlickering = p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0;

        if (!isFlickering) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.tilt);

          const shipGlowColor = p.rapidDuration > 0 ? '#10b981' : '#00f0ff';
          ctx.shadowBlur = 18;
          ctx.shadowColor = shipGlowColor;

          // Main Stealth Hull
          ctx.beginPath();
          ctx.moveTo(0, -p.height / 2); // Nose
          ctx.lineTo(-p.width / 2, p.height / 2); // Left wingtip
          ctx.lineTo(-p.width / 4, p.height / 3); // Left wing notch
          ctx.lineTo(0, p.height / 4); // Rear center
          ctx.lineTo(p.width / 4, p.height / 3); // Right wing notch
          ctx.lineTo(p.width / 2, p.height / 2); // Right wingtip
          ctx.closePath();

          ctx.fillStyle = '#0f172a';
          ctx.fill();
          ctx.lineWidth = 2.2;
          ctx.strokeStyle = shipGlowColor;
          ctx.stroke();

          // Cockpit Canopy (Glowing Cyan/Teal)
          ctx.beginPath();
          ctx.ellipse(0, -p.height / 6, 5, 12, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Wing Cannons
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-p.width / 2 - 1, p.height / 4, 3, 10);
          ctx.fillRect(p.width / 2 - 2, p.height / 4, 3, 10);

          // Shield Bubble if active
          if (p.hasShield || p.invulnerableTimer > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, p.radius + 14, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#38bdf8';
            ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // 8. Draw Particles
      for (let pIdx = s.particles.length - 1; pIdx >= 0; pIdx--) {
        const pt = s.particles[pIdx];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.96;
        pt.vy *= 0.96;
        pt.life++;

        if (pt.life >= pt.maxLife) {
          s.particles.splice(pIdx, 1);
          continue;
        }

        const alpha = 1 - pt.life / pt.maxLife;
        ctx.save();
        ctx.beginPath();
        if (pt.glow) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = pt.color;
        }
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.arc(pt.x, pt.y, pt.size * (1 - (pt.life / pt.maxLife) * 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 9. Floating Text (Combat feedback, score popup)
      for (let fIdx = s.floatingTexts.length - 1; fIdx >= 0; fIdx--) {
        const ft = s.floatingTexts[fIdx];
        ft.y -= 1.2;
        ft.life++;
        ft.alpha = 1 - ft.life / ft.maxLife;

        if (ft.life >= ft.maxLife) {
          s.floatingTexts.splice(fIdx, 1);
          continue;
        }

        ctx.save();
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // Restore screen shake context
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  // Mobile / Touch controls helper
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (stateRef.current.gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;

    const targetX = (touch.clientX - rect.left) * scaleX;
    const targetY = (touch.clientY - rect.top) * scaleY - 40;

    stateRef.current.player.x = Math.max(30, Math.min(VIRTUAL_WIDTH - 30, targetX));
    stateRef.current.player.y = Math.max(VIRTUAL_HEIGHT * 0.35, Math.min(VIRTUAL_HEIGHT - 30, targetY));
    stateRef.current.keys.fire = true; // Auto-fire while dragging
  };

  const handleTouchEnd = () => {
    stateRef.current.keys.fire = false;
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col items-center justify-center p-2 select-none overflow-hidden font-sans">
      {/* Game Window Container */}
      <div className="relative flex flex-col items-center justify-center w-full h-full max-w-[760px] max-h-[96vh]">
        {/* Top Floating Control Bar */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 mb-1.5 text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold tracking-wider uppercase text-sm">NEON VOID</span>
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
              wave % 5 === 0 
                ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse font-bold' 
                : 'bg-cyan-950 text-cyan-300 border-cyan-800'
            }`}>
              {wave % 5 === 0 ? `BOSS WAVE ${wave}` : `WAVE ${wave}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundMuted((m) => !m)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
              title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden sm:inline text-[11px]">{soundMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            {gameState === 'PLAYING' && (
              <button
                onClick={togglePause}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 text-yellow-400" />
                <span className="hidden sm:inline text-[11px]">Pause (P)</span>
              </button>
            )}
          </div>
        </div>

        {/* Canvas & HUD Area */}
        <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-2xl border-2 border-cyan-500/30 bg-black shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          <canvas
            ref={canvasRef}
            width={VIRTUAL_WIDTH}
            height={VIRTUAL_HEIGHT}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full object-contain cursor-crosshair"
          />

          {/* BOSS WARNING BANNER OVERLAY */}
          {bossWarningBanner && (
            <div className="absolute top-16 inset-x-4 flex items-center justify-center pointer-events-none z-30 animate-bounce">
              <div className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-red-950/90 border-2 border-red-500 text-red-400 backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.7)]">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-spin" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black font-mono tracking-widest text-white">RED ALERT: BOSS APPROACHING</span>
                  <span className="text-[11px] font-mono text-red-300">OMEGA DREADNOUGHT SIGNATURE VERIFIED</span>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED BOSS HEALTH BAR (when Boss is active) */}
          {bossInfo && (gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <div className="absolute top-3 inset-x-8 pointer-events-none flex flex-col items-center z-20">
              <div className="w-full max-w-md bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.35)]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400">
                    <Skull className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span>{bossInfo.name}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-rose-300">
                    {Math.max(0, Math.round((bossInfo.hp / bossInfo.maxHp) * 100))}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-150 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                    style={{ width: `${Math.max(0, (bossInfo.hp / bossInfo.maxHp) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* HUD Layer (Active during PLAYING or PAUSED) */}
          {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <div className={`absolute inset-0 pointer-events-none p-4 flex flex-col justify-between ${bossInfo ? 'pt-16' : ''}`}>
              {/* Top HUD */}
              <div className="flex items-start justify-between w-full">
                {/* Health & Shields */}
                <div className="flex flex-col gap-1.5 bg-slate-950/70 backdrop-blur-md p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono tracking-wider font-semibold text-slate-300">SHIELD HULL</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        health > 50 ? 'text-emerald-400' : health > 25 ? 'text-yellow-400' : 'text-rose-500 animate-pulse'
                      }`}
                    >
                      {health}%
                    </span>
                  </div>
                  <div className="w-36 sm:w-44 h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        health > 50
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                          : health > 25
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                          : 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse'
                      }`}
                      style={{ width: `${Math.max(0, health)}%` }}
                    />
                  </div>

                  {shieldActive && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 animate-pulse">
                      <Shield className="w-3 h-3 text-cyan-400" />
                      <span>PLASMA BARRIER ACTIVE</span>
                    </div>
                  )}
                </div>

                {/* Score & High Score */}
                <div className="flex flex-col items-end bg-slate-950/70 backdrop-blur-md p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">SCORE</span>
                  <span className="text-xl sm:text-2xl font-mono font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                    {score.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-0.5">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span>BEST: {Math.max(score, highScore).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Power-up Buffs Status */}
              <div className="flex items-center gap-2 self-start">
                {spreadTimer > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/50 backdrop-blur-md text-cyan-300 font-mono text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>TRIPLE: {spreadTimer}s</span>
                  </div>
                )}
                {rapidTimer > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md text-emerald-300 font-mono text-xs">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>RAPID: {rapidTimer}s</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* START SCREEN OVERLAY */}
          {gameState === 'START' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4 tracking-wider">
                <Crosshair className="w-3.5 h-3.5 animate-spin" />
                ARCADE CLASSIC REDEFINED
              </div>

              <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white mb-2 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
                NEON <span className="text-cyan-400">VOID</span>
              </h1>
              <p className="text-slate-300 text-sm max-w-sm mb-6 leading-relaxed">
                Pilot the cyber-interceptor through deep space. Confront deadly fleets and face catastrophic <span className="text-rose-400 font-semibold">Omega Dreadnought Bosses</span> every 5 waves.
              </p>

              <button
                onClick={startGame}
                className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-base shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] transition-all cursor-pointer transform hover:scale-105 active:scale-95 mb-6"
              >
                PRESS ENTER OR CLICK TO LAUNCH
              </button>

              {/* Controls Instruction Box */}
              <div className="grid grid-cols-2 gap-3 max-w-md w-full text-left bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                <div className="flex flex-col gap-1">
                  <span className="text-cyan-400 font-bold">MOVEMENT</span>
                  <span>W, A, S, D or Arrows</span>
                  <span className="text-[10px] text-slate-400">Touch/drag on mobile</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-cyan-400 font-bold">WEAPONS</span>
                  <span>Spacebar to Fire Dual Lasers</span>
                  <span className="text-[10px] text-slate-400">Automatic fire on touch</span>
                </div>
              </div>

              {highScore > 0 && (
                <div className="flex items-center gap-1.5 mt-5 font-mono text-xs text-amber-400">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>RECORD HIGH SCORE: {highScore.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* PAUSED OVERLAY */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <h2 className="text-3xl font-mono font-bold text-yellow-400 mb-4 tracking-wider">GAME PAUSED</h2>
              <button
                onClick={togglePause}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-sm font-semibold transition-colors cursor-pointer shadow-lg mb-3"
              >
                <Play className="w-4 h-4" /> RESUME MISSION (P)
              </button>
            </div>
          )}

          {/* GAME OVER OVERLAY */}
          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_25px_rgba(239,68,68,0.5)]">
                <RotateCcw className="w-7 h-7" />
              </div>

              <h2 className="text-3xl sm:text-5xl font-mono font-black text-rose-500 mb-1 drop-shadow-[0_0_20px_rgba(244,63,94,0.7)]">
                VESSEL DESTROYED
              </h2>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">Mission Terminated</p>

              {/* Stats Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 w-full max-w-xs mb-6 flex flex-col gap-2 font-mono text-left">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">FINAL SCORE:</span>
                  <span className="text-cyan-400 font-bold text-lg">{score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">ENEMIES DESTROYED:</span>
                  <span className="text-white font-medium">{enemiesDefeated}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">SECTOR REACHED:</span>
                  <span className="text-white font-medium">Wave {wave}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> ALL-TIME RECORD:
                  </span>
                  <span className="text-amber-400 font-bold">{Math.max(score, highScore).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all cursor-pointer transform hover:scale-105 active:scale-95"
              >
                PRESS ENTER OR CLICK TO RETRY
              </button>
            </div>
          )}
        </div>

        {/* Bottom Mobile Control Buttons (visible on touch devices) */}
        <div className="flex sm:hidden items-center justify-center gap-4 w-full mt-2">
          <button
            onTouchStart={() => (stateRef.current.keys.fire = true)}
            onTouchEnd={() => (stateRef.current.keys.fire = false)}
            onMouseDown={() => (stateRef.current.keys.fire = true)}
            onMouseUp={() => (stateRef.current.keys.fire = false)}
            className="w-full py-3 bg-cyan-600/80 active:bg-cyan-500 text-white rounded-xl font-mono text-sm font-bold border border-cyan-400 shadow-md touch-none"
          >
            HOLD TO FIRE
          </button>
        </div>
      </div>
    </div>
  );
}
