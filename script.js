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
let currWordIndex;
let moveToNextWord;
let progressIncrement;
let currProgress;
let spanArr;

async function getNewText() {
  const fetchedData = await fetch(API_NAME);
  const data = await fetchedData.json();
  const text = data.content;
  return text;
}

async function renderNewText() {
  textDisplay.innerHTML = "";
  const text = await getNewText();

  const spanOne = document.createElement("span");
  const spanTwo = document.createElement("span");
  const spanThree = document.createElement("span");
  const spanFour = document.createElement("span");
  const spanFive = document.createElement("span");

  spanOne.classList.add("correct");
  spanOne.classList.remove("incorrect");
  spanOne.classList.remove("underline");

  spanTwo.classList.add("correct");
  spanTwo.classList.remove("incorrect");
  spanTwo.classList.remove("underline");

  spanThree.classList.add("incorrect");
  spanThree.classList.remove("correct");
  spanThree.classList.remove("underline");

  spanFour.classList.remove("incorrect");
  spanFour.classList.remove("correct");
  spanFour.classList.add("underline");

  spanFive.classList.remove("correct");
  spanFive.classList.remove("incorrect");
  spanFive.classList.remove("underline");

  textDisplay.appendChild(spanOne);
  textDisplay.appendChild(spanTwo);
  textDisplay.appendChild(spanThree);
  textDisplay.appendChild(spanFour);
  textDisplay.appendChild(spanFive);

  spanFive.textContent = text;

  spanArr = [spanOne, spanTwo, spanThree, spanFour, spanFive];
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

function paintText(check) {
  spanArr.forEach((ele, index) => {
    ele.textContent = "";
  });
  const spanOne = spanArr[0];
  const spanTwo = spanArr[1];
  const spanThree = spanArr[2];
  const spanFour = spanArr[3];
  const spanFive = spanArr[4];

  const wordStartIndex = textWordIndexArr[currWordIndex];

  for (let i = 0; i < wordStartIndex; i++) {
    spanOne.textContent += textCharArr[i];
  }

  let flag = true;
  for (let i = 0; i < textInput.value.length; i++) {
    if (flag && textInput.value[i] === textCharArr[wordStartIndex + i]) {
      spanTwo.textContent += textCharArr[wordStartIndex + i];
    } else {
      spanThree.textContent += textCharArr[wordStartIndex + i];
      flag = false;
    }
  }

  if (check === "final") return;

  spanFour.textContent = textCharArr[wordStartIndex + textInput.value.length];

  for (
    let i = wordStartIndex + textInput.value.length + 1;
    i < textCharArr.length;
    i++
  ) {
    spanFive.textContent += textCharArr[i];
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
    progressUpdate("final");
    paintText("final");
    textInput.value = "";
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
