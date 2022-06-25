'use strict';

// Declarations

// Player tallies and assets

const cAssetsSlot = document.getElementById('current-assets');
const exposureSlot = document.getElementById('exposure');
const pMinAssetsSlot = document.getElementById('potential-minimum-assets');
const scoreSlot = document.getElementById('score');
const highScoreSlot = document.getElementById('high-score');

let cAssetsValuePlayer = 100;
let exposureValuePlayer = 0;
let pMinAssetsValuePlayer = 100;

const alertButton = document.querySelector('.btn--alert');
const newButton = document.querySelector('.btn--new');
const statusButton = document.querySelector('.btn--status');
const bidButton = document.querySelector('.btn--bid');
const peekButton = document.querySelector('.btn--peek');
const passButton = document.querySelector('.btn--pass');

const peekCost = 20;
peekButton.innerText = `👁 Peek (Cost: T${peekCost})`;

alertButton.style.opacity = 0;
alertButton.classList.remove('invisible');

// Game tallies and assets
let scoreValue = 0;
let highScoreValue = 0;
let cAssetsValueGame = 100;
let exposureValueGame = 0;
let pMinAssetsValueGame = 100;
let knownFieldsGame = [];

// General tallies and assets

let state = 'Player';
let passes = 0;

let fieldValues = [40, 20, 2, 1000];

class Field {
  constructor(nameLetter, earthNumber) {
    this.letter = nameLetter;
    this.number = earthNumber;
    this.earthImgSlot = document.getElementById(`earth${nameLetter}Img`);
    this.grassImgSlot = document.getElementById(`grass${nameLetter}Img`);
    this.bidValueSlot = document.getElementById(`bid${nameLetter}`);
    this.fieldValueSlot = document.getElementById(`value${nameLetter}`);
    this.earthImgSource = `images/Field_Earth${earthNumber}.jpg`;
    this.grassImgSource = `images/Field${nameLetter}_Grass.jpg`;
    this.fieldValue = fieldValues[earthNumber - 1];
    this.bidPerson = null;
    this.bidValue = 0;
    this.sold = false;
    this.justSold = false;
    this.selected = false;
    this.viewed = false;
    this.gameViewed = false;
    this.going = 0;
  }
}

const fieldLookUp = {
  A: null,
  B: null,
  C: null,
  D: null,
};

// Initialise display and variables

initialise();

// Initialise helper functions

function initialise() {
  cAssetsValuePlayer = 100;
  exposureValuePlayer = 0;
  pMinAssetsValuePlayer = 100;
  scoreValue = 0;

  cAssetsValueGame = 100;
  exposureValueGame = 0;
  pMinAssetsValueGame = 100;

  // Lay objects randomly

  let earthNumbers = [1, 2, 3, 4];
  for (const letter of ['A', 'B', 'C', 'D']) {
    const randomEarthNumber = randomInt(0, earthNumbers.length - 1);
    const earthNumber = earthNumbers.splice(randomEarthNumber, 1)[0];
    fieldLookUp[letter] = new Field(letter, earthNumber);
  }

  // Set up initial display

  for (const letter of ['A', 'B', 'C', 'D']) {
    const field = fieldLookUp[letter];
    displayBid(field);
    displayValue(field);
    displayEarth(field);
    field.grassImgSlot.style.opacity = 1;
  }
  displayFinancialPosition();

  alertButton.style.opacity = 0;

  // Set up Player turn

  setUpPlayer();

  // Display functions

  function displayBid(field) {
    if (field.bidPerson == null) {
      field.bidValueSlot.innerText = 'No bid';
    } else if (field.bidPerson == 'Player') {
      field.bidValueSlot.innerText = `Your bid: T${field.bid}`;
    } else {
      field.bidValueSlot.text = `Game bid: T${field.bid}`;
    }
  }

  function displayValue(field) {
    if (field.viewed == false) {
      field.fieldValueSlot.innerText = 'Field Value: ?';
    } else {
      field.fieldValueSlot.innerText = `Field Value: T${field.bidValue}`;
    }
  }

  function displayEarth(field) {
    field.earthImgSlot.src = `${field.earthImgSlot.baseURI}${field.earthImgSource}`;
    console.log(field.earthImgSlot.src);
  }

  function displayFinancialPosition() {
    cAssetsSlot.innerText = `T${cAssetsValuePlayer}`;
    exposureSlot.innerText = `T${exposureValuePlayer}`;
    pMinAssetsSlot.innerText = `T${pMinAssetsValuePlayer}`;
  }

  // Player functions

  function setUpPlayer() {
    state = 'Player';
    setButtons();
    setNewButton();
    scoreSlot.innerText = 'T0';
    statusButton.innerText = '👉your turn';
  }
}

