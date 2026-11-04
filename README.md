# Meu cantinho

Aplicativo de notas em português, sem dependências externas. Requer Node.js 20 ou superior.

## Executar

```sh
cd /workspace/notes
npm start
```

A porta padrão é 3000; use `PORT` para alterá-la. Para execução em seu PC, copie o projeto, instale Node.js e execute `npm start` na pasta do projeto.

Inclui notas com formatação, fontes, marca-texto, símbolos, datas, pastas, favoritos, post-its coloridos, busca, grade/lista e tema escuro. Os dados são armazenados no localStorage do navegador, sem conta ou sincronização. Use “Baixar backup” para preservar os dados e “Importar backup” para restaurá-los. Limpar dados do navegador remove as notas.

## Instalar no computador

Abra o aplicativo pelo Chrome ou Edge e use “Instalar aplicativo” no menu do navegador, quando disponível. A instalação e o funcionamento offline exigem HTTPS ou localhost e suporte do navegador. Após a primeira abertura e cache completo, o service worker oferece os arquivos locais offline. Não é um instalador nativo .exe.

## Verificação

`node --check server.js`, `node --check public/app.js` e `node --check public/sw.js` validam sintaxe. Inicie com `npm start` e faça requisições HTTP para `/`, `/app.js` e `/manifest.webmanifest`. Verifique no navegador criação/edição e recarregamento, pastas, busca, backups e instalação.
