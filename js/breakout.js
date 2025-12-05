// 打磚塊遊戲
(function () {
    const BEST_SCORE_KEY = 'rg-breakout-best';

    // 遊戲設定
    const CANVAS_WIDTH = 480;
    const CANVAS_HEIGHT = 400;
    const PADDLE_WIDTH = 80;
    const PADDLE_HEIGHT = 12;
    const PADDLE_SPEED = 8;
    const BALL_RADIUS = 8;
    const BALL_SPEED = 5;
    const BRICK_ROWS = 5;
    const BRICK_COLS = 8;
    const BRICK_WIDTH = 54;
    const BRICK_HEIGHT = 18;
    const BRICK_PADDING = 4;
    const BRICK_TOP_OFFSET = 40;
    const BRICK_LEFT_OFFSET = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;

    // 磚塊顏色（按行）
    const BRICK_COLORS = ['#e53e3e', '#ed8936', '#ecc94b', '#48bb78', '#4299e1'];
    const BRICK_COLORS_IDE = ['#f14c4c', '#ce9178', '#dcdcaa', '#4ec9b0', '#569cd6'];

    // 遊戲狀態
    let paddle = { x: 0, y: 0, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
    let ball = { x: 0, y: 0, dx: 0, dy: 0, radius: BALL_RADIUS };
    let bricks = [];
    let score = 0;
    let bestScore = 0;
    let level = 1;
    let lives = 3;
    let isPlaying = false;
    let isPaused = false;
    let animationId = null;

    // 輸入狀態
    let leftPressed = false;
    let rightPressed = false;

    // DOM 元素
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const levelClearScreen = document.getElementById('level-clear');
    const pauseOverlay = document.getElementById('pause-overlay');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backMenuBtn = document.getElementById('back-menu-btn');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const levelDisplay = document.getElementById('level');
    const livesDisplay = document.getElementById('lives');
    const finalScore = document.getElementById('final-score');
    const finalScoreIDE = document.getElementById('final-score-ide');
    const finalLevel = document.getElementById('final-level');
    const finalLevelIDE = document.getElementById('final-level-ide');

    // 初始化畫布
    function initCanvas() {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    }

    // 初始化板子
    function initPaddle() {
        paddle.x = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
        paddle.y = CANVAS_HEIGHT - PADDLE_HEIGHT - 10;
        paddle.width = PADDLE_WIDTH;
    }

    // 初始化球
    function initBall() {
        ball.x = CANVAS_WIDTH / 2;
        ball.y = CANVAS_HEIGHT - PADDLE_HEIGHT - 30;
        // 隨機角度發射（避免太水平）
        const angle = (Math.random() * 60 + 60) * Math.PI / 180; // 60-120 度
        const speed = BALL_SPEED + (level - 1) * 0.5; // 隨關卡加速
        ball.dx = speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -speed * Math.sin(angle);
    }

    // 初始化磚塊
    function initBricks() {
        bricks = [];
        const rows = Math.min(BRICK_ROWS + Math.floor((level - 1) / 2), 8); // 隨關卡增加行數
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < BRICK_COLS; col++) {
                bricks.push({
                    x: BRICK_LEFT_OFFSET + col * (BRICK_WIDTH + BRICK_PADDING),
                    y: BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING),
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    color: row % BRICK_COLORS.length,
                    alive: true
                });
            }
        }
    }

    // 取得顏色
    function getColors() {
        const isIDEMode = document.documentElement.classList.contains('ide-mode');
        return {
            background: isIDEMode ? '#0d1117' : '#1a1a2e',
            paddle: isIDEMode ? '#569cd6' : '#4299e1',
            ball: isIDEMode ? '#dcdcaa' : '#ecc94b',
            brickColors: isIDEMode ? BRICK_COLORS_IDE : BRICK_COLORS
        };
    }

    // 繪製遊戲
    function draw() {
        const colors = getColors();

        // 清空畫布
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 繪製磚塊
        bricks.forEach(brick => {
            if (brick.alive) {
                ctx.fillStyle = colors.brickColors[brick.color];
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
                ctx.fill();

                // 磚塊高光
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 4);
            }
        });

        // 繪製板子
        ctx.fillStyle = colors.paddle;
        ctx.beginPath();
        ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 4);
        ctx.fill();

        // 板子高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(paddle.x + 4, paddle.y + 2, paddle.width - 8, 3);

        // 繪製球
        ctx.fillStyle = colors.ball;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // 球高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(ball.x - 2, ball.y - 2, ball.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    // 移動板子
    function movePaddle() {
        if (leftPressed && paddle.x > 0) {
            paddle.x -= PADDLE_SPEED;
        }
        if (rightPressed && paddle.x < CANVAS_WIDTH - paddle.width) {
            paddle.x += PADDLE_SPEED;
        }
    }

    // 移動球
    function moveBall() {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // 左右牆壁碰撞
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > CANVAS_WIDTH) {
            ball.dx = -ball.dx;
            ball.x = Math.max(ball.radius, Math.min(CANVAS_WIDTH - ball.radius, ball.x));
        }

        // 上牆壁碰撞
        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
            ball.y = ball.radius;
        }

        // 下方出界
        if (ball.y + ball.radius > CANVAS_HEIGHT) {
            loseLife();
            return;
        }

        // 板子碰撞
        if (ball.y + ball.radius > paddle.y &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width) {

            // 根據擊中位置改變反彈角度
            const hitPos = (ball.x - paddle.x) / paddle.width; // 0-1
            const angle = (hitPos * 120 + 30) * Math.PI / 180; // 30-150 度
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = speed * Math.cos(angle) * (hitPos < 0.5 ? -1 : 1);
            ball.dy = -Math.abs(speed * Math.sin(angle));
            ball.y = paddle.y - ball.radius;
        }

        // 磚塊碰撞
        bricks.forEach(brick => {
            if (brick.alive && checkBrickCollision(brick)) {
                brick.alive = false;
                score += 10 * level;
                updateStats();

                // 檢查是否過關
                if (bricks.every(b => !b.alive)) {
                    levelUp();
                }
            }
        });
    }

    // 檢查磚塊碰撞
    function checkBrickCollision(brick) {
        if (ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + brick.height) {

            // 判斷碰撞方向
            const overlapLeft = ball.x + ball.radius - brick.x;
            const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
            const overlapTop = ball.y + ball.radius - brick.y;
            const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapY) {
                ball.dx = -ball.dx;
            } else {
                ball.dy = -ball.dy;
            }

            return true;
        }
        return false;
    }

    // 失去一條命
    function loseLife() {
        lives--;
        updateStats();

        if (lives <= 0) {
            gameOver();
        } else {
            // 重置球和板子位置
            initPaddle();
            initBall();
        }
    }

    // 過關
    function levelUp() {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        levelClearScreen.classList.remove('hidden');

        setTimeout(() => {
            levelClearScreen.classList.add('hidden');
            level++;
            initPaddle();
            initBall();
            initBricks();
            updateStats();
            isPlaying = true;
            gameLoop();
        }, 1500);
    }

    // 遊戲主循環
    function gameLoop() {
        if (!isPlaying || isPaused) return;

        movePaddle();
        moveBall();
        draw();

        animationId = requestAnimationFrame(gameLoop);
    }

    // 更新統計
    function updateStats() {
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        livesDisplay.textContent = lives;
    }

    // 載入最高分
    function loadBestScore() {
        bestScore = parseInt(localStorage.getItem(BEST_SCORE_KEY)) || 0;
        bestScoreDisplay.textContent = bestScore;
    }

    // 儲存最高分
    function saveBestScore() {
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_SCORE_KEY, bestScore);
            bestScoreDisplay.textContent = bestScore;
        }
    }

    // 開始遊戲
    function startGame() {
        // 重置狀態
        score = 0;
        level = 1;
        lives = 3;
        isPlaying = true;
        isPaused = false;

        initCanvas();
        initPaddle();
        initBall();
        initBricks();
        loadBestScore();
        updateStats();

        // 切換畫面
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        levelClearScreen.classList.add('hidden');
        pauseOverlay.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        draw();
        gameLoop();
    }

    // 暫停/繼續
    function togglePause() {
        if (!isPlaying) return;

        isPaused = !isPaused;

        if (isPaused) {
            cancelAnimationFrame(animationId);
            pauseOverlay.classList.remove('hidden');
        } else {
            pauseOverlay.classList.add('hidden');
            gameLoop();
        }
    }

    // 遊戲結束
    function gameOver() {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        saveBestScore();

        // 更新結果
        finalScore.textContent = score;
        finalScoreIDE.textContent = score;
        finalLevel.textContent = level;
        finalLevelIDE.textContent = level;

        // 顯示結束畫面
        setTimeout(() => {
            gameOverScreen.classList.remove('hidden');
        }, 300);
    }

    // 回主選單
    function backToMenu() {
        window.location.href = '../index.html';
    }

    // 鍵盤控制
    function handleKeydown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            leftPressed = true;
            e.preventDefault();
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            rightPressed = true;
            e.preventDefault();
        }
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            togglePause();
        }
    }

    function handleKeyup(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            leftPressed = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            rightPressed = false;
        }
    }

    // 滑鼠控制
    function handleMouseMove(e) {
        if (!isPlaying || isPaused) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, mouseX - paddle.width / 2));
    }

    // 觸控控制
    function handleTouchMove(e) {
        if (!isPlaying || isPaused) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const scaleX = CANVAS_WIDTH / rect.width;
        paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, touchX * scaleX - paddle.width / 2));
    }

    // 事件監聽
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    backMenuBtn.addEventListener('click', backToMenu);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // 初始化
    function init() {
        initCanvas();
        loadBestScore();
    }

    init();
})();
