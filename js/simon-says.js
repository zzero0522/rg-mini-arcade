// 順序記憶遊戲 (Simon Says)
(function() {
    const BEST_SCORE_KEY = 'rg-simon-best';

    // 遊戲狀態
    let sequence = [];
    let playerIndex = 0;
    let level = 1;
    let bestScore = 0;
    let isPlaying = false;
    let isShowingSequence = false;

    // DOM 元素
    const startScreen = document.getElementById('start-screen');
    const gameStats = document.getElementById('game-stats');
    const gameMessage = document.getElementById('game-message');
    const simonBoard = document.getElementById('simon-board');
    const gameOverScreen = document.getElementById('game-over');
    const levelDisplay = document.getElementById('level');
    const bestScoreDisplay = document.getElementById('best-score');
    const gameOverMsg = document.getElementById('game-over-msg');
    const buttons = document.querySelectorAll('.simon-btn');

    // 載入最佳紀錄
    function loadBestScore() {
        const saved = localStorage.getItem(BEST_SCORE_KEY);
        if (saved) {
            bestScore = parseInt(saved);
            bestScoreDisplay.textContent = bestScore;
        }
    }

    // 儲存最佳紀錄
    function saveBestScore() {
        if (level - 1 > bestScore) {
            bestScore = level - 1;
            localStorage.setItem(BEST_SCORE_KEY, bestScore);
            bestScoreDisplay.textContent = bestScore;
        }
    }

    // 閃爍按鈕
    function flashButton(colorIndex, duration = 400) {
        return new Promise(resolve => {
            const btn = buttons[colorIndex];
            btn.classList.add('active');

            setTimeout(() => {
                btn.classList.remove('active');
                setTimeout(resolve, 100);
            }, duration);
        });
    }

    // 播放序列
    async function playSequence() {
        isShowingSequence = true;
        setButtonsDisabled(true);
        updateMessage(true);

        await delay(500);

        for (let i = 0; i < sequence.length; i++) {
            await flashButton(sequence[i]);
        }

        isShowingSequence = false;
        setButtonsDisabled(false);
        updateMessage(false);
    }

    // 新增隨機顏色到序列
    function addToSequence() {
        const randomColor = Math.floor(Math.random() * 4);
        sequence.push(randomColor);
    }

    // 設定按鈕禁用狀態
    function setButtonsDisabled(disabled) {
        buttons.forEach(btn => {
            if (disabled) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });
    }

    // 更新訊息
    function updateMessage(showing) {
        const normalTitle = gameMessage.querySelector('.normal-title');
        const ideTitle = gameMessage.querySelector('.ide-title');

        if (showing) {
            normalTitle.textContent = '請記住順序...';
            ideTitle.textContent = '// Memorizing...';
        } else {
            normalTitle.textContent = '輪到你了！';
            ideTitle.textContent = '// Your turn!';
        }
    }

    // 延遲函式
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 處理玩家點擊
    async function handlePlayerClick(colorIndex) {
        if (!isPlaying || isShowingSequence) return;

        await flashButton(colorIndex, 200);

        if (colorIndex === sequence[playerIndex]) {
            playerIndex++;

            if (playerIndex === sequence.length) {
                // 完成這一關
                level++;
                levelDisplay.textContent = level;
                playerIndex = 0;

                await delay(500);
                addToSequence();
                playSequence();
            }
        } else {
            // 錯誤，遊戲結束
            gameOver();
        }
    }

    // 開始遊戲
    function startGame() {
        sequence = [];
        playerIndex = 0;
        level = 1;
        isPlaying = true;

        levelDisplay.textContent = '1';
        loadBestScore();

        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameStats.classList.remove('hidden');
        gameMessage.classList.remove('hidden');
        simonBoard.classList.remove('hidden');

        addToSequence();
        playSequence();
    }

    // 遊戲結束
    function gameOver() {
        isPlaying = false;
        saveBestScore();

        const finalLevel = level - 1;
        const isIDE = document.documentElement.classList.contains('ide-mode');

        if (isIDE) {
            gameOverMsg.innerHTML = `<span class="ide-title">// Reached level ${finalLevel}</span>`;
        } else {
            gameOverMsg.innerHTML = `<span class="normal-title">你到達了第 ${finalLevel} 關！</span>`;
        }

        simonBoard.classList.add('hidden');
        gameMessage.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
    }

    // 返回開始畫面
    function backToStart() {
        gameOverScreen.classList.add('hidden');
        gameStats.classList.add('hidden');
        simonBoard.classList.add('hidden');
        gameMessage.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    // 事件綁定
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('retry-btn').addEventListener('click', startGame);
    document.getElementById('back-btn').addEventListener('click', backToStart);

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const colorIndex = parseInt(btn.dataset.color);
            handlePlayerClick(colorIndex);
        });
    });

    // 初始化
    loadBestScore();
})();
