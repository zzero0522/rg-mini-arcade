// 太空射擊遊戲
(function () {
    const BEST_SCORE_KEY = 'rg-shmup-best';

    // 遊戲設定
    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 500;
    const PLAYER_WIDTH = 40;
    const PLAYER_HEIGHT = 30;
    const PLAYER_SPEED = 6;
    const BULLET_WIDTH = 4;
    const BULLET_HEIGHT = 12;
    const BULLET_SPEED = 10;
    const ENEMY_WIDTH = 32;
    const ENEMY_HEIGHT = 24;
    const ENEMY_BULLET_SPEED = 4;
    const SHOOT_COOLDOWN = 150; // ms
    const POWERUP_SIZE = 20;
    const POWERUP_SPEED = 2;

    // 道具類型
    const POWERUP_TYPES = {
        SHIELD: 'shield',      // 護盾
        TRIPLE: 'triple',      // 三連發
        RAPID: 'rapid',        // 快速射擊
        LIFE: 'life'          // 額外生命
    };

    // 遊戲狀態
    let player = { x: 0, y: 0, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    let bullets = [];
    let enemies = [];
    let enemyBullets = [];
    let particles = [];
    let stars = [];
    let powerups = [];
    let score = 0;
    let bestScore = 0;
    let wave = 1;
    let lives = 3;
    let isPlaying = false;
    let isPaused = false;
    let animationId = null;
    let lastShootTime = 0;
    let waveTimer = 0;
    let invincibleTimer = 0;

    // 道具效果狀態
    let hasShield = false;
    let shieldTimer = 0;
    let hasTriple = false;
    let tripleTimer = 0;
    let hasRapid = false;
    let rapidTimer = 0;
    let lastPowerupScore = 0;

    // 輸入狀態
    let keys = {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false
    };

    // DOM 元素
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const pauseOverlay = document.getElementById('pause-overlay');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backMenuBtn = document.getElementById('back-menu-btn');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const waveDisplay = document.getElementById('wave');
    const livesDisplay = document.getElementById('lives');
    const finalScore = document.getElementById('final-score');
    const finalScoreIDE = document.getElementById('final-score-ide');
    const finalWave = document.getElementById('final-wave');
    const finalWaveIDE = document.getElementById('final-wave-ide');

    // 初始化畫布
    function initCanvas() {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    }

    // 初始化星星背景
    function initStars() {
        stars = [];
        for (let i = 0; i < 50; i++) {
            stars.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 0.5
            });
        }
    }

    // 初始化玩家
    function initPlayer() {
        player.x = (CANVAS_WIDTH - PLAYER_WIDTH) / 2;
        player.y = CANVAS_HEIGHT - PLAYER_HEIGHT - 20;
    }

    // 生成敵人波次
    function spawnWave() {
        const enemyCount = 4 + wave * 2;
        const rows = Math.ceil(enemyCount / 6);
        const cols = Math.min(enemyCount, 6);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols && enemies.length < enemyCount; col++) {
                const x = 50 + col * (ENEMY_WIDTH + 30);
                const y = -50 - row * (ENEMY_HEIGHT + 20);
                enemies.push({
                    x: x,
                    y: y,
                    width: ENEMY_WIDTH,
                    height: ENEMY_HEIGHT,
                    targetY: 50 + row * (ENEMY_HEIGHT + 20),
                    dx: (Math.random() - 0.5) * 2,
                    shootTimer: Math.random() * 2000,
                    type: row % 3 // 不同類型敵人
                });
            }
        }
        waveTimer = 0;
    }

    // 生成道具
    function spawnPowerup(x, y) {
        const types = Object.values(POWERUP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        powerups.push({
            x: x,
            y: y,
            type: type,
            size: POWERUP_SIZE
        });
    }

    // 檢查是否該生成道具 (500, 1000, 2000, 4000, 8000, 16000, 之後每16000分)
    function checkPowerupSpawn() {
        // 計算下一個門檻：500, 1000, 2000, 4000, 8000, 16000, 32000, 48000...
        let nextThreshold;
        if (lastPowerupScore < 16000) {
            // 指數成長階段：500, 1000, 2000, 4000, 8000, 16000
            nextThreshold = 500;
            while (nextThreshold <= lastPowerupScore) {
                nextThreshold *= 2;
            }
            if (nextThreshold > 16000) nextThreshold = 16000;
        } else {
            // 16000之後，每16000分給一次
            nextThreshold = lastPowerupScore + 16000;
        }

        if (score >= nextThreshold) {
            lastPowerupScore = nextThreshold;
            // 隨機位置生成道具
            const x = Math.random() * (CANVAS_WIDTH - POWERUP_SIZE);
            spawnPowerup(x, -POWERUP_SIZE);
        }
    }

    // 取得顏色
    function getColors() {
        const isIDEMode = document.documentElement.classList.contains('ide-mode');
        return {
            background: isIDEMode ? '#0d1117' : '#0a0a1a',
            player: isIDEMode ? '#569cd6' : '#4299e1',
            playerAccent: isIDEMode ? '#4ec9b0' : '#38a169',
            bullet: isIDEMode ? '#dcdcaa' : '#ecc94b',
            enemy: [
                isIDEMode ? '#f14c4c' : '#e53e3e',
                isIDEMode ? '#ce9178' : '#ed8936',
                isIDEMode ? '#c586c0' : '#9f7aea'
            ],
            enemyBullet: isIDEMode ? '#f14c4c' : '#fc8181',
            star: isIDEMode ? '#6a737d' : '#4a5568',
            particle: isIDEMode ? '#dcdcaa' : '#faf089',
            shield: isIDEMode ? '#4ec9b0' : '#48bb78',
            powerup: {
                shield: '#48bb78',
                triple: '#ed8936',
                rapid: '#ecc94b',
                life: '#fc8181'
            }
        };
    }

    // 繪製遊戲
    function draw() {
        const colors = getColors();

        // 清空畫布
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 繪製星星
        stars.forEach(star => {
            ctx.fillStyle = colors.star;
            ctx.globalAlpha = 0.5 + Math.random() * 0.5;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // 繪製粒子
        particles.forEach(p => {
            ctx.fillStyle = p.color || colors.particle;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // 繪製道具
        powerups.forEach(powerup => {
            ctx.fillStyle = colors.powerup[powerup.type];
            ctx.beginPath();
            ctx.arc(powerup.x + powerup.size / 2, powerup.y + powerup.size / 2,
                powerup.size / 2, 0, Math.PI * 2);
            ctx.fill();

            // 道具圖示
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let icon = '';
            switch (powerup.type) {
                case POWERUP_TYPES.SHIELD: icon = '🛡️'; break;
                case POWERUP_TYPES.TRIPLE: icon = '↑↑↑'; break;
                case POWERUP_TYPES.RAPID: icon = '⚡'; break;
                case POWERUP_TYPES.LIFE: icon = '❤️'; break;
            }
            ctx.fillText(icon, powerup.x + powerup.size / 2, powerup.y + powerup.size / 2);
        });

        // 繪製玩家子彈
        ctx.fillStyle = colors.bullet;
        bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
        });

        // 繪製敵人子彈
        ctx.fillStyle = colors.enemyBullet;
        enemyBullets.forEach(bullet => {
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // 繪製敵人
        enemies.forEach(enemy => {
            ctx.fillStyle = colors.enemy[enemy.type];

            // 敵機本體
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            ctx.lineTo(enemy.x, enemy.y);
            ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + 8);
            ctx.lineTo(enemy.x + enemy.width, enemy.y);
            ctx.closePath();
            ctx.fill();
        });

        // 繪製玩家（無敵時閃爍）
        if (invincibleTimer <= 0 || Math.floor(Date.now() / 100) % 2 === 0) {
            // 護盾效果
            if (hasShield) {
                ctx.strokeStyle = colors.shield;
                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.3;
                ctx.beginPath();
                ctx.arc(player.x + player.width / 2, player.y + player.height / 2,
                    Math.max(player.width, player.height) / 2 + 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // 主體顏色 (三連發時變橘色)
            ctx.fillStyle = hasTriple ? '#ed8936' : (hasRapid ? '#ecc94b' : colors.player);
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2, player.y);
            ctx.lineTo(player.x, player.y + player.height);
            ctx.lineTo(player.x + player.width / 2, player.y + player.height - 8);
            ctx.lineTo(player.x + player.width, player.y + player.height);
            ctx.closePath();
            ctx.fill();

            // 駕駛艙
            ctx.fillStyle = colors.playerAccent;
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + 15, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // 繪製道具效果倒數
        drawPowerupTimers(colors);
    }

    // 繪製道具效果倒數
    function drawPowerupTimers(colors) {
        let y = 10;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        if (hasShield) {
            const remaining = Math.ceil(shieldTimer / 1000);
            ctx.fillStyle = colors.powerup.shield;
            ctx.fillText(`🛡️ 護盾: ${remaining}s`, 10, y);
            y += 18;
        }
        if (hasTriple) {
            const remaining = Math.ceil(tripleTimer / 1000);
            ctx.fillStyle = colors.powerup.triple;
            ctx.fillText(`↑↑↑ 三連發: ${remaining}s`, 10, y);
            y += 18;
        }
        if (hasRapid) {
            const remaining = Math.ceil(rapidTimer / 1000);
            ctx.fillStyle = colors.powerup.rapid;
            ctx.fillText(`⚡ 快速射擊: ${remaining}s`, 10, y);
        }
    }

    // 更新星星
    function updateStars() {
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > CANVAS_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * CANVAS_WIDTH;
            }
        });
    }

    // 更新粒子
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.dx;
            p.y += p.dy;
            p.life -= 0.02;
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    // 產生爆炸粒子
    function createExplosion(x, y, count = 10, color = null) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 2 + Math.random() * 3;
            particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                life: 1,
                color: color
            });
        }
    }

    // 更新道具
    function updatePowerups() {
        for (let i = powerups.length - 1; i >= 0; i--) {
            powerups[i].y += POWERUP_SPEED;
            if (powerups[i].y > CANVAS_HEIGHT) {
                powerups.splice(i, 1);
            }
        }
    }

    // 更新道具效果計時器
    function updatePowerupTimers(deltaTime) {
        if (hasShield) {
            shieldTimer -= deltaTime;
            if (shieldTimer <= 0) {
                hasShield = false;
            }
        }
        if (hasTriple) {
            tripleTimer -= deltaTime;
            if (tripleTimer <= 0) {
                hasTriple = false;
            }
        }
        if (hasRapid) {
            rapidTimer -= deltaTime;
            if (rapidTimer <= 0) {
                hasRapid = false;
            }
        }
    }

    // 收集道具
    function collectPowerup(powerup) {
        const colors = getColors();
        createExplosion(powerup.x + powerup.size / 2, powerup.y + powerup.size / 2, 8, colors.powerup[powerup.type]);

        switch (powerup.type) {
            case POWERUP_TYPES.SHIELD:
                hasShield = true;
                shieldTimer = 8000; // 8秒護盾
                break;
            case POWERUP_TYPES.TRIPLE:
                hasTriple = true;
                tripleTimer = 10000; // 10秒三連發
                break;
            case POWERUP_TYPES.RAPID:
                hasRapid = true;
                rapidTimer = 8000; // 8秒快速射擊
                break;
            case POWERUP_TYPES.LIFE:
                lives++;
                updateStats();
                break;
        }
    }

    // 移動玩家
    function movePlayer() {
        if (keys.left && player.x > 0) {
            player.x -= PLAYER_SPEED;
        }
        if (keys.right && player.x < CANVAS_WIDTH - player.width) {
            player.x += PLAYER_SPEED;
        }
        if (keys.up && player.y > CANVAS_HEIGHT / 2) {
            player.y -= PLAYER_SPEED;
        }
        if (keys.down && player.y < CANVAS_HEIGHT - player.height - 10) {
            player.y += PLAYER_SPEED;
        }
    }

    // 玩家射擊
    function playerShoot() {
        const now = Date.now();
        const cooldown = hasRapid ? 80 : SHOOT_COOLDOWN;

        if (keys.shoot && now - lastShootTime > cooldown) {
            if (hasTriple) {
                // 三連發
                bullets.push({
                    x: player.x + player.width / 2 - BULLET_WIDTH / 2,
                    y: player.y
                });
                bullets.push({
                    x: player.x + 5,
                    y: player.y + 5
                });
                bullets.push({
                    x: player.x + player.width - 5 - BULLET_WIDTH,
                    y: player.y + 5
                });
            } else {
                bullets.push({
                    x: player.x + player.width / 2 - BULLET_WIDTH / 2,
                    y: player.y
                });
            }
            lastShootTime = now;
        }
    }

    // 更新子彈
    function updateBullets() {
        // 玩家子彈
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= BULLET_SPEED;
            if (bullets[i].y < -BULLET_HEIGHT) {
                bullets.splice(i, 1);
            }
        }

        // 敵人子彈
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            enemyBullets[i].y += ENEMY_BULLET_SPEED;
            if (enemyBullets[i].y > CANVAS_HEIGHT) {
                enemyBullets.splice(i, 1);
            }
        }
    }

    // 更新敵人
    function updateEnemies(deltaTime) {
        enemies.forEach(enemy => {
            // 移動到目標位置
            if (enemy.y < enemy.targetY) {
                enemy.y += 2;
            } else {
                // 左右移動
                enemy.x += enemy.dx;
                if (enemy.x <= 0 || enemy.x >= CANVAS_WIDTH - enemy.width) {
                    enemy.dx = -enemy.dx;
                }

                // 射擊
                enemy.shootTimer -= deltaTime;
                if (enemy.shootTimer <= 0) {
                    enemyBullets.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height
                    });
                    enemy.shootTimer = 1500 + Math.random() * 2000 - wave * 100;
                }
            }
        });
    }

    // 碰撞檢測
    function checkCollisions() {
        // 子彈 vs 敵人
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + BULLET_WIDTH > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + BULLET_HEIGHT > enemy.y) {

                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    score += 100 * wave;
                    updateStats();
                    checkPowerupSpawn();
                    break;
                }
            }
        }

        // 道具 vs 玩家
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            if (player.x < powerup.x + powerup.size &&
                player.x + player.width > powerup.x &&
                player.y < powerup.y + powerup.size &&
                player.y + player.height > powerup.y) {

                collectPowerup(powerup);
                powerups.splice(i, 1);
            }
        }

        // 敵人子彈 vs 玩家
        if (invincibleTimer <= 0) {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const bullet = enemyBullets[i];
                if (bullet.x > player.x &&
                    bullet.x < player.x + player.width &&
                    bullet.y > player.y &&
                    bullet.y < player.y + player.height) {

                    enemyBullets.splice(i, 1);
                    playerHit();
                    break;
                }
            }
        }

        // 敵人 vs 玩家
        if (invincibleTimer <= 0) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                if (player.x < enemy.x + enemy.width &&
                    player.x + player.width > enemy.x &&
                    player.y < enemy.y + enemy.height &&
                    player.y + player.height > enemy.y) {

                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    enemies.splice(i, 1);
                    playerHit();
                    break;
                }
            }
        }
    }

    // 玩家被擊中
    function playerHit() {
        // 護盾擋下攻擊
        if (hasShield) {
            hasShield = false;
            shieldTimer = 0;
            createExplosion(player.x + player.width / 2, player.y + player.height / 2, 12, '#48bb78');
            invincibleTimer = 500; // 短暫無敵
            return;
        }

        lives--;
        updateStats();
        createExplosion(player.x + player.width / 2, player.y + player.height / 2, 15);

        if (lives <= 0) {
            gameOver();
        } else {
            invincibleTimer = 2000; // 2秒無敵時間
            initPlayer();
        }
    }

    // 檢查波次
    function checkWave(deltaTime) {
        if (enemies.length === 0) {
            waveTimer += deltaTime;
            if (waveTimer > 1500) {
                wave++;
                updateStats();
                spawnWave();
            }
        }
    }

    // 遊戲主循環
    let lastTime = 0;
    function gameLoop(timestamp) {
        if (!isPlaying || isPaused) return;

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (invincibleTimer > 0) {
            invincibleTimer -= deltaTime;
        }

        updateStars();
        updateParticles();
        updatePowerups();
        updatePowerupTimers(deltaTime);
        movePlayer();
        playerShoot();
        updateBullets();
        updateEnemies(deltaTime);
        checkCollisions();
        checkWave(deltaTime);
        draw();

        animationId = requestAnimationFrame(gameLoop);
    }

    // 更新統計
    function updateStats() {
        scoreDisplay.textContent = score;
        waveDisplay.textContent = wave;
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
        wave = 1;
        lives = 3;
        isPlaying = true;
        isPaused = false;
        bullets = [];
        enemies = [];
        enemyBullets = [];
        particles = [];
        powerups = [];
        invincibleTimer = 0;
        lastTime = 0;
        lastPowerupScore = 0;

        // 重置道具效果
        hasShield = false;
        shieldTimer = 0;
        hasTriple = false;
        tripleTimer = 0;
        hasRapid = false;
        rapidTimer = 0;

        initCanvas();
        initStars();
        initPlayer();
        loadBestScore();
        updateStats();
        spawnWave();

        // 切換畫面
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        pauseOverlay.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        draw();
        animationId = requestAnimationFrame(gameLoop);
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
            lastTime = performance.now();
            animationId = requestAnimationFrame(gameLoop);
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
        finalWave.textContent = wave;
        finalWaveIDE.textContent = wave;

        // 顯示結束畫面
        setTimeout(() => {
            gameOverScreen.classList.remove('hidden');
        }, 500);
    }

    // 回主選單
    function backToMenu() {
        window.location.href = '../index.html';
    }

    // 鍵盤控制
    function handleKeydown(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                keys.up = true;
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                keys.down = true;
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                keys.left = true;
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                keys.right = true;
                e.preventDefault();
                break;
            case 'z':
            case 'Z':
            case ' ':
                keys.shoot = true;
                e.preventDefault();
                break;
            case 'p':
            case 'P':
            case 'Escape':
                togglePause();
                e.preventDefault();
                break;
        }
    }

    function handleKeyup(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                keys.down = false;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                keys.right = false;
                break;
            case 'z':
            case 'Z':
            case ' ':
                keys.shoot = false;
                break;
        }
    }

    // 事件監聽
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    backMenuBtn.addEventListener('click', backToMenu);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);

    // 初始化
    function init() {
        initCanvas();
        initStars();
        loadBestScore();
    }

    init();
})();
