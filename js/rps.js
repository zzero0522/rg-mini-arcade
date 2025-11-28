// 剪刀石頭布遊戲
(function () {
    const BEST_STREAK_KEY = 'rg-rps-best-streak';

    // 選項
    const CHOICES = {
        rock: { emoji: '✊', beats: 'scissors', name: '石頭' },
        paper: { emoji: '✋', beats: 'rock', name: '布' },
        scissors: { emoji: '✌️', beats: 'paper', name: '剪刀' }
    };

    // 遊戲狀態
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let streak = 0;
    let bestStreak = 0;
    let history = [];
    let isProcessing = false;

    // DOM 元素
    const playerChoiceDisplay = document.getElementById('player-choice');
    const computerChoiceDisplay = document.getElementById('computer-choice');
    const resultText = document.getElementById('result-text');
    const streakDisplay = document.getElementById('streak');
    const bestStreakDisplay = document.getElementById('best-streak');
    const winsDisplay = document.getElementById('wins');
    const drawsDisplay = document.getElementById('draws');
    const lossesDisplay = document.getElementById('losses');
    const hintDisplay = document.getElementById('hint');
    const historyContainer = document.getElementById('history');
    const choiceButtons = document.querySelectorAll('.choice-btn');

    // 載入最高連勝
    function loadBestStreak() {
        bestStreak = parseInt(localStorage.getItem(BEST_STREAK_KEY)) || 0;
        bestStreakDisplay.textContent = bestStreak;
    }

    // 儲存最高連勝
    function saveBestStreak() {
        if (streak > bestStreak) {
            bestStreak = streak;
            localStorage.setItem(BEST_STREAK_KEY, bestStreak);
            bestStreakDisplay.textContent = bestStreak;
        }
    }

    // 電腦選擇
    function getComputerChoice() {
        const choices = Object.keys(CHOICES);
        return choices[Math.floor(Math.random() * choices.length)];
    }

    // 判定結果
    function getResult(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return 'draw';
        } else if (CHOICES[playerChoice].beats === computerChoice) {
            return 'win';
        } else {
            return 'lose';
        }
    }

    // 更新顯示
    function updateStats() {
        streakDisplay.textContent = streak;
        winsDisplay.textContent = wins;
        drawsDisplay.textContent = draws;
        lossesDisplay.textContent = losses;
    }

    // 新增歷史紀錄
    function addToHistory(playerChoice, computerChoice, result) {
        history.unshift({ playerChoice, computerChoice, result });

        // 只保留最近 20 筆
        if (history.length > 20) {
            history.pop();
        }

        renderHistory();
    }

    // 渲染歷史紀錄
    function renderHistory() {
        historyContainer.innerHTML = '';

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = `history-item ${item.result}`;
            div.innerHTML = `
                ${CHOICES[item.playerChoice].emoji}
                <span class="history-vs">vs</span>
                ${CHOICES[item.computerChoice].emoji}
            `;
            historyContainer.appendChild(div);
        });
    }

    // 顯示結果文字
    function showResult(result) {
        resultText.className = 'result-text ' + result;

        if (result === 'win') {
            resultText.innerHTML = `
                <span class="normal-title">你贏了！</span>
                <span class="ide-title">return "WIN";</span>
            `;
        } else if (result === 'lose') {
            resultText.innerHTML = `
                <span class="normal-title">你輸了...</span>
                <span class="ide-title">return "LOSE";</span>
            `;
        } else {
            resultText.innerHTML = `
                <span class="normal-title">平手！</span>
                <span class="ide-title">return "DRAW";</span>
            `;
        }
    }

    // 玩遊戲
    async function play(playerChoice) {
        if (isProcessing) return;
        isProcessing = true;

        // 重置顯示
        playerChoiceDisplay.className = 'choice-display';
        computerChoiceDisplay.className = 'choice-display';
        resultText.textContent = '';
        resultText.className = 'result-text';

        // 顯示玩家選擇
        playerChoiceDisplay.textContent = CHOICES[playerChoice].emoji;

        // 電腦搖擺動畫
        computerChoiceDisplay.classList.add('shaking');
        computerChoiceDisplay.textContent = '🤔';

        // 等待一下製造懸念
        await new Promise(resolve => setTimeout(resolve, 800));

        // 電腦選擇
        const computerChoice = getComputerChoice();
        computerChoiceDisplay.classList.remove('shaking');
        computerChoiceDisplay.classList.add('revealed');
        computerChoiceDisplay.textContent = CHOICES[computerChoice].emoji;

        // 判定結果
        const result = getResult(playerChoice, computerChoice);

        // 更新統計
        if (result === 'win') {
            wins++;
            streak++;
            saveBestStreak();
            playerChoiceDisplay.classList.add('win');
            computerChoiceDisplay.classList.add('lose');
        } else if (result === 'lose') {
            losses++;
            streak = 0;
            playerChoiceDisplay.classList.add('lose');
            computerChoiceDisplay.classList.add('win');
        } else {
            draws++;
            playerChoiceDisplay.classList.add('draw');
            computerChoiceDisplay.classList.add('draw');
        }

        showResult(result);
        updateStats();
        addToHistory(playerChoice, computerChoice, result);

        // 更新提示
        if (streak >= 5) {
            hintDisplay.innerHTML = `
                <span class="normal-title">🔥 ${streak} 連勝！繼續保持！</span>
                <span class="ide-title">// 🔥 ${streak} win streak!</span>
            `;
        } else if (streak >= 3) {
            hintDisplay.innerHTML = `
                <span class="normal-title">👍 ${streak} 連勝中！</span>
                <span class="ide-title">// ${streak} streak, keep going!</span>
            `;
        } else {
            hintDisplay.innerHTML = `
                <span class="normal-title">選擇你的出拳！</span>
                <span class="ide-title">// Select your move</span>
            `;
        }

        isProcessing = false;
    }

    // 初始化
    function init() {
        loadBestStreak();
        updateStats();
    }

    // 事件監聽
    choiceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const choice = btn.dataset.choice;
            play(choice);
        });
    });

    // 鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
        if (e.key === '1' || e.key.toLowerCase() === 'r') {
            play('rock');
        } else if (e.key === '2' || e.key.toLowerCase() === 'p') {
            play('paper');
        } else if (e.key === '3' || e.key.toLowerCase() === 's') {
            play('scissors');
        }
    });

    // 執行初始化
    init();
})();
