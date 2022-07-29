// # Configuration
const animationDuration = 500; // miliseconds - also adjust animation time on color-list.css
const guessScore = 1000;
const maxScore = 999 * guessScore; //this will make the game stops when player reaches max score

// # DOMs
let colorListDOM = null;
let scorePointsDOM = null;

// # Application Flags
let isReadyToSelectColor = false;
let playerScore = 0;
let colorQueue = [];
let playerGuess = [];

const handler = () => {
  const run = () => {
    colorListDOM = document.getElementById("color-list");
    scorePointsDOM = document.getElementById("score-points");
  };

  const resetGame = () => {
    isReadyToSelectColor = false;
    colorListDOM.innerHTML = "";
    playerScore = 0;
    colorQueue = [];
    playerGuess = [];
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const showScreen = (screen) => {
    document.body.className = `${screen}-open`;
  };

  const sleep = async (time) => {
    await new Promise((resolve) => setTimeout(resolve, time));
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const gameOver = () => {
    scorePointsDOM.innerHTML = playerScore;
    isReadyToSelectColor = false;
    showScreen("score");
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const showColorSequence = async (color, index) => {
    isReadyToSelectColor = false;

    if (index === 0) console.log("\n----- Color sequence -----");

    console.log(`[${index}] => ${color.id}`);

    const colorDOM = document.querySelector(`[data-color-id="${color.id}"]`);
    colorDOM.classList.add("glowing");

    setTimeout(async () => {
      colorDOM.classList.remove("glowing");

      // wait for animation effect to go away
      await sleep(animationDuration);

      // Display new color animation?
      if (index < colorQueue.length - 1) {
        showColorSequence(colorQueue[index + 1], index + 1);
      } else {
        isReadyToSelectColor = true;

        // Ok, player can play now...
      }
    }, [animationDuration * 2]);
  };

  const draftNewColor = async () => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    colorQueue.push(color);

    showColorSequence(colorQueue[0], 0);
  };

  const startNewGame = async () => {
    // # Reset any previous variables
    resetGame();

    // # Print colors on screen (this make the game configurable by file)
    let html = "";

    COLORS.forEach((color, index) => {
      html += `
          <div class="color" id="color-${index}" data-color-id="${color.id}">
            <button 
              type="button" 
              onclick="javascript:gameHandler.selectColor('${index}')" 
              style="
                --image: url('../images/${color.id}.png');
                --color: ${color.color};
              "
            >
            </button>
          </div>
        `;
    });

    colorListDOM.innerHTML = html;

    // # Open Game Screen
    showScreen("game");

    // # Wait some time for the user to see the colors
    await sleep(1000);

    // # Run first turn
    draftNewColor();
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const selectColor = async (colorIndex) => {
    if (!isReadyToSelectColor) return;

    isReadyToSelectColor = false;

    const colorDOM = document.getElementById(`color-${colorIndex}`);
    const colorId = colorDOM.dataset.colorId;

    playerGuess.push(colorId);

    // Player matched the sequence?
    let sequenceMatch = true;

    console.log("\n----- Checking player guess -----");

    playerGuess.forEach((guess, index) => {
      console.log(
        `[${index}] => ${guess} ${guess === colorQueue[index].id ? "✅" : "❌"}`
      );

      if (guess !== colorQueue[index].id) {
        sequenceMatch = false;
      }
    });

    if (sequenceMatch) {
      // Animate correct guess
      colorDOM.classList.add("correct");
      setTimeout(() => {
        colorDOM.classList.remove("correct");
      }, 500);

      // wait for animation effect to go away
      await sleep(animationDuration);

      // Is guess sequence finished? 🥳
      if (playerGuess.length === colorQueue.length) {
        playerScore += guessScore;

        // # Reached max score?
        if (playerScore >= maxScore) {
          return gameOver();
        }

        // reset player guess
        playerGuess = [];

        console.log("\nGenerating new color sequence...");

        // Wait some time for next color
        await sleep(2000);

        // New turn
        return draftNewColor();
      }

      // Let player keep choosing colors
      isReadyToSelectColor = true;
    } else {
      console.log("Game over! 😔 => Score: " + playerScore);

      // Animate wrong guess
      colorDOM.classList.add("wrong");

      // Wait animation to complete
      await sleep(800);

      return gameOver();
    }
  };

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  return {
    run,
    startNewGame,
    selectColor,
  };
};

var gameHandler = handler();

window.addEventListener("load", () => {
  gameHandler = handler();
  gameHandler.run();
});
