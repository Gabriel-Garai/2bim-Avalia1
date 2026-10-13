# Desenho Assinado

Nome: Gabriel Martins dos Santos Garai
RA: 2026108062
URL: https://gabrielgarai-2bim-avalia1.pages.dev/

Atividade individual de Desenvolvimento Web Prático. O navegador envia somente o número e o ID token do Google. A Pages Function verifica o token com o Google e gera o desenho no servidor, usando o e-mail verificado como assinatura.

## Publicação

- Branch de produção: main
- Framework preset: None
- Build command: vazio
- Build output directory: public
- Root directory: raiz do repositório (vazio)
- Variável de ambiente: GOOGLE_CLIENT_ID, igual ao Client ID utilizado em public/index.html.

No cliente OAuth Web application do Google, cadastrar como Authorized JavaScript origin:
https://gabrielgarai-2bim-avalia1.pages.dev

O Client ID presente no HTML foi recuperado do arquivo anterior deste repositório. É necessário confirmar que pertence ao cliente OAuth correto. Não utilizar Client Secret no código.

## Contrato

POST /api/desenho, corpo JSON com numero inteiro de 1 a 100 e cabeçalho Authorization: Bearer <id_token>.
Validação na ordem método (405), corpo (400), token (401). Sucesso: 200 com Content-Type image/svg+xml.

## Evidência obrigatória pendente

Após publicar e concluir as configurações: entrar com Google, gerar com o número 62, clicar em Baixar SVG e adicionar o arquivo baixado em evidencias/exemplo.svg na branch main.
O SVG deve vir do site publicado. Não há evidência fictícia neste pacote.

## Origem

A função lib/desenho.js foi preservada integralmente do repositório frankalcantara/2bim-Avalia1, conforme o enunciado. O estilo original também foi preservado.
