let gameState = {
    sessionId: null,
    allQuestions: [],
    currentQuestionIndex: 0,
    totalQuestions: 15,
    currentScore: 0,
    safetyLevel: 0,
    gameActive: true,
    hintsUsed: 0,
    fiftyFiftyUsed: false,
    audiencePollUsed: false,
    assignmentTitle: ''
};

const POINTS = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
const SAFETY_LEVELS = [0, 0, 0, 0, 0, 1000, 1000, 1000, 1000, 1000, 32000, 32000, 32000, 32000, 32000, 1000000];

document.addEventListener('DOMContentLoaded', async () => {
    gameState.sessionId = sessionStorage.getItem('gameSessionId');
    gameState.assignmentTitle = sessionStorage.getItem('assignmentTitle') || '';

    if (!gameState.sessionId) {
        window.location.href = '/';
        return;
    }

    displayPrizeLadder();
    renderSidebar();
    await startGameSession();
});

function clearStoredGameSession() {
    sessionStorage.removeItem('gameSessionId');
    sessionStorage.removeItem('gameQuestions');
}

async function startGameSession() {
    try {
        document.getElementById('gameLoading').classList.remove('hidden');
        document.getElementById('gameContent').classList.add('hidden');

        const questionsData = sessionStorage.getItem('gameQuestions');
        if (!questionsData) {
            throw new Error('Küsimusi ei leitud. Alusta mängu uuesti avalehelt.');
        }

        gameState.allQuestions = JSON.parse(questionsData);
        displayQuestionContent(gameState.allQuestions[0], 0);
        updatePrizeHighlight();
        updateLifelines();
        updateScoreDisplay();
        showGameContent();
    } catch (error) {
        console.error('Error starting game session:', error);
        showError(error.message);
    }
}

function displayPrizeLadder() {
    const prizeList = document.getElementById('prizeList');
    prizeList.innerHTML = '';

    POINTS.forEach((points, index) => {
        const level = index + 1;
        const item = document.createElement('div');
        item.className = 'prize-item';

        if (SAFETY_LEVELS[index] > 0) {
            item.classList.add('safety');
        }

        item.innerHTML = `<strong>${level}.</strong> ${formatPoints(points)}`;
        prizeList.appendChild(item);
    });
}

function renderSidebar() {
    const sidebar = document.getElementById('gameSidebarContent');
    sidebar.innerHTML = `
        <p><strong>Ülesanne:</strong> ${escapeHtml(gameState.assignmentTitle || 'Valimata')}</p>
        <p><strong>Turvatasemed:</strong> 1 000, 32 000 ja 1 000 000</p>
        <p><strong>Reegel:</strong> vale vastus lõpetab mängu ja tulemus langeb viimasele turvatasemele.</p>
    `;
}

function showGameContent() {
    document.getElementById('gameLoading').classList.add('hidden');
    document.getElementById('gameContent').classList.remove('hidden');
}

function displayQuestionContent(question, index) {
    gameState.currentQuestionIndex = index;
    clearQuestionPopups();

    document.getElementById('questionNumber').textContent = `Küsimus ${index + 1}/${gameState.totalQuestions}`;
    document.getElementById('questionLevel').textContent = `Tase ${question.level}`;
    document.getElementById('questionText').textContent = question.question;

    const grid = document.getElementById('answersGrid');
    grid.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    question.options.forEach((option, optionIndex) => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.innerHTML = `<strong>${letters[optionIndex]}.</strong> ${escapeHtml(option)}`;
        button.onclick = () => answerQuestion(optionIndex);
        grid.appendChild(button);
    });
}

async function answerQuestion(optionIndex) {
    if (!gameState.gameActive) return;

    try {
        gameState.gameActive = false;
        disableAnswerButtons();

        const response = await fetch('/api/game/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: gameState.sessionId,
                answerIndex: optionIndex
            })
        });

        if (!response.ok) {
            throw new Error('Vastuse kontrollimine ebaõnnestus');
        }

        const data = await response.json();
        const currentQuestion = gameState.allQuestions[gameState.currentQuestionIndex];
        highlightAnswer(optionIndex, currentQuestion.correctIndex, data.isCorrect);
        showExplanation(data.explanation);

        await wait(1800);

        if (data.isCorrect) {
            gameState.currentScore = data.currentScore || data.finalScore || gameState.currentScore;
            gameState.safetyLevel = getSafetyLevelForQuestion(gameState.currentQuestionIndex + 1);
            updateScoreDisplay();

            if (data.gameState === 'won') {
                clearStoredGameSession();
                showResult('Palju õnne!', data.message, data.finalScore, 15, data.explanation);
                return;
            }

            const nextQuestion = data.nextQuestion;
            updatePrizeHighlight();
            updateLifelines();
            enableAnswerButtons();
            gameState.gameActive = true;
            displayQuestionContent(nextQuestion, nextQuestion.index);
            return;
        }

        clearStoredGameSession();
        showResult(
            'Vale vastus',
            `Õige vastus oli: ${currentQuestion.options[currentQuestion.correctIndex]}`,
            data.finalScore,
            gameState.currentQuestionIndex + 1,
            data.explanation
        );
    } catch (error) {
        console.error('Error answering question:', error);
        alert(`Viga vastuse töötlemisel: ${error.message}`);
        gameState.gameActive = true;
        enableAnswerButtons();
    }
}

