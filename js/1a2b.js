// 1A2B 猜數字遊戲
(function () {
    const BEST_RECORD_KEY = 'rg-1a2b-best-';

    // 遊戲狀態
    let secretNumber = '';
    let digits = 4;
    let attempts = 0;
    let isPlaying = false;
    let history = [];

    // DOM 元素
    const startScreen = document.getElementById('start-screen');
    const winScreen = document.getElementById('win-screen');
    const gameContent = document.getElementById('game-content');
    const digitInputsContainer = document.getElementById('digit-inputs');
    const guessBtn = document.getElementById('guess-btn');
    const startBtn = document.getElementById('start-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const changeDifficultyBtn = document.getElementById('change-difficulty-btn');
    const attemptsDisplay = document.getElementById('attempts');
    const bestRecordDisplay = document.getElementById('best-record');
    const difficultyDisplay = document.getElementById('difficulty');
    const historyContainer = document.getElementById('history');
    const messageDisplay = document.getElementById('message');
    const diffButtons = document.querySelectorAll('.diff-btn');
    const answerDisplay = document.getElementById('answer-display');
    const answerDisplayIDE = document.getElementById('answer-display-ide');
    const finalAttempts = document.getElementById('final-attempts');
    const finalAttemptsIDE = document.getElementById('final-attempts-ide');

    // 生成不重複的隨機數字
    function generateSecretNumber() {
        const available = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let result = '';

        // 第一位不能是 0
        const firstIndex = Math.floor(Math.random() * 9) + 1;
        result += available[firstIndex];
        available.splice(firstIndex, 1);

        // 其餘位數
        for (let i = 1; i < digits; i++) {
            const index = Math.floor(Math.random() * available.length);
            result += available[index];
            available.splice(index, 1);
        }

        return result;
    }

    // 建立輸入框
    function createInputs() {
        digitInputsContainer.innerHTML = '';

        for (let i = 0; i < digits; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'digit-input';
            input.maxLength = 1;
            input.dataset.index = i;
            input.inputMode = 'numeric';
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeydown);
            input.addEventListener('focus', () => input.select());
            digitInputsContainer.appendChild(input);
        }
    }

    // 處理輸入
    function handleInput(e) {
        const input = e.target;
        const value = input.value;

        // 只允許數字
        if (!/^\d$/.test(value)) {
            input.value = '';
            return;
        }

        // 自動跳到下一格
        const index = parseInt(input.dataset.index);
        if (index < digits - 1) {
            const inputs = digitInputsContainer.querySelectorAll('.digit-input');
            inputs[index + 1].focus();
        }

        clearMessage();
    }

    // 處理按鍵
    function handleKeydown(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');

        if (e.key === 'Backspace' && input.value === '' && index > 0) {
            inputs[index - 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputs[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < digits - 1) {
            inputs[index + 1].focus();
        } else if (e.key === 'Enter') {
            makeGuess();
        }
    }

    // 取得輸入的猜測
    function getGuess() {
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');
        let guess = '';
        inputs.forEach(input => {
            guess += input.value;
        });
        return guess;
    }

    // 驗證猜測
    function validateGuess(guess) {
        if (guess.length !== digits) {
            return { valid: false, message: '請填寫所有數字！' };
        }

        // 檢查是否有重複數字
        const unique = new Set(guess.split(''));
        if (unique.size !== digits) {
            return { valid: false, message: '數字不能重複！' };
        }

        return { valid: true };
    }

    // 計算 A 和 B
    function calculateResult(guess) {
        let a = 0;
        let b = 0;

        for (let i = 0; i < digits; i++) {
            if (guess[i] === secretNumber[i]) {
                a++;
            } else if (secretNumber.includes(guess[i])) {
                b++;
            }
        }

        return { a, b };
    }

    // 進行猜測
    function makeGuess() {
        if (!isPlaying) return;

        const guess = getGuess();
        const validation = validateGuess(guess);

        if (!validation.valid) {
            showMessage(validation.message, 'error');
            shakeInputs();
            return;
        }

        attempts++;
        attemptsDisplay.textContent = attempts;

        const result = calculateResult(guess);
        addToHistory(guess, result);

        if (result.a === digits) {
            // 贏了！
            win();
        } else {
            // 繼續猜
            clearInputs();
            focusFirstInput();
        }
    }

    // 新增到歷史紀錄
    function addToHistory(guess, result) {
        history.unshift({ guess, result });

        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span class="history-number">#${attempts}</span>
            <span class="history-guess">${guess}</span>
            <div class="history-result">
                <span class="result-a">${result.a}A</span>
                <span class="result-b">${result.b}B</span>
            </div>
        `;

        historyContainer.insertBefore(item, historyContainer.firstChild);
    }

    // 顯示訊息
    function showMessage(text, type = '') {
        messageDisplay.textContent = text;
        messageDisplay.className = 'message ' + type;
    }

    // 清除訊息
    function clearMessage() {
        messageDisplay.textContent = '';
        messageDisplay.className = 'message';
    }

    // 抖動輸入框
    function shakeInputs() {
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');
        inputs.forEach(input => {
            input.classList.add('error');
            setTimeout(() => input.classList.remove('error'), 300);
        });
    }

    // 清空輸入框
    function clearInputs() {
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');
        inputs.forEach(input => {
            input.value = '';
        });
    }

    // 聚焦第一個輸入框
    function focusFirstInput() {
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }

    // 載入最佳紀錄
    function loadBestRecord() {
        const record = localStorage.getItem(BEST_RECORD_KEY + digits);
        if (record) {
            bestRecordDisplay.textContent = record;
        } else {
            bestRecordDisplay.textContent = '-';
        }
    }

    // 儲存最佳紀錄
    function saveBestRecord() {
        const currentBest = localStorage.getItem(BEST_RECORD_KEY + digits);
        if (!currentBest || attempts < parseInt(currentBest)) {
            localStorage.setItem(BEST_RECORD_KEY + digits, attempts);
            bestRecordDisplay.textContent = attempts;
        }
    }

    // 勝利
    function win() {
        isPlaying = false;
        saveBestRecord();

        // 標記所有輸入框為成功
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');
        inputs.forEach(input => input.classList.add('success'));

        // 顯示勝利畫面
        answerDisplay.textContent = secretNumber;
        answerDisplayIDE.textContent = secretNumber;
        finalAttempts.textContent = attempts;
        finalAttemptsIDE.textContent = attempts;

        setTimeout(() => {
            winScreen.classList.remove('hidden');
        }, 500);
    }

    // 開始遊戲
    function startGame() {
        secretNumber = generateSecretNumber();
        attempts = 0;
        history = [];
        isPlaying = true;

        attemptsDisplay.textContent = '0';
        difficultyDisplay.textContent = digits;
        historyContainer.innerHTML = '';
        clearMessage();

        loadBestRecord();
        createInputs();

        startScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');

        focusFirstInput();

        // Debug 用（正式版移除）
        // console.log('Secret:', secretNumber);
    }

    // 返回難度選擇
    function backToMenu() {
        isPlaying = false;
        winScreen.classList.add('hidden');
        gameContent.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    // 選擇難度
    function selectDifficulty(e) {
        const btn = e.target.closest('.diff-btn');
        if (!btn) return;

        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        digits = parseInt(btn.dataset.digits);
    }

    // 事件監聽
    startBtn.addEventListener('click', startGame);
    guessBtn.addEventListener('click', makeGuess);
    playAgainBtn.addEventListener('click', startGame);
    changeDifficultyBtn.addEventListener('click', backToMenu);
    diffButtons.forEach(btn => btn.addEventListener('click', selectDifficulty));

    // 初始化狀態
    function init() {
        gameContent.classList.add('hidden');
        winScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    // 執行初始化
    init();
})();
