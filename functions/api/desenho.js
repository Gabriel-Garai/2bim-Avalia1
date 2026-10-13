import { gerarDesenho, numeroValido } from '../../lib/desenho.js';

function erro(texto, status, extra = {}) {
  return new Response(texto, { status, headers: {
    'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...extra,
  }});
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return erro('Método não permitido.', 405, { Allow: 'POST' });
  let body;
  try { body = await request.json(); }
  catch { return erro('Corpo ausente ou JSON inválido.', 400); }
  if (!numeroValido(body?.numero)) return erro('Digite um número inteiro entre 1 e 100.', 400);

  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get('Authorization') || '');
  if (!match) return erro('Entre com sua conta Google para gerar o desenho.', 401);
  if (!env.GOOGLE_CLIENT_ID) return erro('Login Google não configurado no servidor.', 500);

  let dados;
  try {
    const resposta = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(match[1]));
    if (resposta.status !== 200) return erro('Token inválido ou expirado. Entre novamente.', 401);
    dados = await resposta.json();
  } catch { return erro('Não foi possível verificar o login Google. Tente novamente.', 503); }

  if (dados.aud !== env.GOOGLE_CLIENT_ID || dados.email_verified !== 'true' ||
      typeof dados.email !== 'string' || !dados.email.trim() ||
      !Number.isFinite(Number(dados.exp)) || Number(dados.exp) <= Date.now() / 1000) {
    return erro('Token inválido, expirado ou e-mail não verificado. Entre novamente.', 401);
  }
  return new Response(gerarDesenho(body.numero, dados.email), { status: 200, headers: {
    'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store',
  }});
}
