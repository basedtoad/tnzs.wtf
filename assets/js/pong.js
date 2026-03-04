/* ==========================================================================
   pong.js — Canvas Pong game
   Player: left paddle (W/S or ↑/↓ or touch)  — pink
   AI:     right paddle (auto-tracks ball)      — blue

   Court layout:
     |<--goal area-->|<-------field------->|<--goal area-->|
     0             GOAL_X               W-GOAL_X           W

   Ball bounces off all 4 canvas walls. Scoring happens when the ball
   exits the goal area back into the field (crossing the goal line).
   ========================================================================== */

(function () {
  'use strict';

  const canvas = document.getElementById('pong-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const W = 800;
  const H = 500;
  canvas.width  = W;
  canvas.height = H;

  /* --- Design tokens --- */
  const COLOR_BG    = '#141414';
  const COLOR_WHITE = '#FFFFFF';
  const COLOR_PINK  = '#F280AA';
  const COLOR_BLUE  = '#4DA6FF';
  const FONT_HEADING = '"BBH Bartle", serif';
  const FONT_BODY    = '"Outfit", sans-serif';

  /* --- Constants --- */
  const GOAL_X     = 40;    // goal line x from each edge (smaller = closer to edge)
  const PADDLE_W   = 10;
  const PADDLE_H   = 80;
  const PADDLE_SPD = 7;
  const BALL_R     = 7;
  const SPEED_INIT = 3.5;
  const SPEED_MAX  = 15;
  const SPEED_INC  = 0.35;
  const AI_SPEED   = 3.5;
  const WIN_SCORE  = 7;

  /* --- State --- */
  let gameState = 'idle';
  let score     = { p: 0, ai: 0 };
  let player    = { y: H / 2 - PADDLE_H / 2 };
  let ai        = { y: H / 2 - PADDLE_H / 2 };
  let ball      = makeBall();

  /* --- Input --- */
  const keys  = {};
  const touch = { up: false, down: false };

  document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown', ' '].includes(e.key) && gameState === 'playing') {
      e.preventDefault();
    }
    if (e.key === ' ' || e.key === 'Enter') handleInteract();
    if (e.key === 'Escape') {
      if (gameState === 'playing') gameState = 'paused';
      else if (gameState === 'paused') gameState = 'playing';
    }
  });
  document.addEventListener('keyup', function (e) { keys[e.key] = false; });

  var btnUp   = document.getElementById('pong-touch-up');
  var btnDown = document.getElementById('pong-touch-down');
  if (btnUp) {
    btnUp.addEventListener('touchstart',  function (e) { e.preventDefault(); touch.up = true;  }, { passive: false });
    btnUp.addEventListener('touchend',    function (e) { e.preventDefault(); touch.up = false; }, { passive: false });
    btnUp.addEventListener('touchcancel', function ()  { touch.up = false; });
  }
  if (btnDown) {
    btnDown.addEventListener('touchstart',  function (e) { e.preventDefault(); touch.down = true;  }, { passive: false });
    btnDown.addEventListener('touchend',    function (e) { e.preventDefault(); touch.down = false; }, { passive: false });
    btnDown.addEventListener('touchcancel', function ()  { touch.down = false; });
  }

  canvas.addEventListener('click', handleInteract);
  canvas.addEventListener('touchend', function (e) { e.preventDefault(); handleInteract(); }, { passive: false });

  function handleInteract() {
    if (gameState === 'idle' || gameState === 'gameover') startGame();
    else if (gameState === 'playing') gameState = 'paused';
    else if (gameState === 'paused')  gameState = 'playing';
  }

  /* --- Helpers --- */
  function makeBall() {
    var angle = (Math.random() * Math.PI / 2.5) - Math.PI / 5;
    var dir   = Math.random() < 0.5 ? 1 : -1;
    return {
      x: W / 2, y: H / 2,
      dx: dir * SPEED_INIT * Math.cos(angle),
      dy: SPEED_INIT * Math.sin(angle),
      speed: SPEED_INIT,
    };
  }

  function startGame() {
    score     = { p: 0, ai: 0 };
    player.y  = H / 2 - PADDLE_H / 2;
    ai.y      = H / 2 - PADDLE_H / 2;
    ball      = makeBall();
    gameState = 'playing';
  }

  function fillRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }
    ctx.fill();
  }

  /* --- Update --- */
  function update() {
    if (gameState !== 'playing') return;

    /* Player movement */
    var goUp   = keys['w'] || keys['W'] || keys['ArrowUp']  || touch.up;
    var goDown = keys['s'] || keys['S'] || keys['ArrowDown'] || touch.down;
    if (goUp)   player.y = Math.max(0,            player.y - PADDLE_SPD);
    if (goDown) player.y = Math.min(H - PADDLE_H, player.y + PADDLE_SPD);

    /* AI movement */
    var aiCenter = ai.y + PADDLE_H / 2;
    if (aiCenter < ball.y - 3) ai.y = Math.min(H - PADDLE_H, ai.y + AI_SPEED);
    else if (aiCenter > ball.y + 3) ai.y = Math.max(0, ai.y - AI_SPEED);

    /* Capture previous x for goal-crossing detection */
    var prevX = ball.x;

    /* Ball movement */
    ball.x += ball.dx;
    ball.y += ball.dy;

    /* Top / bottom wall bounce */
    if (ball.y - BALL_R <= 0) { ball.y = BALL_R;      ball.dy =  Math.abs(ball.dy); }
    if (ball.y + BALL_R >= H) { ball.y = H - BALL_R;  ball.dy = -Math.abs(ball.dy); }

    /* Left canvas wall bounce (back of left goal) */
    if (ball.x - BALL_R <= 0) { ball.x = BALL_R; ball.dx = Math.abs(ball.dx); }

    /* Right canvas wall bounce (back of right goal) */
    if (ball.x + BALL_R >= W) { ball.x = W - BALL_R; ball.dx = -Math.abs(ball.dx); }

    /* Left paddle (player) — only intercepts ball heading left */
    var px = GOAL_X;
    if (
      ball.dx < 0 &&
      ball.x - BALL_R <= px + PADDLE_W &&
      ball.x + BALL_R >= px &&
      ball.y + BALL_R >= player.y &&
      ball.y - BALL_R <= player.y + PADDLE_H
    ) {
      ball.x = px + PADDLE_W + BALL_R;
      var relHit = (ball.y - (player.y + PADDLE_H / 2)) / (PADDLE_H / 2);
      var angle  = relHit * (Math.PI / 3);
      ball.speed = Math.min(SPEED_MAX, ball.speed + SPEED_INC);
      ball.dx    =  ball.speed * Math.cos(angle);
      ball.dy    =  ball.speed * Math.sin(angle);
    }

    /* Right paddle (AI) — only intercepts ball heading right */
    var ax = W - GOAL_X - PADDLE_W;
    if (
      ball.dx > 0 &&
      ball.x + BALL_R >= ax &&
      ball.x - BALL_R <= ax + PADDLE_W &&
      ball.y + BALL_R >= ai.y &&
      ball.y - BALL_R <= ai.y + PADDLE_H
    ) {
      ball.x = ax - BALL_R;
      var relHit2 = (ball.y - (ai.y + PADDLE_H / 2)) / (PADDLE_H / 2);
      var angle2  = relHit2 * (Math.PI / 3);
      ball.speed  = Math.min(SPEED_MAX, ball.speed + SPEED_INC);
      ball.dx     = -ball.speed * Math.cos(angle2);
      ball.dy     =  ball.speed * Math.sin(angle2);
    }

    /*
     * Scoring — goal line crossing detection.
     * Score is awarded when the ball EXITS the goal area back into the field:
     *   prevX was in goal area  →  ball.x is now in field  =  point
     * This also covers "back of the post": ball bounced off the canvas wall
     * and crossed the goal line coming back — still counts.
     */
    if (prevX < GOAL_X && ball.x >= GOAL_X) {
      score.ai++;
      ball = makeBall();
      if (score.ai >= WIN_SCORE) gameState = 'gameover';
    }
    if (prevX > W - GOAL_X && ball.x <= W - GOAL_X) {
      score.p++;
      ball = makeBall();
      if (score.p >= WIN_SCORE) gameState = 'gameover';
    }
  }

  /* --- Draw --- */
  function draw() {
    /* Background */
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, W, H);

    /* Goal lines — solid white verticals */
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth   = 4;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(GOAL_X, 0);     ctx.lineTo(GOAL_X, H);     ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - GOAL_X, 0); ctx.lineTo(W - GOAL_X, H); ctx.stroke();

    /* Center dividing line — white dashes, wider */
    ctx.save();
    ctx.setLineDash([10, 14]);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth   = 4;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.restore();

    /* Scores — tinted to match paddle colors */
    ctx.font         = '600 60px ' + FONT_HEADING;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle    = 'rgba(242,128,170,0.2)';
    ctx.fillText(score.p, W / 2 - 72, 18);
    ctx.fillStyle    = 'rgba(77,166,255,0.2)';
    ctx.fillText(score.ai, W / 2 + 72, 18);

    /* Paddles */
    ctx.fillStyle = COLOR_PINK;
    fillRoundRect(GOAL_X, player.y, PADDLE_W, PADDLE_H, 4);
    ctx.fillStyle = COLOR_BLUE;
    fillRoundRect(W - GOAL_X - PADDLE_W, ai.y, PADDLE_W, PADDLE_H, 4);

    /* Ball — white, motion stretch, no glow */
    drawBall();

    /* State overlays */
    if (gameState === 'idle') {
      drawOverlay('PONG', 'Press Space or tap to play');
    } else if (gameState === 'paused') {
      drawOverlay('PAUSED', 'Press Space or tap to resume');
    } else if (gameState === 'gameover') {
      drawOverlay(score.p >= WIN_SCORE ? 'YOU WIN' : 'YOU LOSE', 'Press Space or tap to play again');
    }
  }

  function drawBall() {
    var angle   = Math.atan2(ball.dy, ball.dx);
    var ratio   = Math.max(0, (ball.speed - SPEED_INIT) / (SPEED_MAX - SPEED_INIT));
    var stretch = 1 + ratio * 1.4;
    var squash  = 1 / Math.sqrt(stretch);

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(angle);
    ctx.scale(stretch, squash);
    ctx.fillStyle = COLOR_WHITE;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawOverlay(title, hint) {
    ctx.fillStyle = 'rgba(20,20,20,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.font         = '600 76px ' + FONT_HEADING;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = COLOR_WHITE;
    ctx.fillText(title, W / 2, H / 2 - 22);
    ctx.font      = '400 15px ' + FONT_BODY;
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.fillText(hint, W / 2, H / 2 + 22);
  }

  /* --- Loop --- */
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { requestAnimationFrame(loop); });
  } else {
    requestAnimationFrame(loop);
  }

})();