function highlightAnswer(selectedIndex, correctIndex, isCorrect) {
    const options = document.querySelectorAll('.answer-option');
    options[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect && options[correctIndex]) {
        options[correctIndex].classList.add('correct');
    }
}

function showExplanation(explanation) {
    if (!explanation) return;

    document.getElementById('explanationText').textContent = explanation;
    document.getElementById('explanationBox').classList.remove('hidden');
}

function clearQuestionPopups() {
    const ids = ['hintBox', 'pollBox', 'explanationBox'];
    ids.forEach((id) => {
        document.getElementById(id).classList.add('hidden');
    });

    document.getElementById('hintText').textContent = '';
    document.getElementById('pollResults').innerHTML = '';
    document.getElementById('explanationText').textContent = '';
}

function disableAnswerButtons() {
    document.querySelectorAll('.answer-option').forEach((button) => {
        button.disabled = true;
    });
}

function enableAnswerButtons() {
    document.querySelectorAll('.answer-option').forEach((button) => {
        button.disabled = false;
        button.classList.remove('correct', 'incorrect', 'selected');
        button.style.opacity = '';
    });
}

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

function updateScoreDisplay() {
    document.getElementById('currentScore').textContent = formatPoints(gameState.currentScore);
}

function updateLifelines() {
    document.getElementById('btnHint').disabled = gameState.hintsUsed >= 1;
    document.getElementById('btn50').disabled = gameState.fiftyFiftyUsed;
    document.getElementById('btnAudience').disabled = gameState.audiencePollUsed;
}

async function getHint() {
    try {
        if (gameState.hintsUsed >= 1) {
            alert('Oled juba vihje kasutanud.');
            return;
        }

        const response = await fetch('/api/game/hint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId: gameState.sessionId })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Vihje ei ole saadaval');
        }

        document.getElementById('hintText').textContent = data.hint;
        document.getElementById('hintBox').classList.remove('hidden');
        gameState.hintsUsed++;
        updateLifelines();
    } catch (error) {
        console.error('Error getting hint:', error);
        alert(error.message);
    }
}

async function use50Fifty() {
    try {
        if (gameState.fiftyFiftyUsed) {
            alert('Oled juba 50:50 kasutanud.');
            return;
        }

        const response = await fetch('/api/game/50-50', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId: gameState.sessionId })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || '50:50 ei ole saadaval');
        }

        const options = document.querySelectorAll('.answer-option');
        options.forEach((option, index) => {
            const isRemaining = data.remainingOptions.some((remaining) => remaining.index === index);
            if (!isRemaining) {
                option.style.opacity = '0.3';
                option.disabled = true;
            }
        });

        gameState.fiftyFiftyUsed = true;
        updateLifelines();
    } catch (error) {
        console.error('Error using 50:50:', error);
        alert(error.message);
    }
}

async function askAudience() {
    try {
        if (gameState.audiencePollUsed) {
            alert('Oled juba publikuhääletuse kasutanud.');
            return;
        }

        const response = await fetch('/api/game/audience-poll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId: gameState.sessionId })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Publikuhääletus ei ole saadaval');
        }

        displayPoll(data.poll);
        gameState.audiencePollUsed = true;
        updateLifelines();
    } catch (error) {
        console.error('Error getting audience poll:', error);
        alert(error.message);
    }
}

function displayPoll(poll) {
    const pollResults = document.getElementById('pollResults');
    pollResults.innerHTML = '';

    ['A', 'B', 'C', 'D'].forEach((letter) => {
        const result = document.createElement('div');
        result.className = 'poll-result';
        result.innerHTML = `
            <div class="letter">${letter}</div>
            <div class="percentage">${poll[letter] || 0}%</div>
        `;
        pollResults.appendChild(result);
    });

    document.getElementById('pollBox').classList.remove('hidden');
}

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
            body: JSON.stringify({ sessionId: gameState.sessionId })
        });

        if (!response.ok) {
            throw new Error('Mängu lõpetamine ebaõnnestus');
        }

        const data = await response.json();
        clearStoredGameSession();
        showResult('Mäng lõpetatud', data.message, data.finalScore, gameState.currentQuestionIndex, '');
    } catch (error) {
        console.error('Error quitting game:', error);
        alert(error.message);
    }
}

function showResult(title, message, finalScore, answeredCount, explanation) {
    document.getElementById('gameContent').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');

    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultMessage').textContent = message;

    const details = document.getElementById('resultDetails');
    const explanationHtml = explanation ? `<p><strong>Selgitus:</strong> ${escapeHtml(explanation)}</p>` : '';
    details.innerHTML = `
        <p><strong>Lõppskoor:</strong> ${formatPoints(finalScore)}</p>
        <p><strong>Vastatud küsimusi:</strong> ${answeredCount}/15</p>
        ${explanationHtml}
    `;
}

function goHome() {
    sessionStorage.removeItem('gameSessionId');
    sessionStorage.removeItem('selectedAssignmentId');
    sessionStorage.removeItem('assignmentTitle');
    sessionStorage.removeItem('gameQuestions');
    window.location.href = '/';
}

function getSafetyLevelForQuestion(questionNumber) {
    return SAFETY_LEVELS[questionNumber] || 0;
}

function formatPoints(points) {
    return new Intl.NumberFormat('et-EE').format(points) + ' punkti';
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showError(message) {
    alert(`Viga: ${message}`);
}
