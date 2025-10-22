// src/configurator/services/autocomplete.ts
// Mapy.cz Suggest + Geocode napojené na autoComplete.js (CDN).
// Použití:
//   const dispose = await setupAutocomplete(inputEl, (sel) => { ... }, { lang: 'cs' });
//   dispose(); // při opuštění kroku / unmountu

type Suggestion = {
  label: string;
  sub?: string;
  lat?: number | null;
  lon?: number | null;
  raw?: any;
};

type SetupOptions = {
  lang?: 'cs' | 'en';
  limit?: number;
  minChars?: number;
};

declare global {
  interface Window {
    autoComplete?: any;
  }
}

const DEFAULTS = {
  lang: 'cs' as 'cs' | 'en',
  limit: 8,
  minChars: 3,
};

const MAPY_BASE = 'https://api.mapy.cz/v1';
// Klíč jen z .env! V prod prostředí nastav proměnnou VITE_MAPYCZ_KEY a rebuildni.
const API_KEY = (import.meta as any).env?.VITE_MAPYCZ_KEY as string;

if (!API_KEY) {
  // Zřetelná chyba už při inicializaci – ať je hned jasné, proč live nefunguje.
  // (Nezastaví build, jen zaloguje varování.)
  console.warn('[autocomplete] VITE_MAPYCZ_KEY není nastavený. Mapy.cz požadavky selžou (403).');
}

