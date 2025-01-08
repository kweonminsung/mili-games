const container = document.getElementById('container');
const table = document.getElementById('table');
const score_text = document.getElementById('score_text');

const MAX_ROW = 4;
const MAX_COLUMN = 4;
const NEW_NUMBERS = [2, 4];

class Cell {
  constructor(empty, number, dom) {
    this.empty = empty;
    this.number = number;
    this.dom = dom;
  }
}

let cells;
let score = 0;

const initArray = (rows, columns) => {
  const arr = new Array(rows);
  for (let i = 0; i < rows; i++) {
    arr[i] = new Array(columns);
  }
  return arr;
};

const initialize = () => {
  cells = initArray(MAX_ROW, MAX_COLUMN);

  for (let i = 0; i < MAX_COLUMN; i++) {
    const tr = document.createElement('tr');

    for (let j = 0; j < MAX_ROW; j++) {
      const cell = document.createElement('td');
      cells[i][j] = new Cell(true, null, cell);
      cell.classList.add('cell');
      tr.appendChild(cell);
    }

    table.appendChild(tr);
  }

  putNewNumCell(2);
};

const putNewNumCell = number => {
  const emptyCell = [];

  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = 0; j < MAX_COLUMN; j++) {
      if (cells[i][j].empty) emptyCell.push(cells[i][j]);
    }
  }

  if (emptyCell.length == 0) {
    gameOver();
    return;
  }

  selectRandomIndexes(emptyCell.length, number).forEach(index => {
    const newNumber = createRandomNewNumber();
    emptyCell[index].empty = false;
    emptyCell[index].number = newNumber;
    colorByNumber(emptyCell[index].dom, newNumber);
  });
};

const createRandomNewNumber = () => {
  return NEW_NUMBERS[Math.floor(Math.random() * NEW_NUMBERS.length)];
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

const removeColor = dom => {
  dom.className = 'cell';
  dom.innerText = '';
};

const colorByNumber = (dom, number) => {
  dom.className = 'cell';
  if (number > 2048) dom.classList.add('cellover');
  else dom.classList.add('cell' + number);

  dom.innerText = number;
};

const calculateScore = () => {
  score_text.innerText = score;
};

const moveCell = (fromY, fromX, toY, toX) => {
  const tempEmpty = cells[fromY][fromX].empty,
    tempNumber = cells[fromY][fromX].number;
  cells[fromY][fromX].empty = cells[toY][toX].empty;
  cells[fromY][fromX].number = cells[toY][toX].number;

  cells[toY][toX].empty = tempEmpty;
  cells[toY][toX].number = tempNumber;

  colorByNumber(cells[fromY][fromX].dom, cells[fromY][fromX].number);
  colorByNumber(cells[toY][toX].dom, cells[toY][toX].number);
};

const mergeCells = (fromY, fromX, toY, toX) => {
  cells[toY][toX].empty = false;
  cells[toY][toX].number = cells[toY][toX].number + cells[fromY][fromX].number;
  colorByNumber(cells[toY][toX].dom, cells[toY][toX].number);

  cells[fromY][fromX].empty = true;
  cells[fromY][fromX].number = null;
  removeColor(cells[fromY][fromX].dom);

  score += cells[toY][toX].number;
};

const mergeByDirectionDown = () => {
  // Check cell have merge history
  let merged = initArray(MAX_ROW, MAX_COLUMN);

  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = 0; j < MAX_COLUMN; j++) {
      merged[i][j] = false;
    }
  }

  for (let i = 0; i < MAX_COLUMN; i++) {
    for (let j = MAX_ROW - 2; j >= 0; j--) {
      if (!cells[j][i].empty) {
        let topIndex = null;
        for (let k = j + 1; k < MAX_ROW; k++) {
          if (!cells[k][i].empty) {
            topIndex = k;
            break;
          }
        }

        if (topIndex === null) {
          moveCell(j, i, MAX_ROW - 1, i);
          continue;
        }
        if (
          cells[topIndex][i].number !== cells[j][i].number &&
          topIndex - 1 > j
        ) {
          moveCell(j, i, topIndex - 1, i);
          continue;
        }
        if (
          !merged[topIndex][i] &&
          cells[topIndex][i].number === cells[j][i].number
        ) {
          mergeCells(j, i, topIndex, i);

          let secondTopIndex = null;
          for (let m = topIndex + 1; m < MAX_ROW; m++) {
            if (!cells[m][i].empty) {
              secondTopIndex = m;
              break;
            }
          }
          if (secondTopIndex === null) {
            moveCell(topIndex, i, MAX_ROW - 1, i);
          } else if (secondTopIndex - 1 > topIndex) {
            moveCell(topIndex, i, secondTopIndex - 1, i);
          }
        }
      }
    }
  }
};

