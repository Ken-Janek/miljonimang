// Global state
let currentAssignmentId = null;
let currentAssignment = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadAssignments();
});

/**
 * Load all assignments from backend
 */
async function loadAssignments() {
    try {
        showState('loadingState');

        const response = await fetch('/api/assignments');
        if (!response.ok) throw new Error('Failed to load assignments');

        const data = await response.json();
        const assignments = data.assignments || [];

        if (assignments.length === 0) {
            showError('Ülesandeid ei leitud. Palun lisage ülesandeid input/ kausta.');
            return;
        }

        displayAssignments(assignments);
        showState('assignmentsState');
    } catch (error) {
        console.error('Error loading assignments:', error);
        showError(`Viga ülesannete laadimisel: ${error.message}`);
    }
}

/**
 * Display assignments list
 */
function displayAssignments(assignments) {
    const list = document.getElementById('assignmentsList');
    list.innerHTML = '';

    assignments.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'assignment-card';
        card.innerHTML = `
            <span class="id">${assignment.id}</span>
            <h3>${assignment.title}</h3>
        `;
        card.onclick = () => selectAssignment(assignment.id);
        list.appendChild(card);
    });
}

/**
 * Select and start game directly (skip assignment details page)
 */
async function selectAssignment(assignmentId) {
    try {
        showState('loadingState');

        const response = await fetch(`/api/assignments/${assignmentId}`);
        if (!response.ok) throw new Error('Failed to load assignment');

        const data = await response.json();
        currentAssignmentId = assignmentId;
        currentAssignment = data.assignment;

        // Start game directly without showing assignment details
        startGame();
    } catch (error) {
        console.error('Error loading assignment:', error);
        showError(`Viga ülesande laadimisel: ${error.message}`);
    }
}

/**
 * Display assignment details
 */
function displayAssignmentDetail(assignment) {
    document.getElementById('detailTitle').textContent = assignment.title;

    // Convert markdown to HTML
    const htmlContent = markdownToHtml(assignment.assignment);
    document.getElementById('detailContent').innerHTML = htmlContent;
}

/**
 * Simple markdown to HTML converter
 */
function markdownToHtml(markdown) {
    let html = markdown
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^- (.*?)$/gm, '<li>$1</li>')
        .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
        .replace(/^  - (.*?)$/gm, '<li style="margin-left: 20px;">$1</li>')
        .replace(/\n\n+/g, '</p><p>')
        .replace(/^(.*?)$/gm, (match) => {
            if (match.match(/^<[h|u|l]/) || match.match(/^$/)) return match;
            return `<p>${match}</p>`;
        });

    return html;
}

/**
 * Start game
 */
async function startGame() {
    if (!currentAssignmentId) {
        showError('Ülesannet ei valitud');
        return;
    }

    try {
        showState('loadingState');

        const response = await fetch('/api/game/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                assignmentId: currentAssignmentId
            })
        });

        if (!response.ok) throw new Error('Failed to start game');

        const data = await response.json();

        // Store session data
        sessionStorage.setItem('gameSessionId', data.sessionId);
        sessionStorage.setItem('assignmentTitle', currentAssignment.title);
        
        // Store all questions
        if (data.questions) {
            sessionStorage.setItem('gameQuestions', JSON.stringify(data.questions));
        }

        // Redirect to game page
        window.location.href = '/game';
    } catch (error) {
        console.error('Error starting game:', error);
        showError(`Viga mängu alustamisel: ${error.message}`);
    }
}

/**
 * Go back to assignments list
 */
function goBack() {
    currentAssignmentId = null;
    currentAssignment = null;
    loadAssignments();
}

/**
 * Show specific state
 */
function showState(stateName) {
    const states = document.querySelectorAll('.state');
    states.forEach(state => state.classList.add('hidden'));

    const targetState = document.getElementById(stateName);
    if (targetState) {
        targetState.classList.remove('hidden');
    }
}

/**
 * Show error
 */
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showState('errorState');
}
