
// The stream uses four families from the support base. Every column receives 3 items from each family.
const needStreamFamilies = [
  [
    'Preciso de acesso ao painel administrativo.',
    'Quero permissão para criar solicitações no Portal de Serviços.',
    'Liberar acesso ao sistema de inventário fictício.',
    'Preciso consultar relatórios de solicitações.',
    'Solicitar acesso ao painel de indicadores.',
    'Preciso de acesso ao CRM de demonstração.',
    'Preciso de permissão para imprimir relatórios.',
    'Preciso acessar o sistema financeiro fictício.',
    'Liberar perfil de consulta no portal.',
    'Preciso acessar um módulo do sistema de gestão fictício.',
    'Preciso de permissão para registrar documentos.',
    'Preciso de acesso ao módulo de compras do ERP fictício.',
  ],
  [
    'Meu Teams não está conectando.',
    'Outlook e Teams aparecem desconectados.',
    'Não estou recebendo alguns e-mails.',
    'Meu e-mail não está enviando.',
    'Preciso configurar assinatura automática no e-mail.',
    'Instalar e-mail corporativo no celular.',
    'Adicionar pessoas a um grupo de e-mail.',
    'Criar conta de e-mail para novo colaborador.',
    'Preciso alterar o nome exibido no Teams.',
    'Minha conta Microsoft não está conectando.',
    'Não consigo abrir o Outlook.',
    'Preciso acessar uma caixa de e-mail compartilhada.',
  ],
  [
    'Não consigo acessar arquivos compartilhados.',
    'Preciso acessar as pastas do Marketing.',
    'Alguns arquivos do OneDrive não sincronizam.',
    'O drive compartilhado está com erro de carregamento.',
    'Não consigo baixar arquivos do Teams.',
    'O OneDrive não está conectado.',
    'Não consigo salvar na pasta compartilhada.',
    'Preciso revisar o acesso a uma pasta do OneDrive.',
    'Os arquivos compartilhados não abrem.',
    'Preciso acessar uma pasta compartilhada.',
    'O OneDrive não está salvando automaticamente.',
    'A pasta compartilhada aparece sem permissão.',
  ],
  [
    'Instalar Power BI no notebook.',
    'Preciso instalar um aplicativo de videoconferência.',
    'Instalar certificado digital na minha máquina.',
    'Preciso atualizar o certificado digital.',
    'Instalar uma impressora no meu computador.',
    'Preciso atualizar o sistema administrativo.',
    'Configurar acesso ao Wi-Fi.',
    'Configurar conexão à rede corporativa.',
    'Instalar um aplicativo corporativo.',
    'Configurar internet no notebook.',
    'Preciso usar o Excel localmente.',
    'Instalar ferramenta de consultas no computador.',
  ],
];

const needStreamFamilyOrders = [
  [0, 1, 2, 3],
  [2, 0, 3, 1],
  [1, 3, 0, 2],
  [3, 2, 1, 0],
];

const needStreamProfiles = [
  { name: 'Fulano', avatarBg: 'rgba(238,180,30,.16)', avatarFg: '#7b5a10' },
  { name: 'Beltrano', avatarBg: 'rgba(69,129,60,.14)', avatarFg: '#2a5b32' },
  { name: 'Ciclano', avatarBg: 'rgba(82,125,169,.14)', avatarFg: '#3a5f85' },
  { name: 'Sicrano', avatarBg: 'rgba(159,113,186,.14)', avatarFg: '#654a7d' },
  { name: 'Fulana', avatarBg: 'rgba(98,160,153,.14)', avatarFg: '#2d605b' },
  { name: 'Beltrana', avatarBg: 'rgba(224,130,110,.15)', avatarFg: '#8a4d3a' },
  { name: 'Ciclana', avatarBg: 'rgba(142,170,88,.16)', avatarFg: '#55702f' },
  { name: 'Sicrana', avatarBg: 'rgba(108,131,183,.14)', avatarFg: '#41598d' },
];

