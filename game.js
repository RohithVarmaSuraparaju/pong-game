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
let leftPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let rightPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;

let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballSpeedX = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
let ballSpeedY = BALL_SPEED * (Math.random() * 2 - 1);

let leftScore = 0;
let rightScore = 0;

// Mouse controls for left paddle
canvas.addEventListener("mousemove", function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - PADDLE_HEIGHT / 2;

    // Clamp paddle position
    if (leftPaddleY < 0) leftPaddleY = 0;
    if (leftPaddleY > HEIGHT - PADDLE_HEIGHT) leftPaddleY = HEIGHT - PADDLE_HEIGHT;
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "40px Arial";
    ctx.fillText(text, x, y);
}

function resetBall(direction) {
    ballX = WIDTH / 2 - BALL_SIZE / 2;
    ballY = HEIGHT / 2 - BALL_SIZE / 2;
    ballSpeedX = BALL_SPEED * direction;
    ballSpeedY = BALL_SPEED * (Math.random() * 2 - 1);
}

function update() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top and bottom walls
    if (ballY < 0) {
        ballY = 0;
        ballSpeedY *= -1;
    }
    if (ballY + BALL_SIZE > HEIGHT) {
        ballY = HEIGHT - BALL_SIZE;
        ballSpeedY *= -1;
    }

    // Ball collision with left paddle
    if (
        ballX <= PADDLE_MARGIN + PADDLE_WIDTH &&
        ballY + BALL_SIZE > leftPaddleY &&
        ballY < leftPaddleY + PADDLE_HEIGHT
    ) {
        ballX = PADDLE_MARGIN + PADDLE_WIDTH;
        ballSpeedX *= -1;
        // Add a bit of vertical randomness
        ballSpeedY += (Math.random() - 0.5) * 2;
    }

    // Ball collision with right paddle
    if (
        ballX + BALL_SIZE >= WIDTH - PADDLE_MARGIN - PADDLE_WIDTH &&
        ballY + BALL_SIZE > rightPaddleY &&
        ballY < rightPaddleY + PADDLE_HEIGHT
    ) {
        ballX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
        ballSpeedX *= -1;
        ballSpeedY += (Math.random() - 0.5) * 2;
    }

    // Score update
    if (ballX < 0) {
        rightScore++;
        resetBall(1);
    }
    if (ballX + BALL_SIZE > WIDTH) {
        leftScore++;
        resetBall(-1);
    }

    // Simple AI for right paddle
    let targetY = ballY + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    if (rightPaddleY + PADDLE_HEIGHT / 2 < targetY) {
        rightPaddleY += PADDLE_SPEED;
    } else if (rightPaddleY + PADDLE_HEIGHT / 2 > targetY) {
        rightPaddleY -= PADDLE_SPEED;
    }

    // Clamp right paddle position
    if (rightPaddleY < 0) rightPaddleY = 0;
    if (rightPaddleY > HEIGHT - PADDLE_HEIGHT) rightPaddleY = HEIGHT - PADDLE_HEIGHT;
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw paddles
    drawRect(PADDLE_MARGIN, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#0bf");
    drawRect(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fb0");

    // Draw ball
    drawRect(ballX, ballY, BALL_SIZE, BALL_SIZE, "#fff");

    // Draw center line
    for (let i = 0; i < HEIGHT; i += 30) {
        drawRect(WIDTH / 2 - 2, i, 4, 20, "#666");
    }

    // Draw scores
    drawText(leftScore, WIDTH / 2 - 80, 70, "#0bf");
    drawText(rightScore, WIDTH / 2 + 40, 70, "#fb0");
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
