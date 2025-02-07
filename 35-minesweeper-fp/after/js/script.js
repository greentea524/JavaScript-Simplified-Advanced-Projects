// Display/UI

import {
  TILE_STATUSES,
  createBoard,
  markTile,
  revealTile,
  checkWin,
  checkLose,
  positionMatch,
  markedTilesCount,
} from "./minesweeper.js"

const BOARD_SIZE = 10
const NUMBER_OF_MINES = 3
const boardElement = document.querySelector(".board")
const gameStatus = document.querySelector(".gamestatus")
const messageText = document.querySelector(".subtext")
const newGameButton = document.querySelector(".newgame")
const scoreBoard = document.querySelector(".scoreboard")
const level = document.querySelector(".level")
const odometer = document.querySelector(".odometer")

let board = null;
let difficulty = 0;
let score = 0;
let scoreAdded = false;

newGameButton.addEventListener("click", e => {
    newGame()
})

function newGame() {

    board = null;
    scoreAdded = false;

    var boardSizeChoice = BOARD_SIZE;
    var numberOfMines = NUMBER_OF_MINES + difficulty;

    displayMinesLeft();
    refreshScore();
    refreshLevel();

    board = createBoard(
      boardSizeChoice,
      getMinePositions(boardSizeChoice, numberOfMines)
    )

    render();
}

function render() {
  boardElement.innerHTML = ""

  if(board){
      checkGameEnd()

      getTileElements().forEach(element => {
        boardElement.append(element)
      })

      listMinesLeft()
  }

}

function refreshScore() {
    scoreBoard.innerHTML = score;
}

function refreshLevel() {
    level.innerHTML = difficulty;
}

function displayMinesLeft() {
    messageText.innerHTML = "Mines Left: <span data-mine-count></span>"
}

function getTileElements() {
  return board.flatMap(row => {
    return row.map(tileToElement)
  })
}

function tileToElement(tile) {
  const element = document.createElement("div")
  element.dataset.status = tile.status
  element.dataset.x = tile.x
  element.dataset.y = tile.y
  element.textContent = tile.adjacentMinesCount || ""
  return element
}

boardElement.addEventListener("click", e => {
  if (!e.target.matches("[data-status]")) return

  board = revealTile(board, {
    x: parseInt(e.target.dataset.x),
    y: parseInt(e.target.dataset.y),
  })
  render()
})

boardElement.addEventListener("contextmenu", e => {
  if (!e.target.matches("[data-status]")) return

  e.preventDefault()
  board = markTile(board, {
    x: parseInt(e.target.dataset.x),
    y: parseInt(e.target.dataset.y),
  })
  render()
})

boardElement.style.setProperty("--size", BOARD_SIZE)
newGame()

function listMinesLeft() {
    let minesLeftText = document.querySelector("[data-mine-count]")
    if(minesLeftText !== null){
        minesLeftText.innerHTML = NUMBER_OF_MINES + difficulty - markedTilesCount(board)
    }
}

function checkGameEnd() {
  const win = checkWin(board)
  const lose = checkLose(board)

  // if (win || lose) {
  //   boardElement.addEventListener("click", stopProp, { capture: true })
  //   boardElement.addEventListener("contextmenu", stopProp, { capture: true })
  // }

  if (win) {

    if(!scoreAdded){
        difficulty++;
        let thisRoundScore = (difficulty * 1.5) * 1000;
        score = score + Math.round(thisRoundScore);
        scoreAdded = true;
        refreshScore();
        refreshLevel();
        messageText.textContent = "You Win" + " +" + thisRoundScore;
        setTimeout(function(){ newGameButton.click(); }, 2000);

    }

  }
  if (lose) {
    messageText.textContent = "You Lose"
    if(difficulty > 0) difficulty--;
    board.forEach(row => {
      row.forEach(tile => {
        if (tile.status === TILE_STATUSES.MARKED) board = markTile(board, tile)
        if (tile.mine) board = revealTile(board, tile)
      })
    })
    setTimeout(function(){ newGameButton.click(); }, 2000);
  }
}

function stopProp(e) {
  e.stopImmediatePropagation()
}

function getMinePositions(boardSize, numberOfMines) {
  const positions = []

  while (positions.length < numberOfMines) {
    const position = {
      x: randomNumber(boardSize),
      y: randomNumber(boardSize),
    }

    if (!positions.some(positionMatch.bind(null, position))) {
      positions.push(position)
    }
  }

  return positions
}

function randomNumber(size) {
  return Math.floor(Math.random() * size)
}
