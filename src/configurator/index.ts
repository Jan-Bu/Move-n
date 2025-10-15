import { StateManager } from './state';
import { render } from './ui/render-enhanced';
import { Lang } from './types';

function init(): void {
  const root = document.getElementById('moving-configurator-root');
  if (!root) {
    return;
  }

  if (root.hasAttribute('data-initialized')) {
    return;
  }

  console.log('🚀 Configurator: Initializing...');
  root.setAttribute('data-initialized', 'true');

  const lang = (root.getAttribute('data-lang') || 'cs') as Lang;
  const pageSlug = root.getAttribute('data-slug') || 'unknown';
  console.log('📍 Configurator: Lang=' + lang + ', Slug=' + pageSlug);

  const stateManager = new StateManager(lang, pageSlug);

  stateManager.subscribe((state) => {
    render(root, stateManager);
  });

  render(root, stateManager);
  console.log('✅ Configurator: Initialized successfully');
}

function checkAndInit(): void {
  const root = document.getElementById('moving-configurator-root');
  if (root && !root.hasAttribute('data-initialized')) {
    init();
  }
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      checkAndInit();
    }
  }
});

function startObserver(): void {
  checkAndInit();

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserver);
} else {
  startObserver();
}
