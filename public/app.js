(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const STORAGE_KEY = 'cantinho-v1';
  const fonts = { sans: 'Arial, Helvetica, sans-serif', serif: 'Georgia, "Times New Roman", serif', mono: '"Courier New", monospace' };
  const presets = {
    girly: { accent: '#bd4f7e', bg: '#f5e5ee', panel: '#fff7fb', paper: '#fffdfd', ink: '#59394b', font: 'sans', heading: 'serif', pattern: 'ruled', radius: 12 },
    gothic: { accent: '#ce8eac', bg: '#211a26', panel: '#302535', paper: '#322934', ink: '#f4e5ef', font: 'serif', heading: 'serif', pattern: 'plain', radius: 2 },
    y2k: { accent: '#a13be0', bg: '#e7ddfa', panel: '#f5f0ff', paper: '#fffaff', ink: '#49335f', font: 'mono', heading: 'sans', pattern: 'grid', radius: 16 },
    rose: { accent: '#b86782', bg: '#f4e7eb', panel: '#fbf5f7', paper: '#fffafb', ink: '#684652', font: 'sans', heading: 'sans', pattern: 'dots', radius: 8 }
  };
  const defaults = { ...presets.girly, theme: 'girly', name: 'meu caderno', icon: '୨୧', motto: 'aprendendo no meu ritmo.', desk: 'MY LITTLE CODING WORLD', footer: 'feito de café, código & sonhos', layout: 'comfortable', scale: 100, decorations: true, punches: true, pageFormat: 'notebook', zoom: 100 };
  const initial = {
    folders: ['JavaScript', 'HTML & CSS', 'Lógica de programação'],
    notes: [
      { id: 'first-code', title: 'Meu primeiro código ♡', folder: 'JavaScript', color: '', favorite: true, sticky: false, date: '', body: '<h2>Todo começo tem um hello world.</h2><p>Este é o meu espaço para aprender, errar, tentar de novo e guardar cada pequena descoberta. Sem pressa, um conceito de cada vez. ✧</p><h3>01 / O que é uma variável?</h3><p>Uma variável guarda uma informação que podemos usar depois. Em JavaScript, usamos <b>const</b> quando não vamos reatribuir o valor e <b>let</b> quando precisamos mudá-lo.</p><pre data-language="JavaScript"><code>// minha primeira anotação de código ♡\nconst nome = "Rhaíssa";\nlet aulasEstudadas = 1;\n\nconsole.log(`Olá, ${nome}!`);</code></pre><h3>02 / Para não esquecer</h3><ul><li>Strings são textos entre aspas.</li><li>Números podem ser usados em cálculos.</li><li><b>console.log()</b> mostra uma mensagem no console.</li></ul><p><i>♡ Aprender é construir uma versão nova de mim.</i></p>' },
      { id: 'html-css', title: 'HTML + CSS: meu mapa', folder: 'HTML & CSS', color: '', favorite: false, sticky: false, date: '', body: '<h2>A estrutura e o estilo ✿</h2><p><b>HTML</b> organiza o conteúdo. <b>CSS</b> define a aparência.</p><pre data-language="HTML"><code>&lt;h1&gt;Meu cantinho na internet&lt;/h1&gt;\n&lt;p&gt;Feito por mim, com carinho.&lt;/p&gt;</code></pre><h3>Meu próximo passo</h3><p>Criar uma página simples e experimentar cores, tamanhos e espaçamentos.</p>' },
      { id: 'logic', title: 'Pensar antes de programar', folder: 'Lógica de programação', color: '', favorite: false, sticky: false, date: '', body: '<h2>Dividir para entender ✧</h2><p>Um algoritmo é uma sequência de passos para resolver um problema.</p><ol><li>O que eu recebo de entrada?</li><li>O que eu preciso fazer com essa informação?</li><li>Qual resultado eu espero?</li></ol><h3>Exercício do dia</h3><p>Escrever, em palavras, os passos de um programa que diz se um número é par.</p>' },
      { id: 'little-reminder', title: 'Lembrete de uma dev 🎀', folder: 'JavaScript', color: '#fbd9e7', favorite: false, sticky: true, date: '', body: '<h2>Você não precisa saber tudo.</h2><p>Pesquise. Faça perguntas. Teste de novo.</p><p>Cada erro é uma pista, não o fim do caminho. ♡</p>' }
    ], settings: { ...defaults }, activeId: 'first-code'
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isColor = value => typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value);
  const clamp = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
  function clean(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    const allowed = new Set(['P', 'DIV', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'UL', 'OL', 'LI', 'SPAN', 'FONT', 'H1', 'H2', 'H3', 'H4', 'PRE', 'CODE', 'BLOCKQUOTE', 'HR', 'INPUT', 'LABEL']);
    for (const element of [...template.content.querySelectorAll('*')]) {
      if (!template.content.contains(element)) continue;
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'LINK', 'META'].includes(element.tagName)) { element.remove(); continue; }
      if (!allowed.has(element.tagName)) { element.replaceWith(...element.childNodes); continue; }
      if (element.tagName === 'INPUT' && element.getAttribute('type') !== 'checkbox') { element.remove(); continue; }
      for (const attr of [...element.attributes]) {
        if (attr.name === 'style') {
          const safe = document.createElement('span');
          for (const property of ['color', 'background-color', 'font-family', 'font-size', 'text-align', 'font-weight', 'font-style', 'text-decoration']) safe.style.setProperty(property, element.style.getPropertyValue(property));
          element.setAttribute('style', safe.style.cssText);
        } else if (element.tagName === 'PRE' && attr.name === 'data-language') {
          element.setAttribute('data-language', attr.value.slice(0, 30));
        } else if (element.tagName === 'UL' && attr.name === 'data-checklist') {
          element.setAttribute('data-checklist', '');
        } else if (element.tagName === 'INPUT' && ['type', 'checked'].includes(attr.name)) {
          // Only inert, local checklist controls are preserved.
        } else if (!(element.tagName === 'FONT' && ['color', 'face', 'size'].includes(attr.name))) element.removeAttribute(attr.name);
      }
    }
    return template.innerHTML;
  }
  function settingsFrom(raw = {}) {
    if (!raw || typeof raw !== 'object') raw = {};
    const theme = Object.hasOwn(presets, raw.theme) ? raw.theme : 'girly';
    const result = { ...defaults, ...presets[theme], theme };
    for (const key of ['accent', 'bg', 'panel', 'paper', 'ink']) if (isColor(raw[key])) result[key] = raw[key];
    for (const key of ['name', 'icon', 'motto', 'desk', 'footer']) if (typeof raw[key] === 'string') result[key] = raw[key].slice(0, key === 'icon' ? 10 : 80);
    if (Object.hasOwn(fonts, raw.font)) result.font = raw.font;
    if (Object.hasOwn(fonts, raw.heading)) result.heading = raw.heading;
    if (['ruled', 'grid', 'dots', 'plain'].includes(raw.pattern)) result.pattern = raw.pattern;
    if (['comfortable', 'compact'].includes(raw.layout)) result.layout = raw.layout;
    result.scale = clamp(raw.scale ?? 100, 90, 115, 100);
    result.radius = clamp(raw.radius ?? result.radius, 0, 20, 12);
    result.zoom = clamp(raw.zoom ?? 100, 70, 130, 100);
    result.decorations = raw.decorations !== false;
    result.punches = raw.punches !== false;
    result.pageFormat = raw.pageFormat === 'a4' ? 'a4' : 'notebook';
    return result;
  }
  function normalize(raw) {
    if (!raw || !Array.isArray(raw.notes) || !Array.isArray(raw.folders) || raw.notes.length > 10000 || !raw.folders.every(f => typeof f === 'string') || !raw.notes.every(n => n && typeof n.title === 'string' && typeof n.body === 'string')) throw Error('Backup inválido');
    const used = new Set();
    const notes = raw.notes.map(n => {
      const id = typeof n.id === 'string' && n.id && !used.has(n.id) ? n.id : crypto.randomUUID();
      used.add(id);
      if (n.pages !== undefined && (!Array.isArray(n.pages) || !n.pages.every(page => page && typeof page.body === 'string'))) throw Error('Folhas inválidas');
      const pageIds = new Set();
      const pages = (n.pages?.length ? n.pages : [{ body: n.body }]).map(page => {
        const pageId = typeof page.id === 'string' && page.id && !pageIds.has(page.id) ? page.id : crypto.randomUUID();
        pageIds.add(pageId);
        return { id: pageId, body: clean(page.body) };
      });
      return { id, title: n.title, body: pages[0].body, pages, activePageId: pages.some(page => page.id === n.activePageId) ? n.activePageId : pages[0].id, folder: typeof n.folder === 'string' ? n.folder : '', color: isColor(n.color) ? n.color : '', date: /^\d{4}-\d{2}-\d{2}$/.test(n.date) ? n.date : '', favorite: !!n.favorite, sticky: !!n.sticky };
    });
    return { version: 3, folders: [...new Set([...raw.folders, ...notes.map(n => n.folder).filter(Boolean)])], notes, settings: settingsFrom(raw.settings), activeId: notes.some(n => n.id === raw.activeId) ? raw.activeId : notes[0]?.id || null };
  }
  let state, loadError = false;
  try { const raw = localStorage.getItem(STORAGE_KEY); state = normalize(raw ? JSON.parse(raw) : initial); }
  catch { state = normalize(initial); loadError = true; }
  let current = null, filter = 'all', savedRange = null, reversed = false, toastTimer;
  function toast(message) {
    $('#toast').textContent = message; $('#toast').classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4000);
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); $('#save-status').textContent = '● Salvo neste navegador'; return true; }
    catch { $('#save-status').textContent = '⚠ Não foi possível salvar'; toast('O navegador não conseguiu salvar. Baixe um backup para guardar suas páginas.'); return false; }
  }
  function textOf(html) {
    const div = document.createElement('div'); div.innerHTML = clean(html);
    div.querySelectorAll('br').forEach(el => el.replaceWith('\n'));
    div.querySelectorAll('p,div,h1,h2,h3,h4,li,pre').forEach(el => el.append('\n'));
    return div.textContent.trim();
  }
  function activeSheet() { return current?.pages.find(page => page.id === current.activePageId) || current?.pages[0]; }
  function noteText(note) { return note.pages.map(page => textOf(page.body)).join('\n\n'); }
  function renderSheets() {
    const pages = current?.pages || [];
    const index = pages.findIndex(page => page.id === current.activePageId);
    $('.sheet-navigation').hidden = !current;
    $('#sheet-add-bottom').hidden = !current;
    $('#sheet-select').innerHTML = pages.map((page, i) => `<option value="${escapeHtml(page.id)}">${i + 1}</option>`).join('');
    $('#sheet-select').value = activeSheet()?.id || '';
    $('#sheet-count').textContent = `de ${pages.length}`;
    $('#sheet-prev').disabled = index <= 0;
    $('#sheet-next').disabled = index < 0 || index >= pages.length - 1;
    $('#sheet-delete').disabled = pages.length <= 1;
    $('#content').setAttribute('aria-label', `Conteúdo da folha ${index + 1}`);
  }
  function showSheet(id) {
    if (!current || !current.pages.some(page => page.id === id)) return;
    current.activePageId = id; savedRange = null;
    $('#content').innerHTML = clean(activeSheet().body);
    renderSheets(); updateDocumentInfo();
    $('.paper-stage').scrollTop = 0;
  }
  function addSheet() {
    if (!current) return;
    saveNote();
    const page = { id: crypto.randomUUID(), body: '' };
    const index = current.pages.findIndex(item => item.id === current.activePageId);
    current.pages.splice(index + 1, 0, page);
    showSheet(page.id); persist(); renderList(); $('#content').focus();
    toast('Nova folha adicionada à mesma anotação ♡');
  }
  function filteredNotes() {
    const query = $('#search').value.toLocaleLowerCase('pt-BR');
    const notes = state.notes.filter(n => (filter === 'all' || filter === 'favorite' && n.favorite || filter === 'sticky' && n.sticky || n.folder === filter) && `${n.title} ${noteText(n)}`.toLocaleLowerCase('pt-BR').includes(query));
    return reversed ? notes.toReversed() : notes;
  }
  function renderList() {
    $('#count').textContent = state.notes.length;
    $('#folders').innerHTML = state.folders.map((folder, index) => `<button class="folder-button ${filter === folder ? 'active' : ''}" data-folder-index="${index}"><span class="folder-symbol">${['⌘', '✿', '◇', '✦'][index % 4]}</span><span>${escapeHtml(folder)}</span><span class="folder-count">${state.notes.filter(n => n.folder === folder).length}</span></button>`).join('');
    $$('[data-folder-index]').forEach(button => button.onclick = () => changeFilter(state.folders[Number(button.dataset.folderIndex)]));
    $$('[data-filter]').forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
    $('#collection-title').textContent = filter === 'all' ? 'Todas as anotações' : filter === 'favorite' ? 'Favoritas' : filter === 'sticky' ? 'Meus post-its' : filter;
    const notes = filteredNotes(); $('#subtitle').textContent = `${notes.length} ${notes.length === 1 ? 'anotação' : 'anotações'} · suas pequenas descobertas`;
    $('#notes').innerHTML = notes.map(n => `<button class="page-card ${n.id === current?.id ? 'active' : ''} ${n.sticky ? 'sticky' : ''}" data-id="${escapeHtml(n.id)}" aria-pressed="${n.id === current?.id}"><span class="page-card-row"><span class="page-card-icon">${n.sticky ? '▧ POST-IT' : '▤ ANOTAÇÃO'}</span><span class="page-card-favorite">${n.favorite ? '♥' : '· · ·'}</span></span><strong class="page-card-title">${escapeHtml(n.title || 'Anotação sem título')}</strong><span class="page-card-preview">${escapeHtml(noteText(n).slice(0, 100) || 'Uma ideia esperando para acontecer…')}</span><span class="page-card-meta">${escapeHtml(n.folder || 'Sem caderno')}<span>${n.pages.length} ${n.pages.length === 1 ? 'folha' : 'folhas'}</span></span></button>`).join('') || '<div class="empty-list"><span>♡</span><p>Nenhuma anotação por aqui.</p><small>Crie uma anotação ou tente outra busca.</small></div>';
    $$('[data-id]').forEach(button => button.onclick = () => { openNote(button.dataset.id); persist(); });
  }
  function changeFilter(next) {
    filter = next; const visible = filteredNotes();
    if (!visible.some(n => n.id === current?.id)) openNote(visible[0]?.id || null); else renderList();
  }
  function readableInk(color) {
    const rgb = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .35 ? '#493340' : '#f6eaf1';
  }
  function applyPaper() {
    const color = current?.color || state.settings.paper;
    $('#paper').style.setProperty('--page-color', color);
    $('#paper').style.setProperty('--page-ink', readableInk(color));
    $('#paper').classList.toggle('sticky', !!current?.sticky);
    $('#color').value = color;
  }
  function updateDocumentInfo() {
    $('#document-name').textContent = current?.title || (current ? 'Anotação sem título' : 'Seu caderno de estudos');
    $('#breadcrumb').textContent = current?.folder || state.settings.name || 'Meu caderno';
    $('#page-type').textContent = current?.sticky ? 'post-it' : 'página de estudo';
    $('#page-badge').textContent = current?.sticky ? '▧ LITTLE REMINDER' : '⌘ STUDY NOTES';
    $('#page-date').textContent = current?.date ? current.date.split('-').reverse().join('/') : 'sem pressa, sem pausa ♡';
    $('#favorite').textContent = current?.favorite ? '♥' : '♡'; $('#favorite').setAttribute('aria-pressed', String(!!current?.favorite));
    const text = current ? noteText(current) : '';
    const words = text.match(/\S+/g)?.length || 0;
    $('#word-count').textContent = `${words} ${words === 1 ? 'palavra' : 'palavras'}`;
    const sheetWords = current ? textOf(activeSheet().body).match(/\S+/g)?.length || 0 : 0;
    $('#word-count-top').textContent = `${sheetWords} ${sheetWords === 1 ? 'palavra nesta folha' : 'palavras nesta folha'}`;
  }
  function openNote(id) {
    current = state.notes.find(n => n.id === id) || null; savedRange = null; state.activeId = current?.id || null;
    $('#paper').hidden = !current; $('.desk-caption').hidden = !current; $('.desk-footer').hidden = !current;
    $('#empty-editor').hidden = !!current;
    $$('.document-actions button').forEach(button => button.disabled = !current);
    if (current) {
      $('#title').value = current.title; $('#content').innerHTML = clean(activeSheet().body); $('#date').value = current.date;
      $('#note-folder').innerHTML = '<option value="">Sem caderno</option>' + state.folders.map(f => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('');
      $('#note-folder').value = current.folder; applyPaper();
    }
    renderSheets(); updateDocumentInfo(); renderList();
  }
  function saveNote() {
    if (!current) return;
    activeSheet().body = clean($('#content').innerHTML);
    Object.assign(current, { title: $('#title').value, body: current.pages[0].body, folder: $('#note-folder').value, date: $('#date').value });
    const saved = persist(); updateDocumentInfo(); renderList(); return saved;
  }
  function newNote(sticky = false) {
    const note = { id: crypto.randomUUID(), title: '', body: '', folder: state.folders.includes(filter) ? filter : '', date: '', color: sticky ? '#fbd9e7' : '', sticky, favorite: false };
    const page = { id: crypto.randomUUID(), body: '' };
    note.pages = [page]; note.activePageId = page.id;
    state.notes.unshift(note); $('#search').value = '';
    if (filter === 'favorite' || filter === 'sticky' && !sticky) filter = 'all';
    openNote(note.id); persist(); $('#title').focus();
  }
  function applySettings(syncControls = true) {
    const settings = state.settings;
    document.body.dataset.theme = settings.theme; document.body.dataset.pattern = settings.pattern; document.body.dataset.layout = settings.layout;
    for (const name of ['accent', 'bg', 'panel', 'ink']) document.body.style.setProperty(`--${name}`, settings[name]);
    document.body.style.setProperty('--paper-default', settings.paper);
    document.body.style.setProperty('--ui-font', fonts[settings.font]); document.body.style.setProperty('--heading-font', fonts[settings.heading]);
    document.body.style.setProperty('--ui-scale', settings.scale / 100); document.body.style.setProperty('--radius', settings.radius + 'px'); document.body.style.setProperty('--page-zoom', settings.zoom / 100);
    document.body.classList.toggle('no-decorations', !settings.decorations);
    document.body.classList.toggle('no-punches', !settings.punches);
    document.body.dataset.pageFormat = settings.pageFormat;
    $('#page-format').value = $('#setting-page-format').value = settings.pageFormat;
    $('#page-punches').checked = $('#setting-punches').checked = settings.punches;
    $('#brand-name').textContent = settings.name || 'meu caderno'; $('#brand-icon').textContent = settings.icon;
    $('#motto').textContent = settings.motto; $('#desk-label').textContent = settings.desk; $('#paper-footer-text').textContent = settings.footer;
    document.title = `${settings.name || 'Meu caderno'} — study studio`;
    $('meta[name="theme-color"]').content = settings.accent;
    $('#paper-pattern').value = settings.pattern; $('#zoom-reset').textContent = settings.zoom + '%';
    $('#setting-scale-value').textContent = settings.scale + '%';
    $$('[data-preset]').forEach(button => { button.classList.toggle('selected', button.dataset.preset === settings.theme); button.setAttribute('aria-pressed', String(button.dataset.preset === settings.theme)); });
    if (syncControls) {
      for (const name of ['name', 'icon', 'motto', 'desk', 'footer', 'accent', 'bg', 'panel', 'paper', 'ink', 'font', 'heading', 'pattern', 'layout', 'scale', 'radius']) $('#setting-' + name).value = settings[name];
      $('#setting-decorations').checked = settings.decorations;
    }
    applyPaper(); updateDocumentInfo();
  }
  for (const name of ['name', 'icon', 'motto', 'desk', 'footer', 'accent', 'bg', 'panel', 'paper', 'ink', 'font', 'heading', 'pattern', 'layout', 'scale', 'radius']) {
    $('#setting-' + name).addEventListener('input', event => {
      state.settings = settingsFrom({ ...state.settings, [name]: event.target.value }); applySettings(false); persist();
    });
  }
  function changePageFormat(value) {
    state.settings.pageFormat = value; state.settings.punches = value !== 'a4';
    if (value === 'a4') state.settings.pattern = 'plain';
    applySettings(); persist();
  }
  $('#page-format').onchange = $('#setting-page-format').onchange = event => changePageFormat(event.target.value);
  $('#page-punches').onchange = $('#setting-punches').onchange = event => { state.settings.punches = event.target.checked; applySettings(); persist(); };
  $('#setting-decorations').onchange = event => { state.settings.decorations = event.target.checked; applySettings(false); persist(); };
  $$('[data-preset]').forEach(button => button.onclick = () => { state.settings = settingsFrom({ ...state.settings, ...presets[button.dataset.preset], theme: button.dataset.preset }); applySettings(); persist(); });
  $('#reset-settings').onclick = () => { state.settings = { ...defaults }; applySettings(); persist(); toast('Visual restaurado. Suas páginas continuam aqui ♡'); };
  $('#customize').onclick = $('#customize-sidebar').onclick = () => $('#customizer').showModal();
  $$('[data-tab]').forEach(button => button.onclick = () => {
    $$('[data-tab]').forEach(tab => { tab.classList.toggle('active', tab === button); tab.setAttribute('aria-selected', String(tab === button)); });
    $$('.ribbon-panel').forEach(panel => panel.hidden = panel.id !== 'panel-' + button.dataset.tab);
  });
  $('#new').onclick = $('#new-list').onclick = $('#new-empty').onclick = () => newNote();
  $('#sticky-new').onclick = () => newNote(true);
  $('#sheet-add').onclick = $('#sheet-add-bottom').onclick = addSheet;
  $('#sheet-select').onchange = event => { saveNote(); showSheet(event.target.value); persist(); };
  $('#sheet-prev').onclick = () => {
    if (!current) return;
    const index = current.pages.findIndex(page => page.id === current.activePageId);
    if (index > 0) { saveNote(); showSheet(current.pages[index - 1].id); persist(); }
  };
  $('#sheet-next').onclick = () => {
    if (!current) return;
    const index = current.pages.findIndex(page => page.id === current.activePageId);
    if (index < current.pages.length - 1) { saveNote(); showSheet(current.pages[index + 1].id); persist(); }
  };
  $('#sheet-delete').onclick = () => {
    if (!current || current.pages.length <= 1) return;
    const index = current.pages.findIndex(page => page.id === current.activePageId);
    if (!confirm(`Excluir a folha ${index + 1} desta anotação? As outras folhas serão mantidas.`)) return;
    current.pages.splice(index, 1); current.body = current.pages[0].body;
    showSheet(current.pages[Math.min(index, current.pages.length - 1)].id); persist(); renderList();
  };
  $('#search').oninput = renderList;
  $$('[data-filter]').forEach(button => button.onclick = () => changeFilter(button.dataset.filter));
  $('#sort').onclick = () => { reversed = !reversed; renderList(); };
  $('#folder-add').onclick = () => { $('#folder-name').value = ''; $('#folder-dialog').showModal(); $('#folder-name').focus(); };
  $('#folder-close').onclick = () => $('#folder-dialog').close();
  $('#folder-form').onsubmit = event => {
    event.preventDefault(); const folder = $('#folder-name').value.trim();
    if (!folder) return; if (['all', 'favorite', 'sticky'].includes(folder) || state.folders.includes(folder)) { toast('Escolha outro nome para este caderno.'); return; }
    state.folders.push(folder); $('#folder-dialog').close(); changeFilter(folder); persist(); toast('Caderno criado! Adicione sua primeira página.');
  };
  for (const name of ['title', 'content', 'date', 'note-folder']) $('#' + name).addEventListener('input', saveNote);
  $('#color').oninput = event => { if (current) { current.color = event.target.value; applyPaper(); persist(); } };
  $('#paper-pattern').onchange = event => { state.settings.pattern = event.target.value; applySettings(); persist(); };
  function saveExplicitly() {
    if (!current) return toast('Crie uma anotação para salvar.');
    if (saveNote()) toast('Nota salva com todas as suas folhas neste navegador ♡');
  }
  $('#save-note').onclick = saveExplicitly;
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveExplicitly(); }
  });
  $('#favorite').onclick = () => { if (current) { current.favorite = !current.favorite; persist(); updateDocumentInfo(); renderList(); } };
  $('#delete').onclick = () => {
    if (!current || !confirm('Excluir esta anotação e todas as suas folhas? Baixe um backup antes se quiser guardar uma cópia.')) return;
    state.notes = state.notes.filter(note => note.id !== current.id); openNote(filteredNotes()[0]?.id || null); persist();
  };
  $('#toggle-focus').onclick = () => {
    const focus = document.body.classList.toggle('focus-mode'); $('#toggle-focus').setAttribute('aria-pressed', String(focus));
    $('#toggle-focus').title = focus ? 'Sair do modo foco' : 'Modo foco';
  };
  document.addEventListener('selectionchange', () => {
    const selection = getSelection(); if (selection.rangeCount && $('#content').contains(selection.anchorNode) && $('#content').contains(selection.focusNode)) savedRange = selection.getRangeAt(0).cloneRange();
  });
  function restoreSelection() {
    if (!current) { toast('Crie uma página para começar a escrever.'); return false; }
    $('#content').focus(); const selection = getSelection();
    if (savedRange && $('#content').contains(savedRange.commonAncestorContainer)) { selection.removeAllRanges(); selection.addRange(savedRange); }
    else { const range = document.createRange(); range.selectNodeContents($('#content')); range.collapse(false); selection.removeAllRanges(); selection.addRange(range); }
    return true;
  }
  function command(name, value) {
    if (!restoreSelection()) return; document.execCommand(name, false, value); saveNote();
  }
  $$('[data-command]').forEach(button => { button.onmousedown = event => event.preventDefault(); button.onclick = () => command(button.dataset.command); });
  $('#font').onchange = event => command('fontName', event.target.value);
  $('#size').onchange = event => command('fontSize', event.target.value);
  $('#text-color').oninput = event => command('foreColor', event.target.value);
  $('#highlight').oninput = event => command('hiliteColor', event.target.value);
  $$('[data-symbol]').forEach(button => { button.onmousedown = event => event.preventDefault(); button.onclick = () => command('insertText', button.dataset.symbol); });
  $('#content').addEventListener('paste', event => { event.preventDefault(); command('insertText', event.clipboardData.getData('text/plain')); });
  $('#content').addEventListener('change', event => {
    if (event.target.matches('input[type="checkbox"]')) { event.target.toggleAttribute('checked', event.target.checked); saveNote(); }
  });
  $('#content').addEventListener('keydown', event => {
    if (event.key === 'Tab' && getSelection().anchorNode?.parentElement?.closest('pre')) { event.preventDefault(); command('insertText', '  '); }
  });
  $('#insert-code').onclick = () => { if (!current) return toast('Crie uma página primeiro.'); $('#code-input').value = ''; $('#code-dialog').showModal(); $('#code-input').focus(); };
  $('#code-close').onclick = () => $('#code-dialog').close();
  $('#code-form').onsubmit = event => {
    event.preventDefault(); const code = $('#code-input').value; if (!code.trim()) return;
    $('#code-dialog').close(); command('insertHTML', `<pre data-language="${escapeHtml($('#code-language').value)}"><code>${escapeHtml(code)}</code></pre><p><br></p>`);
  };
  $('#insert-checklist').onclick = () => command('insertHTML', '<ul data-checklist><li><label><input type="checkbox"> O que quero aprender</label></li><li><label><input type="checkbox"> Praticar com um exercício</label></li><li><label><input type="checkbox"> Revisar minhas anotações</label></li></ul><p><br></p>');
  $('#insert-date').onclick = () => command('insertText', new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date()));
  $('#insert-divider').onclick = () => command('insertHTML', '<hr><p><br></p>');
  function zoom(delta) { state.settings.zoom = delta === 0 ? 100 : clamp(state.settings.zoom + delta, 70, 130, 100); applySettings(); persist(); }
  $('#zoom-out').onclick = () => zoom(-10); $('#zoom-in').onclick = () => zoom(10); $('#zoom-reset').onclick = () => zoom(0);
  function preparePrint() {
    $('#print-document').innerHTML = current ? current.pages.map((page, index) => `<article class="print-sheet"><h1>${escapeHtml(current.title || 'Anotação sem título')}</h1><div class="print-meta">${escapeHtml(current.folder)}${current.date ? ' · ' + escapeHtml(current.date.split('-').reverse().join('/')) : ''} · Folha ${index + 1} de ${current.pages.length}</div><div class="print-body">${clean(page.body)}</div></article>`).join('') : '';
  }
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', () => { $('#print-document').replaceChildren(); });
  $('#print').onclick = () => { if (current) { preparePrint(); window.print(); } };
  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $('#export').onclick = () => { if (current) download((current.title || 'pagina').replace(/[^\p{L}\p{N} -]/gu, '').slice(0, 100) + '.txt', `${current.title}\n${current.date}\n\n${current.pages.map((page, index) => `--- Folha ${index + 1} de ${current.pages.length} ---\n${textOf(page.body)}`).join('\n\n')}`, 'text/plain;charset=utf-8'); };
  $('#backup').onclick = () => download('meu-caderno-backup.json', JSON.stringify(state, null, 2), 'application/json');
  $('#import').onchange = async event => {
    try {
      const file = event.target.files[0]; if (!file) return;
      if (file.size > 5_000_000) throw Error('Arquivo muito grande'); const imported = normalize(JSON.parse(await file.text()));
      if (!confirm('Substituir suas páginas e preferências pelo backup? Baixe um backup atual antes de continuar.')) return;
      state = imported; filter = 'all'; $('#search').value = ''; applySettings(); openNote(state.activeId); persist(); toast('Caderno restaurado com suas personalizações ♡');
    } catch { toast('Não foi possível importar. Escolha um backup válido de até 5 MB.'); }
    finally { event.target.value = ''; }
  };
  let installPrompt;
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; $('#install').textContent = '↗ Instalar app'; });
  $('#install').onclick = async () => {
    if (installPrompt) { await installPrompt.prompt(); installPrompt = null; }
    else alert('Para usar como aplicativo no computador, abra no Chrome ou Edge e procure “Instalar aplicativo” no menu do navegador. A opção depende do navegador e de HTTPS ou localhost. No Windows, você também pode usar o atalho do arquivo Abrir Meu Cantinho.bat.');
  };
  $('#help').onclick = () => alert('Seu caderno de programação ♡\n\n• Crie cadernos para matérias e anotações para cada aula. Use Nova folha para continuar o mesmo conteúdo. Troque de folha pelas setas ou pelo seletor.\n• O salvamento é automático. Você também pode usar Salvar nota ou Ctrl + S para guardar todas as folhas neste navegador.\n• Selecione o texto e use a aba Escrever para formatar.\n• Na aba Inserir, adicione código, checklists e símbolos.\n• Na aba Página, escolha Folha A4 ou caderno e ative ou desative os furinhos.\n• Em Personalizar, mude temas, cores, nomes, fontes e layout.\n• As notas ficam neste navegador, neste computador. Baixe backups regularmente para guardar uma cópia ou trocar de dispositivo.\n• Blocos de código servem para anotar; eles não executam programas.');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  applySettings(); openNote(state.activeId);
  if (loadError) toast('Não foi possível ler os dados salvos. Importe um backup se tiver uma cópia.');
})();
