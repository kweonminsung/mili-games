const LOT_TYPES = {
  NUMBER: 0,
  NAME: 1,
  EVERY_NAME: 2,
};

const LOCALSTORAGE_KEY = 'prev-lot-spec';
let lotType = LOT_TYPES.NAME;
let allowDuplicates = false;
let useAnimation = true;

const allowDuplicatesBtn = document.getElementById('allow-dupl-ipt');
const useAnimationBtn = document.getElementById('use-ani-ipt');
const lotSpecSettingWrapperDiv = document.getElementById(
  'lot-spec-setting-wrapper'
);
const lotSpecNameListDiv = document.getElementById('lot-spec-name-list');
const lotSpecNumStartIpt = document.getElementById('lot-spec-num-start');
const lotSpecNumEndIpt = document.getElementById('lot-spec-num-end');
const lotSpecFileIpt = document.getElementById('lot-spec-file-ipt');
const lotSpecEveryNameTarea = document.getElementById(
  'lot-spec-every-name-textarea'
);
const pickerBtn = document.getElementById('picker-btn');
const lotDisplayMissileImg = document.getElementById('lot-display-missile-img');
const lotDisplayExplosionImg = document.getElementById(
  'lot-display-explosion-img'
);
const lotHistoryListDiv = document.getElementById('lot-history-list');

const EXAMPLE_LOT_SPEC = {
  // type: LOT_TYPES.NUMBER,
  // data: {
  //     start: 1,
  //     end: 20
  // }.
  type: LOT_TYPES.NAME,
  // type: LOT_TYPES.EVERY_NAME,
  data: ['권민성', '김성민', '오창연', '송동욱'],
  allowDuplicates: false,
  useAnimation: true,
};

const savePrevLot = spec => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(spec));
  } catch (err) {
    console.error(err);
    alert('추첨 기록에 실패하였습니다.');
  }
};
const loadPrevLot = () => {
  const prevLot = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY));
  if (prevLot === null) {
    alert('마지막으로 사용한 추첨이 없습니다.');
    return;
  }
  alert('마지막으로 사용한 추첨을 불러왔습니다.');
  applyLotSpec(prevLot);
};
const initializeSettings = () => {
  setAllowDuplicates(allowDuplicates);
  setUseAnimation(useAnimation);

  setLotType(lotType);
  addLotName();
};
const setLotType = type => {
  lotSpecSettingWrapperDiv.children[lotType].classList.remove(
    'selected-lot-type'
  );
  lotSpecSettingWrapperDiv.children[type].classList.add('selected-lot-type');
  lotType = type;
};
const setAllowDuplicates = _allowDuplicates => {
  allowDuplicates = _allowDuplicates;
  allowDuplicatesBtn.checked = _allowDuplicates;
};
const setUseAnimation = _useAnimation => {
  useAnimation = _useAnimation;
  useAnimationBtn.checked = _useAnimation;
};
const addLotName = (value = '') => {
  const newName = document.createElement('div');
  newName.innerHTML = `
   <div class="lot-spec-name-container">
    <input type="text" placeholder="이름 입력" value="${value}" />
    <button onclick="deleteLotName(this)">X</button>
   </div>
  `;
  lotSpecNameListDiv.appendChild(newName);
};
const deleteLotName = element => {
  element.parentElement.parentElement.remove();
};

const deleteAllLotNames = () => {
  Array.from(lotSpecNameListDiv.childNodes).forEach(c => c.remove());
};
const applyLotSpec = spec => {
  setLotType(spec.type);
  setAllowDuplicates(spec.allowDuplicates);
  setUseAnimation(spec.useAnimation);

  switch (spec.type) {
    case LOT_TYPES.NUMBER:
      lotSpecNumStartIpt.value = spec.data.start;
      lotSpecNumEndIpt.value = spec.data.end;
      break;
    case LOT_TYPES.NAME:
      deleteAllLotNames();
      for (let i = 0; i < spec.data.length; i++) {
        addLotName(spec.data[i]);
      }
      break;
    case LOT_TYPES.EVERY_NAME:
      lotSpecEveryNameTarea.value = spec.data.join(',');
      break;
    default:
      alert('Internal Error');
  }
};
const allowDuplicatesBtnHandler = () => {
  setAllowDuplicates(!allowDuplicates);
};
const useAnimationBtnHandler = () => {
  setUseAnimation(!useAnimation);
};
const startLotBtnHandler = () => {
  let lotSpec = null;

  switch (lotType) {
    case LOT_TYPES.NUMBER:
      if (lotSpecNumStartIpt.value === '' || lotSpecNumEndIpt.value === '') {
        alert('첫 숫자 또는 마지막 숫자에 빈 값이 있습니다.');
        return;
      }

      const lotSpecNumStart = parseInt(lotSpecNumStartIpt.value);
      const lotSpecNumEnd = parseInt(lotSpecNumEndIpt.value);

      if (isNaN(lotSpecNumStart) || isNaN(lotSpecNumEnd)) {
        alert('입력한 값에 숫자가 아닌 값이 있습니다.');
        return;
      }

      if (lotSpecNumEnd < lotSpecNumStart) {
        alert('첫 숫자가 마지막 숫자보다 작거나 같아야 합니다.');
        return;
      }
      lotSpec = {
        type: LOT_TYPES.NUMBER,
        allowDuplicates,
        useAnimation,
        data: {
          start: lotSpecNumStart,
          end: lotSpecNumEnd,
        },
      };
      break;
    case LOT_TYPES.NAME:
      const lotSpecNames = Array.from(lotSpecNameListDiv.children)
        .map(c => c.children[0].children[0].value)
        .filter(v => v !== '');

      if (lotSpecNames.length === 0) {
        alert('최소 하나 이상의 이름 입력이 필요합니다.');
        return;
      }

      lotSpec = {
        type: LOT_TYPES.NAME,
        allowDuplicates,
        useAnimation,
        data: lotSpecNames,
      };
      break;

    case LOT_TYPES.EVERY_NAME:
      const everyNameList = lotSpecEveryNameTarea.value
        .split(',')
        .map(name => name.trim())
        .filter(v => v !== '');

      if (everyNameList.length === 0) {
        alert('최소 하나 이상의 이름 입력이 필요합니다.');
        return;
      }

      lotSpec = {
        type: LOT_TYPES.EVERY_NAME,
        allowDuplicates,
        useAnimation,
        data: everyNameList,
      };
      break;

    default:
      alert('Internal Error');
      return;
  }

  closeModal();
  savePrevLot(lotSpec);
  initializePicker(lotSpec);
};