const needStreamColumns = Array.from({ length: 4 }, (_, columnIndex) => {
  const familyOrder = needStreamFamilyOrders[columnIndex];
  const items = [];

  for (let round = 0; round < 3; round += 1) {
    const itemIndex = columnIndex * 3 + round;
    familyOrder.forEach((familyIndex) => {
      items.push(needStreamFamilies[familyIndex][itemIndex]);
    });
  }

  return items;
});

function getNeedStreamInitial(name) {
  const source = String(name || '').trim();
  return source ? source.charAt(0).toUpperCase() : '•';
}

function buildNeedStream(root = document) {
  const columns = Array.from(root.querySelectorAll('[data-need-column]'));
  if (!columns.length) return;

  columns.forEach((column, columnIndex) => {
    const items = needStreamColumns[columnIndex] || [];
    const track = document.createElement('div');
    track.className = 'need-stream-track';

    for (let copyIndex = 0; copyIndex < 2; copyIndex += 1) {
      const group = document.createElement('div');
      group.className = 'need-stream-set';
      group.setAttribute('aria-hidden', 'true');

      items.forEach((item, itemIndex) => {
        const profile = needStreamProfiles[(columnIndex * items.length + itemIndex) % needStreamProfiles.length];
        const card = document.createElement('div');
        card.className = 'need-stream-card';
        card.style.setProperty('--need-avatar-bg', profile.avatarBg);
        card.style.setProperty('--need-avatar-fg', profile.avatarFg);

        const header = document.createElement('div');
        header.className = 'need-stream-card-head';

        const avatar = document.createElement('div');
        avatar.className = 'need-stream-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = getNeedStreamInitial(profile.name);

        const meta = document.createElement('div');
        meta.className = 'need-stream-card-meta';

        const name = document.createElement('span');
        name.className = 'need-stream-name';
        name.textContent = profile.name;

        meta.appendChild(name);
        header.appendChild(avatar);
        header.appendChild(meta);

        const message = document.createElement('p');
        message.className = 'need-stream-message';
        message.textContent = item;

        card.appendChild(header);
        card.appendChild(message);
        group.appendChild(card);
      });

      track.appendChild(group);
    }

    column.replaceChildren(track);
  });
}


function scene03BoxRelativeToStage(element, stage) {
  let left = 0;
  let top = 0;
  let current = element;

  while (current && current !== stage) {
    left += current.offsetLeft || 0;
    top += current.offsetTop || 0;
    current = current.offsetParent;
  }

  if (current !== stage) {
    const elementRect = element.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    left = elementRect.left - stageRect.left;
    top = elementRect.top - stageRect.top;
  }

  const width = element.offsetWidth;
  const height = element.offsetHeight;
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    centerX: left + width / 2,
    centerY: top + height / 2,
  };
}

function scene03RoundedOrthogonalPath(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.abs(dy) < 2 || dx <= 4) {
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} H ${end.x.toFixed(2)}`;
  }

  const turnX = start.x + dx * 0.56;
  const directionY = dy > 0 ? 1 : -1;
  const radius = Math.min(28, Math.abs(dy) / 2, Math.max(4, dx * 0.18));
  const beforeTurn = turnX - radius;
  const afterTurn = turnX + radius;

  return [
    `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `H ${beforeTurn.toFixed(2)}`,
    `Q ${turnX.toFixed(2)} ${start.y.toFixed(2)} ${turnX.toFixed(2)} ${(start.y + directionY * radius).toFixed(2)}`,
    `V ${(end.y - directionY * radius).toFixed(2)}`,
    `Q ${turnX.toFixed(2)} ${end.y.toFixed(2)} ${afterTurn.toFixed(2)} ${end.y.toFixed(2)}`,
    `H ${end.x.toFixed(2)}`,
  ].join(' ');
}

