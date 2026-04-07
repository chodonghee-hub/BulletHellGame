import React, { useEffect, useMemo, useRef, useState } from "react";

const AVATAR = "/mnt/data/submarine.jpg";

const WIDTH = 900;
const HEIGHT = 560;
const PLAYER_SIZE = 44;
const PROJECTILE_RADIUS = 24;
const INITIAL_LIVES = 5;
const MAX_LIVES = 10;
const NAME_LIMIT = 16;
const HEART_RADIUS = 18;
const SHIELD_RADIUS = 18;
const RAINBOW_RADIUS = 20;
const BONUS_PATTERN_DURATION = 5000;
const BONUS_ENTRY_COST = 5;
const BONUS_COLLISION_SCORE = 30;
const RAINBOW_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

const LANGUAGES = [
  { name: "C", color: "#2563eb" },
  { name: "C++", color: "#1d4ed8" },
  { name: "Java", color: "#ea580c" },
  { name: "JavaScript", color: "#ca8a04" },
  { name: "Python", color: "#16a34a" },
  { name: "TypeScript", color: "#0284c7" },
  { name: "Go", color: "#0891b2" },
  { name: "Rust", color: "#7c2d12" },
  { name: "Kotlin", color: "#9333ea" },
  { name: "Swift", color: "#f97316" },
  { name: "Ruby", color: "#be123c" },
  { name: "PHP", color: "#4f46e5" },
  { name: "Scala", color: "#dc2626" },
  { name: "Haskell", color: "#7c3aed" },
  { name: "Dart", color: "#0f766e" },
  { name: "Lua", color: "#1e40af" },
  { name: "R", color: "#475569" },
  { name: "Perl", color: "#4338ca" },
  { name: "Elixir", color: "#6d28d9" },
  { name: "Erlang", color: "#b91c1c" },
  { name: "Julia", color: "#15803d" },
  { name: "Clojure", color: "#0f766e" },
  { name: "F#", color: "#0ea5e9" },
  { name: "Fortran", color: "#4c1d95" },
  { name: "COBOL", color: "#1f2937" },
  { name: "Ada", color: "#be185d" },
  { name: "OCaml", color: "#c2410c" },
  { name: "Visual Basic", color: "#7c3aed" },
];

const LANGUAGE_INITIALS = [...new Set(LANGUAGES.map((item) => item.name[0].toUpperCase()))].sort();

