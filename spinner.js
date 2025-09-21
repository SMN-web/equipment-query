export function showSpinner(container) {
  let el = container.querySelector('.loadingOverlay');
  if (!el) {
    el = document.createElement('div');
    el.className = 'loadingOverlay';
    el.style = `
      position:fixed;top:0;left:0;width:100vw;height:100vh;
      background:rgba(245,248,250,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;
      transition:opacity 0.2s;
    `;
    el.innerHTML = `
      <div class="spinner-bounce">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
      <style>
        .spinner-bounce {
          width: 54px; height: 54px; position: relative;
        }
        .double-bounce1, .double-bounce2 {
          width: 100%; height: 100%; border-radius: 50%;
          background: linear-gradient(90deg,#38bdfa 10%,#0e6abc 90%);
          opacity: 0.6; position: absolute; top: 0; left: 0;
          animation: bounce 2.0s infinite ease-in-out;
        }
        .double-bounce2 {
          animation-delay: -1.0s;
          background: linear-gradient(90deg,#78e2ff 10%,#4e7aff 90%);
        }
        @keyframes bounce {
          0%, 100% { transform: scale(0.0); }
          50% { transform: scale(1.0); }
        }
      </style>
    `;
    container.appendChild(el);
  }
  el.style.display = 'flex';
}

export function hideSpinner(container) {
  let el = container.querySelector('.loadingOverlay');
  if (el) el.style.display = 'none';
}

export function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
