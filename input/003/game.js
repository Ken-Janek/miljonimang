const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const resultMessageEl = document.getElementById('resultMessage');
const playerEmojiEl = document.getElementById('playerEmoji');
const computerEmojiEl = document.getElementById('computerEmoji');
const playerChoiceNameEl = document.getElementById('playerChoiceName');
const computerChoiceNameEl = document.getElementById('computerChoiceName');

let playerScore = 0;
let computerScore = 0;

const choices = {
    kivi: { emoji: '✊', name: 'Kivi', beats: 'käärid' },
    paber: { emoji: '✋', name: 'Paber', beats: 'kivi' },
    käärid: { emoji: '✌️', name: 'Käärid', beats: 'paber' }
};

const choiceKeys = ['kivi', 'paber', 'käärid'];

function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * choiceKeys.length);
    return choiceKeys[randomIndex];
}

function play(playerChoice) {
    const computerChoice = getComputerChoice();
    
    // Display choices
    playerEmojiEl.textContent = choices[playerChoice].emoji;
    playerChoiceNameEl.textContent = choices[playerChoice].name;
    computerEmojiEl.textContent = choices[computerChoice].emoji;
    computerChoiceNameEl.textContent = choices[computerChoice].name;

    // Determine winner
    if (playerChoice === computerChoice) {
        resultMessageEl.textContent = 'Viik! 🤝';
        resultMessageEl.style.color = '#f39c12';
    } else if (choices[playerChoice].beats === computerChoice) {
        resultMessageEl.textContent = 'Sa võitsid! 🎉';
        resultMessageEl.style.color = '#27ae60';
        playerScore++;
    } else {
        resultMessageEl.textContent = 'Arvuti võitis! 🤖';
        resultMessageEl.style.color = '#e74c3c';
        computerScore++;
    }

    // Update scores
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    playerEmojiEl.textContent = '❓';
    computerEmojiEl.textContent = '❓';
    playerChoiceNameEl.textContent = '-';
    computerChoiceNameEl.textContent = '-';
    resultMessageEl.textContent = 'Alusta mängu!';
    resultMessageEl.style.color = '#667eea';
}
