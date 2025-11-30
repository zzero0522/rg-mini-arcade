// Typing Test 打字測試遊戲
(function () {
    const BEST_WPM_KEY = 'rg-typing-best-';

    // 英文單字庫（包含常用字、程式詞彙、學測指考等級詞彙）
    const WORDS = [
        // 基礎常用字
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
        'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
        'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
        'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',

        // 程式相關
        'code', 'program', 'function', 'variable', 'array', 'object', 'string', 'number', 'boolean', 'null',
        'return', 'class', 'method', 'loop', 'while', 'break', 'continue', 'switch', 'case', 'default',
        'import', 'export', 'const', 'let', 'var', 'async', 'await', 'promise', 'callback', 'event',
        'error', 'debug', 'test', 'build', 'deploy', 'server', 'client', 'database', 'query', 'index',

        // 電腦科技
        'keyboard', 'mouse', 'screen', 'monitor', 'laptop', 'desktop', 'mobile', 'tablet', 'device', 'browser',
        'website', 'application', 'software', 'hardware', 'network', 'internet', 'cloud', 'storage', 'memory', 'processor',

        // 學測指考等級詞彙 - 學術與教育
        'education', 'knowledge', 'university', 'research', 'experiment', 'theory', 'analysis', 'evidence', 'conclusion', 'hypothesis',
        'literature', 'philosophy', 'psychology', 'biology', 'chemistry', 'physics', 'mathematics', 'geography', 'history', 'economics',
        'professor', 'lecture', 'seminar', 'assignment', 'examination', 'scholarship', 'curriculum', 'certificate', 'graduate', 'academic',

        // 學測指考等級詞彙 - 社會與文化
        'society', 'culture', 'tradition', 'civilization', 'democracy', 'government', 'politics', 'citizen', 'community', 'population',
        'environment', 'pollution', 'conservation', 'sustainable', 'resource', 'climate', 'global', 'warming', 'ecosystem', 'species',
        'technology', 'innovation', 'artificial', 'intelligence', 'revolution', 'industrial', 'manufacture', 'economy', 'commerce', 'investment',

        // 學測指考等級詞彙 - 個人特質與情感
        'achieve', 'accomplish', 'ambitious', 'confident', 'creative', 'curious', 'determined', 'diligent', 'enthusiastic', 'flexible',
        'generous', 'grateful', 'humble', 'independent', 'optimistic', 'patient', 'persistent', 'reliable', 'responsible', 'sincere',
        'anxiety', 'depression', 'emotion', 'sympathy', 'empathy', 'frustration', 'satisfaction', 'enthusiasm', 'motivation', 'inspiration',

        // 學測指考等級詞彙 - 動作與行為
        'acquire', 'adapt', 'anticipate', 'appreciate', 'approach', 'assume', 'attempt', 'challenge', 'communicate', 'compare',
        'compete', 'concentrate', 'consider', 'contribute', 'cooperate', 'demonstrate', 'determine', 'develop', 'discover', 'distinguish',
        'eliminate', 'emphasize', 'encourage', 'enhance', 'establish', 'evaluate', 'explore', 'generate', 'identify', 'illustrate',
        'implement', 'improve', 'indicate', 'influence', 'interpret', 'investigate', 'maintain', 'observe', 'obtain', 'overcome',
        'participate', 'perceive', 'persuade', 'predict', 'preserve', 'prevent', 'promote', 'propose', 'recognize', 'recommend',
        'reflect', 'represent', 'require', 'resolve', 'respond', 'reveal', 'significant', 'solve', 'stimulate', 'transform',

        // 學測指考等級詞彙 - 形容詞
        'absolute', 'abundant', 'accurate', 'adequate', 'alternative', 'apparent', 'appropriate', 'available', 'beneficial', 'capable',
        'complex', 'comprehensive', 'considerable', 'constant', 'contemporary', 'critical', 'crucial', 'diverse', 'dominant', 'efficient',
        'essential', 'evident', 'exclusive', 'extraordinary', 'familiar', 'fundamental', 'genuine', 'identical', 'immediate', 'inevitable',
        'initial', 'intense', 'massive', 'moderate', 'negative', 'obvious', 'particular', 'permanent', 'positive', 'potential',
        'practical', 'precious', 'previous', 'primary', 'principal', 'professional', 'profound', 'prominent', 'reasonable', 'relevant',
        'remarkable', 'severe', 'significant', 'similar', 'specific', 'substantial', 'sufficient', 'superior', 'tremendous', 'ultimate',

        // 學測指考等級詞彙 - 名詞
        'advantage', 'aspect', 'attitude', 'authority', 'awareness', 'behavior', 'benefit', 'capacity', 'category', 'circumstance',
        'commitment', 'concept', 'conflict', 'consequence', 'context', 'contrast', 'controversy', 'criterion', 'decade', 'definition',
        'dimension', 'discipline', 'diversity', 'element', 'emphasis', 'era', 'evolution', 'exception', 'existence', 'expansion',
        'factor', 'feature', 'foundation', 'framework', 'function', 'generation', 'heritage', 'identity', 'impact', 'implication',
        'phenomenon', 'perspective', 'principle', 'priority', 'procedure', 'process', 'proportion', 'purpose', 'quality', 'quantity',
        'range', 'reaction', 'reality', 'region', 'relationship', 'religion', 'reputation', 'restriction', 'revolution', 'strategy',
        'structure', 'survival', 'symbol', 'symptom', 'tendency', 'tension', 'threat', 'transition', 'trend', 'welfare'
    ];

    // 預設文章庫
    const ARTICLES = [
        {
            id: 'tech-ai',
            title: '🤖 AI 與未來',
            titleIDE: 'ai_future',
            text: 'Artificial intelligence is transforming the way we live and work. From virtual assistants to self-driving cars, AI technology is becoming an integral part of our daily lives. Machine learning algorithms can now recognize images, understand speech, and even generate creative content. As these systems become more sophisticated, they raise important questions about privacy, employment, and the future of human creativity. The key challenge is to develop AI that benefits humanity while minimizing potential risks.'
        },
        {
            id: 'tech-programming',
            title: '💻 程式設計',
            titleIDE: 'programming',
            text: 'Learning to code is one of the most valuable skills in the modern world. Programming teaches logical thinking, problem-solving, and creativity. Whether you want to build websites, create mobile apps, or analyze data, coding opens doors to countless opportunities. The best way to learn is by doing. Start with simple projects, make mistakes, and learn from them. Remember that every expert programmer was once a beginner who refused to give up.'
        },
        {
            id: 'science-space',
            title: '🚀 太空探索',
            titleIDE: 'space_exploration',
            text: 'Space exploration has always captured human imagination. From the first moon landing to the latest Mars rovers, we continue to push the boundaries of what is possible. Scientists are now planning missions to establish permanent bases on the Moon and eventually send humans to Mars. These ambitious goals require international cooperation, advanced technology, and tremendous resources. The search for life beyond Earth remains one of the most exciting frontiers in science.'
        },
        {
            id: 'life-success',
            title: '🎯 成功心態',
            titleIDE: 'success_mindset',
            text: 'Success is not just about talent or luck. It requires dedication, persistence, and the willingness to learn from failure. The most successful people share common habits: they set clear goals, manage their time effectively, and continuously improve their skills. They also understand the importance of maintaining good relationships and helping others succeed. Remember that success is a journey, not a destination. Enjoy the process and celebrate small victories along the way.'
        },
        {
            id: 'nature-environment',
            title: '🌍 環境保護',
            titleIDE: 'environment',
            text: 'Climate change is one of the greatest challenges facing our planet. Rising temperatures, extreme weather events, and melting ice caps are affecting ecosystems worldwide. However, there is still hope. By reducing carbon emissions, protecting forests, and developing renewable energy sources, we can slow down global warming. Every individual can make a difference by making sustainable choices in daily life. Together, we can create a healthier planet for future generations.'
        },
        {
            id: 'culture-travel',
            title: '✈️ 旅行體驗',
            titleIDE: 'travel',
            text: 'Traveling opens our minds to new cultures, ideas, and perspectives. When we explore different countries, we discover unique traditions, taste exotic foods, and meet people from all walks of life. These experiences help us appreciate diversity and understand our place in the global community. Whether you prefer adventure travel, cultural immersion, or relaxing beach vacations, every journey teaches us something valuable about ourselves and the world around us.'
        },
        {
            id: 'health-wellness',
            title: '💪 健康生活',
            titleIDE: 'health',
            text: 'A healthy lifestyle is the foundation of a happy life. Regular exercise, balanced nutrition, and adequate sleep are essential for physical and mental well-being. Studies show that people who maintain healthy habits have more energy, better focus, and longer lifespans. It is never too late to start making positive changes. Begin with small steps like taking daily walks, eating more vegetables, and reducing screen time before bed. Your future self will thank you.'
        },
        {
            id: 'business-startup',
            title: '💼 創業精神',
            titleIDE: 'startup',
            text: 'Starting a business requires courage, creativity, and careful planning. Successful entrepreneurs identify problems and create innovative solutions. They build strong teams, manage finances wisely, and adapt quickly to changing markets. Failure is often part of the journey, but it provides valuable lessons. The most important qualities are resilience and the ability to learn from mistakes. If you have a great idea and the determination to pursue it, entrepreneurship might be your path to success.'
        }
    ];

    // 遊戲狀態
    let duration = 60;
    let timeLeft = 60;
    let timer = null;
    let isPlaying = false;
    let currentText = '';
    let typedText = '';
    let correctChars = 0;
    let incorrectChars = 0;
    let totalTyped = 0;
    let bestWPM = 0;
    let gameMode = 'random'; // 'random', 'custom', or 'article'
    let selectedArticle = null;
    let customText = '';

    // DOM 元素
    const startScreen = document.getElementById('start-screen');
    const resultScreen = document.getElementById('result-screen');
    const gameContent = document.getElementById('game-content');
    const textDisplay = document.getElementById('text-display');
    const typingInput = document.getElementById('typing-input');
    const timerDisplay = document.getElementById('timer');
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');
    const bestWpmDisplay = document.getElementById('best-wpm');
    const correctCharsDisplay = document.getElementById('correct-chars');
    const errorCharsDisplay = document.getElementById('error-chars');
    const startBtn = document.getElementById('start-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const changeTimeBtn = document.getElementById('change-time-btn');
    const timeButtons = document.querySelectorAll('.time-btn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const customTextSection = document.getElementById('custom-text-section');
    const customTextInput = document.getElementById('custom-text-input');
    const articleSection = document.getElementById('article-section');
    const articleList = document.getElementById('article-list');
    const finalWpm = document.getElementById('final-wpm');
    const finalAccuracy = document.getElementById('final-accuracy');
    const finalCorrect = document.getElementById('final-correct');
    const finalErrors = document.getElementById('final-errors');

    // 初始化文章列表
    function initArticleList() {
        articleList.innerHTML = '';
        ARTICLES.forEach((article, index) => {
            const btn = document.createElement('button');
            btn.className = 'article-btn' + (index === 0 ? ' active' : '');
            btn.dataset.id = article.id;
            btn.innerHTML = `
                <span class="article-title">
                    <span class="normal-title">${article.title}</span>
                    <span class="ide-title">${article.titleIDE}</span>
                </span>
                <span class="article-length">
                    <span class="normal-title">${article.text.length} 字元</span>
                    <span class="ide-title">${article.text.length} chars</span>
                </span>
            `;
            btn.addEventListener('click', () => selectArticle(article.id));
            articleList.appendChild(btn);
        });
        selectedArticle = ARTICLES[0];
    }

    // 選擇文章
    function selectArticle(id) {
        const article = ARTICLES.find(a => a.id === id);
        if (!article) return;

        selectedArticle = article;
        articleList.querySelectorAll('.article-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.id === id);
        });
    }

    // 生成隨機文字
    function generateText(wordCount = 100) {
        const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
        const selected = [];

        for (let i = 0; i < wordCount; i++) {
            selected.push(shuffled[i % shuffled.length]);
        }

        return selected.join(' ');
    }

    // 處理自訂文章
    function processCustomText(text) {
        // 清理文章：移除多餘空白、換行符轉空格
        return text
            .replace(/[\r\n]+/g, ' ')  // 換行轉空格
            .replace(/\s+/g, ' ')       // 多個空格合併
            .trim();
    }

    // 選擇模式
    function selectMode(e) {
        const btn = e.target.closest('.mode-btn');
        if (!btn) return;

        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameMode = btn.dataset.mode;

        // 顯示/隱藏對應區域
        customTextSection.classList.add('hidden');
        articleSection.classList.add('hidden');

        if (gameMode === 'custom') {
            customTextSection.classList.remove('hidden');
        } else if (gameMode === 'article') {
            articleSection.classList.remove('hidden');
        }
    }

    // 渲染文字顯示
    function renderText() {
        const typedChars = typedText.split('');

        // 將文字按單字分割
        const words = currentText.split(' ');
        let charIndex = 0;
        let html = '';

        words.forEach((word, wordIndex) => {
            // 開始一個單字容器
            html += '<span class="word">';

            // 處理單字中的每個字符
            for (let i = 0; i < word.length; i++) {
                let className = 'char';

                if (charIndex < typedChars.length) {
                    if (typedChars[charIndex] === word[i]) {
                        className += ' correct typed';
                    } else {
                        className += ' incorrect typed';
                    }
                } else if (charIndex === typedChars.length) {
                    className += ' current';
                }

                html += `<span class="${className}">${word[i]}</span>`;
                charIndex++;
            }

            html += '</span>';

            // 處理單字後的空格（最後一個單字不加）
            if (wordIndex < words.length - 1) {
                let spaceClassName = 'char';

                if (charIndex < typedChars.length) {
                    if (typedChars[charIndex] === ' ') {
                        spaceClassName += ' correct typed';
                    } else {
                        spaceClassName += ' incorrect typed';
                    }
                } else if (charIndex === typedChars.length) {
                    spaceClassName += ' current';
                }

                html += `<span class="${spaceClassName}">&nbsp;</span>`;
                charIndex++;
            }
        });

        textDisplay.innerHTML = html;

        // 自動滾動到當前位置，確保當前字符可見
        const currentChar = textDisplay.querySelector('.current');
        if (currentChar) {
            const containerRect = textDisplay.getBoundingClientRect();
            const charRect = currentChar.getBoundingClientRect();

            // 如果當前字符超出可視區域，進行滾動
            if (charRect.top < containerRect.top || charRect.bottom > containerRect.bottom) {
                const scrollTop = currentChar.offsetTop - textDisplay.offsetTop - (textDisplay.clientHeight / 3);
                textDisplay.scrollTop = Math.max(0, scrollTop);
            }
        }
    }

    // 處理輸入
    function handleInput(e) {
        if (!isPlaying) return;

        typedText = e.target.value;

        // 計算正確和錯誤字數
        let correct = 0;
        let incorrect = 0;

        for (let i = 0; i < typedText.length; i++) {
            if (i < currentText.length) {
                if (typedText[i] === currentText[i]) {
                    correct++;
                } else {
                    incorrect++;
                }
            }
        }

        correctChars = correct;
        incorrectChars = incorrect;
        totalTyped = typedText.length;

        updateStats();
        renderText();

        // 如果打完所有文字
        if (typedText.length >= currentText.length - 20) {
            if (gameMode === 'random') {
                // 隨機模式：生成更多單字
                currentText += ' ' + generateText(50);
                renderText();
            } else if (typedText.length >= currentText.length) {
                // 文章模式（精選或自訂）：打完就結束
                endGame();
            }
        }
    }

    // 更新統計
    function updateStats() {
        // 計算 WPM (每分鐘字數，以 5 個字符為一個「字」)
        const timeElapsed = duration - timeLeft;
        const minutes = timeElapsed / 60;
        const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;

        // 計算準確率
        const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = accuracy + '%';
        correctCharsDisplay.textContent = correctChars;
        errorCharsDisplay.textContent = incorrectChars;
    }

    // 載入最佳紀錄
    function loadBestWPM() {
        bestWPM = parseInt(localStorage.getItem(BEST_WPM_KEY + duration)) || 0;
        bestWpmDisplay.textContent = bestWPM;
    }

    // 儲存最佳紀錄
    function saveBestWPM(wpm) {
        if (wpm > bestWPM) {
            bestWPM = wpm;
            localStorage.setItem(BEST_WPM_KEY + duration, wpm);
            bestWpmDisplay.textContent = bestWPM;
        }
    }

    // 開始計時器
    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            updateStats();

            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // 開始遊戲
    function startGame() {
        // 根據模式設定文字
        if (gameMode === 'custom') {
            const rawText = customTextInput.value.trim();
            if (!rawText || rawText.length < 10) {
                alert('請輸入至少 10 個字元的文章！');
                return;
            }
            currentText = processCustomText(rawText);
        } else if (gameMode === 'article') {
            if (!selectedArticle) {
                alert('請選擇一篇文章！');
                return;
            }
            currentText = selectedArticle.text;
        } else {
            currentText = generateText(100);
        }

        typedText = '';
        correctChars = 0;
        incorrectChars = 0;
        totalTyped = 0;
        timeLeft = duration;
        isPlaying = true;

        loadBestWPM();

        timerDisplay.textContent = timeLeft;
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '100%';
        correctCharsDisplay.textContent = '0';
        errorCharsDisplay.textContent = '0';
        typingInput.value = '';

        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');

        renderText();
        typingInput.focus();
        startTimer();
    }

    // 結束遊戲
    function endGame() {
        isPlaying = false;
        clearInterval(timer);

        // 計算最終結果
        const minutes = duration / 60;
        const wpm = Math.round((correctChars / 5) / minutes);
        const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;

        // 儲存最佳紀錄
        saveBestWPM(wpm);

        // 顯示結果
        finalWpm.textContent = wpm;
        finalAccuracy.textContent = accuracy + '%';
        finalCorrect.textContent = correctChars;
        finalErrors.textContent = incorrectChars;

        resultScreen.classList.remove('hidden');
    }

    // 返回時間選擇
    function backToMenu() {
        isPlaying = false;
        clearInterval(timer);
        resultScreen.classList.add('hidden');
        gameContent.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    // 選擇時間
    function selectTime(e) {
        const btn = e.target.closest('.time-btn');
        if (!btn) return;

        timeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        duration = parseInt(btn.dataset.time);
        timerDisplay.textContent = duration;
    }

    // 初始化
    function init() {
        gameContent.classList.add('hidden');
        resultScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        initArticleList();
        loadBestWPM();
    }

    // 事件監聽
    startBtn.addEventListener('click', startGame);
    playAgainBtn.addEventListener('click', startGame);
    changeTimeBtn.addEventListener('click', backToMenu);
    timeButtons.forEach(btn => btn.addEventListener('click', selectTime));
    modeButtons.forEach(btn => btn.addEventListener('click', selectMode));
    typingInput.addEventListener('input', handleInput);

    // 防止輸入框失焦
    typingInput.addEventListener('blur', () => {
        if (isPlaying) {
            typingInput.focus();
        }
    });

    // 執行初始化
    init();
})();
