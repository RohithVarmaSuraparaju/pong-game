const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 18;
const PADDLE_SPEED = 7;

// Ball settings
const BALL_SIZE = 16;
const BALL_INITIAL_SPEED = 5;
const BALL_MAX_SPEED = 14;
const BALL_SPEED_INCREASE = 0.6;

// Game state
let leftPaddleY, rightPaddleY;
let ballX, ballY, ballSpeedX, ballSpeedY, ballSpeed;
let leftScore, rightScore;
let particles = [];
let isGameOver = false;
let winner = "";
let lastTime = performance.now();
let fps = 0, frameCount = 0, fpsTime = 0;

// Sound effects
const wallSound = new Audio("https://cdn.jsdelivr.net/gh/rohitvarma-suraparaju/sounds/pong_wall.wav");
const paddleSound = new Audio("https://cdn.jsdelivr.net/gh/rohitvarma-suraparaju/sounds/pong_paddle.wav");
const scoreSound = new Audio("https://cdn.jsdelivr.net/gh/rohitvarma-suraparaju/sounds/pong_score.wav");

// Utility functions
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function resetBall(direction = 1) {
    ballX = WIDTH / 2 - BALL_SIZE / 2;
    ballY = HEIGHT / 2 - BALL_SIZE / 2;
    ballSpeed = BALL_INITIAL_SPEED;
    ballSpeedX = ballSpeed * direction;
    ballSpeedY = ballSpeed * (Math.random() * 2 - 1);
}

function resetGame() {
    leftScore = 0;
    rightScore = 0;
    leftPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    rightPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    isGameOver = false;
    winner = "";
    overlay.hidden = true;
    resetBall(Math.random() < 0.5 ? 1 : -1);
}

function showOverlay(text) {
    message.textContent = text;
    overlay.hidden = false;
}

// Mouse and touch controls for left paddle
canvas.addEventListener("mousemove", function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddleY = clamp(mouseY - PADDLE_HEIGHT / 2, 0, HEIGHT - PADDLE_HEIGHT);
});
canvas.addEventListener("touchmove", function(e) {
    if (e.touches.length) {
        const rect = canvas.getBoundingClientRect();
        const touchY = e.touches[0].clientY - rect.top;
        leftPaddleY = clamp(touchY - PADDLE_HEIGHT / 2, 0, HEIGHT - PADDLE_HEIGHT);
    }
}, {passive: false});

restartBtn.addEventListener("click", resetGame);

