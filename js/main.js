'use strict'

const MINE = '💣'
const EMPTY = ''
const FLAG = '🚩'

var gMarkedCount = 0
var gIsGameOver = false
var gBoard

var gTimerOn = false
var gTimerInterval

var gBombed = true

var gIsFirstClick = true
var gShownsCounter = 0
var gLength
var gMines

function onChangeLevel(size) {
  gIsFirstClick = true
  if (!size) {
    size = gBoard.length
  }
  gMines = 0
  gLength = size
  gIsGameOver = false
  buildBoard(size)
  renderBoard(gBoard)
  changeRestartBtnSmily('start')

  getRandomPos()
  stopTimer()
  resetTimer()
  closeModel()
}

function buildBoard(size) {
  var board = []

  for (var i = 0; i < size; i++) {
    board[i] = []
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
    }
  }
  gBoard = board
  addMinesBySize(size)
}
function renderBoard(board) {
  var strHTML = ''

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j]

      var cellClass = getClassName({ i, j })

      strHTML += `<td class="cell ${cellClass}"
      onmouseup="onHandleKey(event,${i},${j})"
      
       onclick="onCellClicked(this,${i},${j})">${
        currCell.isShown ? currCell.minesAroundCount : ''
      }</td>`
    }
    strHTML += '<tr>'
  }
  var elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, cellI, cellJ) {
  if (gIsFirstClick) {
    gIsFirstClick = false
    if (gBoard[cellI][cellJ].isMine) {
      let isMine = true
      while (isMine) {
        buildBoard(gBoard.length)
        isMine = gBoard[cellI][cellJ].isMine
      }
    }
  }
  var clickedCell = gBoard[cellI][cellJ]

  if (gIsGameOver) return
  if (!gTimerOn) {
    startTimer()
  }

  if (clickedCell.isMine) {
    playSound('clicked')
    renderCell({ i: cellI, j: cellJ }, MINE)
    elCell.style.backgroundColor = 'red'
    gameOver('lose')
  } else {
    var bombConter = setMinesNegsCount(gBoard, cellI, cellJ)
    clickedCell.minesAroundCount = bombConter
    if (bombConter >= 1 && bombConter <= 8) {
      if (!clickedCell.isShown) gShownsCounter++
      elCell.innerText = bombConter
      elCell.style.backgroundColor = 'grey'
    } else if (bombConter === 0) {
      expandShown(cellI, cellJ)
    }
  }
  clickedCell.isShown = true
  if (checkShownCountInBoard(gBoard) === gLength ** 2 - gMines) {
    gameOver('win')
    playSound('victory')
  }
}
function setMinesNegsCount(board, cellI, cellJ) {
  var bombCounter = 0
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue

    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board.length) continue

      if (i === cellI && j === cellJ) continue
      if (board[i][j].isMine) bombCounter++
    }
  }

  return bombCounter
}
function expandShown(cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= gBoard[0].length || gBoard[i][j].isShown) continue
      if (i === cellI && j === cellJ) continue
      else if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) gShownsCounter++
      var count = setMinesNegsCount(gBoard, i, j)
      gBoard[i][j].minesAroundCount = count
      gBoard[i][j].isShown = true
      var elCell = document.querySelector(`.cell-${i}-${j}`)

      elCell.innerText = count
      elCell.style.backgroundColor = 'grey'
      if (count === 0) {
        expandShown(i, j)
      }
    }
  }
}

function getRandomPos() {
  var boardPoss = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var pos = { i: i, j: j }
      boardPoss.push(pos)
    }
  }
  var randPosIdx = getRandomIntInclusive(0, boardPoss.length - 1)
  var randPos = boardPoss[randPosIdx]
  return randPos
}
function showModal(check) {
  switch (check) {
    case 'win':
      var elModal = document.querySelector('.modal')
      elModal.innerText = 'you won 🎉🔥🔥'
      elModal.style.display = 'block'
      break
    case 'lose':
      var elModal = document.querySelector('.modal')
      elModal.innerText = 'you bombed 🤐😲'
      elModal.style.display = 'block'
      break
  }
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
// function renderLives() {
//   var str = '❤❤❤'
//   var strHTML = `lives left: <span style="color:red";>${str}</span>`

//   var elHeader = document.querySelector('.chance-live')
//   elHeader.innerHTML = strHTML
// }
// function removeChance() {
//   // if (clickedCell.isShown) return
//   var elHeader = document.querySelector('.chance-live')
//   var res = elHeader.innerText

//   var res = res.substring(0, res.length - 1)

//   elHeader.innerText = res
// }
// function onHintClicked(elBtn) {
//   elBtn.innerText = LOCK
//   gHintClicked = true
// }
function onHandleKey(ev, cellI, cellJ) {
  window.oncontextmenu = (ev) => {
    ev.preventDefault()
  }

  if (ev.button === 2) {
    gBoard[cellI][cellJ].isMarked = true
    gMarkedCount++

    renderCell({ i: cellI, j: cellJ }, FLAG)
  }
}
function showAllTheMinesWhenLose() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) {
        renderCell({ i, j }, MINE)
      }
    }
  }
}

function renderCell(location, value) {
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}
function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}

function changeRestartBtnSmily(smily) {
  var elBtn = document.querySelector('.restart-btn')
  switch (smily) {
    case 'lose':
      elBtn.innerText = '🤯'
      break
    case 'start':
      elBtn.innerText = '😎'
      break
    case 'win':
      elBtn.innerText = '😀'
      break
    default:
      console.log('valid size')
  }
}
function closeModel() {
  var elModal = document.querySelector('.modal')
  elModal.style.display = 'none'
}

function addBomb(bombCount) {
  for (var i = 0; i < bombCount; i++) {
    const position = getRandomPos(gBoard)
    gBoard[position.i][position.j].isMine = true
    gMines++
  }
}
function checkShownCountInBoard(board) {
  var shownCount = 0
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      if (board[i][j].isShown) shownCount++
    }
  }
  return shownCount
}

function gameOver(result) {
  gIsGameOver = true
  showModal(result)
  changeRestartBtnSmily(result)
  stopTimer()
  if (result === 'lose') {
    showAllTheMinesWhenLose()
  }
}
function resetTimer() {
  var elTimer = document.querySelector('span.timer')
  elTimer.innerText = '0.000'
}

function stopTimer() {
  clearInterval(gTimerInterval)
  gTimerOn = false
}

function startTimer() {
  gTimerOn = true
  var startTime = Date.now()
  gTimerInterval = setInterval(() => {
    var elapsedTime = Date.now() - startTime
    document.querySelector('span.timer').innerText = (
      elapsedTime / 1000
    ).toFixed(3)
  }, 37)
}
function playSound(sound) {
  var victory = new Audio('sounds/victory.mp3')
  var clicked = new Audio('sounds/bomb.mp3')

  switch (sound) {
    case 'victory':
      victory.play()
      break
    case 'clicked':
      clicked.play()
      break
    default:
      console.log('not a sound')
  }
}
