// 記憶翻牌遊戲
(function () {
    const BEST_RECORD_KEY = 'rg-memory-best-';

    // 卡片圖案
    const CARD_SYMBOLS = [
        '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑',
        '🌟', '🌙', '☀️', '⭐', '🔥', '💧', '🌈', '❄️',
        '🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎵', '🎸',
        '🚀', '✈️', '🚗', '🚲', '⚡', '💎', '🔮', '🎁'
    ];

    // 遊戲狀態
    let gridSize = 6;  // 4x6 = 24 cards = 12 pairs
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let moves = 0;
    let timer = null;
    let timeElapsed = 0;
    let isPlaying = false;
    let canFlip = true;

    // DOM 元素
    const startScreen = document.getElementById('start-screen');
    const winScreen = document.getElementById('win-screen');
    const gameContent = document.getElementById('game-content');
    const cardGrid = document.getElementById('card-grid');
    const movesDisplay = document.getElementById('moves');
    const pairsDisplay = document.getElementById('pairs');
    const timerDisplay = document.getElementById('timer');
    const bestRecordDisplay = document.getElementById('best-record');
    const startBtn = document.getElementById('start-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const changeSizeBtn = document.getElementById('change-size-btn');
    const sizeButtons = document.querySelectorAll('.size-btn');
    const finalMoves = document.getElementById('final-moves');
    const finalMovesIDE = document.getElementById('final-moves-ide');
    const finalTime = document.getElementById('final-time');
    const finalTimeIDE = document.getElementById('final-time-ide');

    // 洗牌函式
    function shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 生成卡片
    function generateCards() {
        const numCards = 4 * gridSize;  // 4 rows × gridSize columns
        totalPairs = numCards / 2;

        // 選擇符號
        const selectedSymbols = shuffle(CARD_SYMBOLS).slice(0, totalPairs);

        // 創建配對
        const cardPairs = [...selectedSymbols, ...selectedSymbols];

        // 洗牌
        return shuffle(cardPairs);
    }

    // 渲染卡片
    function renderCards() {
        cardGrid.innerHTML = '';
        cardGrid.className = `card-grid size-${gridSize}`;

        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">?</div>
                    <div class="card-back">${symbol}</div>
                </div>
            `;

            card.addEventListener('click', () => flipCard(card));
            cardGrid.appendChild(card);
        });
    }

    // 翻牌
    function flipCard(card) {
        if (!isPlaying || !canFlip) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        if (flippedCards.length >= 2) return;

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = moves;
            checkMatch();
        }
    }

    // 檢查配對
    function checkMatch() {
        canFlip = false;
        const [card1, card2] = flippedCards;

        if (card1.dataset.symbol === card2.dataset.symbol) {
            // 配對成功
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            pairsDisplay.textContent = `${matchedPairs}/${totalPairs}`;

            flippedCards = [];
            canFlip = true;

            if (matchedPairs === totalPairs) {
                win();
            }
        } else {
            // 配對失敗，翻回去
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }

    // 格式化時間
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // 開始計時器
    function startTimer() {
        timer = setInterval(() => {
            timeElapsed++;
            timerDisplay.textContent = formatTime(timeElapsed);
        }, 1000);
    }

    // 載入最佳紀錄
    function loadBestRecord() {
        const record = localStorage.getItem(BEST_RECORD_KEY + gridSize);
        if (record) {
            bestRecordDisplay.textContent = record;
        } else {
            bestRecordDisplay.textContent = '-';
        }
    }

    // 儲存最佳紀錄
    function saveBestRecord() {
        const currentBest = localStorage.getItem(BEST_RECORD_KEY + gridSize);
        if (!currentBest || moves < parseInt(currentBest)) {
            localStorage.setItem(BEST_RECORD_KEY + gridSize, moves);
            bestRecordDisplay.textContent = moves;
        }
    }

    // 開始遊戲
    function startGame() {
        cards = generateCards();
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        timeElapsed = 0;
        isPlaying = true;
        canFlip = true;

        movesDisplay.textContent = '0';
        pairsDisplay.textContent = `0/${totalPairs}`;
        timerDisplay.textContent = '0:00';

        loadBestRecord();
        renderCards();

        startScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');

        startTimer();
    }

    // 勝利
    function win() {
        isPlaying = false;
        clearInterval(timer);
        saveBestRecord();

        finalMoves.textContent = moves;
        finalMovesIDE.textContent = moves;
        finalTime.textContent = formatTime(timeElapsed);
        finalTimeIDE.textContent = formatTime(timeElapsed);

        setTimeout(() => {
            winScreen.classList.remove('hidden');
        }, 500);
    }

    // 返回選單
    function backToMenu() {
        isPlaying = false;
        clearInterval(timer);
        winScreen.classList.add('hidden');
        gameContent.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    // 選擇難度
    function selectSize(e) {
        const btn = e.target.closest('.size-btn');
        if (!btn) return;

        sizeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gridSize = parseInt(btn.dataset.size);
    }

    // 初始化
    function init() {
        gameContent.classList.add('hidden');
        winScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        loadBestRecord();
    }

    // 事件監聽
    startBtn.addEventListener('click', startGame);
    playAgainBtn.addEventListener('click', startGame);
    changeSizeBtn.addEventListener('click', backToMenu);
    sizeButtons.forEach(btn => btn.addEventListener('click', selectSize));

    // 執行初始化
    init();
})();