// Particle effects for collisions
function spawnParticles(x, y, color) {
    for (let i = 0; i < 14; i++) {
        particles.push({
            x, y,
            dx: Math.cos(Math.random() * 2 * Math.PI) * (1.5 + Math.random() * 3),
            dy: Math.sin(Math.random() * 2 * Math.PI) * (1.5 + Math.random() * 3),
            life: 22 + Math.random() * 18,
            color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    for (let p of particles) {
        ctx.globalAlpha = Math.max(p.life / 30, 0.2);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Draw helpers
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function drawText(text, x, y, color, font = "40px Arial") {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}

// Advanced AI: Predict ball trajectory and move smoothly
function predictBallY() {
    let simX = ballX, simY = ballY, simDX = ballSpeedX, simDY = ballSpeedY;
    while (simX < WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE) {
        simX += simDX;
        simY += simDY;
        if (simY < 0 || simY + BALL_SIZE > HEIGHT) simDY *= -1;
    }
    return simY;
}

function update() {
    if (isGameOver) return;

    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top and bottom walls
    if (ballY < 0) {
        ballY = 0;
        ballSpeedY *= -1;
        wallSound.currentTime = 0; wallSound.play();
        spawnParticles(ballX + BALL_SIZE / 2, 0, "#0bf");
    }
    if (ballY + BALL_SIZE > HEIGHT) {
        ballY = HEIGHT - BALL_SIZE;
        ballSpeedY *= -1;
        wallSound.currentTime = 0; wallSound.play();
        spawnParticles(ballX + BALL_SIZE / 2, HEIGHT, "#fb0");
    }

    // Ball collision with left paddle
    if (
        ballX <= PADDLE_MARGIN + PADDLE_WIDTH &&
        ballY + BALL_SIZE > leftPaddleY &&
        ballY < leftPaddleY + PADDLE_HEIGHT
    ) {
        ballX = PADDLE_MARGIN + PADDLE_WIDTH;
        ballSpeedX = Math.abs(ballSpeedX) + BALL_SPEED_INCREASE;
        ballSpeedX = clamp(ballSpeedX, BALL_INITIAL_SPEED, BALL_MAX_SPEED);
        ballSpeedX *= 1;
        ballSpeedY += ((ballY + BALL_SIZE / 2) - (leftPaddleY + PADDLE_HEIGHT / 2)) * 0.18;
        paddleSound.currentTime = 0; paddleSound.play();
        spawnParticles(ballX, ballY + BALL_SIZE / 2, "#0bf");
    }

    // Ball collision with right paddle
    if (
        ballX + BALL_SIZE >= WIDTH - PADDLE_MARGIN - PADDLE_WIDTH &&
        ballY + BALL_SIZE > rightPaddleY &&
        ballY < rightPaddleY + PADDLE_HEIGHT
    ) {
        ballX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
        ballSpeedX = -Math.abs(ballSpeedX) - BALL_SPEED_INCREASE;
        ballSpeedX = clamp(ballSpeedX, -BALL_MAX_SPEED, -BALL_INITIAL_SPEED);
        ballSpeedY += ((ballY + BALL_SIZE / 2) - (rightPaddleY + PADDLE_HEIGHT / 2)) * 0.18;
        paddleSound.currentTime = 0; paddleSound.play();
        spawnParticles(ballX + BALL_SIZE, ballY + BALL_SIZE / 2, "#fb0");
    }

    // Score update
    if (ballX < 0) {
        rightScore++;
        scoreSound.currentTime = 0; scoreSound.play();
        if (rightScore >= 10) {
            isGameOver = true;
            winner = "AI";
            showOverlay("Game Over!<br>AI Wins 🏆");
        } else {
            resetBall(1);
        }
    }
    if (ballX + BALL_SIZE > WIDTH) {
        leftScore++;
        scoreSound.currentTime = 0; scoreSound.play();
        if (leftScore >= 10) {
            isGameOver = true;
            winner = "You";
            showOverlay("Game Over!<br>You Win 🎉");
        } else {
            resetBall(-1);
        }
    }

    // Improved AI: predict future ball position
    let targetY = predictBallY() + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    if (rightPaddleY + PADDLE_HEIGHT / 2 < targetY - 10) {
        rightPaddleY += PADDLE_SPEED;
    } else if (rightPaddleY + PADDLE_HEIGHT / 2 > targetY + 10) {
        rightPaddleY -= PADDLE_SPEED;
    }
    rightPaddleY = clamp(rightPaddleY, 0, HEIGHT - PADDLE_HEIGHT);

    updateParticles();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw paddles
    drawRect(PADDLE_MARGIN, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#0bf");
    drawRect(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fb0");

    // Draw ball
    drawRect(ballX, ballY, BALL_SIZE, BALL_SIZE, "#fff");

    // Draw particles
    drawParticles();

    // Draw center line
    for (let i = 0; i < HEIGHT; i += 30) {
        drawRect(WIDTH / 2 - 2, i, 4, 20, "#666");
    }

    // Draw scores
    drawText(leftScore, WIDTH / 2 - 80, 70, "#0bf");
    drawText(rightScore, WIDTH / 2 + 40, 70, "#fb0");

    // Draw FPS
    drawText(`FPS: ${fps}`, 20, 40, "#fff", "18px Arial");
}

function gameLoop(now) {
    update();
    draw();

    frameCount++;
    if (now - fpsTime > 1000) {
        fps = frameCount;
        frameCount = 0;
        fpsTime = now;
    }

    requestAnimationFrame(gameLoop);
}

// --- INIT ---
resetGame();
gameLoop();
