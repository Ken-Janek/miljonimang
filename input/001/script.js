/**
 * Kalkulaatori rakendus
 * See fail sisaldab kõiki aritmeetilisi tehteid
 */

// Elementide viited DOM-ist
const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');

/**
 * Peafunktsioon arvutamise tegemiseks
 * @param {string} operation - Operatsioon (+, -, *, /)
 */
function calculate(operation) {
    // Hankige sisestatud arvud
    const num1 = parseFloat(num1Input.value);
    const num2 = parseFloat(num2Input.value);

    // Vali sisendit
    if (isNaN(num1) || isNaN(num2)) {
        showError('Palun sisestage kaks numbrit!');
        return;
    }

    let result;

    // Tehke arvutus vastavalt operatsioonile
    switch (operation) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
        case '/':
            // Kontrollige nulliga jagamist
            if (num2 === 0) {
                showError('Nulliga jagamine ei ole lubatud!');
                return;
            }
            result = num1 / num2;
            break;
        default:
            showError('Tundmatu operatsioon!');
            return;
    }

    // Näita tulemust
    displayResult(result);
    hideError();
}

/**
 * Näita tulemust lehel
 * @param {number} result - Tulemus
 */
function displayResult(result) {
    // Ümarda kuni 2 kümnendkohani
    result = Math.round(result * 100) / 100;
    resultDiv.textContent = result;
}

/**
 * Näita veateadet
 * @param {string} message - Veateade
 */
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    resultDiv.textContent = '0';
}

/**
 * Peida veateade
 */
function hideError() {
    errorDiv.classList.remove('show');
}

/**
 * Lähtesta kalkulaator
 */
function reset() {
    num1Input.value = '';
    num2Input.value = '';
    resultDiv.textContent = '0';
    hideError();
    num1Input.focus();
}

// Kuulajad sisestamise jaoks - kasutaja saab arvutada, kui klõpsib Enterit
num1Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        num2Input.focus();
    }
});

num2Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        calculate('+'); // Vaikimisi operatsioon
    }
});

// Lähtesta fookus
num1Input.focus();
