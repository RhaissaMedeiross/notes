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

Não é necessário reinstalar o Node.js nem instalar novamente o atalho. O aplicativo local ainda não faz atualizações automáticas: é preciso baixar a versão nova. Antes de atualizar, clique em **Backup** no app para guardar uma cópia de suas anotações. Feche o app e a janela antiga do servidor, extraia a nova versão e copie os arquivos para a mesma pasta do app, substituindo os anteriores; depois abra seu `.bat`. Manter a mesma pasta preserva o caminho do atalho. Use o mesmo navegador e perfil e mantenha a porta 3000 para reencontrar suas notas. O formato antigo de backup também é aceito. Não substitua dados do navegador nem use um perfil temporário para atualizar.

## Mais espaço para escrever

Clique na **setinha ao lado das abas Escrever / Inserir / Página** para recolher a barra de fontes e formatação. A folha sobe e ganha o espaço da barra. Use a mesma setinha para mostrar as ferramentas novamente; clicar em uma aba também reabre a barra. O atalho **Ctrl + F1** alterna entre os dois modos.

A preferência é lembrada ao reabrir o app e incluída no backup, sem alterar suas anotações.

## Folhas dentro da mesma anotação

**Nova anotação**, na lateral, cria um conteúdo independente. Para continuar o mesmo assunto em outra folha, use **＋ Nova folha**, acima do editor, ou **＋ Adicionar folha neste conteúdo**, no final da folha.

Use as setas e o seletor **Folha 1 de 3** para navegar. Cada folha tem seu texto e formatação; título, caderno, cor e data são da anotação inteira. O app lembra a folha aberta. **Excluir folha** remove só a folha atual, com confirmação, e mantém pelo menos uma folha; excluir a anotação remove todas as suas folhas.

O salvamento é automático. **Salvar nota** e **Ctrl + S** também guardam a anotação com todas as folhas no navegador. Para uma cópia fora do app, use **Backup** (todas as anotações e personalizações), **Página → Exportar texto** (todas as folhas da anotação) ou **Imprimir / PDF** (todas as folhas). A busca também pesquisa nas folhas adicionais.

As anotações antigas são convertidas para uma folha sem apagar seu texto. Backups antigos continuam aceitos; para abrir backups com múltiplas folhas, use a versão atual do app.

## O que tem no caderno

- Anotações com múltiplas folhas, cadernos por matéria, busca, favoritos e post-its.
- Fontes, tamanhos, negrito, itálico, sublinhado, tachado, cores, marca-texto, alinhamento e listas.
- Blocos de código com linguagem, checklists, datas, divisores e símbolos. Código é material de anotação: não é executado.
- Temas **Pink diary**, **Midnight (gótico)**, **Cyber angel (Y2K)** e **Rose milk**.
- Personalização de nome, símbolo, frases, cores do site, fonte da interface e títulos, tipo de papel, tamanho da interface, cantos e layout.
- Papel pautado, quadriculado, pontilhado ou liso, zoom e modo foco.
- Formato **Caderno** ou **Folha A4** na aba Página e em Personalizar; opção independente de mostrar ou esconder os furinhos e a margem. A4 começa sem furos e sem linhas; você pode personalizar depois. A folha cresce para acomodar conteúdo longo, sem ocultar texto.
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

Validação de múltiplas folhas em Chromium: conteúdo independente em três folhas, navegação, folha ativa após recarregar, salvamento explícito e Ctrl + S, busca em todas as folhas, exportação, backup/importação, impressão de todas as folhas, exclusão com proteção da última folha, migração dos formatos antigos e layout mobile. Também foi validado anteriormente: criação/edição de páginas e cadernos, persistência após recarregar, código seguro, negrito, marca-texto, checklists, favoritos, busca, quatro temas, personalização, backup/restauração, migração de notas antigas e layout desktop/mobile. O lançador específico do Windows e a instalação no PC exigem validação no sistema de destino.
