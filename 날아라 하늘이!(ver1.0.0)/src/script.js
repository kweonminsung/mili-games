let FPS = 60;
let COLLISION_GUIDE = false; // #15
let BIRD_TYPE = 1;
const PIPE_SPEED = 200;
const PIPE_INTERVAL = 2.5; // 파이프 등장 시간 간격(s)
const GRAVITY = 500; // 중력 가속도
const BIRD_ACC = 280;
const VERSION = '1.0.0';

// DO NOT MODIFY
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const MENUS = {
  TITLE: 0,
  GAME: 1,
  SETTINGS: 2,
};
const TITLE_BUTTONS = {
  GAME: 0,
  SETTINGS: 1,
};
const TITLE_BUTTONS_NUM = [TITLE_BUTTONS.GAME, TITLE_BUTTONS.SETTINGS];
const SETTINGS_BUTTONS = {
  FPS_30: 0,
  FPS_60: 1,
  GUIDE_Y: 2,
  GUIDE_N: 3,
  BIRD_1: 4,
  BIRD_2: 5,
  BIRD_3: 6,
  EXIT: 7,
};
const SETTINGS_BUTTONS_NUM = [
  SETTINGS_BUTTONS.FPS_30,
  SETTINGS_BUTTONS.FPS_60,
  SETTINGS_BUTTONS.GUIDE_Y,
  SETTINGS_BUTTONS.GUIDE_N,
  SETTINGS_BUTTONS.BIRD_1,
  SETTINGS_BUTTONS.BIRD_2,
  SETTINGS_BUTTONS.BIRD_3,
  SETTINGS_BUTTONS.EXIT,
];

let app, game;

class App {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);
    this.resize();
    this.initializeContext();

    this.showMenu(MENUS.TITLE);
  }
  showMenu(menu) {
    switch (menu) {
      case MENUS.TITLE:
        new Title(this.ctx);
        break;
      case MENUS.GAME:
        game = new Game(this.ctx);
        break;
      case MENUS.SETTINGS:
        new Settings(this.ctx);
        break;
    }
  }
  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
  }
  initializeContext() {
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'black';
    this.ctx.strokeStyle = 'black';
  }
}

