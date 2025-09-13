const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 18;

// Increase human paddle speed for fairness
const HUMAN_PADDLE_SPEED = 9;
// Slow down AI paddle speed so human has a chance
const AI_PADDLE_SPEED = 6;

const BALL_SIZE = 16;
// Start with higher speed!
const BALL_START_SPEED = 8;
// Ball will increase speed per paddle hit
const BALL_SPEED_INCREMENT = 0.6;

const WIN_SCORE = 3;

let leftPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let rightPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballSpeedX = BALL_START_SPEED * (Math.random() < 0.5 ? 1 : -1);
let ballSpeedY = BALL_START_SPEED * (Math.random() * 2 - 1);
let ballCurrentSpeed = BALL_START_SPEED;

let leftScore = 0;
let rightScore = 0;
let winner = "";
let gameOver = false;

// Mouse controls for left paddle
canvas.addEventListener("mousemove", function(e) {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - PADDLE_HEIGHT / 2;
    if (leftPaddleY < 0) leftPaddleY = 0;
    if (leftPaddleY > HEIGHT - PADDLE_HEIGHT) leftPaddleY = HEIGHT - PADDLE_HEIGHT;
});

// Touch controls for left paddle
canvas.addEventListener("touchmove", function(e) {
    if (gameOver) return;
    if (e.touches.length) {
        const rect = canvas.getBoundingClientRect();
        const touchY = e.touches[0].clientY - rect.top;
        leftPaddleY = touchY - PADDLE_HEIGHT / 2;
        if (leftPaddleY < 0) leftPaddleY = 0;
        if (leftPaddleY > HEIGHT - PADDLE_HEIGHT) leftPaddleY = HEIGHT - PADDLE_HEIGHT;
    }
}, {passive: false});

// Restart game on canvas click after win
canvas.addEventListener("click", function() {
    if (gameOver) {
        resetGame();
        gameLoop();
    }
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawText(text, x, y, color, font = "40px Arial", align = "left") {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

function resetBall(direction) {
    ballX = WIDTH / 2 - BALL_SIZE / 2;
    ballY = HEIGHT / 2 - BALL_SIZE / 2;
    ballCurrentSpeed = BALL_START_SPEED;
    ballSpeedX = ballCurrentSpeed * direction;
    ballSpeedY = ballCurrentSpeed * (Math.random() * 2 - 1);
}

function resetGame() {
    leftScore = 0;
    rightScore = 0;
    leftPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    rightPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    resetBall(Math.random() < 0.5 ? 1 : -1);
    winner = "";
    gameOver = false;
}

function update() {
    if (gameOver) return;

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

    // Ball collision with left paddle (human)
    if (
        ballX <= PADDLE_MARGIN + PADDLE_WIDTH &&
        ballY + BALL_SIZE > leftPaddleY &&
        ballY < leftPaddleY + PADDLE_HEIGHT
    ) {
        ballX = PADDLE_MARGIN + PADDLE_WIDTH;
        ballCurrentSpeed += BALL_SPEED_INCREMENT; // Speed up ball!
        ballSpeedX = ballCurrentSpeed;
        ballSpeedY += (Math.random() - 0.5) * 2;
        // ballSpeedY = clamp(ballSpeedY, -ballCurrentSpeed, ballCurrentSpeed);
        if (ballSpeedY > ballCurrentSpeed) ballSpeedY = ballCurrentSpeed;
        if (ballSpeedY < -ballCurrentSpeed) ballSpeedY = -ballCurrentSpeed;
    }

    // Ball collision with right paddle (AI)
    if (
        ballX + BALL_SIZE >= WIDTH - PADDLE_MARGIN - PADDLE_WIDTH &&
        ballY + BALL_SIZE > rightPaddleY &&
        ballY < rightPaddleY + PADDLE_HEIGHT
    ) {
        ballX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
        ballCurrentSpeed += BALL_SPEED_INCREMENT; // Speed up ball!
        ballSpeedX = -ballCurrentSpeed;
        ballSpeedY += (Math.random() - 0.5) * 2;
        if (ballSpeedY > ballCurrentSpeed) ballSpeedY = ballCurrentSpeed;
        if (ballSpeedY < -ballCurrentSpeed) ballSpeedY = -ballCurrentSpeed;
    }

    // Score update
    if (ballX < 0) {
        rightScore++;
        if (rightScore >= WIN_SCORE) {
            winner = "AI";
            gameOver = true;
        } else {
            resetBall(1);
        }
    }
    if (ballX + BALL_SIZE > WIDTH) {
        leftScore++;
        if (leftScore >= WIN_SCORE) {
            winner = "You";
            gameOver = true;
        } else {
            resetBall(-1);
        }
    }

    // --- Human paddle (left) is controlled by mouse/touch ---

    // --- AI paddle (right) ---
    // Make AI less perfect: only move toward ball if ball is moving toward it
    if (ballSpeedX > 0 && Math.abs(ballY + BALL_SIZE / 2 - (rightPaddleY + PADDLE_HEIGHT / 2)) > 15) {
        // Occasional "error" for AI: don't follow ball perfectly
        let targetY = ballY + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
        if (rightPaddleY + PADDLE_HEIGHT / 2 < targetY - 10) {
            rightPaddleY += AI_PADDLE_SPEED;
        } else if (rightPaddleY + PADDLE_HEIGHT / 2 > targetY + 10) {
            rightPaddleY -= AI_PADDLE_SPEED;
        }
    }
    if (rightPaddleY < 0) rightPaddleY = 0;
    if (rightPaddleY > HEIGHT - PADDLE_HEIGHT) rightPaddleY = HEIGHT - PADDLE_HEIGHT;
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

    drawText(leftScore, WIDTH / 2 - 80, 70, "#0bf", "40px Arial", "center");
    drawText(rightScore, WIDTH / 2 + 40, 70, "#fb0", "40px Arial", "center");

    if (gameOver && winner) {
        ctx.globalAlpha = 0.8;
        drawRect(0, HEIGHT / 2 - 70, WIDTH, 140, "#222");
        ctx.globalAlpha = 1.0;
        drawText(
            winner === "You" ? "🎉 You Win!" : "🏆 AI Wins!",
            WIDTH / 2,
            HEIGHT / 2,
            winner === "You" ? "#0bf" : "#fb0",
            "bold 50px Arial",
            "center"
        );
        drawText(
            "Click to play again",
            WIDTH / 2,
            HEIGHT / 2 + 50,
            "#fff",
            "24px Arial",
            "center"
        );
    }
}

function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

resetGame();
gameLoop();
