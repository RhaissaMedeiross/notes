(() => {
  'use strict';
  function create() {
  const REFERENCE_WIDTH = 794;
  const MIN_WIDTH = 120;
  const MIN_HEIGHT = 100;
  const MAX_HEIGHT = 4000;
  let session = null;

  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function bounds(mount) {
    const localScale = Math.max(mount.paper.clientWidth, 1) / REFERENCE_WIDTH;
    const screenScale = Math.max(mount.paper.getBoundingClientRect().width, 1) / REFERENCE_WIDTH;
    return {
      localScale,
      screenScale,
      width: REFERENCE_WIDTH,
      height: Math.max(mount.paper.clientHeight, 1) / localScale,
      minWidth: Math.min(REFERENCE_WIDTH, MIN_WIDTH / localScale),
      minHeight: MIN_HEIGHT / localScale,
      collapsedHeight: 36 / localScale
    };
  }

  function geometry(note, mount) {
    const board = bounds(mount);
    const minHeight = Math.min(board.height, board.minHeight);
    const width = clamp(number(note.width, 220), board.minWidth, board.width);
    const height = clamp(number(note.height, 190), minHeight, Math.min(Math.max(MAX_HEIGHT, minHeight), board.height));
    const visibleHeight = note.collapsed ? board.collapsedHeight : height;
    return {
      x: clamp(number(note.x, 40), 0, Math.max(0, board.width - width)),
      y: clamp(number(note.y, 180), 0, Math.max(0, board.height - visibleHeight)),
      width,
      height,
      visibleHeight,
      board
    };
  }

  function readableInk(color) {
    if (!/^#[a-f\d]{6}$/i.test(color)) return '#493520';
    const channels = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255)
      .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722 > .35 ? '#493520' : '#fff8ee';
  }

  function paint(note, card, mount) {
    const result = geometry(note, mount);
    const scale = result.board.localScale;
    card.style.left = `${result.x * scale}px`;
    card.style.top = `${result.y * scale}px`;
    card.style.width = `${result.width * scale}px`;
    card.style.height = `${result.visibleHeight * scale}px`;
    card.style.zIndex = String(clamp(number(note.z, 1), 1, 100000));
    const color = /^#[a-f\d]{6}$/i.test(note.color) ? note.color : '#fbd9e7';
    card.style.setProperty('--sticky-color', color);
    card.style.setProperty('--sticky-ink', readableInk(color));
    card.classList.toggle('collapsed', !!note.collapsed);
    card.classList.toggle('pinned', !!note.pinned);
    const pin = card.querySelector('.sticky-pin');
    pin.textContent = note.pinned ? '●' : '⌖';
    pin.setAttribute('aria-pressed', String(!!note.pinned));
    pin.setAttribute('aria-label', note.pinned ? 'Desfixar post-it para mover' : 'Fixar post-it nesta posição');
    pin.title = note.pinned ? 'Desfixar post-it para mover' : 'Fixar post-it nesta posição';
    const location = card.querySelector('.sticky-location');
    location.textContent = note.area === 'desk' ? '↙' : '↗';
    location.setAttribute('aria-label', note.area === 'desk' ? 'Colar sobre a folha' : 'Mover para o lado da folha');
    location.title = note.area === 'desk' ? 'Colar sobre a folha' : 'Mover para o lado da folha';
    const header = card.querySelector('.sticky-drag-handle');
    header.setAttribute('aria-label', note.pinned ? 'Post-it fixado. Desfixe para mover.' : 'Mover post-it. Arraste ou use as setas do teclado.');
    const textarea = card.querySelector('.sticky-text');
    textarea.hidden = !!note.collapsed;
    card.querySelector('.sticky-resize-handle').hidden = !!note.collapsed || !!note.pinned;
    card.querySelector('.sticky-resize-handle').disabled = !!note.pinned;
    const collapse = card.querySelector('.sticky-collapse');
    collapse.textContent = note.collapsed ? '+' : '−';
    collapse.setAttribute('aria-expanded', String(!note.collapsed));
    collapse.setAttribute('aria-label', note.collapsed ? 'Abrir post-it para editar' : 'Recolher post-it');
    collapse.title = note.collapsed ? 'Abrir post-it para editar' : 'Recolher post-it';
    return result;
  }

  function notify(mount, details) {
    if (session === mount) mount.onChange(details || {});
  }

  function raise(note, card, mount) {
    // Compact the local stack before it grows large; never accept arbitrary CSS.
    const ordered = [...mount.stickies].sort((a, b) => number(a.z, 1) - number(b.z, 1));
    ordered.forEach((item, index) => { item.z = index + 1; });
    note.z = ordered.length + 1;
    for (const item of mount.stickies) {
      const element = mount.cards.get(item.id);
      if (element) element.style.zIndex = String(item.z);
    }
    card.style.zIndex = String(note.z);
  }

  function finish(mount, cancel = false) {
    const gesture = mount.gesture;
    if (!gesture) return;
    mount.gesture = null;
    if (cancel) Object.assign(gesture.note, gesture.original);
    paint(gesture.note, gesture.card, mount);
    gesture.card.classList.remove('dragging', 'resizing');
    document.body.classList.remove('sticky-interacting');
    if (gesture.handle.hasPointerCapture?.(gesture.pointerId)) gesture.handle.releasePointerCapture(gesture.pointerId);
    notify(mount, { type: cancel ? 'cancel' : 'geometry', id: gesture.note.id });
  }

  function startGesture(event, kind, note, card, handle, mount) {
    if (event.button !== 0 || mount.gesture || note.pinned) return;
    if (kind === 'move' && event.target.closest('button, input, textarea, label')) return;
    event.preventDefault();
    const layout = geometry(note, mount);
    const original = { x: note.x, y: note.y, width: note.width, height: note.height };
    Object.assign(note, { x: layout.x, y: layout.y, width: layout.width, height: layout.height });
    mount.gesture = { kind, note, card, handle, pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, start: layout, original };
    handle.setPointerCapture(event.pointerId);
    card.classList.add(kind === 'move' ? 'dragging' : 'resizing');
    document.body.classList.add('sticky-interacting');
  }

  function moveGesture(event, mount) {
    const gesture = mount.gesture;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    event.preventDefault();
    const board = bounds(mount);
    const dx = (event.clientX - gesture.clientX) / board.screenScale;
    const dy = (event.clientY - gesture.clientY) / board.screenScale;
    const { note, start } = gesture;
    if (gesture.kind === 'move') {
      const height = note.collapsed ? board.collapsedHeight : start.height;
      note.x = clamp(start.x + dx, 0, Math.max(0, board.width - start.width));
      note.y = clamp(start.y + dy, 0, Math.max(0, board.height - height));
    } else {
      note.width = clamp(start.width + dx, Math.min(board.minWidth, board.width - start.x), board.width - start.x);
      note.height = clamp(start.height + dy, Math.min(board.minHeight, board.height - start.y), Math.min(Math.max(MAX_HEIGHT, board.minHeight), board.height - start.y));
    }
    paint(note, gesture.card, mount);
  }

  function keyboardGeometry(event, kind, note, card, mount) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (event.key === 'Escape' && mount.gesture) { event.preventDefault(); finish(mount, true); return; }
    if (!keys.includes(event.key) || event.target !== event.currentTarget || note.pinned) return;
    event.preventDefault(); event.stopPropagation();
    const layout = geometry(note, mount);
    const step = event.shiftKey ? 10 : 1;
    const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
    const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
    if (kind === 'move') {
      note.x = clamp(layout.x + dx, 0, Math.max(0, layout.board.width - layout.width));
      note.y = clamp(layout.y + dy, 0, Math.max(0, layout.board.height - layout.visibleHeight));
    } else {
      note.width = clamp(layout.width + dx, Math.min(layout.board.minWidth, layout.board.width - layout.x), layout.board.width - layout.x);
      note.height = clamp(layout.height + dy, Math.min(layout.board.minHeight, layout.board.height - layout.y), Math.min(Math.max(MAX_HEIGHT, layout.board.minHeight), layout.board.height - layout.y));
    }
    raise(note, card, mount); paint(note, card, mount); notify(mount, { type: 'geometry', id: note.id });
  }

  function makeButton(className, text, label) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = className; button.textContent = text;
    button.setAttribute('aria-label', label); button.title = label;
    return button;
  }

  function mountCard(note, mount) {
    const card = document.createElement('section');
    card.className = 'floating-sticky'; card.dataset.stickyId = note.id;
    card.setAttribute('role', 'group'); card.setAttribute('aria-label', 'Post-it na folha');
    const header = document.createElement('div');
    header.className = 'sticky-drag-handle'; header.tabIndex = 0;
    header.setAttribute('aria-label', 'Mover post-it. Arraste ou use as setas do teclado.');
    header.title = 'Arraste para mover. Pelo teclado, use as setas; Shift move mais rápido.';
    const label = document.createElement('span'); label.className = 'sticky-label'; label.textContent = 'POST-IT';
    const colorLabel = document.createElement('label'); colorLabel.className = 'sticky-color'; colorLabel.title = 'Cor do post-it';
    const color = document.createElement('input'); color.type = 'color'; color.value = /^#[a-f\d]{6}$/i.test(note.color) ? note.color : '#fbd9e7';
    color.setAttribute('aria-label', 'Cor do post-it');
    colorLabel.append(color);
    const location = makeButton('sticky-location', '↗', 'Mover para o lado da folha');
    const pin = makeButton('sticky-pin', '⌖', 'Fixar post-it nesta posição');
    const collapse = makeButton('sticky-collapse', '−', 'Recolher post-it');
    const remove = makeButton('sticky-delete', '×', 'Excluir post-it');
    const textarea = document.createElement('textarea');
    textarea.className = 'sticky-text'; textarea.value = String(note.text || ''); textarea.placeholder = 'Escreva seu lembrete…';
    textarea.setAttribute('aria-label', 'Texto do post-it'); textarea.spellcheck = true;
    const resize = makeButton('sticky-resize-handle', '↘', 'Redimensionar post-it. Arraste ou use as setas.');
    header.append(label, colorLabel, location, pin, collapse, remove); card.append(header, textarea, resize);
    mount.layer.append(card); mount.cards.set(note.id, card);
    card.addEventListener('pointerdown', () => { raise(note, card, mount); notify(mount, { type: 'order', id: note.id }); });
    header.addEventListener('pointerdown', event => startGesture(event, 'move', note, card, header, mount));
    resize.addEventListener('pointerdown', event => startGesture(event, 'resize', note, card, resize, mount));
    for (const handle of [header, resize]) {
      handle.addEventListener('pointermove', event => moveGesture(event, mount));
      handle.addEventListener('pointerup', event => { if (mount.gesture?.pointerId === event.pointerId) finish(mount); });
      handle.addEventListener('pointercancel', event => { if (mount.gesture?.pointerId === event.pointerId) finish(mount, true); });
      handle.addEventListener('lostpointercapture', event => { if (mount.gesture?.pointerId === event.pointerId) finish(mount); });
    }
    header.addEventListener('keydown', event => keyboardGeometry(event, 'move', note, card, mount));
    resize.addEventListener('keydown', event => keyboardGeometry(event, 'resize', note, card, mount));
    textarea.addEventListener('focus', () => { raise(note, card, mount); notify(mount, { type: 'order', id: note.id }); });
    textarea.addEventListener('input', () => { note.text = textarea.value; notify(mount, { type: 'text', id: note.id }); });
    color.addEventListener('input', () => { note.color = color.value; paint(note, card, mount); notify(mount, { type: 'color', id: note.id }); });
    location.addEventListener('click', () => { if (mount.onMove) mount.onMove(note.id, note.area === 'desk' ? 'paper' : 'desk'); });
    pin.addEventListener('click', () => { note.pinned = !note.pinned; paint(note, card, mount); notify(mount, { type: 'pin', id: note.id }); });
    collapse.addEventListener('click', () => { note.collapsed = !note.collapsed; paint(note, card, mount); notify(mount, { type: 'collapse', id: note.id }); });
    remove.addEventListener('click', () => {
      if (!confirm('Excluir este post-it? O texto da folha será mantido.')) return;
      const index = mount.stickies.indexOf(note); if (index < 0) return;
      mount.stickies.splice(index, 1); mount.cards.delete(note.id); card.remove();
      notify(mount, { type: 'remove', removed: true, id: note.id });
    });
    paint(note, card, mount);
  }

  function destroy() {
    const mount = session; if (!mount) return;
    finish(mount); mount.observer?.disconnect();
    if (mount.resizeListener) window.removeEventListener('resize', mount.resizeListener);
    mount.layer.replaceChildren(); session = null;
    document.body.classList.remove('sticky-interacting');
  }

  function render({ layer, paper, stickies, onChange, onMove }) {
    destroy();
    const mount = { layer, paper, stickies, onMove, onChange: typeof onChange === 'function' ? onChange : () => {}, cards: new Map(), gesture: null };
    session = mount;
    layer.replaceChildren();
    stickies.forEach(note => mountCard(note, mount));
    const repaint = () => {
      if (session !== mount) return;
      for (const note of mount.stickies) {
        const card = mount.cards.get(note.id); if (card) paint(note, card, mount);
      }
    };
    if ('ResizeObserver' in window) { mount.observer = new ResizeObserver(repaint); mount.observer.observe(paper); }
    else { mount.resizeListener = repaint; window.addEventListener('resize', repaint); }
  }

  function focus(id) {
    if (!session) return;
    const note = session.stickies.find(item => item.id === id); const card = session.cards.get(id);
    if (!note || !card) return;
    if (note.collapsed) { note.collapsed = false; paint(note, card, session); notify(session, { type: 'collapse', id }); }
    raise(note, card, session); card.querySelector('.sticky-text').focus();
  }

  return { render, focus, destroy };
  }
  window.StickyCanvas = { create, ...create() };
})();
