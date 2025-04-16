// global variables
let wordLength = "four";
let wordLengthNum;
let randomWord = "";
let currentRow = 0;
let checkingWord = ""

// DOM elements
const welcomeScreen = document.querySelector('#welcome-screen');
const darkModeBtns = document.querySelectorAll('.dark-mode-btn');
const gameRulesBtns = document.querySelectorAll('.game-rules');
const tryAgainBtn = document.querySelector('.try-again');
const chooseLengthBtns = document.querySelectorAll('#welcome-screen form .btns > button');
const startGameBtn = document.querySelector('#welcome-screen form .start-btn');
const gameRulesModal = document.querySelector('.game-rules-modal');
const gameRulesModalClose = document.querySelector('.game-rules-modal .close');
const gameScreen = document.querySelector('#game-screen');
const rowsContainer = document.querySelector('#game-screen main');
const controlBox = document.querySelector('#game-screen main .control');
const checkBtn = document.querySelector('#game-screen main .control button:first-of-type');

// removing elements
gameScreen.remove()
gameRulesModal.remove()
controlBox.remove()

//  dark mode button
let isDarkMode = false;
darkModeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (isDarkMode) {
      btn.querySelector('.fa-solid').style.display = 'block';
      btn.querySelector('img').style.display = 'none';
      isDarkMode = false;
    } else {
      btn.querySelector('.fa-solid').style.display = 'none';
      btn.querySelector('img').style.display = 'block';
      isDarkMode = true;
    }
  });
})

// game rules button
gameRulesBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.container:first-of-type').append(gameRulesModal)
    welcomeScreen.classList.add('pointer-events-none')
    gameScreen.classList.add('pointer-events-none')
  })
})

// close game rules modal
gameRulesModalClose.addEventListener('click', () => {
  gameRulesModal.remove()
  welcomeScreen.classList.remove('pointer-events-none')
  gameScreen.classList.remove('pointer-events-none')
})

// choose word length
chooseLengthBtns.forEach(button => {

  button.addEventListener('click', (event) => {
    chooseLengthBtns.forEach(btn => btn.classList.remove('clicked'));
    button.classList.add('clicked');
    wordLength = button.dataset.length;
    event.preventDefault()
  })

})


// start game button
startGameBtn.addEventListener('click', (event) => {
  // start game
  startGame()
  event.preventDefault()
})

// try again button
tryAgainBtn.addEventListener('click', (event) => {
  location.reload()
  event.preventDefault()
})




// functions

function startGame() {
  // removing welcome screen
  welcomeScreen.remove()
  // adding game screen
  document.body.append(gameScreen)
  // fetching data
  fetch("data.json").then(res => res.json())
  .then(data => {
    // getting random word
    randomWord = data[wordLength][Math.floor(Math.random() * data[wordLength].length)]
    // getting word length number
    wordLengthNum = randomWord.length;
    // adding inputs
    addInputs(wordLengthNum)
    const rows = document.querySelectorAll('#game-screen main .row');
    // adding control box
    rowsContainer.append(controlBox)
    // inputs mechanism
    inputsMechanism(rows)
    // check word button
    checkBtn.addEventListener('click', () => {
      checkWord(rows)
    })
  })
}

function addInputs(num) {
  for (let i = 0; i < 6; i++) {
    let row = document.createElement('div');
    row.classList.add('row');
    rowsContainer.append(row);
    // adding inputs to row
    for (let j = 0; j < num; j++) {
      let div = document.createElement('div');
      let span = document.createElement('span');
      span.className = "gray"
      div.append(span);
      let input = document.createElement('input');
      input.setAttribute('maxlength', 1);
      div.append(input);
      row.append(div);
    }
  }
}

function inputsMechanism(rows) {
  // adding active class to current row
  rows.forEach(row => row.classList.remove("active"))
  rows[currentRow].classList.add('active')
  // getting inputs
  inputs = rows[currentRow].querySelectorAll('input')
  inputs.forEach((input, index) => {
    // adding active class to first input
    if (index === 0) {
      input.classList.add('active')
      input.focus()
    }
    // when inputing
    input.addEventListener("input", () => {
      if (input.value.length === 1) {
        checkingWord = getWord(inputs)
        console.log(checkingWord)
        if (index !== inputs.length - 1) {
          input.classList.remove('active')
          input.blur()
          inputs[index + 1].focus()
          inputs[index + 1].classList.add('active')
        }
      }
    })
    // when clicking back space
    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace") {
        checkingWord = getWord(inputs)
        console.log(checkingWord)
        if (index !== 0 && input.value === "") {
          input.blur()
          input.classList.remove('active')
          inputs[index - 1].focus()
          inputs[index - 1].classList.add('active')
        }
      }
    })
    // when clicking enter
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && index === inputs.length - 1) {
        checkWord(rows)
      }
    })
  });
}

function checkWord(rows) {
  let inputs = rows[currentRow].querySelectorAll('input')
  let lose = true 
  // ensuring that checking word is completed
  if (checkingWord.length === wordLengthNum) {
    // increasing current row
    currentRow++
    // checking word
    let guess = checkingWord.split("")
    let correct = randomWord.split("")
    guess = guess.map(letter => letter.toLowerCase())
    correct = correct.map(letter => letter.toLowerCase())
    // win
    if (guess.join("") === correct.join("")) {
      rowsContainer.classList.add("pointer-events-none")
      rows.forEach(row => row.classList.remove("active"))
      sendMessage("You won", false)
      lose = false
    }
    // checking for correct letters
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === correct[i]) {
        inputs[i].parentElement.querySelector("span").className = "green"
        guess[i] = null
        correct[i] = null
      }
    }
    // checking for letters in wrong place
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] && correct.includes(guess[i])) {
        inputs[i].parentElement.querySelector("span").className = "yellow"
        correct[correct.indexOf(guess[i])] = null; // Mark as used
      }
    }
    // animating inputs
    inputs.forEach((input, index) => {
      input.parentElement.classList.add("animated")
      input.style.animationDelay = `${index * 0.15}s`
      input.parentElement.querySelector("span").style.animationDelay = `${index * 0.15}s`
      input.parentElement.querySelector("span").innerHTML = checkingWord[index]
    })
    // lose message 
    if (currentRow === 6 && lose) {
      sendMessage("You lost word was " + randomWord, false)
    } else {
      inputsMechanism(rows)
    }
    // resetting check word
    checkingWord = ""
  } else {
    sendMessage("word is not completed", true)
  }
}

function getWord(inputs) {  
  let result = ""
  for (let i = 0; i < inputs.length; i++) {
    result += inputs[i].value
  }
  return result
}

function sendMessage(message, isRevomed) {
  let span = document.createElement('span');
  span.innerHTML = ""
  span.append(message)
  span.className = "message"
  rowsContainer.append(span)
  if (isRevomed) {
    setTimeout(() => {
      span.remove()
    }, 1000)
  }
}