const mergeByDirectionUp = () => {
  // Check cell have merge history
  let merged = initArray(MAX_ROW, MAX_COLUMN);

  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = 0; j < MAX_COLUMN; j++) {
      merged[i][j] = false;
    }
  }

  for (let i = 0; i < MAX_COLUMN; i++) {
    for (let j = 1; j < MAX_ROW; j++) {
      if (!cells[j][i].empty) {
        let topIndex = null;
        for (let k = j - 1; k >= 0; k--) {
          if (!cells[k][i].empty) {
            topIndex = k;
            break;
          }
        }

        if (topIndex === null) {
          moveCell(j, i, 0, i);
          continue;
        }
        if (
          cells[topIndex][i].number !== cells[j][i].number &&
          topIndex + 1 < j
        ) {
          moveCell(j, i, topIndex + 1, i);
          continue;
        }
        if (
          !merged[topIndex][i] &&
          cells[topIndex][i].number === cells[j][i].number
        ) {
          mergeCells(j, i, topIndex, i);

          let secondTopIndex = null;
          for (let m = topIndex - 1; m >= 0; m--) {
            if (!cells[m][i].empty) {
              secondTopIndex = m;
              break;
            }
          }
          if (secondTopIndex === null) {
            moveCell(topIndex, i, 0, i);
          } else if (secondTopIndex + 1 < topIndex) {
            moveCell(topIndex, i, secondTopIndex + 1, i);
          }
        }
      }
    }
  }
};

const mergeByDirectionRight = () => {
  // Check cell have merge history
  let merged = initArray(MAX_ROW, MAX_COLUMN);

  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = 0; j < MAX_COLUMN; j++) {
      merged[i][j] = false;
    }
  }

  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = MAX_COLUMN - 2; j >= 0; j--) {
      if (!cells[i][j].empty) {
        let topIndex = null;
        for (let k = j + 1; k < MAX_COLUMN; k++) {
          if (!cells[i][k].empty) {
            topIndex = k;
            break;
          }
        }

        if (topIndex === null) {
          moveCell(i, j, i, MAX_COLUMN - 1);
          continue;
        }
        if (
          cells[i][topIndex].number !== cells[i][j].number &&
          topIndex - 1 > j
        ) {
          moveCell(i, j, i, topIndex - 1);
          continue;
        }
        if (
          !merged[i][topIndex] &&
          cells[i][topIndex].number === cells[i][j].number
        ) {
          mergeCells(i, j, i, topIndex);

          let secondTopIndex = null;
          for (let m = topIndex + 1; m < MAX_COLUMN; m++) {
            if (!cells[i][m].empty) {
              secondTopIndex = m;
              break;
            }
          }
          if (secondTopIndex === null) {
            moveCell(i, topIndex, i, MAX_COLUMN - 1);
          } else if (secondTopIndex - 1 > topIndex) {
            moveCell(i, topIndex, i, secondTopIndex - 1);
          }
        }
      }
    }
  }
};

const mergeByDirectionLeft = () => {
  // Check cell have merge history
  let merged = initArray(MAX_ROW, MAX_COLUMN);

  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = 0; j < MAX_COLUMN; j++) {
      merged[i][j] = false;
    }
  }

  for (let i = 0; i < MAX_ROW; i++) {
    for (let j = 1; j < MAX_COLUMN; j++) {
      if (!cells[i][j].empty) {
        let topIndex = null;
        for (let k = j - 1; k >= 0; k--) {
          if (!cells[i][k].empty) {
            topIndex = k;
            break;
          }
        }

        if (topIndex === null) {
          moveCell(i, j, i, 0);
          continue;
        }
        if (
          cells[i][topIndex].number !== cells[i][j].number &&
          topIndex + 1 < j
        ) {
          moveCell(i, j, i, topIndex + 1);
          continue;
        }
        if (
          !merged[i][topIndex] &&
          cells[i][topIndex].number === cells[i][j].number
        ) {
          mergeCells(i, j, i, topIndex);

          let secondTopIndex = null;
          for (let m = topIndex - 1; m >= 0; m--) {
            if (!cells[i][m].empty) {
              secondTopIndex = m;
              break;
            }
          }
          if (secondTopIndex === null) {
            moveCell(i, topIndex, i, 0);
          } else if (secondTopIndex + 1 < topIndex) {
            moveCell(i, topIndex, i, secondTopIndex + 1);
          }
        }
      }
    }
  }
};

const gameOver = () => {
  setTimeout(() => {
    alert('졌습니다!');

    if (confirm('게임을 재시작합니까?')) {
      location.reload();
    }
  }, 100);
};

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') {
    mergeByDirectionUp();

    calculateScore();
    putNewNumCell(1);
  }
  if (e.key === 'ArrowDown') {
    mergeByDirectionDown();

    calculateScore();
    putNewNumCell(1);
  }
  if (e.key === 'ArrowLeft') {
    mergeByDirectionLeft();

    calculateScore();
    putNewNumCell(1);
  }
  if (e.key === 'ArrowRight') {
    mergeByDirectionRight();

    calculateScore();
    putNewNumCell(1);
  }
});

initialize();
