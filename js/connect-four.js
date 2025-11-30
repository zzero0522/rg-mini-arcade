// 四子棋 (Connect Four)
(function() {
    const ROWS = 6;
    const COLS = 7;
    const PLAYER = 'player';
    const AI = 'ai';

    // 遊戲狀態
    let board = [];
    let difficulty = 'medium';
    let isPlaying = false;
    let isPlayerTurn = true;
    let playerScore = 0;
    let aiScore = 0;
    let drawScore = 0;

    // DOM 元素
    const startScreen = document.getElementById('start-screen');
    const gameStats = document.getElementById('game-stats');
    const gameStatus = document.getElementById('game-status');
    const gameBoard = document.getElementById('game-board');
    const gameControls = document.getElementById('game-controls');
    const resultScreen = document.getElementById('result-screen');
    const resultTitle = document.getElementById('result-title');
    const resultMsg = document.getElementById('result-msg');
    const playerScoreDisplay = document.getElementById('player-score');
    const aiScoreDisplay = document.getElementById('ai-score');
    const drawScoreDisplay = document.getElementById('draw-score');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');

    // 初始化棋盤
    function initBoard() {
        board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    }

    // 渲染棋盤
    function renderBoard() {
        gameBoard.innerHTML = '';

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('button');
                cell.className = 'c4-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (board[row][col]) {
                    cell.classList.add(board[row][col], 'filled');
                }

                cell.addEventListener('click', () => handleClick(col));
                cell.addEventListener('mouseenter', () => handleHover(col, true));
                cell.addEventListener('mouseleave', () => handleHover(col, false));

                gameBoard.appendChild(cell);
            }
        }
    }

    // 處理懸停
    function handleHover(col, isHovering) {
        if (!isPlaying || !isPlayerTurn) return;

        for (let i = 0; i < COLS; i++) {
            gameBoard.classList.remove(`hovering-${i}`);
        }

        if (isHovering && getAvailableRow(col) !== -1) {
            gameBoard.classList.add(`hovering-${col}`);
        }
    }

    // 取得可放置的列
    function getAvailableRow(col) {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (!board[row][col]) {
                return row;
            }
        }
        return -1;
    }

    // 更新狀態提示
    function updateStatus(text, ideText) {
        const normalTitle = gameStatus.querySelector('.normal-title');
        const ideTitle = gameStatus.querySelector('.ide-title');
        normalTitle.textContent = text;
        ideTitle.textContent = ideText;
    }

    // 處理點擊
    function handleClick(col) {
        if (!isPlaying || !isPlayerTurn) return;

        const row = getAvailableRow(col);
        if (row === -1) return;

        makeMove(row, col, PLAYER);
    }

    // 執行落子
    function makeMove(row, col, player) {
        board[row][col] = player;

        // 更新顯示
        const cell = gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add(player, 'filled', 'dropping');

        setTimeout(() => cell.classList.remove('dropping'), 300);

        // 檢查勝利
        const winningCells = checkWinner(row, col, player);
        if (winningCells) {
            endGame(player, winningCells);
            return;
        }

        // 檢查平手
        if (checkDraw()) {
            endGame('draw');
            return;
        }

        // 切換回合
        isPlayerTurn = !isPlayerTurn;

        if (isPlayerTurn) {
            updateStatus('輪到你了！', '// Your turn');
        } else {
            updateStatus('AI 思考中...', '// AI thinking...');
            setTimeout(aiMove, 600);
        }
    }

    // 檢查勝利
    function checkWinner(row, col, player) {
        const directions = [
            [[0, 1], [0, -1]],   // 橫
            [[1, 0], [-1, 0]],   // 直
            [[1, 1], [-1, -1]], // 斜 \
            [[1, -1], [-1, 1]]  // 斜 /
        ];

        for (const [dir1, dir2] of directions) {
            const cells = [[row, col]];

            // 方向1
            let r = row + dir1[0];
            let c = col + dir1[1];
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                cells.push([r, c]);
                r += dir1[0];
                c += dir1[1];
            }

            // 方向2
            r = row + dir2[0];
            c = col + dir2[1];
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                cells.push([r, c]);
                r += dir2[0];
                c += dir2[1];
            }

            if (cells.length >= 4) {
                return cells;
            }
        }

        return null;
    }

    // 檢查平手
    function checkDraw() {
        return board[0].every(cell => cell !== null);
    }

    // AI 移動
    function aiMove() {
        if (!isPlaying) return;

        let col;

        if (difficulty === 'easy') {
            col = getRandomMove();
        } else if (difficulty === 'medium') {
            col = Math.random() < 0.6 ? getBestMove(3) : getRandomMove();
        } else {
            col = getBestMove(5);
        }

        if (col !== null) {
            const row = getAvailableRow(col);
            if (row !== -1) {
                makeMove(row, col, AI);
            }
        }
    }

    // 隨機移動
    function getRandomMove() {
        const available = [];
        for (let col = 0; col < COLS; col++) {
            if (getAvailableRow(col) !== -1) {
                available.push(col);
            }
        }
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    }

    // 評估局面分數
    function evaluateWindow(window, player) {
        const opponent = player === AI ? PLAYER : AI;
        const playerCount = window.filter(c => c === player).length;
        const opponentCount = window.filter(c => c === opponent).length;
        const emptyCount = window.filter(c => c === null).length;

        if (playerCount === 4) return 100;
        if (playerCount === 3 && emptyCount === 1) return 5;
        if (playerCount === 2 && emptyCount === 2) return 2;
        if (opponentCount === 3 && emptyCount === 1) return -4;

        return 0;
    }

    // 評估整個棋盤
    function evaluateBoard(player) {
        let score = 0;

        // 中間列優先
        const centerCol = Math.floor(COLS / 2);
        const centerCount = board.filter(row => row[centerCol] === player).length;
        score += centerCount * 3;

        // 橫向
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col <= COLS - 4; col++) {
                const window = [board[row][col], board[row][col+1], board[row][col+2], board[row][col+3]];
                score += evaluateWindow(window, player);
            }
        }

        // 直向
        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row <= ROWS - 4; row++) {
                const window = [board[row][col], board[row+1][col], board[row+2][col], board[row+3][col]];
                score += evaluateWindow(window, player);
            }
        }

        // 斜向 \
        for (let row = 0; row <= ROWS - 4; row++) {
            for (let col = 0; col <= COLS - 4; col++) {
                const window = [board[row][col], board[row+1][col+1], board[row+2][col+2], board[row+3][col+3]];
                score += evaluateWindow(window, player);
            }
        }

        // 斜向 /
        for (let row = 3; row < ROWS; row++) {
            for (let col = 0; col <= COLS - 4; col++) {
                const window = [board[row][col], board[row-1][col+1], board[row-2][col+2], board[row-3][col+3]];
                score += evaluateWindow(window, player);
            }
        }

        return score;
    }

    // Minimax with Alpha-Beta
    function minimax(depth, alpha, beta, isMaximizing) {
        const validCols = [];
        for (let col = 0; col < COLS; col++) {
            if (getAvailableRow(col) !== -1) validCols.push(col);
        }

        // 終止條件
        if (depth === 0 || validCols.length === 0) {
            return { score: evaluateBoard(AI), col: null };
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            let bestCol = validCols[0];

            for (const col of validCols) {
                const row = getAvailableRow(col);
                board[row][col] = AI;

                const winner = checkWinner(row, col, AI);
                let score;
                if (winner) {
                    score = 10000;
                } else {
                    score = minimax(depth - 1, alpha, beta, false).score;
                }

                board[row][col] = null;

                if (score > maxScore) {
                    maxScore = score;
                    bestCol = col;
                }
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }

            return { score: maxScore, col: bestCol };
        } else {
            let minScore = Infinity;
            let bestCol = validCols[0];

            for (const col of validCols) {
                const row = getAvailableRow(col);
                board[row][col] = PLAYER;

                const winner = checkWinner(row, col, PLAYER);
                let score;
                if (winner) {
                    score = -10000;
                } else {
                    score = minimax(depth - 1, alpha, beta, true).score;
                }

                board[row][col] = null;

                if (score < minScore) {
                    minScore = score;
                    bestCol = col;
                }
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }

            return { score: minScore, col: bestCol };
        }
    }

    // 取得最佳移動
    function getBestMove(depth) {
        return minimax(depth, -Infinity, Infinity, true).col;
    }

    // 結束遊戲
    function endGame(winner, winningCells = null) {
        isPlaying = false;

        // 標記獲勝格子
        if (winningCells) {
            winningCells.forEach(([row, col]) => {
                const cell = gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cell.classList.add('winner');
            });
        }

        const isIDE = document.body.classList.contains('ide-mode');

        setTimeout(() => {
            if (winner === PLAYER) {
                playerScore++;
                playerScoreDisplay.textContent = playerScore;
                resultTitle.innerHTML = isIDE
                    ? '<span class="ide-title">// You Win!</span>'
                    : '<span class="normal-title">🎉 你贏了！</span>';
                resultMsg.innerHTML = isIDE
                    ? '<span class="ide-title">// Great job!</span>'
                    : '<span class="normal-title">太厲害了！</span>';
            } else if (winner === AI) {
                aiScore++;
                aiScoreDisplay.textContent = aiScore;
                resultTitle.innerHTML = isIDE
                    ? '<span class="ide-title">// AI Wins</span>'
                    : '<span class="normal-title">🟡 AI 贏了</span>';
                resultMsg.innerHTML = isIDE
                    ? '<span class="ide-title">// Try again</span>'
                    : '<span class="normal-title">再試一次吧！</span>';
            } else {
                drawScore++;
                drawScoreDisplay.textContent = drawScore;
                resultTitle.innerHTML = isIDE
                    ? '<span class="ide-title">// Draw</span>'
                    : '<span class="normal-title">🤝 平手</span>';
                resultMsg.innerHTML = isIDE
                    ? '<span class="ide-title">// Well matched</span>'
                    : '<span class="normal-title">勢均力敵！</span>';
            }

            gameBoard.classList.add('hidden');
            gameControls.classList.add('hidden');
            gameStatus.classList.add('hidden');
            resultScreen.classList.remove('hidden');
        }, 1000);
    }

    // 開始遊戲
    function startGame() {
        initBoard();
        isPlaying = true;
        isPlayerTurn = true;

        renderBoard();
        updateStatus('輪到你了！', '// Your turn');

        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        gameStats.classList.remove('hidden');
        gameStatus.classList.remove('hidden');
        gameBoard.classList.remove('hidden');
        gameControls.classList.remove('hidden');
    }

    // 返回開始畫面
    function backToStart() {
        playerScore = 0;
        aiScore = 0;
        drawScore = 0;
        playerScoreDisplay.textContent = '0';
        aiScoreDisplay.textContent = '0';
        drawScoreDisplay.textContent = '0';

        resultScreen.classList.add('hidden');
        gameStats.classList.add('hidden');
        gameStatus.classList.add('hidden');
        gameBoard.classList.add('hidden');
        gameControls.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    // 選擇難度
    function selectDifficulty(e) {
        const btn = e.target.closest('.difficulty-btn');
        if (!btn) return;

        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.difficulty;
    }

    // 事件綁定
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('play-again-btn').addEventListener('click', startGame);
    document.getElementById('back-btn').addEventListener('click', backToStart);
    difficultyBtns.forEach(btn => btn.addEventListener('click', selectDifficulty));
})();
