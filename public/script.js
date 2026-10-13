const formulario = document.getElementById('formulario');
const campoNumero = document.getElementById('numero');
const area = document.getElementById('desenho');
const mensagem = document.getElementById('mensagem');
const botaoBaixar = document.getElementById('baixar');
const botaoGerar = document.getElementById('gerar');
let idToken = '';
let svgAtual = '';

window.handleCredentialResponse = function (resposta) {
  idToken = resposta.credential || '';
  document.getElementById('login-status').textContent = idToken
    ? 'Login recebido. O servidor verificará sua conta ao gerar o desenho.'
    : 'Não foi possível entrar. Tente novamente.';
  mensagem.textContent = '';
  svgAtual = '';
  area.innerHTML = '';
  botaoBaixar.hidden = true;
};

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensagem.textContent = '';
  svgAtual = '';
  area.innerHTML = '';
  botaoBaixar.hidden = true;
  botaoGerar.disabled = true;
  try {
    const resposta = await fetch('/api/desenho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: 'Bearer ' + idToken } : {}) },
      body: JSON.stringify({ numero: Number(campoNumero.value) }),
    });
    const texto = await resposta.text();
    if (resposta.status === 400 || resposta.status === 401) {
      mensagem.textContent = 'Erro ' + resposta.status + ': ' + texto;
      if (resposta.status === 401) {
        idToken = '';
        document.getElementById('login-status').textContent = 'Entre novamente com sua conta Google.';
      }
      return;
    }
    if (!resposta.ok || !resposta.headers.get('Content-Type')?.includes('image/svg+xml')) {
      mensagem.textContent = resposta.ok ? 'O servidor não retornou um SVG válido.' : 'Erro ' + resposta.status + ': ' + texto;
      return;
    }
    svgAtual = texto;
    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
  } catch { mensagem.textContent = 'Não foi possível comunicar com o servidor. Tente novamente.'; }
  finally { botaoGerar.disabled = false; }
});

botaoBaixar.addEventListener('click', () => {
  if (!svgAtual) return;
  const url = URL.createObjectURL(new Blob([svgAtual], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'exemplo.svg';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
