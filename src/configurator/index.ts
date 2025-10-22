// src/configurator/index.ts
import { StateManager } from './state';
import { render } from './ui/render-enhanced';
import type { Lang } from './types';
import './configurator.css';

const ROOT_ID = 'moving-configurator-root';
const INIT_ATTR = 'data-initialized';
const OBS_ATTRS = ['data-lang', 'data-slug'] as const;

let currentRoot: HTMLElement | null = null;
let stateManager: StateManager | null = null;
let rafId: number | null = null;

function safeRender() {
  if (!currentRoot || !stateManager) return;
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    render(currentRoot!, stateManager!);
  });
}

function mount(root: HTMLElement) {
  // už běžíme na stejném rootu
  if (currentRoot === root && stateManager) return;

  unmount();

  const lang = (root.getAttribute('data-lang') || 'cs') as Lang;
  const pageSlug = root.getAttribute('data-slug') || 'unknown';

  root.setAttribute(INIT_ATTR, 'true');
  stateManager = new StateManager(lang, pageSlug);
  stateManager.subscribe(() => safeRender());

  currentRoot = root;
  safeRender();

  // eslint-disable-next-line no-console
  console.log(`✅ Configurator: mounted (lang=${lang}, slug=${pageSlug})`);
}

function unmount() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (currentRoot?.hasAttribute(INIT_ATTR)) {
    currentRoot.removeAttribute(INIT_ATTR);
  }
  if (currentRoot) currentRoot.innerHTML = '';
  currentRoot = null;
  stateManager = null;
}

function initIfReady() {
  const root = document.getElementById(ROOT_ID) as HTMLElement | null;
  if (root && !root.hasAttribute(INIT_ATTR)) mount(root);
}

const observer = new MutationObserver((mutations) => {
  let check = false;
  let reinit = false;

  for (const m of mutations) {
    if (m.type === 'childList') {
      check = true;
      // root byl odstraněn?
      if (currentRoot && !document.body.contains(currentRoot)) {
        unmount();
      }
    }
    if (m.type === 'attributes') {
      if (
        currentRoot &&
        m.target === currentRoot &&
        m.attributeName &&
        OBS_ATTRS.includes(m.attributeName as (typeof OBS_ATTRS)[number])
      ) {
        reinit = true;
      }
    }
  }

  if (check) initIfReady();
  if (reinit && currentRoot) {
    const root = currentRoot;
    unmount();
    mount(root);
  }
});

function startObserver() {
  initIfReady();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: OBS_ATTRS as unknown as string[],
    attributeOldValue: true,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserver, { once: true });
} else {
  startObserver();
}

// HMR podpora
if (import.meta && (import.meta as any).hot) {
  (import.meta as any).hot.dispose(() => {
    observer.disconnect();
    unmount();
  });
}

// volitelně: ruční bootstrap
export function bootstrapConfigurator() {
  initIfReady();
}
