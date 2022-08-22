const API_NAME = "http://api.quotable.io/random";

let textDisplay = document.querySelector("#typeText");
let textInput = document.querySelector("#typeInput");
let timer = document.querySelector("#timer");
let nextLevelButton = document.querySelector("#nextLevel");
let wordsPerMinute = document.querySelector("#wordsPerMinute");
let nextLevelContainer = document.querySelector("#nextLevelContainer");
let progressDisplay = document.querySelector("#progressDisplay");
let flagAvatar = document.querySelector("#flagAvatar");
let carAvatar = document.querySelector("#carAvatar");

let textCharArr, textWordArr, textWordIndexArr;
let timerId, timeElapsed;
let inputTextCharArr, inputTextWordArr;
let currCharIndex;
let currWordIndex;
let moveToNextWord;
let progressIncrement;
let currProgress;

async function getNewText() {
  const fetchedData = await fetch(API_NAME);
  const data = await fetchedData.json();
  const text = data.content;
  return text;
}

async function renderNewText() {
  textDisplay.innerHTML = "";
  const text = await getNewText();
  text.split("").forEach((char, index) => {
    let newSpan = document.createElement("span");
    newSpan.innerText = char;
    textDisplay.appendChild(newSpan);
  });
  return [text.split(""), text.split(" ")];
}

function startTimer() {
  timer.innerText = 0;
  timeElapsed = 0;
  let prevDate = new Date();
  return setInterval(function () {
    let currDate = new Date();
    timeElapsed = Math.floor((currDate - prevDate) / 1000);
    timer.innerText = `${Math.floor(
      Math.floor((currDate - prevDate) / 1000) / 60
    )}m ${Math.floor((currDate - prevDate) / 1000) % 60}s`;
  }, 1000);
}

function stopTimer(id) {
  clearInterval(id);
}

function paintTextBefore(charIndex) {
  const charSpanArr = textDisplay.querySelectorAll("span");
  charSpanArr.forEach((charSpan, index) => {
    if (index < charIndex) {
      charSpan.classList.add("correct");
      charSpan.classList.remove("incorrect");
      charSpan.classList.remove("underline");
    }
  });
}
function paintText() {
  const charSpanArr = textDisplay.querySelectorAll("span");
  const wordStartIndex = textWordIndexArr[currWordIndex];
  console.log(textCharArr[wordStartIndex]);
  for (
    let i = textInput.value.length;
    i < textWordArr[currWordIndex].length;
    i++
  ) {
    charSpanArr[wordStartIndex + i].classList.remove("correct");
    charSpanArr[wordStartIndex + i].classList.remove("incorrect");
    charSpanArr[wordStartIndex + i].classList.remove("underline");
  }
  let flag = true;
  for (let i = 0; i < textInput.value.length; i++) {
    if (
      flag &&
      charSpanArr[wordStartIndex + i].innerText === textInput.value[i]
    ) {
      charSpanArr[wordStartIndex + i].classList.add("correct");
      charSpanArr[wordStartIndex + i].classList.remove("incorrect");
      charSpanArr[wordStartIndex + i].classList.remove("underline");
    } else {
      charSpanArr[wordStartIndex + i].classList.remove("correct");
      charSpanArr[wordStartIndex + i].classList.add("incorrect");
      charSpanArr[wordStartIndex + i].classList.remove("underline");
      flag = false;
    }
  }
  if (wordStartIndex + textWordArr[currWordIndex].length < textCharArr.length) {
    charSpanArr[
      wordStartIndex + textWordArr[currWordIndex].length
    ].classList.remove("underline");
  }
  if (wordStartIndex + textInput.value.length < textCharArr.length) {
    charSpanArr[wordStartIndex + textInput.value.length].classList.add(
      "underline"
    );
  }
}

function getStartingIndexOfWords() {
  let arr = [];
  let count = 0;
  for (let i = 0; i < textWordArr.length; i++) {
    arr[i] = count;
    count += textWordArr[i].length;
    if (i < textWordArr.length - 1) {
      count++;
    }
  }
  return arr;
}

function mainGameFunction(e) {
  let inputLength = textInput.value.length;
  let wordLength = textWordArr[currWordIndex].length;
  if (
    textInput.value === textWordArr[currWordIndex] &&
    currWordIndex === textWordArr.length - 1
  ) {
    endGame();
    textInput.value = "";
    currWordIndex++;
    progressUpdate("final");
    paintTextBefore(textCharArr.length);
    paintText();
    return;
  }
  if (inputLength > wordLength) {
    textInput.value = textInput.value.substring(0, textInput.value.length - 1);
    if (textInput.value === textWordArr[currWordIndex] && e.data == " ") {
      currWordIndex++;
      textInput.value = "";
      progressUpdate();
    }
  }
  paintTextBefore(textWordIndexArr[currWordIndex]);
  paintText();
}

function progressIncrementCalculator() {
  let progressDisplayWidth = progressDisplay.clientWidth;
  let flagAvatarWidth = flagAvatar.clientWidth;
  let carAvatarWidth = carAvatar.clientWidth;
  let travelSpace = progressDisplayWidth - flagAvatarWidth - carAvatarWidth;
  progressIncrement = Math.floor(travelSpace / textWordArr.length);
  currProgress = 0;
}
function progressUpdate(arg) {
  if (arg === "final") {
    let progressDisplayWidth = progressDisplay.clientWidth;
    let flagAvatarWidth = flagAvatar.clientWidth;
    let carAvatarWidth = carAvatar.clientWidth;
    let travelSpace = progressDisplayWidth - flagAvatarWidth - carAvatarWidth;
    carAvatar.style.transform = `translateX(${travelSpace - 3}px)`;
  } else {
    currProgress += progressIncrement;
    carAvatar.style.transform = `translateX(${currProgress}px)`;
  }
}
function progressReset() {
  currProgress = 0;
  progressIncrement = 0;
  carAvatar.style.transform = `translateX(${currProgress}px)`;
}

async function startNewGame() {
  [textCharArr, textWordArr] = await renderNewText();
  timerId = startTimer();
  currCharIndex = 0;
  currWordIndex = 0;
  inputTextCharArr = [];
  inputTextWordArr = [];
  textWordIndexArr = getStartingIndexOfWords();
  nextLevelContainer.classList.add("hide");
  textInput.addEventListener("input", mainGameFunction);
  progressReset();
  progressIncrementCalculator();
}

function endGame() {
  textInput.removeEventListener("input", mainGameFunction);
  stopTimer(timerId);
  wordsPerMinute.textContent = `Typing Speed: ${Math.floor(
    textWordArr.length / (timeElapsed / 60)
  )} wpm`;
  nextLevelContainer.classList.remove("hide");
}

nextLevelButton.addEventListener("click", () => {
  startNewGame();
});

startNewGame();