function layoutScene03Connectors(scene) {
  if (!scene) return;

  const stage = scene.querySelector('.scene03-stage');
  const svg = scene.querySelector('.scene03-connectors');
  const focus = scene.querySelector('.scene03-focus');
  const requests = Array.from(scene.querySelectorAll('.scene03-request'));
  const outputs = Array.from(scene.querySelectorAll('.scene03-intent'));

  if (!stage || !svg || !focus || requests.length !== 3 || outputs.length !== 3) return;

  const stageWidth = stage.offsetWidth;
  const stageHeight = stage.offsetHeight;
  if (!stageWidth || !stageHeight) return;

  svg.setAttribute('viewBox', `0 0 ${stageWidth} ${stageHeight}`);

  const focusBox = scene03BoxRelativeToStage(focus, stage);
  const focusRadius = focusBox.width * 0.52;
  const focusCenter = { x: focusBox.centerX, y: focusBox.centerY };
  const rowOffsets = [-0.32, 0, 0.32];

  const setNode = (key, point) => {
    const node = svg.querySelector(`[data-scene03-node="${key}"]`);
    if (!node) return;
    node.setAttribute('cx', point.x.toFixed(2));
    node.setAttribute('cy', point.y.toFixed(2));
  };

  const setPath = (key, start, end) => {
    const path = svg.querySelector(`[data-scene03-path="${key}"]`);
    if (!path) return;
    path.setAttribute('d', scene03RoundedOrthogonalPath(start, end));
  };

  requests.forEach((request, index) => {
    const requestBox = scene03BoxRelativeToStage(request, stage);
    const outputBox = scene03BoxRelativeToStage(outputs[index], stage);
    const dy = focusRadius * rowOffsets[index];
    const boundaryX = Math.sqrt(Math.max(0, focusRadius ** 2 - dy ** 2));

    const inputNode = {
      x: requestBox.right + 12,
      y: requestBox.centerY,
    };
    const inputFocus = {
      x: focusCenter.x - boundaryX,
      y: focusCenter.y + dy,
    };
    const outputFocus = {
      x: focusCenter.x + boundaryX,
      y: focusCenter.y + dy,
    };
    const outputNode = {
      x: outputBox.left - 12,
      y: outputBox.centerY,
    };

    setPath(`input-${index}`, inputNode, inputFocus);
    setPath(`output-${index}`, outputFocus, outputNode);
    setNode(`input-${index}`, inputNode);
    setNode(`output-${index}`, outputNode);
  });
}

function setupScene03Connectors(root = document) {
  const scene = root.querySelector('#scene-3');
  if (!scene) return () => {};

  const stage = scene.querySelector('.scene03-stage');
  if (!stage) return () => {};

  let frame = 0;
  const schedule = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      layoutScene03Connectors(scene);
    });
  };

  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
  if (observer) {
    observer.observe(stage);
    scene.querySelectorAll('.scene03-request, .scene03-focus, .scene03-intent').forEach((element) => {
      observer.observe(element);
    });
  }

  window.addEventListener('resize', schedule, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule, { passive: true });
  }
  window.addEventListener('load', schedule, { once: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule).catch(() => {});
  }

  schedule();
  return schedule;
}

function formatSceneNumber(value) {
  return String(value).padStart(2, '0');
}

function totalSceneNumber(scenes) {
  return formatSceneNumber(scenes.length);
}

function progressFor(index, total) {
  if (!total) return 0;
  return ((index + 1) / total) * 100;
}

function targetForKey(currentIndex, total, key) {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      return Math.min(total - 1, currentIndex + 1);
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      return Math.max(0, currentIndex - 1);
    case 'Home':
      return 0;
    case 'End':
      return Math.max(0, total - 1);
    default:
      return null;
  }
}

function transitionDirection(currentIndex, targetIndex) {
  if (targetIndex > currentIndex) return 'forward';
  if (targetIndex < currentIndex) return 'backward';
  return 'none';
}

