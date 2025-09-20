export async function checkSession(container) {
  container.innerHTML += `
    <button id="checkSessionBtn" style="margin-top:20px;">Check Session</button>
    <pre id="sessionResult" style="white-space: pre-wrap; word-break: break-word; margin-top:10px;"></pre>
  `;

  const button = container.querySelector('#checkSessionBtn');
  const resultPre = container.querySelector('#sessionResult');

  button.addEventListener('click', async () => {
    resultPre.style.color = 'black';
    resultPre.textContent = 'Verifying session...';

    try {
      const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Session verification failed');

      resultPre.textContent = 'Session verified successfully:\n' + JSON.stringify(data, null, 2);
    } catch (err) {
      resultPre.style.color = 'red';
      resultPre.textContent = 'Session verification error:\n' + err.message;
    }
  });
}