function setFieldListeners(fun) {
  for (const letter of ['A', 'B', 'C', 'D']) {
    const field = fieldLookUp[letter];
    field.grassImgSlot.addEventListener('click', fun);
  }
}

function removeFieldListeners(fun) {
  for (const letter of ['A', 'B', 'C', 'D']) {
    const field = fieldLookUp[letter];
    field.grassImgSlot.removeEventListener('click', fun);
  }
}

function findField(grassImgSlot) {
  for (const letter of ['A', 'B', 'C', 'D']) {
    const field = fieldLookUp[letter];
    if (field.grassImgSlot == grassImgSlot) {
      return field;
    }
  }
}

function bidFunction() {
  alertButton.style.opacity = 0;
  if (pMinAssetsValuePlayer - 5 < 0) {
    alertButton.innerText = '🚫Insufficient funds. Click a button.';
    alertButton.style.opacity = 1;
    return;
  }
  setFieldListeners(fieldBid);
  freezeButtons();
  alertButton.innerText = '👉Please now select field.';
  alertButton.style.opacity = 1;
}

function fieldBid(event) {
  const grassImgSlot = event.target;
  let selectedField = findField(grassImgSlot);
  removeFieldListeners(fieldBid);
  if (selectedField.bidPerson == 'Player') {
    if (selectedField.sold) {
      alertButton.innerText = '🚫Already sold. Click a button.';
      alertButton.style.opacity = 1;
    } else {
      alertButton.innerText = '🚫Top bid is yours already. Click a button.';
      alertButton.style.opacity = 1;
    }
    setButtons();
    return;
  }
  if (selectedField.sold) {
    alertButton.innerText = '🚫Already sold. Click a button.';
    alertButton.style.opacity = 1;
    setButtons();
    return;
  }
  if (pMinAssetsValuePlayer - (selectedField.bidValue + 5) < 0) {
    alertButton.innerText = '🚫Insufficient funds. Click a button.';
    alertButton.style.opacity = 1;
    setButtons();
    return;
  }
  alertButton.style.opacity = 0;
  freezeNewButton();
  let slotArray = [];
  let valueArray = [];
  let imageArray = [];
  if (selectedField.bidPerson == 'Game') {
    exposureValueGame -= selectedField.bidValue;
    pMinAssetsValueGame += selectedField.bidValue;
    selectedField.going = 0;
  }
  selectedField.bidValue += 5;
  selectedField.bidPerson = 'Player';
  passes = 0;
  exposureValuePlayer = exposureValuePlayer + selectedField.bidValue;
  pMinAssetsValuePlayer = pMinAssetsValuePlayer - selectedField.bidValue;
  slotArray.push(selectedField.bidValueSlot);
  valueArray.push(`Your bid: T${selectedField.bidValue}`);
  switchPlayerTo('Game', slotArray, valueArray, imageArray);
}

function peekFunction() {
  alertButton.style.opacity = 0;
  if (pMinAssetsValuePlayer - peekCost < 0) {
    alertButton.innerText = '🚫Insufficient funds. Click a button.';
    alertButton.style.opacity = 1;
    return;
  }
  setFieldListeners(fieldPeek);
  freezeButtons();
  alertButton.innerText = '👉Please now select field.';
  alertButton.style.opacity = 1;
}

function fieldPeek(event) {
  const grassImgSlot = event.target;
  let selectedField = findField(grassImgSlot);
  removeFieldListeners(fieldPeek);
  if (selectedField.sold) {
    alertButton.innerText = `🚫Already sold. Can't peek. Click a button.`;
    alertButton.style.opacity = 1;
    setButtons();
    return;
  }
  if (selectedField.viewed) {
    alertButton.innerText = '🚫Already peeked. Click a button.';
    alertButton.style.opacity = 1;
    setButtons();
    return;
  }
  alertButton.style.opacity = 0;
  freezeNewButton();
  let slotArray = [];
  let valueArray = [];
  selectedField.viewed = true;
  passes = 0;
  cAssetsValuePlayer = cAssetsValuePlayer - peekCost;
  pMinAssetsValuePlayer = pMinAssetsValuePlayer - peekCost;
  slotArray.push(selectedField.fieldValueSlot);
  valueArray.push(`Field Value: T${selectedField.fieldValue}`);
  let imageArray = [selectedField.grassImgSlot];
  switchPlayerTo('Game', slotArray, valueArray, imageArray);
}

// 'Game' play functions

