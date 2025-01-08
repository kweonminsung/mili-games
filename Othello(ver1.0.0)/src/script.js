const container = document.getElementById('container');
const table = document.getElementById('table');
const turn_text = document.getElementById('turn_text');
const red_score_text = document.getElementById('red_score_text');
const blue_score_text = document.getElementById('blue_score_text');

const MAX_ROW = 10;
const MAX_COLUMN = 10;
const MID_ROW = MAX_ROW / 2 - 1;
const MID_COLUMN = MAX_COLUMN / 2 - 1;

const BLUE_TURN = 0;
const RED_TURN = 1;
const NULL_SELECT = 0;
const BLUE_SELECT = 1;
const RED_SELECT = 2;

let state;
let cells;
let turn;

const DIRECTIONS = [
  { X: 1, Y: 0 },
  { X: -1, Y: 0 },
  { X: 0, Y: 1 },
  { X: 0, Y: -1 },
  { X: 1, Y: 1 },
  { X: 1, Y: -1 },
  { X: -1, Y: 1 },
  { X: -1, Y: -1 },
];

const initArray = (rows, columns) => {
  const arr = new Array(rows);

  for (let i = 0; i < rows; i++) {
    arr[i] = new Array(columns);
    for (let j = 0; j < columns; j++) arr[i][j] = NULL_SELECT;
  }
  return arr;
};

const initialize = () => {
  state = initArray(MAX_ROW, MAX_COLUMN);
  cells = initArray(MAX_ROW, MAX_COLUMN);

  for (let i = 0; i < MAX_COLUMN; i++) {
    const tr = document.createElement('tr');

    for (let j = 0; j < MAX_ROW; j++) {
      const cell = document.createElement('td');
      cell.row = i;
      cell.column = j;
      cells[i][j] = cell;
      cell.classList.add('cell');
      cell.addEventListener('click', clickHandler);
      tr.appendChild(cell);
    }

    table.appendChild(tr);
  }

  colorCell(MID_ROW, MID_COLUMN, RED_SELECT);
  colorCell(MID_ROW, MID_COLUMN + 1, BLUE_SELECT);
  colorCell(MID_ROW + 1, MID_COLUMN, BLUE_SELECT);
  colorCell(MID_ROW + 1, MID_COLUMN + 1, RED_SELECT);

  turn = RED_TURN;
  nextTurn();
};

const nextTurn = () => {
  if (turn === BLUE_TURN) {
    turn = RED_TURN;
    turn_text.innerText = '빨강 차례';
    console.log('red turn');
  } else {
    turn = BLUE_TURN;
    turn_text.innerText = '파랑 차례';
    console.log('blue turn');
  }
  if (showCanSelect() === 0) {
    alert('놓을 곳이 없습니다. 다음 순서로 넘어갑니다.');
    nextTurn();
  }
};

// Color single cell
const colorCell = (row, column, color) => {
  state[row][column] = color;
  cells[row][column].classList.add('selected');
  cells[row][column].classList.remove('blue', 'red');
  cells[row][column].classList.add(color === BLUE_SELECT ? 'blue' : 'red');
};

const clickHandler = e => {
  const cell = e.target;
  const cellRow = cell.row;
  const cellColumn = cell.column;

  if (
    state[cellRow][cellColumn] !== NULL_SELECT ||
    !calculateCanSelect(cellRow, cellColumn)
  ) {
    alert('다른 칸을 선택해주십시오!');
    return;
  }

  clearAllCanSelect();

  cell.classList.add('selected');

  if (turn === BLUE_TURN) {
    cell.classList.add('blue');
    state[cellRow][cellColumn] = BLUE_SELECT;
  } else {
    cell.classList.add('red');
    state[cellRow][cellColumn] = RED_SELECT;
  }

  // Color each directions
  for (let dir of DIRECTIONS) {
    if (calculateCanSelectByDirection(cellRow, cellColumn, dir)) {
      let curRow = cellRow,
        curColumn = cellColumn,
        count = 0;

      // Calculate what direction to color
      while (true) {
        curRow += dir.X;
        curColumn += dir.Y;

        if (turn === RED_TURN) {
          if (state[curRow][curColumn] == BLUE_SELECT) {
            colorCell(curRow, curColumn, RED_SELECT);
          } else {
            break;
          }
        } else {
          if (state[curRow][curColumn] == RED_SELECT) {
            colorCell(curRow, curColumn, BLUE_SELECT);
          } else {
            break;
          }
        }
      }
    }
  }

  calculateScore();

  nextTurn();
};

const calculateCanSelectByDirection = (row, column, direction) => {
  let curRow = row,
    curColumn = column,
    count = 0;

  while (true) {
    curRow += direction.X;
    curColumn += direction.Y;

    if (
      curRow < 0 ||
      curRow >= MAX_ROW ||
      curColumn < 0 ||
      curColumn >= MAX_COLUMN
    )
      break;
    if (state[curRow][curColumn] == NULL_SELECT) break;

    if (turn === RED_TURN) {
      if (state[curRow][curColumn] === BLUE_SELECT) {
        count++;
      } else {
        if (count > 0) return true;
        else break;
      }
    } else {
      if (state[curRow][curColumn] === RED_SELECT) {
        count++;
      } else {
        if (count > 0) return true;
        else break;
      }
    }
  }
  return false;
};

const calculateCanSelect = (row, column) => {
  for (let dir of DIRECTIONS) {
    if (calculateCanSelectByDirection(row, column, dir)) return true;
  }
  return false;
};

const showCanSelect = () => {
  let count = 0;
  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = 0; j < MAX_COLUMN; j++) {
      if (state[i][j] !== NULL_SELECT) continue;
      if (!calculateCanSelect(i, j)) continue;

      count++;
      cells[i][j].classList.add('canSelect');
    }
  }

  return count;
};

const clearAllCanSelect = () => {
  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = 0; j < MAX_COLUMN; j++) {
      cells[i][j].classList.remove('canSelect');
    }
  }
};

const calculateScore = () => {
  const red_score = document.querySelectorAll('.selected.red').length;
  const blue_score = document.querySelectorAll('.selected.blue').length;

  red_score_text.innerText = red_score;
  blue_score_text.innerText = blue_score;

  if (red_score + blue_score === MAX_ROW * MAX_COLUMN) {
    finishGame(red_score, blue_score);
  }
};

const finishGame = (red_count, blue_count) => {
  setTimeout(() => {
    if (red_count == blue_count) alert('비겼습니다!');
    else if (red_count > blue_count) alert('빨강 승리!');
    else alert('파랑 승리!');

    if (confirm('게임을 재시작합니까?')) {
      location.reload();
    }
  }, 100);
};

// const removeTable = () => {
//   document.querySelectorAll("tr").forEach(tr => tr.remove());
// };

initialize();
