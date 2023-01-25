'use strict'
'use strict'

const BOMB = '💣'
const EMPTY = ''
const FLAG = '🚩'

// Builds the board
// Set the mines
// Call setMinesNegsCount()
// Return the created board
var gTimerOn = false
var gIsGameOver = false
var gBoard
var timerInterval
// console.table(gBoard)
function onChangeLevel(size) {
  gIsGameOver = false
  gBoard = buildBoard(size)
  addMinesBySize(size)
  renderBoard(gBoard)
  console.table(gBoard)
  getRandomPosition()
  clearInterval(timerInterval)
  closeModel()

  //   console.log(res)
}
// function onInitGame() {
//   gBoard = buildBoard()
//   renderBoard(gBoard)
//   var res = getRandomPoss(gBoard)
//   console.log(res)

//   var elModal = document.querySelector('.modal')
//   elModal.style.display = 'none'
// }

// gBoard – A Matrix
// containing cell objects:
// Each cell: {
//  minesAroundCount: 4,
//  isShown: false,
//  isMine: false,
//  isMarked: true

// }

function buildBoard(size) {
  var board = []

  for (var i = 0; i < size; i++) {
    board[i] = []
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 4,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
    }
  }

  console.table(board)

  return board
}

function renderBoard(board) {
  var strHTML = ''

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      //   const currCell = board[i][j]

      var currCell = board[i][j]

      var cellClass = getClassName({ i, j })

      // var strClass= getClassName({i,j}) + ''
      strHTML += `<td class="cell ${cellClass}"
      
       onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellClicked(this,${i},${j}, true)">${
        currCell.isShown ? currCell.minesAroundCount : ''
      }</td>`
    }
    strHTML += '<tr>'
  }
  var elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}
function onCellClicked(elCell, cellI, cellJ, rightClick) {
  if (gIsGameOver) {
    return
  }
  if (gTimerOn === false) {
    startTimer()
  }

  var clickedCell = gBoard[cellI][cellJ]
  clickedCell.isShown = true

  console.log(clickedCell, cellI, cellJ)
  //   if (rightClick) {
  //     clickedCell.isMarked = !clickedCell.isMarked
  //     clickedCell.innerText = clickedCell.isMarked ? FLAG : ''
  //   }
  if (clickedCell.isMine) {
    gameOver()
  } else {
    var bombConter = setMinesNegsCount(gBoard, cellI, cellJ)
    clickedCell.minesAroundCount = bombConter
    if (bombConter >= 1 && bombConter <= 8) {
      // if (bombConter > 0) console.log('hi bomb')
      // else console.log('i am safe')

      elCell.innerText = bombConter
      elCell.style.backgroundColor = 'grey'
    } else if (bombConter === 0) {
      blowUpNegsCont(gBoard, cellI, cellJ)
    }
  }
}

function setMinesNegsCount(board, cellI, cellJ) {
  var bombCounter = 0
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) {
      continue
    }

    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board.length) {
        continue
      }
      if (i === cellI && j === cellJ) continue
      if (board[i][j].isMine) {
        bombCounter++
      }
    }
  }

  return bombCounter
}

// if bomb counter is 0 as i want to bomb his negs

//1- ane tsarekh mezahee eehode for each cell
//2- i can add data i and data j for each cell or class id

function blowUpNegsCont(board, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      //   console.log(i, j)

      //   var currCell = board[i][j]

      // update the model
      var count = setMinesNegsCount(board, i, j)
      board[i][j] = count

      var elCell = document.querySelector(`.cell-${i}-${j}`)
      var count = setMinesNegsCount(board, i, j)
      //   console.log(count)
      console.log(elCell)
      elCell.innerText = count
      elCell.style.backgroundColor = 'grey'
    }
  }
}

function getRandomPosition() {
  return {
    i: getRandomIntInclusive(0, gBoard.length - 1),
    j: getRandomIntInclusive(0, gBoard.length - 1),
  }
}

function addBomb(bombCount) {
  for (var i = 0; i < bombCount; i++) {
    const position = getRandomPosition(gBoard)
    console.log(position)
    gBoard[position.i][position.j].isMine = true
  }
}

function startTimer() {
  gTimerOn = true
  var startTime = Date.now()
  timerInterval = setInterval(() => {
    var elapsedTime = Date.now() - startTime
    document.querySelector('.timer').innerText = (elapsedTime / 1000).toFixed(3)
  }, 37)
}

function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}
function gameOver() {
  gIsGameOver = true
  var elModal = document.querySelector('.modal')
  elModal.style.display = 'block'
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) {
        renderCell({ i, j }, BOMB)
      }
    }
  }
  clearInterval(timerInterval)
}
function renderCell(location, value) {
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}

function addMinesBySize(boardSize) {
  switch (boardSize) {
    case 4:
      addBomb(2)
      break
    case 8:
      addBomb(14)
      break
    case 12:
      addBomb(32)
      break
    default:
      console.log('valid size')
  }
}
function onRestart() {
  closeModel()
  onChangeLevel(gBoard.length)
}

function closeModel() {
  var elModal = document.querySelector('.modal')
  elModal.style.display = 'none'
}
