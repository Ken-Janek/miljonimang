// Game state
let gameState = {
    sessionId: null,
    allQuestions: [],
    currentQuestionIndex: 0,
    currentQuestion: null,
    totalQuestions: 15,
    currentScore: 0,
    safetyLevel: 0,
    gameActive: true,
    hintsUsed: 0,
    fiftyFiftyUsed: false,
    audiencePollUsed: false
};

const POINTS = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
const SAFETY_LEVELS = [0, 0, 0, 0, 0, 1000, 1000, 1000, 1000, 1000, 32000, 32000, 32000, 32000, 32000, 1000000];

/**
 * Get points for a specific level (1-15)
 */
function getPointsForLevel(level) {
    return POINTS[level - 1] || 0;
}

/**
 * Update safety level based on current question
 */
function updateSafetyLevel(state) {
    gameState.safetyLevel = SAFETY_LEVELS[state.currentQuestionIndex] || 0;
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    gameState.sessionId = sessionStorage.getItem('gameSessionId');
    const assignmentTitle = sessionStorage.getItem('assignmentTitle');

    if (!gameState.sessionId) {
        window.location.href = '/';
        return;
    }

    displayPrizeLadder();
    startGameSession();
});

/**
 * Start game session and fetch questions
 */
async function startGameSession() {
    try {
        document.getElementById('gameLoading').classList.remove('hidden');
        document.getElementById('gameContent').classList.add('hidden');
        
        // Get all questions from session (they were generated during /api/game/start)
        // For this implementation, we'll store them in sessionStorage during the start
        const questionsData = sessionStorage.getItem('gameQuestions');
        
        if (questionsData) {
            gameState.allQuestions = JSON.parse(questionsData);
            displayFirstQuestion();
        } else {
            showError('Küsimused ei leitud. Palun alustage mängu uuesti.');
        }
    } catch (error) {
        console.error('Error starting game session:', error);
        showError(`Viga: ${error.message}`);
    }
}

/**
 * Display first question
 */
function displayFirstQuestion() {
    if (gameState.allQuestions.length === 0) {
        showError('Küsimusi ei leitud');
        return;
    }
    
    gameState.currentQuestion = gameState.allQuestions[0];
    gameState.currentQuestionIndex = 0;
    updatePrizeHighlight();
    updateLifelines();
    updateScoreDisplay();
    
    showGameContent();
    displayQuestionContent({
        index: 0,
        level: gameState.currentQuestion.level,
        question: gameState.currentQuestion.question,
        options: gameState.currentQuestion.options,
        totalQuestions: 15
    });
}

/**
 * Display prize ladder
 */
function displayPrizeLadder() {
    const prizeList = document.getElementById('prizeList');
    prizeList.innerHTML = '';

    POINTS.forEach((points, index) => {
        const level = index + 1;
        const item = document.createElement('div');
        item.className = 'prize-item';

        // Check if it's a safety level
        if (SAFETY_LEVELS[index] > 0) {
            item.classList.add('safety');
        }

        item.innerHTML = `<strong>${level}.</strong> ${formatPoints(points)}`;
        prizeList.appendChild(item);
    });

    updatePrizeHighlight();
}

/**
 * Load current question from backend
 */
async function loadCurrentQuestion() {
    try {
        // For now, we'll fetch from session
        // This assumes the backend session has the questions
        displayQuestion();
        showGameContent();
    } catch (error) {
        console.error('Error loading question:', error);
        showError(`Viga küsimuse laadimisel: ${error.message}`);
    }
}

/**
 * Placeholder - display question (would get from session)
 */
function displayQuestion() {
    // This would be called with actual question data from backend
    // For now, it's a placeholder
    showGameContent();
}

/**
 * Show game content
 */
function showGameContent() {
    document.getElementById('gameLoading').classList.add('hidden');
    document.getElementById('gameContent').classList.remove('hidden');
}

/**
 * Format points as currency
 */
function formatPoints(points) {
    if (points >= 1000000) {
        return (points / 1000000).toFixed(1).replace(/\.0$/, '') + 'M €';
    } else if (points >= 1000) {
        return (points / 1000).toFixed(0) + 'K €';
    }
    return points + ' €';
}

/**
 * Update prize ladder highlight
 */
