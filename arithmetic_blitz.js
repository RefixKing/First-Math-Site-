document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');

    const difficultyButtons = document.querySelectorAll('.difficulty-button');
    const highScoreEasySpan = document.getElementById('high-score-easy');
    const highScoreMediumSpan = document.getElementById('high-score-medium');

    const timeDisplay = document.getElementById('time');
    const scoreDisplay = document.getElementById('score');
    const streakDisplay = document.getElementById('streak');
    const problemDisplay = document.getElementById('problem');
    const answerInput = document.getElementById('answer-input');
    const feedbackDisplay = document.getElementById('feedback');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');

    const finalScoreDisplay = document.getElementById('final-score');
    const newHighScoreMessage = document.getElementById('new-high-score');
    const restartBtn = document.getElementById('restart-btn');

    let currentDifficulty = 'easy';
    let score = 0;
    let streak = 0;
    let timer;
    let timeLeft = 60;
    let currentProblem = { num1: 0, num2: 0, operator: '', answer: 0 };
    let problemActive = false; // To prevent multiple submissions or next clicks

    // --- High Score Management ---
    function getHighScore(difficulty) {
        return parseInt(localStorage.getItem(`arithmeticBlitzHighScore_${difficulty}`)) || 0;
    }

    function setHighScore(difficulty, newScore) {
        let currentHighScore = getHighScore(difficulty);
        if (newScore > currentHighScore) {
            localStorage.setItem(`arithmeticBlitzHighScore_${difficulty}`, newScore);
            return true; // New high score achieved
        }
        return false;
    }

    function updateHighScoreDisplays() {
        highScoreEasySpan.textContent = getHighScore('easy');
        highScoreMediumSpan.textContent = getHighScore('medium');
    }

    // --- Game Logic ---
    function generateProblem(difficulty) {
        let num1, num2, operator;
        const operators = ['+', '-', '*']; // Basic operations

        if (difficulty === 'easy') {
            num1 = Math.floor(Math.random() * 9) + 1; // 1-9
            num2 = Math.floor(Math.random() * 9) + 1; // 1-9
            operator = operators[Math.floor(Math.random() * operators.length)];

            // Ensure non-negative results for subtraction
            if (operator === '-' && num1 < num2) {
                [num1, num2] = [num2, num1]; // Swap to ensure num1 >= num2
            }
        } else { // medium
            num1 = Math.floor(Math.random() * 90) + 10; // 10-99
            num2 = Math.floor(Math.random() * 90) + 10; // 10-99
            operator = operators[Math.floor(Math.random() * operators.length)];

            // Introduce division sparingly and ensure whole numbers
            if (Math.random() < 0.2 && num2 !== 0) { // 20% chance for division
                operator = '/';
                // Make num1 a multiple of num2 for whole number result
                num1 = num2 * (Math.floor(Math.random() * 9) + 1); // num1 is multiple of num2
            } else if (operator === '-' && num1 < num2) {
                [num1, num2] = [num2, num1];
            }
        }

        let answer;
        switch (operator) {
            case '+': answer = num1 + num2; break;
            case '-': answer = num1 - num2; break;
            case '*': answer = num1 * num2; break;
            case '/': answer = num1 / num2; break;
        }

        currentProblem = { num1, num2, operator, answer };
        problemDisplay.textContent = `${num1} ${operator} ${num2} = ?`;
        answerInput.value = '';
        answerInput.focus();
        feedbackDisplay.textContent = '';
        feedbackDisplay.className = 'feedback'; // Reset feedback class
        problemActive = true;
        submitBtn.classList.remove('hidden');
        nextBtn.classList.add('hidden');
    }

    function checkAnswer() {
        if (!problemActive) return; // Prevent double submission

        const userAnswer = parseInt(answerInput.value);
        if (isNaN(userAnswer)) {
            feedbackDisplay.textContent = 'Please enter a number.';
            feedbackDisplay.className = 'feedback incorrect'; // Use 'incorrect' styling for validation messages too
            return;
        }

        if (userAnswer === currentProblem.answer) {
            score++;
            streak++;
            feedbackDisplay.textContent = 'Correct!';
            feedbackDisplay.className = 'feedback correct';
            // Add streak bonus points
            if (streak >= 3) { // Bonus for streak of 3 or more
                score += Math.floor(streak / 3); // 1 bonus point for every 3 in streak
            }
            scoreDisplay.textContent = score;
            streakDisplay.textContent = streak;
            submitBtn.classList.add('hidden');
            nextBtn.classList.remove('hidden');
        } else {
            streak = 0;
            feedbackDisplay.textContent = `Incorrect! The answer was ${currentProblem.answer}.`;
            feedbackDisplay.className = 'feedback incorrect';
            streakDisplay.textContent = streak;
            submitBtn.classList.add('hidden');
            nextBtn.classList.remove('hidden');
        }
        problemActive = false;
    }

    function startGame() {
        score = 0;
        streak = 0;
        timeLeft = 60;
        scoreDisplay.textContent = score;
        streakDisplay.textContent = streak;
        timeDisplay.textContent = timeLeft;
        newHighScoreMessage.textContent = '';

        startScreen.classList.remove('active');
        endScreen.classList.remove('active');
        gameScreen.classList.add('active');

        generateProblem(currentDifficulty);
        answerInput.focus();

        timer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        gameScreen.classList.remove('active');
        endScreen.classList.add('active');
        finalScoreDisplay.textContent = score;

        const isNewHighScore = setHighScore(currentDifficulty, score);
        if (isNewHighScore) {
            newHighScoreMessage.textContent = `New High Score for ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}!`;
            updateHighScoreDisplays(); // Update start screen display immediately
        } else {
            newHighScoreMessage.textContent = '';
        }
    }

    // --- Event Listeners ---
    difficultyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            currentDifficulty = e.target.dataset.difficulty;
            startGame();
        });
    });

    submitBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', () => {
        generateProblem(currentDifficulty);
        answerInput.focus(); // Re-focus after generating new problem
    });

    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (submitBtn.classList.contains('hidden')) { // If submit button is hidden, it means next is visible
                nextBtn.click();
            } else {
                submitBtn.click();
            }
        }
    });

    restartBtn.addEventListener('click', () => {
        // Go back to start screen to choose difficulty again or restart current
        startScreen.classList.add('active');
        endScreen.classList.remove('active');
        updateHighScoreDisplays(); // Ensure high scores are fresh
    });

    // Initial load: update high scores
    updateHighScoreDisplays();
});