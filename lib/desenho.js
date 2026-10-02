import { gerarDesenho } from '../../lib/desenho.js';

export async function onRequest(context) {
  const { request, env } = context;

  // 1. Verificar método (405 para qualquer método diferente de POST)
  if (request.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  try {
    // 2. Verificar corpo (JSON e número válido)
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response('JSON inválido ou corpo ausente', { status: 400 });
    }

    const numero = body?.numero;
    if (typeof numero !== 'number' || !Number.isInteger(numero) || numero < 1 || numero > 100) {
      return new Response('Número ausente ou inválido (deve ser inteiro entre 1 e 100)', { status: 400 });
    }

    // 3. Verificar token de autorização
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Token ausente ou inválido', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Validar token no endpoint do Google
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!tokenInfoRes.ok) {
      return new Response('Token inválido ou expirado', { status: 401 });
    }

    const tokenData = await tokenInfoRes.json();

    // Validações do token exigidas pelo contrato
    if (tokenData.aud !== env.GOOGLE_CLIENT_ID || tokenData.email_verified !== 'true' && tokenData.email_verified !== true) {
      return new Response('Token não autorizado para este Client ID ou e-mail não verificado', { status: 401 });
    }

    const email = tokenData.email;

    // 4. Gerar o SVG usando a função protegida
    const svgContent = gerarDesenho(numero, email);

    return new Response(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml'
      }
    });

  } catch (err) {
    return new Response('Erro interno no servidor', { status: 500 });
  }
}
```[cite: 3, 4]

---

### Passo 4: Atualizar o Front-end

#### 1. `public/index.html`
Remova o campo de input de e-mail do formulário, adicione o script do Google Identity Services e insira o botão de login e o campo apenas para o número[cite: 2, 3, 4]. Exemplo de estrutura:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Desenho Assinado</title>
    <link rel="stylesheet" href="style.css">
    <!-- Script do Google Identity Services -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
    <h1>Tabuada Modular no Círculo</h1>
    
    <div id="login-container">
        <!-- O botão do Google será renderizado aqui -->
        <div id="g_id_onload"
             data-client_id="447041241795-kfsdfpra23e22gle0bs1lslo1p6o5qo4.apps.googleusercontent.com"
             data-callback="handleCredentialResponse">
        </div>
        <div class="g_id_signin" data-type="standard"></div>
    </div>

    <form id="desenho-form" style="display:none;">
        <label for="numero">Número (1 a 100):</label>
        <input type="number" id="numero" min="1" max="100" required>
        <button type="submit">Gerar Desenho</button>
    </form>

    <div id="resultado"></div>
    <div id="erro" style="color: red;"></div>

    <script src="script.js"></script>
</body>
</html>
```[cite: 3, 4]

#### 2. `public/script.js`
Atualize o script para capturar o token gerado no login, esconder o login, mostrar o formulário e fazer a requisição `fetch` para `/api/desenho`[cite: 3, 4]:

```javascript
let idToken = null;

function handleCredentialResponse(response) {
    idToken = response.credential;
    // Oculta login e mostra o formulário após logar com sucesso
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('desenho-form').style.display = 'block';
}

document.getElementById('desenho-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const numero = parseInt(document.getElementById('numero').value, 10);
    const erroDiv = document.getElementById('erro');
    const resultadoDiv = document.getElementById('resultado');
    
    erroDiv.textContent = '';
    resultadoDiv.innerHTML = '';

    try {
        const response = await fetch('/api/desenho', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ numero })
        });

        if (response.status === 400 || response.status === 401) {
            const errText = await response.text();
            erroDiv.textContent = `Erro (${response.status}): ${errText}`;
            return;
        }

        if (!response.ok) {
            throw new Error('Erro ao gerar o desenho.');
        }

        const svgText = await response.text();
        resultadoDiv.innerHTML = svgText;

    } catch (err) {
        erroDiv.textContent = 'Ocorreu um erro ao comunicar com o servidor.';
    }
});
```[cite: 3, 4]

---

### Passo 5: Gerar a Evidência Obrigatória
1. Certifique-se de preencher o `README.md` com as suas informações exatas (Nome, RA e URL do site)[cite: 3, 4].
2. Acesse o seu site publicado no Cloudflare Pages[cite: 3].
3. Faça login com a sua conta Google e insira o número correspondente aos **dois últimos dígitos do seu RA** (se forem `00`, use `100`)[cite: 3].
4. Baixe o SVG gerado pelo site[cite: 3].
5. Crie uma pasta chamada `evidencias` na raiz do seu repositório e salve o arquivo lá dentro com o nome exato de `exemplo.svg` (`evidencias/exemplo.svg`)[cite: 3, 4].
6. Faça commit e push de tudo para a branch `main` do seu repositório[cite: 3].

Diga-me se conseguiu aplicar essas alterações ou se ficou com alguma dúvida em algum trecho específico!