function updatePrizeHighlight() {
    const items = document.querySelectorAll('.prize-item');
    items.forEach((item, index) => {
        item.classList.remove('current', 'passed');

        if (index === gameState.currentQuestionIndex) {
            item.classList.add('current');
        } else if (index < gameState.currentQuestionIndex) {
            item.classList.add('passed');
        }
    });
}

/**
 * Answer question
 */
async function answerQuestion(optionIndex) {
    if (!gameState.gameActive) return;

    try {
        gameState.gameActive = false;
        disableAnswerButtons();

        const currentQuestion = gameState.allQuestions[gameState.currentQuestionIndex];
        const isCorrect = optionIndex === currentQuestion.correctIndex;

        // Highlight answer
        const options = document.querySelectorAll('.answer-option');
        options[optionIndex].classList.add(isCorrect ? 'correct' : 'incorrect');

        if (!isCorrect) {
            options[currentQuestion.correctIndex].classList.add('correct');
        }

        // Wait before showing result
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (isCorrect) {
            gameState.currentScore = getPointsForLevel(gameState.currentQuestionIndex + 1);
            updateSafetyLevel(gameState);
            updateScoreDisplay();

            // Check if game is won
            if (gameState.currentQuestionIndex === 14) {
                showResult('🎉 Õnnitleksin!', `Võitsid 1,000,000 €!`, gameState.currentScore, true);
                return;
            }

            // Move to next question
            gameState.currentQuestionIndex++;
            const nextQuestion = gameState.allQuestions[gameState.currentQuestionIndex];
            updatePrizeHighlight();
            updateLifelines();
            clearAnswerOptions();
            displayQuestionContent({
                index: gameState.currentQuestionIndex,
                level: nextQuestion.level,
                question: nextQuestion.question,
                options: nextQuestion.options,
                totalQuestions: 15
            });
            gameState.gameActive = true;
            enableAnswerButtons();
        } else {
            // Wrong answer - game over
            showResult('💔 Vale vastus', `Õige vastus oli: ${currentQuestion.options[currentQuestion.correctIndex]}`, gameState.safetyLevel, false);
        }
    } catch (error) {
        console.error('Error answering question:', error);
        alert('Viga vastuse töötlemisel');
        gameState.gameActive = true;
        enableAnswerButtons();
    }
}

/**
 * Load next question
 */
function loadNextQuestion(questionData) {
    updateScoreDisplay();
    clearAnswerOptions();
    displayQuestionContent(questionData);
    gameState.gameActive = true;
    enableAnswerButtons();
}

/**
 * Display question content
 */
function displayQuestionContent(questionData) {
    clearQuestionPopups();

    document.getElementById('questionNumber').textContent = `Küsimus ${questionData.index + 1}/${questionData.totalQuestions}`;
    document.getElementById('questionLevel').textContent = `Taseme ${questionData.level}`;
    document.getElementById('questionText').textContent = questionData.question;

    // Add answer options
    const grid = document.getElementById('answersGrid');
    grid.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    questionData.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.innerHTML = `<strong>${letters[index]}.</strong> ${option}`;
        button.onclick = () => answerQuestion(index);
        grid.appendChild(button);
    });
}

/**
 * Clear answer options
 */
function clearAnswerOptions() {
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => {
        option.classList.remove('correct', 'incorrect', 'selected');
        option.style.opacity = '';
    });
}

/**
 * Clear temporary per-question UI elements
 */
function clearQuestionPopups() {
    const hintBox = document.getElementById('hintBox');
    const pollBox = document.getElementById('pollBox');
    const hintText = document.getElementById('hintText');
    const pollResults = document.getElementById('pollResults');

    hintBox.classList.add('hidden');
    pollBox.classList.add('hidden');
    hintText.textContent = '';
    pollResults.innerHTML = '';
}

/**
 * Disable answer buttons
 */
function disableAnswerButtons() {
    const buttons = document.querySelectorAll('.answer-option');
    buttons.forEach(btn => btn.disabled = true);
}

/**
 * Enable answer buttons
 */
function enableAnswerButtons() {
    const buttons = document.querySelectorAll('.answer-option');
    buttons.forEach(btn => btn.disabled = false);
}

/**
 * Get hint from AI
 */