const END_MESSAGES = [
  "교수님이 조용히 미소 지었다. 좋아, 이제 대학원으로 오면 되겠네.",
  "도망친 줄 알았지? 다음 스테이지는 연구실 출근이다.",
  "게임은 끝났고, 책상 위에는 대학원 지원서만 남아 있었다.",
  "알파벳은 피하지 못했다. 이제 논문 주제도 피할 수 없다.",
  "축하합니다. 당신은 대학원에 끌려가 연구의 세계에 입문했습니다.",
  "랩실 문이 열렸다. 안으로 들어오라는 교수님의 손짓이 보인다.",
  "탄막보다 무서운 말이 들린다. 연구할 생각 있지?",
  "생존 실패. 오늘부터 당신의 출석 위치는 강의실이 아니라 연구실이다.",
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createLogoDataUrl(language) {
  const label = language.name.length <= 4 ? language.name : language.name[0].toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${language.color}"/>
          <stop offset="100%" stop-color="#111827"/>
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="68" height="68" rx="18" fill="url(#g)" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>
      <circle cx="22" cy="22" r="4" fill="rgba(255,255,255,0.30)"/>
      <text x="40" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="${label.length >= 3 ? 18 : 24}" font-weight="700" fill="white">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createHeartDataUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="31" fill="#1f2937" stroke="rgba(255,255,255,0.22)" stroke-width="2" />
      <path d="M36 57c-1 0-2-.4-2.7-1.1L17.1 40.5a10.4 10.4 0 0 1 14.7-14.7l4.2 4.2 4.2-4.2a10.4 10.4 0 1 1 14.7 14.7L38.7 55.9A3.8 3.8 0 0 1 36 57Z" fill="#f43f5e"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createShieldDataUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="31" fill="#1f2937" stroke="rgba(255,255,255,0.22)" stroke-width="2" />
      <path d="M36 14l16 6v13c0 11.5-7.4 21-16 25-8.6-4-16-13.5-16-25V20l16-6Z" fill="#facc15"/>
      <path d="M36 21l9 3.5v8.3c0 7.7-4.5 14.3-9 17-4.5-2.7-9-9.3-9-17v-8.3L36 21Z" fill="#fde68a"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createRainbowDataUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r="33" fill="#111827" stroke="rgba(255,255,255,0.24)" stroke-width="2"/>
      <path d="M20 46a18 18 0 0 1 36 0" stroke="#ef4444" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M24 46a14 14 0 0 1 28 0" stroke="#f97316" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M28 46a10 10 0 0 1 20 0" stroke="#eab308" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M32 46a6 6 0 0 1 12 0" stroke="#22c55e" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="38" cy="49" r="3" fill="#3b82f6"/>
      <circle cx="46" cy="27" r="3" fill="#8b5cf6"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function makeImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function buildProjectileImages() {
  const result = {};
  LANGUAGES.forEach((language) => {
    result[language.name] = makeImage(createLogoDataUrl(language));
  });
  result.__heart = makeImage(createHeartDataUrl());
  result.__shield = makeImage(createShieldDataUrl());
  result.__rainbow = makeImage(createRainbowDataUrl());
  return result;
}

function randomEdgeSpawn() {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) return { x: Math.random() * WIDTH, y: -28 };
  if (edge === 1) return { x: WIDTH + 28, y: Math.random() * HEIGHT };
  if (edge === 2) return { x: Math.random() * WIDTH, y: HEIGHT + 28 };
  return { x: -28, y: Math.random() * HEIGHT };
}

function createProjectile(elapsedMs) {
  const spawn = randomEdgeSpawn();
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  const dx = centerX - spawn.x + (Math.random() - 0.5) * 220;
  const dy = centerY - spawn.y + (Math.random() - 0.5) * 220;
  const len = Math.hypot(dx, dy) || 1;
  const difficulty = Math.min(1 + elapsedMs / 25000, 2.5);
  const speed = (120 + Math.random() * 140) * difficulty;
  const language = randomItem(LANGUAGES);

  return {
    id: Math.random().toString(36).slice(2),
    kind: "projectile",
    x: spawn.x,
    y: spawn.y,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
    r: PROJECTILE_RADIUS,
    char: language.name[0].toUpperCase(),
    label: language.name,
    color: language.color,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 1.5,
  };
}

function createPickup(kind, elapsedMs) {
  const spawn = randomEdgeSpawn();
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  const dx = centerX - spawn.x + (Math.random() - 0.5) * 180;
  const dy = centerY - spawn.y + (Math.random() - 0.5) * 180;
  const len = Math.hypot(dx, dy) || 1;
  const baseSpeed = kind === "heart" ? 95 : kind === "shield" ? 105 : 115;
  const speed = baseSpeed * Math.min(1 + elapsedMs / 40000, 1.6);
  const r = kind === "heart" ? HEART_RADIUS : kind === "shield" ? SHIELD_RADIUS : RAINBOW_RADIUS;
  const label = kind === "heart" ? "__heart" : kind === "shield" ? "__shield" : "__rainbow";

  return {
    id: Math.random().toString(36).slice(2),
    kind,
    x: spawn.x,
    y: spawn.y,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
    r,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.9,
    label,
  };
}

function createInitialGameState() {
  return {
    player: {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      size: PLAYER_SIZE,
      invincibleUntil: 0,
      shieldUntil: 0,
    },
    projectiles: [],
    lives: INITIAL_LIVES,
    score: 0,
    elapsedMs: 0,
    spawnTimer: 0,
    heartSpawnTimer: 0,
    shieldSpawnTimer: 0,
    rainbowSpawnTimer: 0,
    running: false,
    endingMessage: randomItem(END_MESSAGES),
    slowMode: false,
    rainbowTextUntil: 0,
    bonusModeUntil: 0,
    bonusShieldQueued: false,
  };
}

function App() {
  const [phase, setPhase] = useState("ready");
  const [rankingName, setRankingName] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [finalEndingMessage, setFinalEndingMessage] = useState("");
  const [avatarReady, setAvatarReady] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bullet-hell-rank") || "[]");
    } catch {
      return [];
    }
  });

  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const gameRef = useRef(createInitialGameState());
  const projectileImagesRef = useRef(null);

  const avatar = useMemo(() => {
    const img = new Image();
    img.onload = () => {
      setAvatarReady(true);
      setAvatarBroken(false);
    };
    img.onerror = () => {
      setAvatarReady(false);
      setAvatarBroken(true);
    };
    img.src = AVATAR;
    return img;
  }, []);

  const projectileImages = useMemo(() => buildProjectileImages(), []);

  useEffect(() => {
    projectileImagesRef.current = projectileImages;
  }, [projectileImages]);

  useEffect(() => {
    const trackedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", " ", "Space", "Spacebar"];

    const down = (e) => {
      if (trackedKeys.includes(e.key)) {
        e.preventDefault();
        keysRef.current[normalizeKey(e.key)] = true;
      }
    };

    const up = (e) => {
      if (trackedKeys.includes(e.key)) {
        e.preventDefault();
        keysRef.current[normalizeKey(e.key)] = false;
      }
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let last = performance.now();

    const render = () => {
      const now = performance.now();
      const rawDt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const state = gameRef.current;

      if (phase === "playing" && state.running) {
        updateGame(state, rawDt, now, keysRef.current, () => {
          state.running = false;
          setFinalScore(state.score);
          setFinalTime(state.elapsedMs / 1000);
          setFinalEndingMessage(state.endingMessage);
          setPhase("gameover");
        });
      }

      drawGame(
        ctx,
        state,
        phase,
        {
          image: avatar,
          ready: avatarReady,
          broken: avatarBroken,
        },
        projectileImagesRef.current || {},
      );

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [phase, avatar, avatarReady, avatarBroken]);

  const startGame = () => {
    gameRef.current = createInitialGameState();
    gameRef.current.running = true;
    setRankingName("");
    setFinalScore(0);
    setFinalTime(0);
    setFinalEndingMessage("");
    setPhase("playing");
  };

  const saveRank = () => {
    const trimmed = rankingName.trim().slice(0, NAME_LIMIT);
    if (!trimmed) return;

    const updated = [...leaderboard, { name: trimmed, score: finalScore, time: finalTime }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updated);
    localStorage.setItem("bullet-hell-rank", JSON.stringify(updated));
    setPhase("ready");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-4 px-2 gap-4">
            <div>
              <h1 className="text-3xl font-bold">알파벳 피하기</h1>
              <p className="text-zinc-400 text-sm mt-1">[Shift] 가속, [Space] 슬로우 모드입니다.</p>
            </div>
            <button
              onClick={startGame}
              disabled={phase === "playing"}
              className={`px-4 py-2 rounded-2xl font-semibold transition ${
                phase === "playing"
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-white text-zinc-950 hover:scale-105"
              }`}
            >
              {phase === "playing" ? "플레이 중" : "다시하기"}
            </button>
          </div>

          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950"
          />

          {!avatarReady && (
            <p className="text-xs text-zinc-500 mt-3 px-1">
              {avatarBroken ? "캐릭터 이미지를 불러오지 못해 기본 원형 캐릭터로 표시 중입니다." : "캐릭터 이미지 로딩 중..."}
            </p>
          )}
          <p className="text-xs text-zinc-500 mt-2 px-1">
            Shift + 방향키: 가속 이동 / Space: 시간과 탄막, 플레이어 모두 감속 / 하트: 라이프 +1 / 실드: 3초 무적 / 무지개: 화면 탄막 제거 / 라이프 10: 히든 보너스 패턴
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
            <h2 className="text-xl font-semibold mb-3">게임 규칙</h2>
            <div className="space-y-2 text-sm text-zinc-300 leading-6">
              <p>• 라이프: {INITIAL_LIVES}개, 최대 {MAX_LIVES}개</p>
              <p>• 라이프가 10이 되면 히든 보너스 패턴이 시작됩니다.</p>
              <p>• 보너스 패턴 진입 시 라이프 5가 감소하고, 5초 동안 노란 테두리 패턴이 진행됩니다.</p>
              <p>• 보너스 패턴 중에는 충돌할 때마다 점수 30점을 획득하고 라이프는 줄지 않습니다.</p>
              <p>• 보너스 패턴 종료 후에는 실드 효과가 3초 동안 유지됩니다.</p>
              <p>• 프로그래밍 언어별 이미지 탄막을 피해야 합니다.</p>
              <p>• Shift를 누른 채 이동하면 이동 속도가 증가합니다.</p>
              <p>• Space를 누르면 플레이어, 탄막, 시간 흐름이 모두 느려집니다.</p>
              <p>• 하트 이미지를 먹으면 라이프가 1 증가합니다.</p>
              <p>• 실드 이미지를 먹으면 3초 동안 무적이고 노란 그림자가 강하게 생깁니다.</p>
              <p>• 무지개 이미지를 먹으면 RAINBOW 텍스트가 뜨고 현재 화면의 일반 탄막이 모두 제거됩니다.</p>
              <p>• 플레이 중에는 다시하기 버튼이 비활성화됩니다.</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
            <h2 className="text-xl font-semibold mb-3">현재 상태</h2>
            <StatusPanel phase={phase} state={gameRef.current} finalScore={finalScore} finalTime={finalTime} />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
            <h2 className="text-xl font-semibold mb-3">등장 알파벳</h2>
            <p className="text-sm text-zinc-400 leading-6">{LANGUAGE_INITIALS.join(", ")}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
            <h2 className="text-xl font-semibold mb-3">랭킹 TOP 10</h2>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-zinc-400">아직 등록된 기록이 없습니다.</p>
              ) : (
                leaderboard.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex items-center justify-between rounded-2xl bg-zinc-800/70 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-zinc-400">#{idx + 1}</span>
                      <span>{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.score}점</div>
                      <div className="text-zinc-400 text-xs">{item.time.toFixed(1)}초</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {phase === "gameover" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">게임 종료</h2>
            <p className="text-zinc-200 mb-3 leading-7">{finalEndingMessage}</p>
            <p className="text-zinc-300 mb-1">생존 시간: {finalTime.toFixed(1)}초</p>
            <p className="text-zinc-300 mb-4">최종 점수: {finalScore}점</p>
            <label className="block text-sm text-zinc-400 mb-2">플레이어 이름</label>
            <input
              value={rankingName}
              onChange={(e) => setRankingName(e.target.value.slice(0, NAME_LIMIT))}
              onKeyDown={(e) => e.key === "Enter" && saveRank()}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 px-4 py-3 outline-none focus:border-white"
              placeholder="이름을 입력하세요"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveRank}
                className="flex-1 rounded-2xl bg-white text-zinc-950 font-semibold py-3 hover:scale-[1.02] transition"
              >
                랭킹 등록
              </button>
              <button
                onClick={startGame}
                className="flex-1 rounded-2xl bg-zinc-800 text-white font-semibold py-3 hover:bg-zinc-700 transition"
              >
                다시 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeKey(key) {
  if (key === " " || key === "Spacebar" || key === "Space") return "Space";
  return key;
}

function StatusPanel({ phase, state, finalScore, finalTime }) {
  const lives = phase === "gameover" ? 0 : state.lives;
  const score = phase === "gameover" ? finalScore : state.score;
  const time = phase === "gameover" ? finalTime : state.elapsedMs / 1000;
  const shieldLeft = Math.max(0, (state.player.shieldUntil - performance.now()) / 1000);
  const bonusLeft = Math.max(0, (state.bonusModeUntil - performance.now()) / 1000);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-zinc-400">상태</span>
        <span>{phase === "playing" ? "플레이 중" : phase === "gameover" ? "게임 종료" : "대기 중"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-zinc-400">라이프</span>
        <span>{"❤ ".repeat(Math.max(lives, 0)) || "없음"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-zinc-400">점수</span>
        <span>{score}점</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-zinc-400">생존 시간</span>
        <span>{time.toFixed(1)}초</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-zinc-400">슬로우 모드</span>
        <span>{state.slowMode ? "활성" : "비활성"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-zinc-400">실드</span>
        <span>{shieldLeft > 0 ? `${shieldLeft.toFixed(1)}초` : "없음"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-zinc-400">보너스 패턴</span>
        <span>{bonusLeft > 0 ? `${bonusLeft.toFixed(1)}초` : "없음"}</span>
      </div>
      <div className="text-zinc-500 pt-2">조작: ← ↑ ↓ → / Shift / Space</div>
    </div>
  );
}

function updateGame(state, rawDt, now, activeKeys, onGameOver) {
  const isSlowMode = !!activeKeys.Space;
  state.slowMode = isSlowMode;

  const timeScale = isSlowMode ? 0.42 : 1;
  const dt = rawDt * timeScale;
  const shiftBoost = activeKeys.Shift ? 1.65 : 1;
  const playerBaseSpeed = 290;
  const playerSpeed = playerBaseSpeed * shiftBoost * (isSlowMode ? 0.55 : 1);
  const move = { x: 0, y: 0 };

  if (activeKeys.ArrowLeft) move.x -= 1;
  if (activeKeys.ArrowRight) move.x += 1;
  if (activeKeys.ArrowUp) move.y -= 1;
  if (activeKeys.ArrowDown) move.y += 1;

  const len = Math.hypot(move.x, move.y) || 1;
  state.player.x = clamp(
    state.player.x + (move.x / len) * playerSpeed * rawDt,
    state.player.size / 2,
    WIDTH - state.player.size / 2,
  );
  state.player.y = clamp(
    state.player.y + (move.y / len) * playerSpeed * rawDt,
    state.player.size / 2,
    HEIGHT - state.player.size / 2,
  );

  const wasBonusActive = now < state.bonusModeUntil;

  state.elapsedMs += dt * 1000;
  state.score = Math.floor((state.elapsedMs / 1000) * 10);

  if (!wasBonusActive && state.bonusShieldQueued) {
    state.player.shieldUntil = Math.max(state.player.shieldUntil, now) + 3000;
    state.bonusShieldQueued = false;
  }

  if (!wasBonusActive && state.lives >= MAX_LIVES) {
    state.lives = Math.max(0, state.lives - BONUS_ENTRY_COST);
    state.bonusModeUntil = now + BONUS_PATTERN_DURATION;
    state.bonusShieldQueued = true;
  }

  const isBonusActive = now < state.bonusModeUntil;

  const projectileInterval = Math.max(0.18, 0.68 - state.elapsedMs / 18000);
  state.spawnTimer += dt;
  while (state.spawnTimer >= projectileInterval) {
    state.spawnTimer -= projectileInterval;
    state.projectiles.push(createProjectile(state.elapsedMs));
  }

  state.heartSpawnTimer += dt;
  if (state.heartSpawnTimer >= 9.5) {
    state.heartSpawnTimer = 0;
    state.projectiles.push(createPickup("heart", state.elapsedMs));
  }

  state.shieldSpawnTimer += dt;
  if (state.shieldSpawnTimer >= 13.5) {
    state.shieldSpawnTimer = 0;
    state.projectiles.push(createPickup("shield", state.elapsedMs));
  }

  state.rainbowSpawnTimer += dt;
  if (state.rainbowSpawnTimer >= 17.5) {
    state.rainbowSpawnTimer = 0;
    state.projectiles.push(createPickup("rainbow", state.elapsedMs));
  }

  state.projectiles = state.projectiles
    .map((projectile) => ({
      ...projectile,
      x: projectile.x + projectile.vx * dt,
      y: projectile.y + projectile.vy * dt,
      angle: projectile.angle + projectile.spin * dt,
    }))
    .filter(
      (projectile) =>
        projectile.x > -80 &&
        projectile.x < WIDTH + 80 &&
        projectile.y > -80 &&
        projectile.y < HEIGHT + 80,
    );

  const nextProjectiles = [];
  const shieldActive = now < state.player.shieldUntil;

  for (const projectile of state.projectiles) {
    const dx = projectile.x - state.player.x;
    const dy = projectile.y - state.player.y;
    const dist = Math.hypot(dx, dy);
    const hit = dist < projectile.r + state.player.size * 0.34;

    if (!hit) {
      nextProjectiles.push(projectile);
      continue;
    }

    if (isBonusActive) {
      state.score += BONUS_COLLISION_SCORE;
      continue;
    }

    if (projectile.kind === "heart") {
      state.lives = Math.min(MAX_LIVES, state.lives + 1);
      continue;
    }

    if (projectile.kind === "shield") {
      state.player.shieldUntil = Math.max(state.player.shieldUntil, now) + 3000;
      continue;
    }

    if (projectile.kind === "rainbow") {
      state.rainbowTextUntil = now + 1500;
      state.projectiles = nextProjectiles.filter((item) => item.kind !== "projectile");
      return;
    }

    if (shieldActive) {
      continue;
    }

    if (now > state.player.invincibleUntil) {
      state.lives -= 1;
      state.player.invincibleUntil = now + 1000;
      if (state.lives <= 0) {
        state.lives = 0;
        onGameOver();
        state.projectiles = nextProjectiles;
        return;
      }
      continue;
    }

    nextProjectiles.push(projectile);
  }

  state.projectiles = nextProjectiles;
}

function drawFallbackPlayer(ctx, state, shieldActive) {
  const { x, y, size } = state.player;

  ctx.save();
  if (shieldActive) {
    ctx.shadowBlur = 40;
    ctx.shadowColor = "rgba(250, 204, 21, 1)";
  }
  ctx.fillStyle = "#fafafa";
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = shieldActive ? "rgba(250, 204, 21, 1)" : "rgba(255,255,255,0.85)";
  ctx.lineWidth = shieldActive ? 3 : 2;
  ctx.beginPath();
  ctx.arc(x, y, size / 2 + 6, 0, Math.PI * 2);
  ctx.stroke();

  if (shieldActive) {
    ctx.strokeStyle = "rgba(253, 224, 71, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size / 2 + 11, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(x - 7, y - 4, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 7, y - 4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + 2, 8, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();
}

function drawPlayer(ctx, state, avatar) {
  const blink = performance.now() < state.player.invincibleUntil && Math.floor(performance.now() / 100) % 2 === 0;
  if (blink) return;

  const shieldActive = performance.now() < state.player.shieldUntil;

  if (avatar.ready && avatar.image?.complete && avatar.image.naturalWidth > 0) {
    ctx.save();
    if (shieldActive) {
      ctx.shadowBlur = 44;
      ctx.shadowColor = "rgba(250, 204, 21, 1)";
    }
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.size / 2 + 4, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      avatar.image,
      state.player.x - state.player.size / 2,
      state.player.y - state.player.size / 2,
      state.player.size,
      state.player.size,
    );
    ctx.restore();

    ctx.strokeStyle = shieldActive ? "rgba(250, 204, 21, 1)" : "rgba(255,255,255,0.85)";
    ctx.lineWidth = shieldActive ? 3 : 2;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.size / 2 + 6, 0, Math.PI * 2);
    ctx.stroke();

    if (shieldActive) {
      ctx.strokeStyle = "rgba(253, 224, 71, 0.82)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, state.player.size / 2 + 11, 0, Math.PI * 2);
      ctx.stroke();
    }
    return;
  }

  drawFallbackPlayer(ctx, state, shieldActive);
}

function drawProjectile(ctx, projectile, projectileImages) {
  const image = projectileImages?.[projectile.label];
  ctx.save();
  ctx.translate(projectile.x, projectile.y);
  ctx.rotate(projectile.angle);

  ctx.beginPath();
  ctx.fillStyle = projectile.kind === "heart"
    ? "rgba(244, 63, 94, 0.10)"
    : projectile.kind === "shield"
      ? "rgba(250, 204, 21, 0.16)"
      : projectile.kind === "rainbow"
        ? "rgba(59, 130, 246, 0.14)"
        : "rgba(244, 63, 94, 0.10)";
  ctx.arc(0, 0, projectile.r + 9, 0, Math.PI * 2);
  ctx.fill();

  if (projectile.kind === "shield") {
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(250, 204, 21, 0.95)";
  } else if (projectile.kind === "rainbow") {
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(147, 197, 253, 0.9)";
  }

  if (image?.complete && image.naturalWidth > 0) {
    ctx.drawImage(image, -projectile.r, -projectile.r, projectile.r * 2, projectile.r * 2);
  } else {
    ctx.beginPath();
    ctx.fillStyle = projectile.color || (projectile.kind === "shield" ? "#facc15" : projectile.kind === "rainbow" ? "#60a5fa" : "#f43f5e");
    ctx.arc(0, 0, projectile.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(projectile.kind === "heart" ? "+" : projectile.kind === "shield" ? "S" : projectile.kind === "rainbow" ? "R" : projectile.char, 0, 1);
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawRainbowText(ctx, untilTime) {
  const now = performance.now();
  if (now >= untilTime) return;
  const alpha = Math.min(1, (untilTime - now) / 1000);
  const text = "RAINBOW";
  const spacing = 42;
  const startX = WIDTH / 2 - ((text.length - 1) * spacing) / 2;
  const y = HEIGHT / 2 - 70;

  ctx.save();
  ctx.font = "900 56px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < text.length; i += 1) {
    ctx.fillStyle = `${RAINBOW_COLORS[i % RAINBOW_COLORS.length]}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
    ctx.shadowBlur = 20;
    ctx.shadowColor = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
    ctx.fillText(text[i], startX + i * spacing, y + Math.sin((now / 120) + i) * 6);
  }
  ctx.restore();
}

function drawGame(ctx, state, phase, avatar, projectileImages) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, state.slowMode ? "#050816" : "#09090b");
  gradient.addColorStop(1, state.slowMode ? "#111827" : "#18181b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const bonusLeftMs = Math.max(0, state.bonusModeUntil - performance.now());
  const bonusRatio = bonusLeftMs > 0 ? bonusLeftMs / BONUS_PATTERN_DURATION : 0;

  ctx.strokeStyle = bonusRatio > 0
    ? "rgba(250, 204, 21, 0.95)"
    : state.slowMode
      ? "rgba(96,165,250,0.24)"
      : "rgba(255,255,255,0.12)";
  ctx.lineWidth = bonusRatio > 0 ? 6 : 4;
  ctx.strokeRect(6, 6, WIDTH - 12, HEIGHT - 12);

  if (bonusRatio > 0) {
    const perimeter = 2 * ((WIDTH - 12) + (HEIGHT - 12));
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([perimeter * bonusRatio, perimeter]);
    ctx.lineDashOffset = 0;
    ctx.strokeStyle = "rgba(253, 224, 71, 1)";
    ctx.lineWidth = 8;
    ctx.shadowBlur = 24;
    ctx.shadowColor = "rgba(250, 204, 21, 0.95)";
    ctx.strokeRect(6, 6, WIDTH - 12, HEIGHT - 12);
    ctx.restore();
  }

  for (let i = 0; i < 40; i += 1) {
    const x = (i * 137) % WIDTH;
    const y = (i * 97) % HEIGHT;
    ctx.fillStyle = state.slowMode ? "rgba(96,165,250,0.08)" : "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const projectile of state.projectiles) {
    drawProjectile(ctx, projectile, projectileImages);
  }

  drawPlayer(ctx, state, avatar);
  drawRainbowText(ctx, state.rainbowTextUntil);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 18px sans-serif";
  ctx.fillText(`LIFE: ${state.lives}`, 22, 34);
  ctx.fillText(`SCORE: ${state.score}`, 22, 60);
  ctx.fillText(`TIME: ${(state.elapsedMs / 1000).toFixed(1)}s`, 22, 86);
  ctx.fillText(`SLOW: ${state.slowMode ? "ON" : "OFF"}`, 22, 112);
  if (bonusRatio > 0) {
    ctx.fillStyle = "rgba(253, 224, 71, 0.98)";
    ctx.fillText(`BONUS: ${(bonusLeftMs / 1000).toFixed(1)}s`, 22, 138);
  }

  if (phase === "ready") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "700 34px sans-serif";
    ctx.fillText("알파벳 피하기", WIDTH / 2, HEIGHT / 2 - 18);
    ctx.font = "400 20px sans-serif";
    ctx.fillText("Shift: 가속 / Space: 슬로우 모드 / 하트·실드·무지개를 먹어보세요", WIDTH / 2, HEIGHT / 2 + 24);
    ctx.textAlign = "start";
  }
}

function runDevTests() {
  console.assert(clamp(5, 0, 10) === 5, "clamp should keep in-range values");
  console.assert(clamp(-1, 0, 10) === 0, "clamp should cap low values");
  console.assert(clamp(99, 0, 10) === 10, "clamp should cap high values");

  const spawn = randomEdgeSpawn();
  const onEdge =
    spawn.y === -28 ||
    spawn.x === WIDTH + 28 ||
    spawn.y === HEIGHT + 28 ||
    spawn.x === -28;
  console.assert(onEdge, "randomEdgeSpawn should create projectiles on the border");

  const projectile = createProjectile(1000);
  console.assert(typeof projectile.x === "number" && typeof projectile.vx === "number", "createProjectile should return numeric position and velocity");
  console.assert(projectile.char === projectile.char.toUpperCase(), "projectile char should be uppercase");
  console.assert(LANGUAGE_INITIALS.includes(projectile.char), "projectile char should come from programming languages");

  const heart = createPickup("heart", 1000);
  const shield = createPickup("shield", 1000);
  const rainbow = createPickup("rainbow", 1000);
  console.assert(heart.kind === "heart", "heart pickup should be created");
  console.assert(shield.kind === "shield", "shield pickup should be created");
  console.assert(rainbow.kind === "rainbow", "rainbow pickup should be created");

  const bonusState = createInitialGameState();
  bonusState.lives = MAX_LIVES;
  updateGame(bonusState, 0.016, 1000, {}, () => {});
  console.assert(bonusState.bonusModeUntil > 1000, "bonus mode should start when life reaches max");
  console.assert(bonusState.lives === MAX_LIVES - BONUS_ENTRY_COST, "bonus mode should consume 5 life on entry");

  const bonusCollisionState = createInitialGameState();
  bonusCollisionState.bonusModeUntil = 5000;
  bonusCollisionState.projectiles = [{ id: "x", kind: "projectile", x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0, r: 20, angle: 0, spin: 0, label: LANGUAGES[0].name, char: "C", color: LANGUAGES[0].color }];
  const scoreBefore = bonusCollisionState.score;
  updateGame(bonusCollisionState, 0.016, 1000, {}, () => {});
  console.assert(bonusCollisionState.score >= scoreBefore + BONUS_COLLISION_SCORE, "bonus mode collision should add bonus score");

  const images = buildProjectileImages();
  console.assert(Object.keys(images).length === LANGUAGES.length + 3, "Each language plus heart, shield, rainbow should have generated images");

  console.assert(normalizeKey(" ") === "Space", "space key should normalize");
  console.assert(normalizeKey("Shift") === "Shift", "shift key should stay unchanged");
}

if (typeof window !== "undefined") {
  runDevTests();
}

export default App;
