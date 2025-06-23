document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');

    const difficultyButtons = document.querySelectorAll('.difficulty-button');
    const highScoreEasySpan = document.getElementById('high-score-easy');
    const highScoreMediumSpan = document.getElementById('high-score-medium');
    const highScoreHardSpan = document.getElementById('high-score-hard');

    const timeDisplay = document.getElementById('time');
    const scoreDisplay = document.getElementById('score');
    const streakDisplay = document.getElementById('streak');
    const speakWordBtn = document.getElementById('speak-word-btn');
    const answerInput = document.getElementById('answer-input');
    const hintLetterBtn = document.getElementById('hint-letter-btn');
    const hintDefinitionBtn = document.getElementById('hint-definition-btn');
    const hintsLeftLetterDisplay = document.getElementById('hints-left-letter');
    const hintsLeftDefinitionDisplay = document.getElementById('hints-left-definition');
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
    let timeLeft = 90;
    let currentWord = '';
    let revealedLetters = '';
    let hintsLeftLetter = 3;
    let hintsLeftDefinition = 1;
    let problemActive = false; // To prevent multiple submissions or next clicks
    let startTimeForWord; // To calculate time bonus

    // Word lists by difficulty
    // (In a real app, these might come from a JSON file or API)
    const wordLists = {
        easy: [
            { word: "cat", definition: "A small domesticated carnivorous mammal with soft fur, a short snout, and retractable claws." },
            { word: "dog", definition: "A domesticated carnivorous mammal that typically has a long snout, an acute sense of smell, and a barking voice." },
            { word: "run", definition: "Move at a speed faster than walking, never having both or all feet on the ground at the same time." },
            { word: "jump", definition: "Push oneself off a surface and into the air by using the muscles in one's legs and feet." },
            { word: "book", definition: "A written or printed work consisting of pages glued or sewn together along one side and bound in covers." },
            { word: "play", definition: "Engage in activity for enjoyment and recreation rather than a serious or practical purpose." },
            { word: "happy", definition: "Feeling or showing pleasure or contentment." },
            { word: "tree", definition: "A woody perennial plant, typically having a single stem or trunk growing to a considerable height and bearing lateral branches at some distance from the ground." },
            { word: "house", definition: "A building for human habitation, especially one that is lived in by a family or small group of people." },
            { word: "sun", definition: "The star that the Earth orbits, providing light and heat." }
        ],
        medium: [
            { word: "beautiful", definition: "Pleasing the senses or mind aesthetically." },
            { word: "friend", definition: "A person whom one knows and with whom one has a bond of mutual affection." },
            { word: "success", definition: "The accomplishment of an aim or purpose." },
            { word: "journey", definition: "An act of traveling from one place to another." },
            { word: "knowledge", definition: "Facts, information, and skills acquired by a person through experience or education; the theoretical or practical understanding of a subject." },
            { word: "important", definition: "Of great significance or value; likely to have a profound effect on success, survival, or well-being." },
            { word: "challenge", definition: "A call to someone to participate in a competitive situation or fight to decide who is superior in terms of ability or strength." },
            { word: "adventure", definition: "An unusual and exciting, typically hazardous, experience or activity." },
            { word: "curiosity", definition: "A strong desire to know or learn something." },
            { word: "imagination", definition: "The faculty or action of forming new ideas, or images or concepts of external objects not present to the senses." }
        ],
        hard: [
            { word: "conscience", definition: "An inner feeling or voice acting as a guide to the rightness or wrongness of one's behavior." },
            { word: "rhythm", definition: "A strong, regular, repeated pattern of movement or sound." },
            { word: "acquiesce", definition: "Accept something reluctantly but without protest." },
            { word: "ubiquitous", definition: "Present, appearing, or found everywhere." },
            { word: "serendipity", definition: "The occurrence and development of events by chance in a happy or beneficial way." },
            { word: "onomatopoeia", definition: "The formation of a word from a sound associated with what is named (e.g., cuckoo, sizzle)." },
            { word: "perseverance", definition: "Persistence in doing something despite difficulty or delay in achieving success." },
            { word: "quixotic", definition: "Extremely idealistic; unrealistic and impractical." },
            { word: "mellifluous", definition: "Sweet or musical; pleasant to hear." },
            { word: "cacophony", definition: "A harsh, discordant mixture of sounds." }
        ]
    };

    // --- High Score Management ---
    function getHighScore(difficulty) {
        return parseInt(localStorage.getItem(`spellingBeeHighScore_${difficulty}`)) || 0;
    }

    function setHighScore(difficulty, newScore) {
        let currentHighScore = getHighScore(difficulty);
        if (newScore > currentHighScore) {
            localStorage.setItem(`spellingBeeHighScore_${difficulty}`, newScore);
            return true; // New high score achieved
        }
        return false;
    }

    function updateHighScoreDisplays() {
        highScoreEasySpan.textContent = getHighScore('easy');
        highScoreMediumSpan.textContent = getHighScore('medium');
        highScoreHardSpan.textContent = getHighScore('hard');
    }

    // --- Game Logic ---
    function getRandomWord(difficulty) {
        const list = wordLists[difficulty];
        if (!list || list.length === 0) {
            console.error("Word list not found for difficulty:", difficulty);
            return null;
        }
        const randomIndex = Math.floor(Math.random() * list.length);
        return list[randomIndex];
    }

    function speakWord(word) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US'; // Set language
            utterance.rate = 0.8; // Slightly slower for clarity
            utterance.pitch = 1.0;
            speechSynthesis.speak(utterance);
        } else {
            feedbackDisplay.textContent = 'Text-to-speech not supported in this browser.';
            feedbackDisplay.className = 'feedback incorrect';
            console.warn("SpeechSynthesis API not supported.");
        }
    }

    function generateNewWord() {
        const wordObj = getRandomWord(currentDifficulty);
        if (wordObj) {
            currentWord = wordObj.word.toLowerCase();
            currentProblemDefinition = wordObj.definition; // Store definition for hint
            revealedLetters = Array(currentWord.length).fill('_'); // Initialize for letter hint
            answerInput.value = '';
            answerInput.focus();
            feedbackDisplay.textContent = '';
            feedbackDisplay.className = 'feedback';
            problemActive = true;
            submitBtn.classList.remove('hidden');
            nextBtn.classList.add('hidden');
            speakWord(currentWord);
            startTimeForWord = Date.now(); // Record start time for this word
        } else {
            feedbackDisplay.textContent = 'No words available for this difficulty.';
            feedbackDisplay.className = 'feedback incorrect';
            // Potentially end game or show specific error
        }
    }

    function checkAnswer() {
        if (!problemActive) return;

        const userAnswer = answerInput.value.toLowerCase().trim();
        if (userAnswer === '') {
            feedbackDisplay.textContent = 'Please type the word.';
            feedbackDisplay.className = 'feedback incorrect';
            return;
        }

        if (userAnswer === currentWord) {
            const timeTaken = (Date.now() - startTimeForWord) / 1000; // Time in seconds
            let wordPoints = 10;
            let timeBonus = Math.max(0, 5 - Math.floor(timeTaken / 5)); // More bonus for faster answers
            wordPoints += timeBonus;

            score += wordPoints;
            streak++;
            feedbackDisplay.textContent = `Correct! +${wordPoints} points.`;
            feedbackDisplay.className = 'feedback correct';
            // Advanced streak bonus
            if (streak >= 2) {
                score += (streak * 2); // Increasing bonus for longer streaks
            }
            scoreDisplay.textContent = score;
            streakDisplay.textContent = streak;
            submitBtn.classList.add('hidden');
            nextBtn.classList.remove('hidden');
        } else {
            streak = 0;
            feedbackDisplay.textContent = `Incorrect! The word was "${currentWord}".`;
            feedbackDisplay.className = 'feedback incorrect';
            streakDisplay.textContent = streak;
            submitBtn.classList.add('hidden');
            nextBtn.classList.remove('hidden');
        }
        problemActive = false;
    }

    function giveLetterHint() {
        if (hintsLeftLetter > 0) {
            const availableIndices = [];
            for (let i = 0; i < currentWord.length; i++) {
                if (revealedLetters[i] === '_') {
                    availableIndices.push(i);
                }
            }

            if (availableIndices.length > 0) {
                const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                revealedLetters[randomIndex] = currentWord[randomIndex];
                feedbackDisplay.textContent = `Hint: ${revealedLetters.join(' ')}`;
                feedbackDisplay.className = 'feedback info';
                hintsLeftLetter--;
                hintsLeftLetterDisplay.textContent = hintsLeftLetter;
                if (hintsLeftLetter === 0) hintLetterBtn.disabled = true;
            } else {
                feedbackDisplay.textContent = 'All letters revealed for this word!';
                feedbackDisplay.className = 'feedback info';
            }
        }
    }

    function giveDefinitionHint() {
        if (hintsLeftDefinition > 0 && currentProblemDefinition) {
            feedbackDisplay.textContent = `Definition: ${currentProblemDefinition}`;
            feedbackDisplay.className = 'feedback info';
            hintsLeftDefinition--;
            hintsLeftDefinitionDisplay.textContent = hintsLeftDefinition;
            if (hintsLeftDefinition === 0) hintDefinitionBtn.disabled = true;
        } else if (!currentProblemDefinition) {
             feedbackDisplay.textContent = 'No definition available for this word.';
             feedbackDisplay.className = 'feedback info';
        }
    }

    function startGame() {
        score = 0;
        streak = 0;
        timeLeft = 90;
        hintsLeftLetter = 3;
        hintsLeftDefinition = 1;
        scoreDisplay.textContent = score;
        streakDisplay.textContent = streak;
        timeDisplay.textContent = timeLeft;
        newHighScoreMessage.textContent = '';
        hintsLeftLetterDisplay.textContent = hintsLeftLetter;
        hintsLeftDefinitionDisplay.textContent = hintsLeftDefinition;
        hintLetterBtn.disabled = false;
        hintDefinitionBtn.disabled = false;


        startScreen.classList.remove('active');
        endScreen.classList.remove('active');
        gameScreen.classList.add('active');

        generateNewWord();
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
            updateHighScoreDisplays();
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

    speakWordBtn.addEventListener('click', () => speakWord(currentWord));
    submitBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', generateNewWord);
    hintLetterBtn.addEventListener('click', giveLetterHint);
    hintDefinitionBtn.addEventListener('click', giveDefinitionHint);


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
        startScreen.classList.add('active');
        endScreen.classList.remove('active');
        updateHighScoreDisplays();
    });

    // Initial load: update high scores
    updateHighScoreDisplays();
});