async function getHint() {
    try {
        if (gameState.hintsUsed >= 1) {
            alert('Oled juba kasutanud kõik vihjed!');
            return;
        }

        const response = await fetch('/api/game/hint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: gameState.sessionId
            })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('hintText').textContent = data.hint;
            document.getElementById('hintBox').classList.remove('hidden');
            gameState.hintsUsed++;
            updateLifelines();
        } else {
            alert(data.error || 'Vihje ei ole saadaval');
        }
    } catch (error) {
        console.error('Error getting hint:', error);
        alert('Viga vihje küsimisel');
    }
}

/**
 * Use 50:50 lifeline
 */
async function use50Fifty() {
    try {
        if (gameState.fiftyFiftyUsed) {
            alert('Oled juba kasutanud 50:50!');
            return;
        }

        const response = await fetch('/api/game/50-50', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: gameState.sessionId
            })
        });

        const data = await response.json();

        if (data.success) {
            const options = document.querySelectorAll('.answer-option');
            options.forEach((option, index) => {
                const remaining = data.remainingOptions.find(r => r.index === index);
                if (!remaining) {
                    option.style.opacity = '0.3';
                    option.disabled = true;
                }
            });

            gameState.fiftyFiftyUsed = true;
            updateLifelines();
        } else {
            alert(data.error || '50:50 ei ole saadaval');
        }
    } catch (error) {
        console.error('Error using 50:50:', error);
        alert('Viga 50:50 kasutamisel');
    }
}

/**
 * Ask audience
 */
async function askAudience() {
    try {
        if (gameState.audiencePollUsed) {
            alert('Oled juba kasutanud publikuhääletuse!');
            return;
        }

        const response = await fetch('/api/game/audience-poll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: gameState.sessionId
            })
        });

        const data = await response.json();

        if (data.success) {
            displayPoll(data.poll);
            gameState.audiencePollUsed = true;
            updateLifelines();
        } else {
            alert(data.error || 'Hääletus ei ole saadaval');
        }
    } catch (error) {
        console.error('Error getting audience poll:', error);
        alert('Viga hääletu küsimisel');
    }
}

/**
 * Display audience poll results
 */
function displayPoll(poll) {
    const pollResults = document.getElementById('pollResults');
    pollResults.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    letters.forEach((letter, index) => {
        const percentage = poll[letter] || 0;
        const result = document.createElement('div');
        result.className = 'poll-result';
        result.innerHTML = `
            <div class="letter">${letter}</div>
            <div class="percentage">${percentage}%</div>
        `;
        pollResults.appendChild(result);
    });

    document.getElementById('pollBox').classList.remove('hidden');
}

/**
 * Update lifelines UI
 */
function updateLifelines() {
    if (gameState.hintsUsed >= 1) {
        document.getElementById('btnHint').disabled = true;
    }
    if (gameState.fiftyFiftyUsed) {
        document.getElementById('btn50').disabled = true;
    }
    if (gameState.audiencePollUsed) {
        document.getElementById('btnAudience').disabled = true;
    }
}

/**
 * Update score display
 */
function updateScoreDisplay() {
    document.getElementById('currentScore').textContent = formatPoints(gameState.currentScore);
}

/**
 * Show result screen
 */
function showResult(title, message, finalScore, isWin) {
    document.getElementById('gameContent').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');

    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultMessage').textContent = message;

    const details = document.getElementById('resultDetails');
    details.innerHTML = `
        <p><strong>Lõppskoor:</strong> ${formatPoints(finalScore)}</p>
        <p><strong>Vastused:</strong> ${gameState.currentQuestionIndex}/15</p>
    `;
}

/**
 * Quit game
 */
async function quitGame() {
    if (!confirm('Oled kindel, et soovid mängu lõpetada?')) {
        return;
    }

    try {
        const response = await fetch('/api/game/quit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: gameState.sessionId
            })
        });

        const data = await response.json();
        showResult('🛑 Mäng lõpetatud', data.message, data.finalScore, false);
    } catch (error) {
        console.error('Error quitting game:', error);
    }
}

/**
 * Go home
 */
function goHome() {
    sessionStorage.removeItem('gameSessionId');
    sessionStorage.removeItem('assignmentTitle');
    window.location.href = '/';
}

/**
 * Show error
 */
function showError(message) {
    alert(`Viga: ${message}`);
}
