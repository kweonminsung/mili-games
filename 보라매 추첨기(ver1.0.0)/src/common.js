/* 
    CommonJS 생산성 향상을 위한 공통 모듈

    @author (검열됨)대대
    @version 0.1.0

    == 사용 방법 ==
    <link rel="stylesheet" href="./src/common.css"></link>
    <script src="./src/common.js"></script>

    == Modal 사용방법(팝업이 하나일 경우) ==
    <div class="modal-wrapper">
        <div class="modal-content">
            -- 내용 --
        </div>
    </div>
    
    == Modal 사용방법(팝업이 여러 개일 경우) ==
    <div class="modal-wrapper">
        <div class="modal-content">
            <div class="modal-page">
                -- 내용 --
            </div>
            
            <div class="modal-page">
                -- 내용--
            </div>

            ...
        </div>
    </div>
*/

const modalWrapper = document.querySelector('.modal-wrapper');
const modalContent = document.querySelector('.modal-content');
const modalPages = document.querySelectorAll('.modal-page');
let currentPage = 1;

const openModal = () => {
  modalWrapper.style.display = 'flex';
  modalWrapper.style.animation = 'modalOpen 0.15s linear';
};

const closeModal = () => {
  modalWrapper.style.animation = 'modalClose 0.15s linear';
  setTimeout(() => {
    modalWrapper.style.display = 'none';
  }, 100);
};

const setModalPage = page => {
  if (modalPages.length === 0 || modalPages.length < page) return;

  modalContent.style.animation = 'modalClose 0.15s linear';
  setTimeout(() => {
    modalPages.forEach(modal => {
      modal.style.display = 'none';
    });

    modalPages[page - 1].style.display = 'block';
    modalContent.style.animation = 'modalOpen 0.15s linear';
  }, 100);
};

if (modalPages.length !== 0) {
  setModalPage(1);
}
