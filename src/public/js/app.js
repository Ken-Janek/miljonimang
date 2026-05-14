let currentAssignmentId = null;
let currentAssignment = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAssignments();
});

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

function displayAssignments(assignments) {
    const list = document.getElementById('assignmentsList');
    list.innerHTML = '';

    assignments.forEach((assignment) => {
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

async function selectAssignment(assignmentId) {
    try {
        showState('loadingState');

        const response = await fetch(`/api/assignments/${assignmentId}`);
        if (!response.ok) throw new Error('Failed to load assignment');

        const data = await response.json();
        currentAssignmentId = assignmentId;
        currentAssignment = data.assignment;

        startGame();
    } catch (error) {
        console.error('Error loading assignment:', error);
        showError(`Viga ülesande laadimisel: ${error.message}`);
    }
}

function displayAssignmentDetail(assignment) {
    document.getElementById('detailTitle').textContent = assignment.title;
    const htmlContent = markdownToHtml(assignment.assignment);
    document.getElementById('detailContent').innerHTML = htmlContent;
}

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

        sessionStorage.setItem('gameSessionId', data.sessionId);
        sessionStorage.setItem('selectedAssignmentId', currentAssignmentId);
        sessionStorage.setItem('assignmentTitle', currentAssignment.title);

        if (data.questions) {
            sessionStorage.setItem('gameQuestions', JSON.stringify(data.questions));
        }

        window.location.href = '/game';
    } catch (error) {
        console.error('Error starting game:', error);
        showError(`Viga mängu alustamisel: ${error.message}`);
    }
}

function goBack() {
    currentAssignmentId = null;
    currentAssignment = null;
    loadAssignments();
}

function showState(stateName) {
    const states = document.querySelectorAll('.state');
    states.forEach((state) => state.classList.add('hidden'));

    const targetState = document.getElementById(stateName);
    if (targetState) {
        targetState.classList.remove('hidden');
    }
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showState('errorState');
}