let gamePlay = function () {
  const kTF = gameKnownTreasureField();
  if (
    kTF &&
    kTF.bidPerson != 'Game' &&
    kTF.bidValue + 5 <= pMinAssetsValueGame
  ) {
    gameBidField(kTF);
    return;
  } else {
    let randomCoin = Math.random();
    if (randomCoin > 0.5) {
      if (!gameBid()) {
        if (!gamePeek()) {
          passFunction('Player');
          return;
        }
      }
    } else {
      if (!gamePeek()) {
        if (!gameBid()) {
          passFunction('Player');
          return;
        }
      }
    }
  }
};

function gameKnownTreasureField() {
  for (const letter of ['A', 'B', 'C', 'D']) {
    const field = fieldLookUp[letter];
    if (field.gameViewed && field.number == 4) {
      return field;
    }
  }
  return false;
}

function fieldCanBid() {
  let resultArray = [];
  for (const letter of ['A', 'B', 'C', 'D']) {
    const field = fieldLookUp[letter];
    if (
      field.bidPerson != 'Game' &&
      (field.bidValue + 5 <= field.fieldValue || !field.gameViewed) &&
      field.bidValue + 5 <= pMinAssetsValueGame &&
      !field.sold
    ) {
      resultArray.push(field);
    }
  }
  return resultArray;
}

function fieldValueNotKnownGameArray() {
  let resultArray = [];
  for (const letter of ['A', 'B', 'C', 'D']) {
    const field = fieldLookUp[letter];
    if (!(field.gameViewed || field.sold)) {
      resultArray.push(field);
    }
  }
  return resultArray;
}

function gameBid() {
  const listCanBid = fieldCanBid();
  let chosenField;
  if (listCanBid.length == 0) {
    return false;
  } else {
    chosenField = listCanBid[randomInt(0, listCanBid.length - 1)];
  }
  gameBidField(chosenField);
  return true;
}

function gameBidField(field) {
  let slotArray = [];
  let valueArray = [];
  if (field.bidPerson == 'Player') {
    exposureValuePlayer -= field.bidValue;
    pMinAssetsValuePlayer += field.bidValue;
    field.going = 0;
  }
  field.bidPerson = 'Game';
  field.bidValue += 5;
  field.going = 0;
  exposureValueGame += field.bidValue;
  pMinAssetsValueGame -= field.bidValue;
  slotArray.push(field.bidValueSlot);
  valueArray.push(`Game bid: T${field.bidValue}`);
  passes = 0;
  switchPlayerTo('Player', slotArray, valueArray, []);
}

function gamePeek() {
  const listNotKnown = fieldValueNotKnownGameArray();
  let chosenField;
  if (listNotKnown.length <= 2) {
    return false;
  } else {
    chosenField = listNotKnown[randomInt(0, listNotKnown.length - 1)];
  }
  gamePeekField(chosenField);
  return true;
}

function gamePeekField(field) {
  cAssetsValueGame -= peekCost;
  pMinAssetsValueGame -= peekCost;
  field.gameViewed = true;
  passes = 0;
  switchPlayerTo('Player', [], [], []);
}

// General helper functions

function setButtons() {
  bidButton.addEventListener('click', bidFunction);
  peekButton.addEventListener('click', peekFunction);
  passButton.addEventListener('click', passFunctionToGame);
}

function freezeButtons() {
  bidButton.removeEventListener('click', bidFunction);
  peekButton.removeEventListener('click', peekFunction);
  passButton.removeEventListener('click', passFunctionToGame);
}

function setNewButton() {
  newButton.addEventListener('click', initialise);
}

function freezeNewButton() {
  newButton.removeEventListener('click', initialise);
}

function bidsDead() {
  for (const letter of ['A', 'B', 'C', 'D']) {
    const field = fieldLookUp[letter];
    if (field.bidPerson && !field.sold) {
      return false;
    }
  }
  return true;
}