class Title {
  constructor(ctx) {
    this.ctx = ctx;
    this.intervalId = null;
    this.t = 0;
    this.buttonSelect = TITLE_BUTTONS.GAME;
    this.eventListener = e => {
      // console.log(e.keyCode);
      switch (e.keyCode) {
        case 13:
        case 32:
          // console.log("enter or space");
          this.deactivate();
          switch (this.buttonSelect) {
            case TITLE_BUTTONS.GAME:
              app.showMenu(MENUS.GAME);
              break;
            case TITLE_BUTTONS.SETTINGS:
              app.showMenu(MENUS.SETTINGS);
              break;
          }
          break;
        case 38:
          // console.log("arrow up");
          this.buttonSelect =
            TITLE_BUTTONS_NUM[
              (this.buttonSelect + TITLE_BUTTONS_NUM.length - 1) %
                TITLE_BUTTONS_NUM.length
            ];
          break;
        case 40:
          // console.log("arrow down");
          this.buttonSelect =
            TITLE_BUTTONS_NUM[
              (this.buttonSelect + TITLE_BUTTONS_NUM.length + 1) %
                TITLE_BUTTONS_NUM.length
            ];
          break;
      }
    };
    document.addEventListener('keydown', this.eventListener);
    this.animate();
  }
  update() {
    this.showBackground();
    this.showButton();
    this.showHaneul();
  }
  showBackground() {
    const img = new Image();
    img.src = './src/image/background-title.png';
    this.ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  showButton() {
    this.ctx.font = '24px DungGeunMo';
    this.ctx.fillText('게임 시작', CANVAS_WIDTH / 2, 410, 200);
    this.ctx.fillText('설정', CANVAS_WIDTH / 2, 450, 200);

    this.ctx.fillStyle = 'gray';
    this.ctx.font = '12px DungGeunMo';
    this.ctx.fillText('키보드로 움직이세요', CANVAS_WIDTH / 2, 480, 200);
    this.ctx.fillStyle = 'black';

    this.ctx.font = '12px DungGeunMo';
    this.ctx.fillText(`ver ${VERSION}`, 550, 490, 200);
    this.ctx.beginPath();
    this.ctx.strokeRect(
      CANVAS_WIDTH / 2 - 100,
      this.buttonSelect === TITLE_BUTTONS.GAME ? 385 : 425,
      200,
      40
    );
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    this.ctx.closePath();
  }
  showHaneul() {
    const imgSize = this.t > 20 ? 200 : this.t * 10;
    const img = new Image();
    img.src = `./src/image/bird${BIRD_TYPE}.png`;
    this.ctx.drawImage(
      img,
      CANVAS_WIDTH / 2 - imgSize / 2,
      CANVAS_HEIGHT / 2 - imgSize / 2,
      imgSize,
      imgSize
    );
  }
  animate() {
    this.intervalId = setInterval(() => {
      this.update();
      this.t += 1;
      // console.log(this.t / FPS);
    }, 1000 / FPS);
  }
  deactivate() {
    document.removeEventListener('keydown', this.eventListener);
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

class Settings {
  constructor(ctx) {
    this.ctx = ctx;
    this.buttonSelect = SETTINGS_BUTTONS.FPS_30;
    this.eventListener = e => {
      //console.log(e.keyCode);
      switch (e.keyCode) {
        case 13:
        case 32:
          //console.log("enter or space");
          switch (this.buttonSelect) {
            case SETTINGS_BUTTONS.FPS_30:
              this.changeFPS(30);
              break;
            case SETTINGS_BUTTONS.FPS_60:
              this.changeFPS(60);
              break;
            case SETTINGS_BUTTONS.GUIDE_Y:
              this.changeCollisionGuide(true);
              break;
            case SETTINGS_BUTTONS.GUIDE_N:
              this.changeCollisionGuide(false);
              break;
            case SETTINGS_BUTTONS.BIRD_1:
              this.changeBirdType(1);
              break;
            case SETTINGS_BUTTONS.BIRD_2:
              this.changeBirdType(2);
              break;
            case SETTINGS_BUTTONS.BIRD_3:
              this.changeBirdType(3);
              break;
            case SETTINGS_BUTTONS.EXIT:
              this.deactivate();
              app.showMenu(MENUS.TITLE);
              break;
          }
          break;
        case 38:
          //console.log("arrow up");
          this.buttonSelect =
            SETTINGS_BUTTONS_NUM[
              (this.buttonSelect + SETTINGS_BUTTONS_NUM.length - 1) %
                SETTINGS_BUTTONS_NUM.length
            ];
          console.log(this.buttonSelect);
          break;
        case 40:
          // console.log("arrow down");
          this.buttonSelect =
            SETTINGS_BUTTONS_NUM[
              (this.buttonSelect + SETTINGS_BUTTONS_NUM.length + 1) %
                SETTINGS_BUTTONS_NUM.length
            ];
          break;
      }
    };
    document.addEventListener('keydown', this.eventListener);
    this.animate();
  }
  update() {
    this.showBackground();
    this.showButton();
  }
  showBackground() {
    const img = new Image();
    img.src = './src/image/background.png';
    this.ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  showButton() {
    this.ctx.font = '30px DungGeunMo';
    this.ctx.fillText('- 설정 -', CANVAS_WIDTH / 2, 80, 200);
    this.ctx.font = '20px DungGeunMo';
    this.ctx.fillText('FPS(초당 프레임)', 180, 160, 200);
    if (FPS === 30) this.ctx.fillStyle = 'red';
    this.ctx.fillText('30', 380, 160, 200);
    this.ctx.fillStyle = 'black';
    if (FPS === 60) this.ctx.fillStyle = 'red';
    this.ctx.fillText('60', 480, 160, 200);
    this.ctx.fillStyle = 'black';

    this.ctx.fillText('충돌 가이드 표시', 180, 220, 200);
    if (COLLISION_GUIDE) this.ctx.fillStyle = 'red';
    this.ctx.fillText('켜기', 380, 220, 200);
    this.ctx.fillStyle = 'black';
    if (!COLLISION_GUIDE) this.ctx.fillStyle = 'red';
    this.ctx.fillText('끄기', 480, 220, 200);
    this.ctx.fillStyle = 'black';

    this.ctx.fillText('플레이어 선택', 180, 280, 200);
    if (BIRD_TYPE === 1) this.ctx.fillStyle = 'red';
    this.ctx.fillText('하늘이', 360, 280, 200);
    this.ctx.fillStyle = 'black';
    if (BIRD_TYPE === 2) this.ctx.fillStyle = 'red';
    this.ctx.fillText('푸르미', 440, 280, 200);
    this.ctx.fillStyle = 'black';
    if (BIRD_TYPE === 3) this.ctx.fillStyle = 'red';
    this.ctx.fillText('보라미', 520, 280, 200);
    this.ctx.fillStyle = 'black';
    this.ctx.font = '18px DungGeunMo';
    this.ctx.fillText('뒤로가기', CANVAS_WIDTH / 2, 400, 200);

    this.ctx.fillStyle = 'gray';
    this.ctx.font = '12px DungGeunMo';
    this.ctx.fillText('기획 및 개발', CANVAS_WIDTH / 2, 455, 200);
    this.ctx.font = '10px DungGeunMo';
    this.ctx.fillText('(검열됨)대대', CANVAS_WIDTH / 2, 470, 400);
    this.ctx.fillStyle = 'black';

    this.ctx.beginPath();
    this.ctx.strokeRect(
      [340, 440, 340, 440, 320, 400, 480, 260][this.buttonSelect],
      [135, 135, 195, 195, 255, 255, 255, 375][this.buttonSelect],
      80,
      40
    );
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    this.ctx.closePath();
  }
  changeFPS(fps) {
    FPS = fps;
  }
  changeCollisionGuide(collisionGuide) {
    COLLISION_GUIDE = collisionGuide;
  }
  changeBirdType(birdType) {
    BIRD_TYPE = birdType;
  }
  animate() {
    this.intervalId = setInterval(() => {
      this.update();
      this.t += 1;
      //console.log(this.t / FPS);
    }, 1000 / FPS);
  }
  deactivate() {
    document.removeEventListener('keydown', this.eventListener);
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.intervalId = null;
    this.t = 0;

    this.background = new GameBackground();
    this.bird = new Bird(CANVAS_WIDTH / 4, CANVAS_HEIGHT * 0.4);
    this.pipes = new Pipes(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.meter = 0;
    this.eventListener = e => {
      //console.log(e.keyCode);
      switch (e.keyCode) {
        case 38:
          //console.log("arrow up");
          if (!this.intervalId) return;

          this.bird.pullUp(this.ctx);
          break;
        case 40:
          //console.log("arrow down");
          if (!this.intervalId) return;

          this.bird.pullDown(this.ctx);
          break;
        case 32:
          //console.log("pause");

          if (this.intervalId) this.pause();
          else this.animate();
          break;
      }
    };
    document.addEventListener('keydown', this.eventListener);
    this.animate();
  }
  showMeter() {
    this.meter += PIPE_SPEED / FPS;

    this.ctx.textAlign = 'left';
    this.ctx.font = '18px DungGeunMo';
    this.ctx.fillText(`거리: ${this.convertMeter(this.meter)}m`, 40, 40, 200);
    this.ctx.textAlign = 'center';
  }
  convertMeter(meter) {
    return `${Math.trunc(meter / 100)}.${Math.trunc(meter % 100)}`;
  }
  gameOver() {
    alert(`===== GAME OVER =====\n거리: ${this.convertMeter(this.meter)}m`);
    this.deactivate();
    app.showMenu(MENUS.TITLE);
  }
  update() {
    if ((this.t / FPS) % PIPE_INTERVAL === 0) {
      this.pipes.addUpDownPipe(CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    this.background.update(this.ctx);
    this.pipes.update(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.bird.update(this.ctx, this.pipes, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.showMeter();
  }
  animate() {
    this.intervalId = setInterval(() => {
      this.update();
      this.t += 1;
      //console.log(this.t / FPS);
    }, 1000 / FPS);
  }
  pause() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
  deactivate() {
    document.removeEventListener('keydown', this.eventListener);
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

class Bird {
  constructor(x, y) {
    this.radius = 38;
    this.vx = 0;
    this.vy = 0;
    this.x = x;
    this.y = y;
    this.g = GRAVITY;
  }
  update(ctx, pipes, canvasWidth, canvasHeight) {
    this.vy += this.g / FPS;
    this.x += this.vx / FPS;
    this.y += this.vy / FPS;
    this.collidePipe(pipes);

    if (this.y + 40 > canvasHeight) {
      this.vy = 0;
      this.y = canvasHeight - 80 + 40;
    } else if (this.y - 40 < 0) {
      this.vy = 0;
      this.y = 40;
    }
    const img = new Image();
    img.src = `./src/image/bird${BIRD_TYPE}.png`;
    ctx.drawImage(img, this.x - 40, this.y - 40, 80, 80);
    if (COLLISION_GUIDE) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'lightgreen';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.closePath();
      ctx.strokeStyle = 'black';
    }
  }
  pullUp(ctx) {
    this.vy -= BIRD_ACC;
  }
  pullDown(ctx) {
    this.vy += BIRD_ACC;
  }
  collidePipe(pipes) {
    for (const id in pipes.pipes) {
      const pipe = pipes.pipes[id];
      const minX = pipe.x - this.radius;
      const maxX = pipe.x + pipe.width + this.radius;
      const minY = pipe.y - this.radius;
      const maxY = pipe.y + pipe.height + this.radius;
      let isOver = false;
      if (
        this.x > minX &&
        this.x < maxX &&
        this.y > pipe.y &&
        this.y < pipe.y + pipe.height
      )
        isOver = true;
      if (
        this.x > pipe.x &&
        this.x < pipe.x + pipe.width &&
        this.y > minY &&
        this.y < maxY
      )
        isOver = true;
      else if (
        calculateDistance(this.x, this.y, pipe.x, pipe.y) < this.radius ||
        calculateDistance(this.x, this.y, pipe.x, pipe.y + pipe.height) <
          this.radius ||
        calculateDistance(this.x, this.y, pipe.x + pipe.width, pipe.y) <
          this.radius ||
        calculateDistance(
          this.x,
          this.y,
          pipe.x + pipe.width,
          pipe.y + pipe.height
        ) < this.radius
      )
        isOver = true;

      if (isOver) {
        game.gameOver();
      }
    }
  }
}

class Pipes {
  constructor(canvasWidth, canvasHeight) {
    this.pipes = {};
    this.id = 1;
  }
  update(ctx, canvasWidth, canvasHeight) {
    for (const id in this.pipes) {
      this.pipes[id].update(ctx, canvasWidth, canvasHeight);
    }
  }
  addUpDownPipe(canvasWidth, canvasHeight) {
    const pipeYOffset = parseInt(Math.random() * (canvasHeight - 200)) + 50;
    this.addNewPipe(canvasWidth, pipeYOffset - 500, true);
    this.addNewPipe(canvasWidth, pipeYOffset + 150, false);
  }
  addNewPipe(x, y, isUp) {
    const pipe = new Pipe(this, this.id, x, y, isUp);
    this.pipes[this.id] = pipe;

    this.id++;
  }
  deletePipe(id) {
    delete this.pipes[id];
  }
}

class Pipe {
  constructor(pipes, id, x, y, isUp) {
    this.pipes = pipes;
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 500;
    this.isUp = isUp;
  }
  update(ctx, canvasWidth, canvasHeight) {
    this.x -= PIPE_SPEED / FPS;
    if (this.x == -100) {
      this.pipes.deletePipe(this.id);
    }

    const img = new Image();
    img.src = `./src/image/pipe-${this.isUp ? 'up' : 'down'}.png`;
    ctx.drawImage(img, this.x, this.y, this.width, this.height);
  }
}

class GameBackground {
  constructor() {
    this.x = 0;
    this.width = 2000;
    this.height = CANVAS_HEIGHT;
  }
  update(ctx) {
    this.x = (this.x - PIPE_SPEED / FPS) % 2000;
    console.log(this.x);

    const img = new Image();
    img.src = './src/image/background-game.png';

    ctx.drawImage(img, this.x, 0, this.width, this.height);

    if (this.x + this.width < CANVAS_WIDTH) {
      ctx.drawImage(img, this.x + this.width, 0, this.width, this.height);
    }
  }
}

const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};

window.onload = () => {
  app = new App();
};
