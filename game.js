const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 18;
const PADDLE_SPEED = 7;

// Ball settings
const BALL_SIZE = 16;
const BALL_SPEED = 5;

// Game state
let leftPaddleY, rightPaddleY;
let ballX, ballY, ballSpeedX, ballSpeedY;
let leftScore, rightScore;
let isGameOver = false;

const WIN_SCORE = 7;

// DOM elements
const gameOverDiv = document.getElementById('game-over');
const gameOverMsg = document.getElementById('game-over-message');
const restartBtn = document.getElementById('restart-btn');

// Reset everything
function resetGame() {
    leftScore = 0;
    rightScore = 0;
    leftPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    rightPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    isGameOver = false;
    gameOverDiv.hidden = true;
    resetBall(Math.random() < 0.5 ? 1 : -1);
}

function resetBall(direction = 1) {
    ballX = WIDTH / 2 - BALL_SIZE / 2;
    ballY = HEIGHT / 2 - BALL_SIZE / 2;
    ballSpeedX = BALL_SPEED * direction;
    ballSpeedY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Mouse controls for left paddle
canvas.addEventListener("mousemove", function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp
    if (leftPaddleY < 0) leftPaddleY = 0;
    if (leftPaddleY > HEIGHT - PADDLE_HEIGHT) leftPaddleY = HEIGHT - PADDLE_HEIGHT;
});

// Touch controls for left paddle
canvas.addEventListener("touchmove", function(e) {
    if (e.touches.length) {
        const rect = canvas.getBoundingClientRect();
        const touchY = e.touches[0].clientY - rect.top;
        leftPaddleY = touchY - PADDLE_HEIGHT / 2;
        if (leftPaddleY < 0) leftPaddleY = 0;
        if (leftPaddleY > HEIGHT - PADDLE_HEIGHT) leftPaddleY = HEIGHT - PADDLE_HEIGHT;
    }
}, {passive: false});

restartBtn.addEventListener("click", resetGame);

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawText(text, x, y, color, font = "40px Arial") {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawRect(PADDLE_MARGIN, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#0bf");
    drawRect(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fb0");
    drawRect(ballX, ballY, BALL_SIZE, BALL_SIZE, "#fff");

    // Center line
    for (let i = 0; i < HEIGHT; i += 30) {
        drawRect(WIDTH / 2 - 2, i, 4, 20, "#666");
    }

    drawText(leftScore, WIDTH / 2 - 80, 70, "#0bf");
    drawText(rightScore, WIDTH / 2 + 40, 70, "#fb0");
}

function update() {
    if (isGameOver) return;

    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with walls
    if (ballY < 0) {
        ballY = 0;
        ballSpeedY *= -1;
    }
    if (ballY + BALL_SIZE > HEIGHT) {
        ballY = HEIGHT - BALL_SIZE;
        ballSpeedY *= -1;
    }

    // Left paddle collision
    if (
        ballX <= PADDLE_MARGIN + PADDLE_WIDTH &&
        ballY + BALL_SIZE > leftPaddleY &&
        ballY < leftPaddleY + PADDLE_HEIGHT
    ) {
        ballX = PADDLE_MARGIN + PADDLE_WIDTH;
        ballSpeedX *= -1;
        ballSpeedY += ((ballY + BALL_SIZE / 2) - (leftPaddleY + PADDLE_HEIGHT / 2)) * 0.18;
    }

    // Right paddle collision
    if (
        ballX + BALL_SIZE >= WIDTH - PADDLE_MARGIN - PADDLE_WIDTH &&
        ballY + BALL_SIZE > rightPaddleY &&
        ballY < rightPaddleY + PADDLE_HEIGHT
    ) {
        ballX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
        ballSpeedX *= -1;
        ballSpeedY += ((ballY + BALL_SIZE / 2) - (rightPaddleY + PADDLE_HEIGHT / 2)) * 0.18;
    }

    // Score update
    if (ballX < 0) {
        rightScore++;
        if (rightScore >= WIN_SCORE) {
            isGameOver = true;
            showGameOver("Game Over!<br>AI Wins 🏆");
        } else {
            resetBall(1);
        }
    }
    if (ballX + BALL_SIZE > WIDTH) {
        leftScore++;
        if (leftScore >= WIN_SCORE) {
            isGameOver = true;
            showGameOver("Game Over!<br>You Win 🎉");
        } else {
            resetBall(-1);
        }
    }

    // Simple AI for right paddle
    let targetY = ballY + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    if (rightPaddleY + PADDLE_HEIGHT / 2 < targetY - 10) {
        rightPaddleY += PADDLE_SPEED;
    } else if (rightPaddleY + PADDLE_HEIGHT / 2 > targetY + 10) {
        rightPaddleY -= PADDLE_SPEED;
    }
    if (rightPaddleY < 0) rightPaddleY = 0;
    if (rightPaddleY > HEIGHT - PADDLE_HEIGHT) rightPaddleY = HEIGHT - PADDLE_HEIGHT;
}

function showGameOver(msg) {
    gameOverMsg.innerHTML = msg;
    gameOverDiv.hidden = false;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- INIT ---
resetGame();
gameLoop();
