// 迷你貪吃蛇遊戲
(function () {
    const BEST_SCORE_KEY = 'rg-snake-best';

    // 遊戲設定
    const GRID_SIZE = 20;       // 格子大小
    const GRID_COUNT = 20;      // 格子數量
    const INITIAL_SPEED = 150;  // 初始速度 (ms)
    const MIN_SPEED = 50;       // 最快速度
    const SPEED_INCREASE = 5;   // 每吃一個食物加速

    // 方向
    const DIRECTIONS = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    };

    // 遊戲狀態
    let snake = [];
    let food = null;
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let bestScore = 0;
    let speed = INITIAL_SPEED;
    let gameLoop = null;
    let isPlaying = false;
    let isPaused = false;

    // DOM 元素
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const pauseOverlay = document.getElementById('pause-overlay');
    const mobileControls = document.getElementById('mobile-controls');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backMenuBtn = document.getElementById('back-menu-btn');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const lengthDisplay = document.getElementById('length');
    const speedDisplay = document.getElementById('speed');
    const finalScore = document.getElementById('final-score');
    const finalScoreIDE = document.getElementById('final-score-ide');
    const finalLength = document.getElementById('final-length');
    const finalLengthIDE = document.getElementById('final-length-ide');

    // 初始化畫布
    function initCanvas() {
        const size = GRID_SIZE * GRID_COUNT;
        canvas.width = size;
        canvas.height = size;
    }

    // 初始化蛇
    function initSnake() {
        const startX = Math.floor(GRID_COUNT / 2);
        const startY = Math.floor(GRID_COUNT / 2);
        snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
    }

    // 生成食物
    function spawnFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_COUNT),
                y: Math.floor(Math.random() * GRID_COUNT)
            };
        } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        food = newFood;
    }

    // 取得顏色
    function getColors() {
        const isIDEMode = document.documentElement.classList.contains('ide-mode');
        return {
            background: isIDEMode ? '#0d1117' : '#1a1a2e',
            snake: isIDEMode ? '#4ec9b0' : '#38a169',
            snakeHead: isIDEMode ? '#569cd6' : '#48bb78',
            food: isIDEMode ? '#f14c4c' : '#e53e3e',
            grid: isIDEMode ? '#161b22' : '#16213e'
        };
    }

    // 繪製遊戲
    function draw() {
        const colors = getColors();

        // 清空畫布
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 繪製格線（可選）
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= GRID_COUNT; i++) {
            ctx.beginPath();
            ctx.moveTo(i * GRID_SIZE, 0);
            ctx.lineTo(i * GRID_SIZE, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * GRID_SIZE);
            ctx.lineTo(canvas.width, i * GRID_SIZE);
            ctx.stroke();
        }

        // 繪製蛇
        snake.forEach((segment, index) => {
            const isHead = index === 0;
            ctx.fillStyle = isHead ? colors.snakeHead : colors.snake;

            // 圓角方塊
            const padding = 1;
            const x = segment.x * GRID_SIZE + padding;
            const y = segment.y * GRID_SIZE + padding;
            const size = GRID_SIZE - padding * 2;
            const radius = 4;

            ctx.beginPath();
            ctx.roundRect(x, y, size, size, radius);
            ctx.fill();

            // 蛇頭眼睛
            if (isHead) {
                ctx.fillStyle = colors.background;
                const eyeSize = 3;
                const eyeOffset = 5;

                if (direction === 'right') {
                    ctx.fillRect(x + size - eyeOffset, y + 4, eyeSize, eyeSize);
                    ctx.fillRect(x + size - eyeOffset, y + size - 7, eyeSize, eyeSize);
                } else if (direction === 'left') {
                    ctx.fillRect(x + eyeOffset - eyeSize, y + 4, eyeSize, eyeSize);
                    ctx.fillRect(x + eyeOffset - eyeSize, y + size - 7, eyeSize, eyeSize);
                } else if (direction === 'up') {
                    ctx.fillRect(x + 4, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                    ctx.fillRect(x + size - 7, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                } else {
                    ctx.fillRect(x + 4, y + size - eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(x + size - 7, y + size - eyeOffset, eyeSize, eyeSize);
                }
            }
        });

        // 繪製食物
        if (food) {
            ctx.fillStyle = colors.food;
            const padding = 2;
            const x = food.x * GRID_SIZE + padding;
            const y = food.y * GRID_SIZE + padding;
            const size = GRID_SIZE - padding * 2;

            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 移動蛇
    function moveSnake() {
        direction = nextDirection;
        const dir = DIRECTIONS[direction];
        const head = snake[0];
        const newHead = {
            x: head.x + dir.x,
            y: head.y + dir.y
        };

        // 檢查碰撞
        if (checkCollision(newHead)) {
            gameOver();
            return;
        }

        snake.unshift(newHead);

        // 檢查是否吃到食物
        if (newHead.x === food.x && newHead.y === food.y) {
            score += 10;
            updateStats();
            spawnFood();

            // 加速
            speed = Math.max(MIN_SPEED, speed - SPEED_INCREASE);
            restartGameLoop();
        } else {
            snake.pop();
        }
    }

    // 檢查碰撞
    function checkCollision(head) {
        // 撞牆
        if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
            return true;
        }

        // 撞自己
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                return true;
            }
        }

        return false;
    }

    // 遊戲主循環
    function gameStep() {
        if (!isPlaying || isPaused) return;
        moveSnake();
        draw();
    }

    // 開始遊戲循環
    function startGameLoop() {
        gameLoop = setInterval(gameStep, speed);
    }

    // 重啟遊戲循環（加速用）
    function restartGameLoop() {
        clearInterval(gameLoop);
        startGameLoop();
    }

    // 更新統計
    function updateStats() {
        scoreDisplay.textContent = score;
        lengthDisplay.textContent = snake.length;
        speedDisplay.textContent = Math.floor((INITIAL_SPEED - speed) / SPEED_INCREASE) + 1;
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
        speed = INITIAL_SPEED;
        direction = 'right';
        nextDirection = 'right';
        isPlaying = true;
        isPaused = false;

        initCanvas();
        initSnake();
        spawnFood();
        loadBestScore();
        updateStats();

        // 切換畫面
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        pauseOverlay.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        // 在手機上顯示控制按鈕
        if ('ontouchstart' in window) {
            mobileControls.classList.remove('hidden');
        }

        draw();
        startGameLoop();
    }

    // 暫停/繼續
    function togglePause() {
        if (!isPlaying) return;

        isPaused = !isPaused;

        if (isPaused) {
            clearInterval(gameLoop);
            pauseOverlay.classList.remove('hidden');
        } else {
            pauseOverlay.classList.add('hidden');
            startGameLoop();
        }
    }

    // 遊戲結束
    function gameOver() {
        isPlaying = false;
        clearInterval(gameLoop);
        saveBestScore();

        // 更新結果
        finalScore.textContent = score;
        finalScoreIDE.textContent = score;
        finalLength.textContent = snake.length;
        finalLengthIDE.textContent = snake.length;

        // 顯示結束畫面
        setTimeout(() => {
            gameOverScreen.classList.remove('hidden');
        }, 300);
    }

    // 回主選單
    function backToMenu() {
        window.location.href = '../index.html';
    }

    // 處理方向改變
    function changeDirection(newDir) {
        // 防止 180 度轉向
        const opposites = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };

        if (newDir && opposites[newDir] !== direction) {
            nextDirection = newDir;
        }
    }

    // 鍵盤控制
    function handleKeydown(e) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            'W': 'up',
            's': 'down',
            'S': 'down',
            'a': 'left',
            'A': 'left',
            'd': 'right',
            'D': 'right'
        };

        if (keyMap[e.key]) {
            e.preventDefault();
            changeDirection(keyMap[e.key]);
        }

        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            togglePause();
        }
    }

    // 手機控制
    function handleMobileControl(e) {
        const btn = e.target.closest('.control-btn');
        if (!btn) return;

        e.preventDefault();

        if (btn.dataset.dir) {
            changeDirection(btn.dataset.dir);
        } else if (btn.dataset.action === 'pause') {
            togglePause();
        }
    }

    // 觸控滑動控制
    let touchStartX = 0;
    let touchStartY = 0;

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        if (!isPlaying || isPaused) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipe = 30;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipe) {
                changeDirection(deltaX > 0 ? 'right' : 'left');
            }
        } else {
            if (Math.abs(deltaY) > minSwipe) {
                changeDirection(deltaY > 0 ? 'down' : 'up');
            }
        }
    }

    // 事件監聽
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    backMenuBtn.addEventListener('click', backToMenu);
    document.addEventListener('keydown', handleKeydown);
    mobileControls.addEventListener('click', handleMobileControl);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 初始化
    function init() {
        initCanvas();
        loadBestScore();
    }

    init();
})();
