const container = document.getElementById('container');
const table = document.getElementById('table');
const timer_text = document.getElementById('timer-text');
const pin_count = document.getElementById('pin-count');
const mine_left = document.getElementById('mine-left');

const column_input = document.getElementById('column-input');
const row_input = document.getElementById('row-input');
const mine_input = document.getElementById('mine-input');

let MAX_ROW = null;
let MAX_COLUMN = null;
let MINE_NUM = null;

const DIFFICULTY = [
  { row: 8, column: 8, mine: 8 },
  { row: 12, column: 12, mine: 20 },
  { row: 16, column: 16, mine: 40 },
];

const DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
];

let pinCount = 0;

let isLeftClick = false;
let isRightClick = false;

let clickFlag = false;
let initFlag = true;
let startRow = null,
  startColumn = null;

let cells;
let openedCellNum = 0;

let now;
let timerId;

class Cell {
  constructor(isMine, dom) {
    this.opened = false;
    this.isMine = isMine;
    this.pinned = false;
    this.number = null;
    this.dom = dom;
  }
}

const initArray = (rows, columns) => {
  const arr = new Array(rows);
  for (let i = 0; i < rows; i++) {
    arr[i] = new Array(columns);
  }
  return arr;
};

const selectRandomIndexes = (totalIndex, selectingNumber) => {
  const randomIndexArray = [];

  for (let i = 0; i < selectingNumber; i++) {
    let randomNum = Math.floor(Math.random() * totalIndex);
    if (randomIndexArray.indexOf(randomNum) === -1) {
      randomIndexArray.push(randomNum);
    } else {
      i--;
    }
  }
  return randomIndexArray;
};

const putMine = number => {
  const emptyCell = [];

  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = 0; j < MAX_COLUMN; j++) {
      if (i !== startRow && j !== startColumn) emptyCell.push(cells[i][j]);
    }
  }

  selectRandomIndexes(emptyCell.length, number).forEach(index => {
    emptyCell[index].isMine = true;
    colorIsMine(emptyCell[index].dom);
  });
};

const putNumber = () => {
  for (let i = 0; i < MAX_COLUMN; i++) {
    for (let j = 0; j < MAX_ROW; j++) {
      const nearMines = calculateNearMine(i, j);
      cells[i][j].number = nearMines;
      colorByNumber(cells[i][j].dom, nearMines);
    }
  }
};

const initialize = () => {
  cells = initArray(MAX_ROW, MAX_COLUMN);

  for (let i = 0; i < MAX_COLUMN; i++) {
    const tr = document.createElement('tr');

    for (let j = 0; j < MAX_ROW; j++) {
      const cell = document.createElement('td');
      cell.row = i;
      cell.column = j;
      cell.addEventListener('mousedown', preClickHandler);
      cell.addEventListener('mouseup', clickHandler);
      cell.addEventListener('contextmenu', e => e.preventDefault());
      cell.classList.add('cell');
      cells[i][j] = new Cell(false, cell);
      tr.appendChild(cell);
    }

    table.appendChild(tr);
  }

  pin_count.innerText = 0;
  mine_left.innerText = MINE_NUM;
};

const colorPinned = (dom, pinned) => {
  dom.classList.remove('pinned');

  if (pinned) dom.classList.add('pinned');
};
const colorOpened = dom => {
  dom.classList.add('opened');
};
const colorIsMine = dom => {
  dom.classList.add('isMine');
};
const colorRevealed = dom => {
  dom.classList.add('revealed');
};
const colorByNumber = (dom, number) => {
  if (number === 0) return;

  dom.classList.add('cell' + number);
};

const openCell = (row, column) => {
  const cell = cells[row][column];

  if (!cell.opened && !cell.pinned) {
    cell.opened = true;
    colorOpened(cell.dom);
    cell.dom.innerText = cell.number !== 0 ? cell.number : '';
    openedCellNum++;

    if (cell.number === 0) {
      for (const dir of DIRECTIONS) {
        if (
          row + dir.y < MAX_ROW &&
          row + dir.y >= 0 &&
          column + dir.x < MAX_COLUMN &&
          column + dir.x >= 0 &&
          !cells[row + dir.y][column + dir.x].pinned
        )
          openCell(row + dir.y, column + dir.x);
      }
    }
    if (cell.isMine) {
      cell.dom.innerText = '';
      gameOver();
    }
  }
};

const calculateNearMine = (row, column) => {
  let count = 0;

  for (const dir of DIRECTIONS) {
    if (
      row + dir.y < MAX_ROW &&
      row + dir.y >= 0 &&
      column + dir.x < MAX_COLUMN &&
      column + dir.x >= 0 &&
      cells[row + dir.y][column + dir.x].isMine
    )
      count++;
  }

  return count;
};

const calculateNearPin = (row, column) => {
  let count = 0;

  for (const dir of DIRECTIONS) {
    if (
      row + dir.y < MAX_ROW &&
      row + dir.y >= 0 &&
      column + dir.x < MAX_COLUMN &&
      column + dir.x >= 0 &&
      cells[row + dir.y][column + dir.x].pinned
    )
      count++;
  }

  return count;
};

