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
      <div class="spinner-dots">
        <div></div><div></div><div></div>
      </div>
      <style>
        .spinner-dots {
          display: flex; gap: 15px;
        }
        .spinner-dots div {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: linear-gradient(90deg,#38bdfa 40%,#0e6abc 80%);
          opacity: 0.75;
          animation: pulse 0.9s infinite cubic-bezier(.6,.1,.2,1);
        }
        .spinner-dots div:nth-child(2) {
          animation-delay: .3s;
          background: linear-gradient(90deg,#78e2ff 40%,#6498ff 80%);
        }
        .spinner-dots div:nth-child(3) {
          animation-delay: .6s;
          background: linear-gradient(90deg, #43e285 40%, #b7ffc7 80%);
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.65;}
          50% { transform: scale(1.35); opacity: 1;}
          100% { transform: scale(1); opacity: 0.65;}
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