// ------------------------------------------------------
let randomPicker = null;
let currentLotType = null;
let currentLotData = null;
let currentAllowDuplicates = null;
let currentUseAnimation = null;
let currentLotHistory = [];
let disablePickFlag = false;
let explosionDelayId = null;
const NOTHING_TO_PICK_FLAG = -1;

const initializePicker = spec => {
  currentLotType = spec.type;
  currentAllowDuplicates = spec.allowDuplicates;
  currentUseAnimation = spec.useAnimation;
  currentLotData = spec.data;
  disablePickFlag = false;
  resetPicker();
};
const resetPicker = () => {
  switch (currentLotType) {
    case LOT_TYPES.NUMBER: {
      randomPicker = createRandomPicker(
        createIndexArray(currentLotData.end - currentLotData.start + 1),
        currentAllowDuplicates
      );
      break;
    }
    case LOT_TYPES.NAME:
    case LOT_TYPES.EVERY_NAME: {
      randomPicker = createRandomPicker(
        createIndexArray(currentLotData.length),
        currentAllowDuplicates
      );
      break;
    }
    default:
      alert('Internal Error');
  }
};
const createIndexArray = to => {
  const arr = [];
  for (let i = 0; i < to; i++) arr.push(i);
  return arr;
};
const createRandomPicker = (array, _allowDuplicates) => {
  const tempArray = [...array];
  if (_allowDuplicates) {
    return function pickOne() {
      const randomIndex = Math.floor(Math.random() * tempArray.length);
      return tempArray[randomIndex];
    };
  } else {
    return function pickOne() {
      if (tempArray.length === 1) {
        pickerBtn.disabled = true;
        disablePickFlag = true;
      }

      if (tempArray.length === 0) return NOTHING_TO_PICK_FLAG;

      const randomIndex = Math.floor(Math.random() * tempArray.length);
      return tempArray.splice(randomIndex, 1)[0];
    };
  }
};
const pickerBtnHandler = () => {
  stopAllAnimations();

  let result = null;
  const pickerResult = randomPicker();
  if (pickerResult === NOTHING_TO_PICK_FLAG) {
    alert('더 이상 뽑을 수 없습니다.');
    return;
  }
  currentLotHistory.push(pickerResult);

  switch (currentLotType) {
    case LOT_TYPES.NUMBER: {
      result = currentLotData.start + pickerResult;
      break;
    }
    case LOT_TYPES.NAME:
    case LOT_TYPES.EVERY_NAME: {
      result = currentLotData[pickerResult];
      break;
    }
    default:
      alert('Internal Error');
      return;
  }
  if (!useAnimation) {
    alert(`결과는 ${result} 입니다!`);
  } else {
    animateMissile(result);
  }
  addNewHistory(result);
};
const resetBtnHandler = () => {
  alert('실행 결과가 리셋되었습니다.');

  currentLotHistory = [];
  resetHistory();

  pickerBtn.disabled = false;
  disablePickFlag = false;
  stopAllAnimations();

  resetPicker();
};
const stopAllAnimations = () => {
  lotDisplayMissileImg.classList.remove('animate-launchMissile');
  clearTimeout(explosionDelayId);
  lotDisplayExplosionImg.classList.remove('animate-explodeMissile');
  lotDisplayExplosionImg.removeEventListener(
    'click',
    explosionClickEventHandler
  );
};
const explosionClickEventHandler = () => {
  lotDisplayExplosionImg.classList.remove('animate-explodeMissile');
  lotDisplayExplosionImg.removeEventListener(
    'click',
    explosionClickEventHandler
  );
};
const animateMissile = result => {
  lotDisplayMissileImg.classList.add('animate-launchMissile');
  pickerBtn.disabled = true;

  explosionDelayId = setTimeout(() => {
    lotDisplayMissileImg.classList.remove('animate-launchMissile');
    lotDisplayExplosionImg.classList.add('animate-explodeMissile');
    lotDisplayExplosionImg.innerText = result;
    if (!disablePickFlag) pickerBtn.disabled = false;
    lotDisplayExplosionImg.addEventListener(
      'click',
      explosionClickEventHandler
    );
  }, 1000);
};
const addNewHistory = result => {
  const newHistory = document.createElement('p');
  newHistory.innerText = result;
  lotHistoryListDiv.appendChild(newHistory);
};
const resetHistory = () => {
  Array.from(lotHistoryListDiv.childNodes).forEach(c => c.remove());
};

window.onload = () => {
  initializeSettings();
  openModal();
  lotSpecFileIpt.addEventListener('change', event => {
    const file = event.target.files[0];
    if (confirm('기존의 작성한 명단은 덮어씌워 집니다. 진행하겠습니까?')) {
      applyLotSpec({
        type: LOT_TYPES.NAME,
        data: file.name.split(',').map(f => f.trim()),
        allowDuplicates,
        useAnimation,
      });
    }
  });
};