const preClickHandler = e => {
  if ('which' in e) {
    isRightClick = e.which === 3 ? true : isRightClick;
    isLeftClick = e.which === 1 ? true : isLeftClick;
  } else if ('button' in e) {
    isRightClick = e.button === 2 ? true : isRightClick;
    isLeftClick = e.button === 0 ? true : isLeftClick;
  }
  clickFlag = true;
};

const clickHandler = e => {
  e.preventDefault();

  const cellDiv = e.target;
  const cellRow = e.target.row,
    cellColumn = e.target.column;
  const cell = cells[cellRow][cellColumn];

  if (initFlag && !isRightClick && isLeftClick) {
    startRow = cellRow;
    startColumn = cellColumn;
    putMine(MINE_NUM);
    putNumber();
    initFlag = false;
    startTimer();
  }

  if (clickFlag) {
    // Right & Left Click
    if (isRightClick && isLeftClick) {
      console.log('Both click');
      if (
        cell.opened &&
        calculateNearPin(cellRow, cellColumn) === cell.number
      ) {
        for (const dir of DIRECTIONS) {
          if (
            cellRow + dir.y < MAX_ROW &&
            cellRow + dir.y >= 0 &&
            cellColumn + dir.x < MAX_COLUMN &&
            cellColumn + dir.x >= 0 &&
            !cells[cellRow + dir.y][cellColumn + dir.x].pinned
          )
            openCell(cellRow + dir.y, cellColumn + dir.x);
        }
      }
    }
    // Right Click
    else if (isRightClick && !isLeftClick) {
      console.log('Right click');
      if (!cell.opened) {
        if (cell.pinned) pinCount--;
        else pinCount++;
        colorPinned(cellDiv, !cell.pinned);
        cell.pinned = !cell.pinned;
      }
    }
    // Left Click
    else {
      console.log('Left click');
      if (!cell.opened && !cell.pinned) {
        openCell(cellRow, cellColumn);
      }
    }
    clickFlag = false;

    pin_count.innerText = pinCount;
    mine_left.innerText = MINE_NUM - pinCount;

    // Check win game
    if (openedCellNum === MAX_ROW * MAX_COLUMN - MINE_NUM) {
      winGame();
    }
  }

  if ('which' in e) {
    isRightClick = e.which === 3 ? false : isRightClick;
    isLeftClick = e.which === 1 ? false : isLeftClick;
  } else if ('button' in e) {
    isRightClick = e.button === 2 ? false : isRightClick;
    isLeftClick = e.button === 0 ? false : isLeftClick;
  }
};

const revealAllMines = () => {
  for (let i = 0; i < MAX_COLUMN; i++) {
    for (let j = 0; j < MAX_ROW; j++) {
      if (cells[i][j].isMine) colorRevealed(cells[i][j].dom);
    }
  }
};

const gameOver = () => {
  revealAllMines();

  setTimeout(() => {
    alert('졌습니다!');

    clearInterval(timerId);

    if (confirm('게임을 재시작합니까?')) {
      location.reload();
    }
  }, 100);
};

const winGame = () => {
  setTimeout(() => {
    console.log(formatTime(Math.round((Date.now() - now) / 1000)));
    alert(
      '이겼습니다! 걸린 시간: ' +
        formatTime(Math.round((Date.now() - now) / 1000))
    );

    clearInterval(timerId);

    if (confirm('게임을 재시작합니까?')) {
      location.reload();
    }
  }, 100);
};

const formatTime = timeNum => {
  const hour = parseInt(String(timeNum / (60 * 60)));
  const min = parseInt(String((timeNum % (60 * 60)) / 60));
  const sec = timeNum % 60;

  return (
    String(hour).padStart(2, '0') +
    ':' +
    String(min).padStart(2, '0') +
    ':' +
    String(sec).padStart(2, '0')
  );
};

const startTimer = () => {
  now = Date.now();
  timerId = setInterval(() => {
    timer_text.innerText = formatTime(Math.round((Date.now() - now) / 1000));
  }, 1000);
};

const difficultyHandler = index => {
  MAX_ROW = DIFFICULTY[index].row;
  MAX_COLUMN = DIFFICULTY[index].column;
  MINE_NUM = DIFFICULTY[index].mine;

  closeModal();
  initialize();
};

const userInputStart = () => {
  try {
    const columns = parseInt(column_input.value);
    const rows = parseInt(row_input.value);
    const mines = parseInt(mine_input.value);

    if (
      columns * columns <= mines ||
      columns < 2 ||
      columns > 20 ||
      rows < 2 ||
      rows > 20
    )
      throw new Error('Invalid Input');

    MAX_ROW = rows;
    MAX_COLUMN = columns;
    MINE_NUM = mines;

    closeModal();
    initialize();
  } catch (err) {
    console.error(err);
  }
};

openModal();
