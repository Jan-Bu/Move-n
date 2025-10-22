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

/* ----------------------- Scroll helpers ----------------------- */
function scrollConfiguratorToTop(root: HTMLElement) {
  // Sticky header (pokud nějaký používáš, dej mu klidně atribut data-sticky-header)
  const sticky =
    document.querySelector<HTMLElement>('[data-sticky-header]') ||
    document.querySelector<HTMLElement>('.site-header.is-sticky') ||
    document.querySelector<HTMLElement>('header.sticky');

  const offset = sticky ? sticky.getBoundingClientRect().height : 0;

  const y = root.getBoundingClientRect().top + window.scrollY - offset - 12;
  // Smooth – UX přívětivější; pokud chceš instantně, změň na behavior: 'auto'
  window.scrollTo({ top: y, behavior: 'smooth' });
}

function scrollAfterRender(root: HTMLElement) {
  // 1. rAF – počkej, až proběhne náš render plánovaný v safeRender()
  // 2. setTimeout(0) – nech DOM vykreslit layout, a pak posuň
  requestAnimationFrame(() => setTimeout(() => scrollConfiguratorToTop(root), 0));
}

/* ----------------------- Render orchestration ----------------------- */
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

  // --- sledování změny kroku: po každé změně kroku posuň na začátek konfigurátoru ---
  let prevStep: number | null = null;
  stateManager.subscribe(() => {
    const state = stateManager!.getState();
    const stepChanged = prevStep === null ? false : prevStep !== state.currentStep;

    safeRender();

    if (stepChanged) {
      // posuň až po renderu
      scrollAfterRender(root);
    }

    prevStep = state.currentStep;
  });

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