// ———————————————————————————————
// Lazy-load autoComplete.js + CSS (jen jednou)
// ———————————————————————————————
let libLoaded: Promise<void> | null = null;
function loadAutoCompleteLib(): Promise<void> {
  if (libLoaded) return libLoaded;
  libLoaded = new Promise<void>((resolve, reject) => {
    const cssHref =
      'https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@10.2.7/dist/css/autoComplete.02.min.css';
    if (!document.querySelector('link[data-autocomplete-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      link.setAttribute('data-autocomplete-css', '1');
      document.head.appendChild(link);
    }

    if (window.autoComplete) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@10.2.7/dist/autoComplete.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
  return libLoaded;
}

// ———————————————————————————————
// Jednoduchý cache dle dotazu/jazyka
// ———————————————————————————————
const queryCache = new Map<string, Suggestion[]>();

async function fetchSuggest(q: string, lang: 'cs' | 'en', limit: number): Promise<Suggestion[]> {
  const key = `${lang}|${limit}|${q}`;
  if (queryCache.has(key)) return queryCache.get(key)!;
  if ((q ?? '').trim().length < 3) return [];

  const url = new URL(`${MAPY_BASE}/suggest`);
  url.searchParams.set('lang', lang);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('types', 'address,street,municipality'); // správně: plural "types"
  url.searchParams.set('q', q.trim());                          // správně: "q"

  const res = await fetch(url.toString(), {
    mode: 'cors',
    headers: { 'X-Mapy-Api-Key': API_KEY },
  });

  if (res.status === 403) throw new Error('MAPY_FORBIDDEN'); // referer/klíč
  if (!res.ok) throw new Error(`MAPY_${res.status}`);

  const json = await res.json();
  const items: Suggestion[] = (json?.items ?? []).map((it: any) => ({
    label: it?.title ?? '',
    sub: it?.subtitle ?? '',
    lat: it?.position?.lat ?? it?.center?.lat ?? null,
    lon: it?.position?.lon ?? it?.center?.lon ?? null,
    raw: it,
  }));

  queryCache.set(key, items);
  return items;
}

async function geocode(label: string, lang: 'cs' | 'en') {
  const url = new URL(`${MAPY_BASE}/geocode`);
  url.searchParams.set('lang', lang);
  url.searchParams.set('limit', '1');
  url.searchParams.set('q', label);

  const res = await fetch(url.toString(), {
    mode: 'cors',
    headers: { 'X-Mapy-Api-Key': API_KEY },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const first = data?.items?.[0];
  if (!first) return null;

  return {
    lat: first?.position?.lat ?? first?.center?.lat ?? null,
    lon: first?.position?.lon ?? first?.center?.lon ?? null,
  };
}

// ———————————————————————————————
// Veřejné API: setupAutocomplete – vrací Promise<disposer>
// ———————————————————————————————
export async function setupAutocomplete(
  input: HTMLInputElement,
  onSelect?: (s: Suggestion) => void,
  opts: SetupOptions = {}
): Promise<() => void> {
  const { lang, limit, minChars } = { ...DEFAULTS, ...opts };

  // Zabal input do wrapperu kvůli stylům knihovny
  let wrapper: HTMLDivElement | null = null;
  if (!input.parentElement?.classList.contains('autoComplete_wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'autoComplete_wrapper';
    input.parentElement?.insertBefore(wrapper, input);
    wrapper.appendChild(input);
  }

  await loadAutoCompleteLib();

  const ac = new window.autoComplete({
    selector: () => input,
    placeHolder: input.placeholder || (lang === 'cs' ? 'Zadejte adresu…' : 'Enter your address…'),
    threshold: minChars,
    data: {
      // Předáváme rovnou Suggestion objekty; vyhledává se v "label"
      keys: ['label'],
      src: async (q: string) => {
        try {
          return await fetchSuggest(q, lang, limit);
        } catch (e) {
          return [];
        }
      },
      cache: false,
    },
    resultsList: {
      element: (list: HTMLElement, data: any) => {
        list.style.maxHeight = 'max-content';
        list.style.overflow = 'hidden';

        if (!data.results.length) {
          const msg = document.createElement('div');
          msg.className = 'no_result';
          msg.style.padding = '6px 8px';
          msg.textContent =
            lang === 'cs'
              ? 'Žádné výsledky. Zkuste upřesnit adresu.'
              : 'No results. Try refining the address.';
          list.prepend(msg);
        } else {
          const bar = document.createElement('div');
          bar.style.cssText =
            'padding:6px 8px;display:flex;align-items:center;justify-content:flex-end;gap:6px;font-size:12px;';
          const s = document.createElement('span');
          s.textContent = 'Powered by';
          const img = new Image();
          img.src = 'https://api.mapy.cz/img/api/logo-small.svg';
          img.style.width = '60px';
          bar.append(s, img);
          list.append(bar);
        }
      },
      noResults: true,
    },
    resultItem: {
      element: (itemEl: HTMLElement, data: any) => {
        const v: Suggestion = data.value;
        const line = document.createElement('div');
        line.style.cssText =
          'display:flex;flex-direction:column;gap:2px;overflow:hidden;text-overflow:ellipsis;';
        const main = document.createElement('div');
        main.style.fontWeight = '600';
        main.textContent = v.label;
        const sub = document.createElement('div');
        sub.style.cssText = 'font-size:12px;opacity:0.8;';
        sub.textContent = v.sub || '';
        line.append(main);
        if (v.sub) line.append(sub);
        itemEl.append(line);
      },
      highlight: true,
    },
  });

  // Výběr položky (autoComplete.js dispatchuje 'selection' na input)
  const selectionHandler = async (event: any) => {
    const sel: Suggestion | undefined = event?.detail?.selection?.value;
    if (!sel) return;

    input.value = sel.label;

    let { lat, lon } = sel;
    if (lat == null || lon == null) {
      const p = await geocode(sel.label, lang);
      if (p) {
        lat = p.lat;
        lon = p.lon;
      }
    }

    onSelect?.({ ...sel, lat: lat ?? null, lon: lon ?? null });
  };

  input.addEventListener('selection', selectionHandler);

  // ——— disposer ———
  return () => {
    try {
      input.removeEventListener('selection', selectionHandler as any);
    } catch {}
    try {
      const list = document.querySelector('.autoComplete_result_list');
      if (list && list.parentElement) list.parentElement.removeChild(list);
      if (wrapper && wrapper.parentElement) {
        wrapper.parentElement.insertBefore(input, wrapper);
        wrapper.remove();
      }
    } catch {}
  };
}
