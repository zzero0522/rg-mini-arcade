// 採地雷遊戲

class Minesweeper {
    constructor() {
        this.boardSize = 9;
        this.mineCount = 10;
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.flagCount = 0;

        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.startScreen = document.getElementById('start-screen');
        this.gameStats = document.getElementById('game-stats');
        this.gameBoard = document.getElementById('game-board');
        this.gameControls = document.getElementById('game-controls');
        this.gameOverScreen = document.getElementById('game-over');
        this.winScreen = document.getElementById('win-screen');

        this.mineCountDisplay = document.getElementById('mine-count');
        this.flagCountDisplay = document.getElementById('flag-count');
        this.timerDisplay = document.getElementById('timer');

        this.gameOverMsg = document.getElementById('game-over-msg');
        this.winMsg = document.getElementById('win-msg');
    }

    bindEvents() {
        // 難度選擇
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.boardSize = parseInt(btn.dataset.size);
                this.mineCount = parseInt(btn.dataset.mines);
                this.startGame();
            });
        });

        // 重新開始
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startGame();
        });

        // 遊戲結束後重試
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.startGame();
        });

        // 勝利後再玩
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.showStartScreen();
        });

        // 返回選單
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showStartScreen();
        });

        document.getElementById('back-win-btn').addEventListener('click', () => {
            this.showStartScreen();
        });

        // 禁用右鍵選單
        this.gameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    showStartScreen() {
        this.stopTimer();
        this.startScreen.classList.remove('hidden');
        this.gameStats.classList.add('hidden');
        this.gameBoard.classList.add('hidden');
        this.gameControls.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.winScreen.classList.add('hidden');
    }

    startGame() {
        // 重置遊戲狀態
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.flagCount = 0;
        this.timer = 0;
        this.stopTimer();

        // 初始化空板
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            this.revealed[i] = [];
            this.flagged[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = 0;
                this.revealed[i][j] = false;
                this.flagged[i][j] = false;
            }
        }

        // 更新UI
        this.updateStats();
        this.renderBoard();
        this.showGameScreen();
    }

    placeMines(excludeRow, excludeCol) {
        // 在第一次點擊後放置地雷，避開點擊位置及周圍
        let minesPlaced = 0;
        const excludeZone = this.getNeighbors(excludeRow, excludeCol);
        excludeZone.push({ row: excludeRow, col: excludeCol });

        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);

            // 檢查是否在排除區域
            const isExcluded = excludeZone.some(pos => pos.row === row && pos.col === col);

            if (!isExcluded && this.board[row][col] !== -1) {
                this.board[row][col] = -1; // -1 表示地雷
                minesPlaced++;
            }
        }

        // 計算每個格子周圍的地雷數
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== -1) {
                    this.board[i][j] = this.countAdjacentMines(i, j);
                }
            }
        }
    }

    getNeighbors(row, col) {
        const neighbors = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < this.boardSize &&
                    newCol >= 0 && newCol < this.boardSize) {
                    neighbors.push({ row: newRow, col: newCol });
                }
            }
        }
        return neighbors;
    }

    countAdjacentMines(row, col) {
        let count = 0;
        const neighbors = this.getNeighbors(row, col);
        for (const { row: r, col: c } of neighbors) {
            if (this.board[r][c] === -1) {
                count++;
            }
        }
        return count;
    }

    showGameScreen() {
        this.startScreen.classList.add('hidden');
        this.gameStats.classList.remove('hidden');
        this.gameBoard.classList.remove('hidden');
        this.gameControls.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.winScreen.classList.add('hidden');
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board size-${this.boardSize}`;

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                // 左鍵點擊
                cell.addEventListener('click', (e) => {
                    this.handleClick(i, j);
                });

                // 右鍵標記
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(i, j);
                });

                // 行動裝置長按標記
                let longPressTimer;
                cell.addEventListener('touchstart', (e) => {
                    longPressTimer = setTimeout(() => {
                        e.preventDefault();
                        this.handleRightClick(i, j);
                    }, 500);
                });

                cell.addEventListener('touchend', () => {
                    clearTimeout(longPressTimer);
                });

                cell.addEventListener('touchmove', () => {
                    clearTimeout(longPressTimer);
                });

                this.gameBoard.appendChild(cell);
            }
        }
    }

    handleClick(row, col) {
        if (this.gameOver || this.gameWon) return;
        if (this.flagged[row][col]) return;
        if (this.revealed[row][col]) return;

        // 第一次點擊時放置地雷
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }

        this.revealCell(row, col);
        this.checkWin();
    }

    handleRightClick(row, col) {
        if (this.gameOver || this.gameWon) return;
        if (this.revealed[row][col]) return;

        this.flagged[row][col] = !this.flagged[row][col];
        this.flagCount = this.flagged[row][col] ? this.flagCount + 1 : this.flagCount - 1;

        this.updateCellDisplay(row, col);
        this.updateStats();
    }

    revealCell(row, col) {
        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) return;
        if (this.revealed[row][col]) return;
        if (this.flagged[row][col]) return;

        this.revealed[row][col] = true;
        this.updateCellDisplay(row, col);

        // 踩到地雷
        if (this.board[row][col] === -1) {
            this.endGame(false, row, col);
            return;
        }

        // 如果是空格（周圍沒有地雷），自動展開
        if (this.board[row][col] === 0) {
            const neighbors = this.getNeighbors(row, col);
            for (const { row: r, col: c } of neighbors) {
                this.revealCell(r, c);
            }
        }
    }

    updateCellDisplay(row, col) {
        const cell = this.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        cell.className = 'cell';

        if (this.flagged[row][col]) {
            cell.classList.add('flagged');
        } else if (this.revealed[row][col]) {
            cell.classList.add('revealed');
            const value = this.board[row][col];

            if (value === -1) {
                cell.classList.add('mine');
            } else if (value > 0) {
                cell.textContent = value;
                cell.dataset.number = value;
            }
        }
    }

    updateStats() {
        this.mineCountDisplay.textContent = this.mineCount;
        this.flagCountDisplay.textContent = this.flagCount;
        this.timerDisplay.textContent = this.timer;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = this.timer;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    checkWin() {
        let revealedCount = 0;
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.revealed[i][j]) revealedCount++;
            }
        }

        const totalSafeCells = this.boardSize * this.boardSize - this.mineCount;
        if (revealedCount === totalSafeCells) {
            this.endGame(true);
        }
    }

    endGame(won, explodedRow = -1, explodedCol = -1) {
        this.stopTimer();

        if (won) {
            this.gameWon = true;
            // 自動標記所有地雷
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === -1 && !this.flagged[i][j]) {
                        this.flagged[i][j] = true;
                        this.updateCellDisplay(i, j);
                    }
                }
            }
            this.showWinScreen();
        } else {
            this.gameOver = true;
            // 標記爆炸的地雷
            if (explodedRow >= 0 && explodedCol >= 0) {
                const cell = this.gameBoard.querySelector(
                    `[data-row="${explodedRow}"][data-col="${explodedCol}"]`
                );
                if (cell) {
                    cell.classList.add('exploded');
                }
            }
            // 顯示所有地雷
            this.revealAllMines();
            this.showGameOverScreen();
        }
    }

    revealAllMines() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === -1) {
                    this.revealed[i][j] = true;
                    this.updateCellDisplay(i, j);
                }
            }
        }
    }

    showGameOverScreen() {
        const isIDE = document.documentElement.classList.contains('ide-mode');
        if (isIDE) {
            this.gameOverMsg.innerHTML = `<span class="ide-title">// Time: ${this.timer}s</span>`;
        } else {
            this.gameOverMsg.innerHTML = `<span class="normal-title">用時：${this.timer} 秒</span>`;
        }
        this.gameOverScreen.classList.remove('hidden');
    }

    showWinScreen() {
        const isIDE = document.documentElement.classList.contains('ide-mode');
        if (isIDE) {
            this.winMsg.innerHTML = `<span class="ide-title">// Cleared in ${this.timer}s</span>`;
        } else {
            this.winMsg.innerHTML = `<span class="normal-title">成功排除 ${this.mineCount} 顆地雷！<br>用時：${this.timer} 秒</span>`;
        }
        this.winScreen.classList.remove('hidden');
    }
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});