function switchPlayerTo(person, slotArray, valueArray, imageArray) {
  [slotArray, valueArray, imageArray] = ripenBids(
    person,
    slotArray,
    valueArray,
    imageArray
  );

  slotArray.push(cAssetsSlot);
  slotArray.push(exposureSlot);
  slotArray.push(pMinAssetsSlot);

  valueArray.push(`T${cAssetsValuePlayer}`);
  valueArray.push(`T${exposureValuePlayer}`);
  valueArray.push(`T${pMinAssetsValuePlayer}`);

  if (passes > 1 && bidsDead()) {
    state = 'Gameover';
  } else {
    state = person;
  }

  let play;
  slotArray.push(statusButton);

  switch (state) {
    case 'Player':
      valueArray.push('👉your turn');
      play = function () {
        setButtons();
        setNewButton();
      };
      break;
    case 'Game':
      valueArray.push('✋game turn');
      play = gamePlay;
      break;
    case 'Gameover':
      scoreValue = cAssetsValuePlayer;
      highScoreValue = Math.max(highScoreValue, scoreValue);
      valueArray.push(`🎉game over. final assets: T${cAssetsValuePlayer}`);
      slotArray.push(scoreSlot);
      slotArray.push(highScoreSlot);
      valueArray.push(`T${scoreValue}`);
      valueArray.push(`T${highScoreValue}`);
      play = function () {
        setNewButton();
      };
      break;
  }
  transition(slotArray, valueArray, imageArray, play);
}

function ripenBids(person, slotArray, valueArray, imageArray) {
  for (const letter of ['A', 'B', 'C', 'D']) {
    const field = fieldLookUp[letter];
    // Check for sold fields
    if (field.bidPerson == person && !field.sold) {
      field.going++;
      if (field.going > 2) {
        field.sold = true;
        if (person == 'Game') {
          field.gameViewed = true;
          cAssetsValueGame += field.fieldValue - field.bidValue;
          exposureValueGame -= field.bidValue;
          pMinAssetsValueGame += field.fieldValue;
          slotArray.push(field.bidValueSlot);
          valueArray.push(`GONE for T${field.bidValue} to Game`);
        } else {
          cAssetsValuePlayer += field.fieldValue - field.bidValue;
          exposureValuePlayer -= field.bidValue;
          pMinAssetsValuePlayer += field.fieldValue;
          slotArray.push(field.bidValueSlot);
          valueArray.push(`GONE for T${field.bidValue} to you`);
          if (!field.viewed) {
            imageArray.push(field.grassImgSlot);
            slotArray.push(field.fieldValueSlot);
            valueArray.push(`Field Value: T${field.fieldValue}`);
          }
        }
        // Increase 'goings' of bid but unsold fields.
      } else {
        if (person == 'Game') {
          switch (field.going) {
            case 1:
              slotArray.push(field.bidValueSlot);
              valueArray.push(`Game bid: T${field.bidValue} GOING ONCE`);
              break;
            case 2:
              slotArray.push(field.bidValueSlot);
              valueArray.push(`Game bid: T${field.bidValue} GOING TWICE`);
              break;
          }
        } else {
          switch (field.going) {
            case 1:
              slotArray.push(field.bidValueSlot);
              valueArray.push(`Your bid: T${field.bidValue} GOING ONCE`);
              break;
            case 2:
              slotArray.push(field.bidValueSlot);
              valueArray.push(`Your bid: T${field.bidValue} GOING TWICE`);
              break;
          }
        }
      }
    }
  }
  return [slotArray, valueArray, imageArray];
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high + 1 - low));
}

function passFunctionToGame() {
  passFunction('Game');
}

function passFunction(person) {
  alertButton.style.opacity = 0;
  freezeButtons();
  passes++;
  console.log(`passes = ${passes}`);
  switchPlayerTo(person, [], [], []);
}

function transition(slotArray, valueArray, imageArray, callback) {
  recursiveTimeoutFadeOut(1, slotArray, valueArray, imageArray, callback);
}

let recursiveTimeoutFadeOut = function (
  op,
  slotArray,
  valueArray,
  imageArray,
  callback
) {
  if (op < 0.01) {
    setTimeout(function () {
      fadeIn(slotArray, valueArray, callback);
    }, 500);
    return;
  }
  for (let slot of slotArray) {
    slot.style.opacity = op;
  }
  for (let image of imageArray) {
    image.style.opacity = op;
  }
  setTimeout(
    recursiveTimeoutFadeOut.bind(
      null,
      op - 0.01,
      slotArray,
      valueArray,
      imageArray,
      callback
    ),
    10
  );
  /*
   */
};

function fadeIn(slotArray, valueArray, callback) {
  for (let i = 0; i < slotArray.length; i++) {
    slotArray[i].innerText = valueArray[i];
  }
  recursiveTimeoutFadeIn(0, slotArray, valueArray, callback);
}

let recursiveTimeoutFadeIn = function (op, slotArray, valueArray, callback) {
  if (op >= 1) {
    callback();
    return;
  }
  for (let slot of slotArray) {
    slot.style.opacity = op;
  }
  setTimeout(
    recursiveTimeoutFadeIn.bind(
      this,
      op + 0.01,
      slotArray,
      valueArray,
      callback
    ),
    10
  );
};
