# Meu caderno · Study Studio

Um caderno de programação com interface de aplicativo: barra de ferramentas como em um editor de texto, cadernos e páginas na lateral e uma folha central para estudar.

## Abrir no Windows

1. Instale o **Node.js LTS** em https://nodejs.org/ (uma vez).
2. Baixe o ZIP do repositório e escolha **Extrair tudo**. Guarde a pasta extraída em um local permanente.
3. Dê dois cliques em **Abrir Meu Cantinho.bat**.
4. Quando o Edge ou Chrome está instalado em um dos caminhos padrão, o caderno abre em uma janela própria de aplicativo. Caso contrário, abre no navegador padrão.
5. Mantenha a janela do servidor aberta enquanto usa o app. Para criar um atalho: botão direito no `.bat` → **Mostrar mais opções → Enviar para → Área de trabalho (criar atalho)**.

O lançador do Windows foi preparado, mas precisa de validação no seu computador; não é um instalador `.exe`. No Chrome/Edge também pode aparecer a opção **Instalar aplicativo**, disponível com localhost ou HTTPS. O manifesto, os ícones e o cache offline estão incluídos.

### Atualizar uma versão anterior

Antes de atualizar, clique em **Backup** no app para guardar uma cópia de suas páginas. Feche a janela antiga do servidor, extraia a nova versão e abra seu `.bat`. Use o mesmo navegador e perfil e mantenha a porta 3000 para reencontrar suas notas. O formato antigo de backup também é aceito. Não substitua dados do navegador nem use um perfil temporário para atualizar.

## O que tem no caderno

- Páginas, cadernos por matéria, busca, favoritos e post-its.
- Fontes, tamanhos, negrito, itálico, sublinhado, tachado, cores, marca-texto, alinhamento e listas.
- Blocos de código com linguagem, checklists, datas, divisores e símbolos. Código é material de anotação: não é executado.
- Temas **Pink diary**, **Midnight (gótico)**, **Cyber angel (Y2K)** e **Rose milk**.
- Personalização de nome, símbolo, frases, cores do site, fonte da interface e títulos, tipo de papel, tamanho da interface, cantos e layout.
- Papel pautado, quadriculado, pontilhado ou liso, zoom e modo foco.
- Exportação de texto, impressão/PDF e backup/restauração com as personalizações.

As páginas e preferências são salvas no `localStorage` do navegador, sem conta ou sincronização entre dispositivos. Limpar dados do navegador remove as notas. Baixe backups regularmente. Atualizar o tema não exclui suas páginas. Notas da primeira versão são lidas pela mesma chave `cantinho-v1`.

## Desenvolvimento

Requer Node.js >=20. Não usa dependências externas nem exige `npm install`.

```sh
npm start
```

O servidor atende na porta 3000; use `PORT` para alterar. `node desktop.cjs` também inicia o servidor quando necessário e abre o navegador (janela de app no Windows quando disponível). Cada tarefa na nuvem já é isolada: use o checkout existente, sem criar worktrees, salvo pedido explícito.

Para verificar sintaxe:

```sh
node --check server.js
node --check desktop.cjs
node --check public/app.js
node --check public/sw.js
```

Validação realizada em Chromium: criação/edição de páginas e cadernos, persistência após recarregar, código seguro, negrito, marca-texto, checklists, favoritos, busca, quatro temas, personalização, backup/restauração, migração de notas antigas e layout desktop/mobile. O lançador específico do Windows e a instalação no PC exigem validação no sistema de destino.
