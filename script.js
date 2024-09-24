document.addEventListener('DOMContentLoaded', function () {
    // Get the game board element from the DOM
    let board = document.getElementById('gameBoard');

    // Variables for the timer functionality
    let timer;
    let time = 0;
    let isPaused = false; // Track if the timer is paused

    // Variables for the score
    let score = 0;
    const timeFactor = 100;

    // Variables to keep track of game progress and state
    let level = 1;
    let matchedCards = 0;
    let firstCard, secondCard;
    let hasFlippedCard = false;
    let lockBoard = false;
    let cards = [];



    // DOM Elements for Pause/Resume buttons
    const pauseButton = document.getElementById('pauseButton');
    const resumeButton = document.getElementById('resumeButton')

    // Event listener to pause the game
    pauseButton.addEventListener('click', pauseGame);

    // Event listener to resume the game
    resumeButton.addEventListener('click', resumeGame);

    // Add an event listener to the Restart button
    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', restartGame);


    // Function to start the timer (increments every second)
    function startTimer() {
        timer = setInterval(() => {
            if (!isPaused) {
                time++;
                document.getElementById('timer').textContent = `Time: ${time} seconds`;
            }
        }, 1000);  // Every second
    }

    // Function to stop the timer
    function stopTimer() {
        clearInterval(timer);
    }

    // Function to reset the timer (used at the start of each game)
    function resetTimer() {
        stopTimer();  // Clear any existing timer
        time = 0;  // Reset time to 0
        document.getElementById('timer').textContent = `Time: 0 seconds`;  // Reset the display
    }

    // Function to pause the game (including the timer)
    function pauseGame() {
        isPaused = true; // Set the paused flag to true
        pauseButton.disabled = true; //Disable the pause button
        resumeButton.disabled = false; // Enable the resume button
        lockBoard = true; // Lock the board to prevent interaction
    }

    // Function to resume the game (including the timer)
    function resumeGame() {
        isPaused = false; // Set the paused flag to false
        pauseButton.disabled = false; // Enable the pause button
        resumeButton.disabled = true; // Disable the resume button
        lockBoard = false; // Unlock the board for interactions
    }

    // Function to restart the game
    function restartGame() {
        // Reset all game variables
        score = 0;
        level = 1;
        matchedCards = 0;
        lockBoard = false;

        // Update the scoreboard
        const scoreboardElement = document.getElementById('scoreboard');
        if (scoreboardElement) {
            scoreboardElement.textContent = `Score: ${score}`;
        }

        // Reset timer
        resetTimer();

        // Clear + reset board to level 1
        startLevel(8, 'level1');

        // Enable the pause button and disable resume button in case they're in the wrong state
        pauseButton.disabled = false;
        resumeButton.disabled = true;

        console.log('Game has been restarted!');
    }

    // Function to shuffle the card array (to randomize card positions)
    function shuffle(array) {
        array.sort(() => 0.5 - Math.random());
    }

    // Function to start the next level (with an increased number of cards)
    function nextLevel() {
        level++;  // Increase the level
        console.log(`Starting level ${level}`);


        if (level === 2) {
            startLevel(10, 'level2');  // Level 2: 10 pairs, 5x4 grid
        } else if (level === 3) {
            startLevel(18, 'level3');  // Level 3: 18 pairs, 6x6 grid
        } else {
            alert('Congratulations! You have completed all levels!');  // Game completed
            level = 1;  // Restart at level 1
            startLevel(8, 'level1');  // Level 1: 8 pairs, 4x4 grid
        }
    }

    // Function to start a specific level
    function startLevel(pairsCount, levelClass) {
        console.log(`Generating ${pairsCount} pairs for ${levelClass}`);
        cards = generateCardPairs(pairsCount);  // Generate pairs of cards for the level
        board.className = `game-board ${levelClass}`;  // Set the CSS class for the board layout
        matchedCards = 0;  // Reset matched cards count
        createBoard();  // Create the board with the new cards
    }

    // Function to generate pairs of cards (dynamically based on level)
    function generateCardPairs(pairsCount) {
        // Create an array of unique values for the cards (A-Z)
        const cardValues = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, pairsCount);
        return [...cardValues, ...cardValues];  // Duplicate each value to form pairs
    }

    // Function to create the board with the cards
    function createBoard() {
        resetTimer();  // Reset the timer for the new game
        startTimer();  // Start the timer
        shuffle(cards);  // Shuffle the cards
        board.innerHTML = '';  // Clear the previous game board

        // Loop through the shuffled cards and create card elements
        cards.forEach(card => {
            const cardElement = document.createElement('div');  // Create a card div
            cardElement.classList.add('card');  // Add the card class
            cardElement.setAttribute('data-value', card);  // Store the card's value
            cardElement.addEventListener('click', flipCard);  // Add click event listener
            board.appendChild(cardElement);  // Append the card to the board
        });
    }

    // Function to handle card flips
    function flipCard() {
        if (lockBoard || isPaused) return; // Prevent further interaction if the board is locked or game is paused
        if (this === firstCard) return; // Prevent clicking the same card twice

        this.classList.add('flipped'); // Add the flipped class to the card
        this.textContent = this.getAttribute('data-value'); // Display the card's value

        if (!hasFlippedCard) {
            // First card clicked
            hasFlippedCard = true;
            firstCard = this; // Store the first card
        } else {
            // Second card clicked
            hasFlippedCard = false;
            secondCard = this; // Store the second card
            checkForMatch(); // Check if the two flipped cards match
        }
    }


    // Function to check if two flipped cards match
    function checkForMatch() {
        if (firstCard.getAttribute('data-value') === secondCard.getAttribute('data-value')) {
            disableCards();  // Disable the matched cards
            matchedCards += 2;  // Increase the matched cards count

            console.log(`Matched Cards: ${matchedCards} / ${cards.length}`);//Debugging

            // Check if all cards are matched (end of level)
            if (matchedCards === cards.length) {
                stopTimer();  // Stop the timer
                calculateScore();
                setTimeout(() => {
                    alert(`You've won! Time: ${time} seconds. Score: ${score}`);  // Display the win message with time and score.
                    console.log('Proceeding to the next level') // Debugging
                    nextLevel();  // Move to the next level
                }, 500);  // Short delay before proceeding to the next level
            }
        } else {
            // No match, flip the cards back
            unflipCards();
        }
    }

    // Function to calculate and update score
    function calculateScore() {
        const levelMultiplier = (level * 100) + 10; // Higher levels give more points
        const timePenalty = time; // Adjust time penalty to be less severe
        const pointsEarned = Math.max(10, levelMultiplier - timePenalty); // Calculate points for this level

        score += pointsEarned; // Add points earned for this level to the total score

        const scoreboardElement = document.getElementById('scoreboard');

        if (scoreboardElement) {
            scoreboardElement.textContent = `Score: ${score}`; // Update the scoreboard display if it exists
        } else {
            console.error('Scoreboard element not found!'); // Log an error if the scoreboard doesn't exist
        }
        console.log(`Points earned: ${pointsEarned}, Total Score: ${score}`)
        // document.getElementById('scoreboard').textContent = `Score: ${score}`; // Update the scoreboard display
    }

    // Function to disable the matched cards (remove click event listeners)
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetBoard();
    }

    // Function to unflip the cards (when no match is found)
    function unflipCards() {
        lockBoard = true;  // Temporarily lock the board

        // Delay for a short period before flipping the cards back
        setTimeout(() => {
            firstCard.classList.remove('flipped');  // Remove the flipped class
            secondCard.classList.remove('flipped');  // Remove the flipped class
            firstCard.textContent = '';  // Clear the card's value
            secondCard.textContent = '';  // Clear the card's value
            resetBoard();  // Reset the board state
        }, 1000);  // 1-second delay
    }

    // Function to reset the board variables (after each turn)
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];  // Reset flags
        [firstCard, secondCard] = [null, null];  // Clear the stored cards
    }

    // Start the first level when the game loads
    startLevel(8, 'level1');  // Level 1: 8 pairs, 4x4 grid
});