const SCENE05_LOGICAL_WIDTH = 1440;
const SCENE05_LOGICAL_HEIGHT = 900;

function computeContainedScale(
  containerWidth,
  containerHeight,
  logicalWidth = SCENE05_LOGICAL_WIDTH,
  logicalHeight = SCENE05_LOGICAL_HEIGHT,
) {
  if (![containerWidth, containerHeight, logicalWidth, logicalHeight].every((value) => Number.isFinite(value) && value > 0)) {
    return 0;
  }
  return Math.min(containerWidth / logicalWidth, containerHeight / logicalHeight);
}

function deriveScene05State({ active, mode, loaded }) {
  const shouldBeLoaded = Boolean(loaded || active);
  const visible = Boolean(active && loaded && mode === 'live');
  return {
    loaded: shouldBeLoaded,
    visible,
    interactive: visible,
    tabIndex: visible ? 0 : -1,
  };
}

function nextScene05Mode(currentMode, key, sceneActive) {
  if (!sceneActive || String(key).toLowerCase() !== 'l') return currentMode;
  return currentMode === 'live' ? 'fallback' : 'live';
}

function allowLocalScene05Runtime(hostname) {
  // The embedded demo is part of this static bundle and stays on the same origin.
  return true;
}

function setupScene05Demo(root = document) {
  const scene = root.querySelector('#scene-5');
  const demo = scene?.querySelector('[data-scene05-demo]');
  const screen = scene?.querySelector('[data-scene05-screen]');
  const liveSurface = scene?.querySelector('[data-scene05-live]');
  const viewport = scene?.querySelector('[data-scene05-viewport]');
  const frame = scene?.querySelector('[data-scene05-frame]');
  const toggle = scene?.querySelector('[data-scene05-toggle]');
  const modeLabel = scene?.querySelector('[data-scene05-mode-label]');

  if (!scene || !demo || !screen || !liveSurface || !viewport || !frame || !toggle || !modeLabel) {
    return {
      setActive() {},
      handleShortcut() { return false; },
    };
  }

  const localRuntimeAllowed = allowLocalScene05Runtime(window.location.hostname);
  const state = {
    active: false,
    mode: localRuntimeAllowed ? 'live' : 'fallback',
    requested: false,
    probeInFlight: false,
    loaded: false,
    interacted: false,
  };

  const resizeViewport = () => {
    const scale = computeContainedScale(screen.clientWidth, screen.clientHeight);
    viewport.style.setProperty('--scene05-app-scale', String(scale || 1));
  };

  const sync = () => {
    const view = deriveScene05State(state);
    const liveVisible = view.visible;

    demo.dataset.mode = state.mode;
    demo.classList.toggle('is-live-visible', liveVisible);
    demo.classList.toggle('has-demo-interaction', state.interacted);
    liveSurface.setAttribute('aria-hidden', liveVisible ? 'false' : 'true');
    frame.tabIndex = view.tabIndex;
    toggle.hidden = !localRuntimeAllowed;
    toggle.tabIndex = localRuntimeAllowed && state.active ? 0 : -1;
    toggle.setAttribute('aria-label', 'Abrir apresentação em nova aba');
    modeLabel.textContent = state.mode === 'live' ? 'LIVE' : 'FALLBACK';

    if (!state.active && (document.activeElement === frame || document.activeElement === toggle)) {
      document.activeElement.blur();
    }

    if (view.loaded && state.mode === 'live') ensureLoaded();
  };

  const ensureLoaded = async () => {
    if (!localRuntimeAllowed || state.requested || state.probeInFlight) return;
    const source = frame.dataset.src;
    if (!source) return;

    state.probeInFlight = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1600);

    try {
      const demoUrl = new URL(source, window.location.href);
      if (demoUrl.origin !== window.location.origin) throw new Error('Cross-origin demo blocked');
      const response = await fetch(demoUrl, {
        method: 'GET',
        mode: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Static demo unavailable');
      state.requested = true;
      frame.src = source;
    } catch (_error) {
      state.mode = 'fallback';
      state.loaded = false;
      sync();
    } finally {
      window.clearTimeout(timeout);
      state.probeInFlight = false;
    }
  };

  const setMode = (mode) => {
    state.mode = mode === 'fallback' ? 'fallback' : 'live';
    state.interacted = true;
    sync();
  };

  // const toggleMode = () => setMode(state.mode === 'live' ? 'fallback' : 'live');

  frame.addEventListener('load', () => {
    if (frame.src === 'about:blank') return;
    state.loaded = true;
    sync();
  });

  frame.addEventListener('error', () => {
    state.mode = 'fallback';
    state.loaded = false;
    sync();
  });

  toggle.addEventListener('click', () => {
    if (!localRuntimeAllowed) return;
    window.open(
        new URL('./demo/', window.location.href).href,
        '_blank',
        'noopener,noreferrer',
    );
  });

  window.addEventListener('blur', () => {
    window.setTimeout(() => {
      if (document.activeElement !== frame) return;
      state.interacted = true;
      sync();
    }, 0);
  });

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(resizeViewport)
    : null;
  resizeObserver?.observe(screen);
  window.addEventListener('resize', resizeViewport, { passive: true });
  resizeViewport();
  sync();

  return {
    setActive(active) {
      state.active = Boolean(active);
      sync();
      resizeViewport();
    },
    handleShortcut(key) {
      if (!localRuntimeAllowed) return false;
      const nextMode = nextScene05Mode(state.mode, key, state.active);
      if (nextMode === state.mode) return false;
      setMode(nextMode);
      return true;
    },
  };
}

function initPresentation() {
  const deck = document.getElementById('deck');
  if (!deck) return;

  const scenes = Array.from(deck.querySelectorAll('.scene'));
  const sceneCurrent = document.getElementById('sceneCurrent');
  const sceneTotal = document.getElementById('sceneTotal');
  const progressBar = document.getElementById('progressBar');

  buildNeedStream(deck);
  const updateScene03Connectors = setupScene03Connectors(deck);
  const scene05Demo = setupScene05Demo(deck);

  // Fit the existing compositions as a whole when browser zoom reduces the viewport.
  // Independent scale/translate properties preserve the scene transition transforms.
  const fitScenes = () => {
    const displayScale = Math.min(2, Math.max(1, Math.min(window.innerWidth / 1920, window.innerHeight / 1080)));
    document.documentElement.style.setProperty('--display-scale', displayScale);
    scenes.forEach((scene) => {
      const shell = scene.querySelector('.scene-shell');
      if (!shell) return;
      const style = getComputedStyle(scene);
      const top = parseFloat(style.paddingTop);
      const bottom = parseFloat(style.paddingBottom);
      const availableHeight = Math.max(1, scene.clientHeight - top - bottom);
      const availableWidth = Math.max(1, scene.clientWidth - 48);
      const scale = Math.min(displayScale, availableWidth / shell.offsetWidth, availableHeight / shell.offsetHeight);
      shell.style.setProperty('--scene-fit', scale);
      shell.style.top = `${top + availableHeight / 2}px`;
    });
  };
  const fitObserver = new ResizeObserver(fitScenes);
  scenes.forEach((scene) => fitObserver.observe(scene.querySelector('.scene-shell')));
  window.addEventListener('resize', fitScenes, { passive: true });
  document.fonts.ready.then(fitScenes);
  window.addEventListener('load', fitScenes, { once: true });
  fitScenes();

  const EXIT_MS = 170;
  const ENTER_MS = 520;
  const WHEEL_THRESHOLD = 16;

  let activeIndex = 0;
  let isTransitioning = false;
  let touchStartY = null;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setCounters = (index) => {
    if (sceneCurrent) sceneCurrent.textContent = formatSceneNumber(index + 1);
    if (sceneTotal) sceneTotal.textContent = totalSceneNumber(scenes);
    if (progressBar) progressBar.style.width = `${progressFor(index, scenes.length)}%`;
  };

  const applyActiveScene = (index) => {
    activeIndex = index;
    scenes.forEach((scene, idx) => {
      const isActive = idx === index;
      scene.classList.toggle('is-active', isActive);
      scene.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      scene.querySelectorAll('video').forEach((video) => {
        if (isActive) video.play().catch(() => {});
        else video.pause();
      });
    });
    if (document.body) document.body.dataset.activeScene = String(index + 1);
    setCounters(index);
    if (index === 2) updateScene03Connectors();
    scene05Demo.setActive(index === 4);
  };

  const finishTransition = (targetScene) => {
    targetScene.classList.remove('is-entering');
    deck.classList.remove('is-transitioning');
    isTransitioning = false;
  };

  const enterScene = (index, direction, animate = true) => {
    const targetScene = scenes[index];
    if (!targetScene) return;

    deck.dataset.direction = direction;
    deck.scrollTo({ top: targetScene.offsetTop, behavior: 'auto' });
    applyActiveScene(index);

    if (!animate || prefersReducedMotion()) {
      finishTransition(targetScene);
      return;
    }

    targetScene.classList.add('is-entering');
    window.setTimeout(() => finishTransition(targetScene), ENTER_MS);
  };

  const goTo = (index) => {
    const targetScene = scenes[index];
    if (!targetScene || index === activeIndex || isTransitioning) return;

    const currentScene = scenes[activeIndex];
    const direction = transitionDirection(activeIndex, index);
    const reduceMotion = prefersReducedMotion();

    deck.dataset.direction = direction;

    if (reduceMotion) {
      enterScene(index, direction, false);
      return;
    }

    isTransitioning = true;
    deck.classList.add('is-transitioning');
    currentScene.classList.add('is-leaving');

    window.setTimeout(() => {
      currentScene.classList.remove('is-leaving');
      enterScene(index, direction, true);
    }, EXIT_MS);
  };

  window.addEventListener('keydown', (event) => {
    if (scene05Demo.handleShortcut(event.key)) {
      event.preventDefault();
      return;
    }

    const target = targetForKey(activeIndex, scenes.length, event.key);
    if (target === null) return;
    event.preventDefault();
    goTo(target);
  });

  deck.addEventListener('wheel', (event) => {
    event.preventDefault();
    if (isTransitioning || Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;
    goTo(activeIndex + (event.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  deck.addEventListener('touchstart', (event) => {
    if (!event.touches.length) return;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  deck.addEventListener('touchend', (event) => {
    if (touchStartY === null || !event.changedTouches.length) return;
    const delta = touchStartY - event.changedTouches[0].clientY;
    touchStartY = null;
    if (isTransitioning || Math.abs(delta) < 44) return;
    goTo(activeIndex + (delta > 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', () => {
    const activeScene = scenes[activeIndex];
    if (activeScene) deck.scrollTo({ top: activeScene.offsetTop, behavior: 'auto' });
    updateScene03Connectors();
  });

  applyActiveScene(0);
  deck.scrollTo({ top: 0, behavior: 'auto' });
  deck.dataset.direction = 'forward';
  const firstScene = scenes[0];
  if (firstScene && !prefersReducedMotion()) {
    firstScene.classList.add('is-entering');
    window.setTimeout(() => firstScene.classList.remove('is-entering'), ENTER_MS);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPresentation, { once: true });
  } else {
    initPresentation();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatSceneNumber,
    totalSceneNumber,
    progressFor,
    targetForKey,
    transitionDirection,
    computeContainedScale,
    deriveScene05State,
    nextScene05Mode,
    allowLocalScene05Runtime,
  };
}
