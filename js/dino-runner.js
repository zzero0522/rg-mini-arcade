/**
 * Dino Runner
 * A pixel-art runner game adapted to the global theme system
 */

class DinoRunner {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('game-container');

        // UI Elements
        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('high-score');
        this.finalScoreEl = document.getElementById('final-score');
        this.finalScoreIdeEl = document.getElementById('final-score-ide');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');

        // Game State
        this.isPlaying = false;
        this.isGameOver = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('dino-runner-highscore')) || 0;
        this.gameSpeed = 5;
        this.frameCount = 0;

        // Physics Constants
        this.GRAVITY = 0.6;
        this.JUMP_FORCE = -12;
        this.DOUBLE_JUMP_FORCE = -10;

        // Sprites (Binary Maps: 1 = pixel, 0 = empty)
        // 20x22 grid (scaled up by 2 or 3)
        this.sprites = {
            dino: [
                "00000000001111111100",
                "00000000011111111110",
                "00000000011111111111",
                "00000000011111111111",
                "00000000011111100000",
                "00000000011111111111",
                "00000000011111111111",
                "00000000011111111111",
                "00000000011110000000",
                "00000000111111110000",
                "00000000111111110000",
                "00000001111111110000",
                "00000011111111110000",
                "00000111111111110000",
                "00001111111111110000",
                "00001111111111110000",
                "00011111111111110000",
                "00011111111111110000",
                "00000011100111000000",
                "00000011000111000000",
                "00000011000110000000",
                "00000011000110000000"
            ],
            dinoRun1: [
                "00000000001111111100",
                "00000000011111111110",
                "00000000011111111111",
                "00000000011111111111",
                "00000000011111100000",
                "00000000011111111111",
                "00000000011111111111",
                "00000000011111111111",
                "00000000011110000000",
                "00000000111111110000",
                "00000000111111110000",
                "00000001111111110000",
                "00000011111111110000",
                "00000111111111110000",
                "00001111111111110000",
                "00001111111111110000",
                "00011111111111110000",
                "00011111111111110000",
                "00000011100110000000",
                "00000011000110000000",
                "00000011000000000000",
                "00000011000000000000"
            ],
            dinoRun2: [
                "00000000001111111100",
                "00000000011111111110",
                "00000000011111111111",
                "00000000011111111111",
                "00000000011111100000",
                "00000000011111111111",
                "00000000011111111111",
                "00000000011111111111",
                "00000000011110000000",
                "00000000111111110000",
                "00000000111111110000",
                "00000001111111110000",
                "00000011111111110000",
                "00000111111111110000",
                "00001111111111110000",
                "00001111111111110000",
                "00011111111111110000",
                "00011111111111110000",
                "00000000000111000000",
                "00000000000111000000",
                "00000000000110000000",
                "00000000000110000000"
            ],
            cactusSmall: [
                "0000110000",
                "0001110000",
                "0001110000",
                "1101110000",
                "1101110000",
                "1101110000",
                "1111110000",
                "0111110000",
                "0011110000",
                "0011110000",
                "0011110011",
                "0011110111",
                "0011110111",
                "0011111110",
                "0011111100",
                "0011111000",
                "0011110000",
                "0011110000",
                "0011110000",
                "0011110000"
            ],
            cactusLarge: [
                "0000011000000",
                "0000011000000",
                "0000011000000",
                "0000011000000",
                "0000011000000",
                "0000011000000",
                "0000011000000",
                "0011011000000",
                "0011011000000",
                "0011011000000",
                "0011011000000",
                "0011011000000",
                "0011011000000",
                "0011111000000",
                "0001111000000",
                "0000111000000",
                "0000111000000",
                "0000111000000",
                "0000111000110",
                "0000111000110",
                "0000111000110",
                "0000111000110",
                "0000111000110",
                "0000111111110",
                "0000111111100",
                "0000111111000",
                "0000111000000",
                "0000111000000",
                "0000111000000",
                "0000111000000"
            ],
            bird1: [
                "00000000001100000000",
                "00000000111100000000",
                "00000011111100000000",
                "00001111111100000000",
                "00011111111100000000",
                "00111111111100000000",
                "01111111111111111100",
                "11111111111110000000",
                "00011111110000000000",
                "00001111100000000000",
                "00000110000000000000",
                "00000100000000000000"
            ],
            bird2: [
                "00000000001100000000",
                "00000000111100000000",
                "00000011111100000000",
                "00001111111100000000",
                "00011111111100000000",
                "00111111111100000000",
                "01111111111111111100",
                "00011111111110000000",
                "00001111110000000000",
                "00000111110000000000",
                "00000011000000000000",
                "00000001000000000000"
            ]
        };

        // Entities
        this.player = {
            x: 50,
            y: 0,
            width: 40,
            height: 44,
            vy: 0,
            isGrounded: false,
            jumpCount: 0,
            maxJumps: 2,
            state: 'run', // run, jump, idle
            frame: 0
        };

        this.obstacles = [];
        this.particles = [];
        this.clouds = [];

        // Theme Colors
        this.colors = {
            bg: '#ffffff',
            text: '#000000',
            accent: '#007acc',
            secondary: '#f3f3f3'
        };

        // Initialize
        this.updateThemeColors();
        this.resize();
        this.updateHighScoreDisplay();
        this.initClouds();
        this.draw(); // Draw initial frame

        // Event Listeners
        window.addEventListener('resize', () => this.resize());
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());

        // Input handling
        ['keydown', 'mousedown', 'touchstart'].forEach(evt => {
            window.addEventListener(evt, (e) => this.handleInput(e));
        });

        // Watch for theme changes
        const observer = new MutationObserver(() => {
            this.updateThemeColors();
            if (!this.isPlaying) this.draw();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    updateThemeColors() {
        const style = getComputedStyle(document.documentElement);
        this.colors.bg = style.getPropertyValue('--bg-primary').trim();
        this.colors.text = style.getPropertyValue('--text-primary').trim();
        this.colors.accent = style.getPropertyValue('--accent').trim();
        this.colors.secondary = style.getPropertyValue('--bg-secondary').trim();
        this.colors.textSecondary = style.getPropertyValue('--text-secondary').trim();
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.groundY = this.canvas.height - 40;

        if (!this.isPlaying) {
            this.player.y = this.groundY - this.player.height;
            this.draw();
        }
    }

    initClouds() {
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height / 2),
                speed: Math.random() * 0.5 + 0.1,
                width: 40 + Math.random() * 40
            });
        }
    }

    handleInput(e) {
        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;
        if (e.type === 'touchstart') e.preventDefault();

        if (!this.isPlaying) return;

        this.jump();
    }

    jump() {
        if (this.player.jumpCount < this.player.maxJumps) {
            this.player.vy = this.player.jumpCount === 0 ? this.JUMP_FORCE : this.DOUBLE_JUMP_FORCE;
            this.player.jumpCount++;
            this.player.isGrounded = false;

            // Dust particles
            this.createDust(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height,
                5
            );
        }
    }

    startGame() {
        this.isPlaying = true;
        this.isGameOver = false;
        this.score = 0;
        this.gameSpeed = 6;
        this.obstacles = [];
        this.particles = [];
        this.player.y = this.groundY - this.player.height;
        this.player.vy = 0;
        this.player.jumpCount = 0;

        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    resetGame() {
        this.startGame();
    }

    spawnObstacle() {
        const isBird = Math.random() > 0.8 && this.score > 500; // Only spawn birds after some score
        const type = isBird ? 'bird' : (Math.random() > 0.5 ? 'cactusLarge' : 'cactusSmall');

        let width = 0, height = 0, y = 0;

        if (type === 'bird') {
            width = 40;
            height = 30;
            y = this.groundY - 50 - Math.random() * 40; // Variable height
        } else if (type === 'cactusLarge') {
            width = 26; // 13 * 2
            height = 60; // 30 * 2
            y = this.groundY - height;
        } else {
            width = 20; // 10 * 2
            height = 40; // 20 * 2
            y = this.groundY - height;
        }

        const obstacle = {
            x: this.canvas.width,
            y: y,
            width: width,
            height: height,
            type: type,
            frame: 0,
            markedForDeletion: false
        };
        this.obstacles.push(obstacle);
    }

    createDust(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 2,
                life: 1.0,
                size: Math.random() * 3 + 1
            });
        }
    }

    update() {
        this.score += 0.15;
        this.scoreEl.textContent = Math.floor(this.score).toString().padStart(5, '0');

        if (this.gameSpeed < 15) {
            this.gameSpeed += 0.001;
        }

        // Player Physics
        this.player.vy += this.GRAVITY;
        this.player.y += this.player.vy;

        if (this.player.y + this.player.height >= this.groundY) {
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
            this.player.isGrounded = true;
            this.player.jumpCount = 0;
        }

        // Player Animation State
        if (!this.player.isGrounded) {
            this.player.state = 'jump';
        } else {
            this.player.state = 'run';
        }

        // Animate Player
        if (this.frameCount % 6 === 0) {
            this.player.frame = (this.player.frame + 1) % 2;
        }

        // Obstacles
        if (this.frameCount % Math.floor(1200 / this.gameSpeed) === 0) {
            if (Math.random() > 0.4) this.spawnObstacle();
        }

        // Ensure minimum distance
        if (this.obstacles.length > 0) {
            const lastObstacle = this.obstacles[this.obstacles.length - 1];
            if (this.canvas.width - lastObstacle.x < 300) {
                // Don't spawn
            } else if (Math.random() < 0.02) {
                this.spawnObstacle();
            }
        } else if (Math.random() < 0.02) {
            this.spawnObstacle();
        }

        this.obstacles.forEach(obs => {
            obs.x -= this.gameSpeed;

            // Animate Birds
            if (obs.type === 'bird' && this.frameCount % 10 === 0) {
                obs.frame = (obs.frame + 1) % 2;
            }

            // Collision (Simple AABB with slight padding)
            const padding = 5;
            if (
                this.player.x + padding < obs.x + obs.width - padding &&
                this.player.x + this.player.width - padding > obs.x + padding &&
                this.player.y + padding < obs.y + obs.height - padding &&
                this.player.y + this.player.height - padding > obs.y + padding
            ) {
                this.gameOver();
            }

            if (obs.x + obs.width < 0) {
                obs.markedForDeletion = true;
            }
        });

        this.obstacles = this.obstacles.filter(obs => !obs.markedForDeletion);

        // Particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        // Clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * (this.canvas.height / 2);
            }
        });

        this.frameCount++;
    }

    drawSprite(ctx, spriteMap, x, y, scale = 2, color) {
        ctx.fillStyle = color;
        for (let r = 0; r < spriteMap.length; r++) {
            const row = spriteMap[r];
            for (let c = 0; c < row.length; c++) {
                if (row[c] === '1') {
                    ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Clouds
        this.ctx.fillStyle = this.colors.textSecondary;
        this.clouds.forEach(cloud => {
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(cloud.x, cloud.y, cloud.width, 10); // Simple cloud shape
        });
        this.ctx.globalAlpha = 1.0;

        // Ground Line
        this.ctx.strokeStyle = this.colors.text;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();

        // Player
        let sprite;
        if (this.player.state === 'jump') {
            sprite = this.sprites.dino; // Use idle/jump sprite
        } else {
            sprite = this.player.frame === 0 ? this.sprites.dinoRun1 : this.sprites.dinoRun2;
        }
        this.drawSprite(this.ctx, sprite, this.player.x, this.player.y, 2, this.colors.accent);

        // Obstacles
        this.obstacles.forEach(obs => {
            let sprite;
            if (obs.type === 'bird') {
                sprite = obs.frame === 0 ? this.sprites.bird1 : this.sprites.bird2;
                this.drawSprite(this.ctx, sprite, obs.x, obs.y, 2, this.colors.text);
            } else if (obs.type === 'cactusLarge') {
                sprite = this.sprites.cactusLarge;
                this.drawSprite(this.ctx, sprite, obs.x, obs.y, 2, this.colors.textSecondary);
            } else {
                sprite = this.sprites.cactusSmall;
                this.drawSprite(this.ctx, sprite, obs.x, obs.y, 2, this.colors.textSecondary);
            }
        });

        // Particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = this.colors.text;
            this.ctx.globalAlpha = p.life;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1.0;
    }

    gameLoop(timestamp) {
        if (!this.isPlaying) return;

        this.update();
        this.draw();

        if (!this.isGameOver) {
            requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.isGameOver = true;
        this.gameOverScreen.classList.remove('hidden');

        const finalScore = Math.floor(this.score);
        this.finalScoreEl.textContent = finalScore;
        if (this.finalScoreIdeEl) this.finalScoreIdeEl.textContent = finalScore;

        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('dino-runner-highscore', this.highScore);
            this.updateHighScoreDisplay();
        }

        this.draw();
    }

    updateHighScoreDisplay() {
        this.highScoreEl.textContent = this.highScore.toString().padStart(5, '0');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DinoRunner();
});
