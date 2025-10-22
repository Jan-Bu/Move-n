// src/configurator/services/autocomplete.ts
// Mapy.cz Suggest integrováno s autoComplete.js (CDN).
// Volání: const dispose = setupAutocomplete(input, (sel) => { ... }, { lang: 'cs' });

type Suggestion = {
  label: string;
  lat?: number;
  lon?: number;
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
  lang: 'cs',
  limit: 5,
  minChars: 3,
};

const MAPYCZ_SUGGEST = 'https://api.mapy.cz/v1/suggest';

const ENV_KEY = (import.meta as any).env?.VITE_MAPYCZ_KEY as string | undefined;
const HARDCODED_DEV_KEY =
  'eyJpIjoyNTcsImMiOjE2Njc0ODU2MjN9.c_UlvdpHGTI_Jb-TNMYlDYuIkCLJaUpi911RdlwPsAY';
const API_KEY = ENV_KEY || HARDCODED_DEV_KEY;

// Lazy-load autoComplete.js (jen jednou)
let libLoaded: Promise<void> | null = null;
function loadAutoCompleteLib(): Promise<void> {
  if (libLoaded) return libLoaded;
  libLoaded = new Promise<void>((resolve, reject) => {
    const cssHref =
      'https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@10.2.7/dist/css/autoComplete.02.min.css';
    if (!document.querySelector(`link[data-autocomplete-css]`)) {
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

// Cache podle dotazu
const queryCache = new Map<string, Array<{ value: string; data: any }>>();

async function fetchSuggest(query: string, lang: string, limit: number) {
  const key = `${lang}|${limit}|${query}`;
  if (queryCache.has(key)) return queryCache.get(key)!;

  const url = new URL(MAPYCZ_SUGGEST);
  url.searchParams.set('lang', lang);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('type', 'regional.address'); // jen adresy
  url.searchParams.set('apikey', API_KEY);
  url.searchParams.set('query', query);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Suggest failed: ' + res.status);
  const json = await res.json();

  const items: Array<{ value: string; data: any }> = (json.items || []).map((item: any) => ({
    // value tu klidně necháme jen "name"; zobrazení a doplnění vyřešíme vlastní logikou
    value: item.name,
    data: item,
  }));
  queryCache.set(key, items);
  return items;
}

// Pomocná funkce pro zformátování co nejúplnější adresy
function formatAddress(item: any): string {
  // 1) ideálně z objektu address (pokud je)
  const a = item?.address;
  if (a) {
    const parts = [
      [a.street, a.houseNumber].filter(Boolean).join(' '),
      a.municipality || a.city || a.town,
      a.postcode || a.zip,
      a.country,
    ]
      .filter(Boolean)
      .join(', ')
      .replace(/\s+,/g, ','); // drobný úklid mezer

    if (parts) return parts;
  }

  // 2) label + location (co vrací suggest často)
  const label = item?.label;
  const location = item?.location;
  if (label && location) return `${label}, ${location}`;
  if (label) return label;

  // 3) fallback na name
  return item?.name || '';
}

// Geocode fallback pro souřadnice
async function geocodeLabel(label: string, lang: string) {
  const url = new URL('https://api.mapy.cz/v1/geocode');
  url.searchParams.set('query', label);
  url.searchParams.set('limit', '1');
  url.searchParams.set('lang', lang);
  url.searchParams.set('apikey', API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const json = await res.json();
  const item = json?.items?.[0];
  const lat = item?.position?.lat ?? item?.center?.lat;
  const lon = item?.position?.lon ?? item?.center?.lon;
  return lat != null && lon != null ? { lat, lon } : null;
}

// Veřejné API
export function setupAutocomplete(
  input: HTMLInputElement,
  onSelect?: (s: Suggestion) => void,
  opts: SetupOptions = {}
) {
  const { lang, limit, minChars } = { ...DEFAULTS, ...opts };

  // Oblečení inputu do wrapperu pro styly knihovny
  let wrapper: HTMLDivElement | null = null;
  if (!input.parentElement?.classList.contains('autoComplete_wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'autoComplete_wrapper';
    input.parentElement?.insertBefore(wrapper, input);
    wrapper.appendChild(input);
  }

  let acInstance: any = null;
  let selectionHandler: any = null;
  let destroyed = false;

  const init = async () => {
    await loadAutoCompleteLib();
    if (destroyed) return;

    // @ts-ignore
    acInstance = new window.autoComplete({
      selector: () => input,
      placeHolder: input.placeholder || (lang === 'cs' ? 'Zadejte adresu…' : 'Enter your address…'),
      threshold: minChars,
      searchEngine: (query: string, record: string) => `<mark>${record}</mark>`,
      data: {
        keys: ['value'],
        src: async (q: string) => {
          if (!q || q.trim().length < minChars) return [];
          try {
            const items = await fetchSuggest(q.trim(), lang, limit);
            // závod odpovědí: vrať data pro aktuální hodnotu inputu
            const now = input.value.trim();
            if (now.length >= minChars) {
              const cachedNow = await fetchSuggest(now, lang, limit);
              return cachedNow;
            }
            return items;
          } catch {
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
            msg.style.padding = '5px';
            msg.innerHTML = `<span>${
              lang === 'cs' ? 'Žádné výsledky pro' : 'Found no results for'
            } "${data.query}"</span>`;
            list.prepend(msg);
          } else {
            const logoHolder = document.createElement('div');
            const text = document.createElement('span');
            const img = new Image();

            logoHolder.style.cssText =
              'padding:5px;display:flex;align-items:center;justify-content:end;gap:5px;font-size:12px;';
            text.textContent = 'Powered by';
            img.src = 'https://api.mapy.cz/img/api/logo-small.svg';
            img.style.width = '60px';
            logoHolder.append(text, img);
            list.append(logoHolder);
          }
        },
        noResults: true,
      },
      resultItem: {
        element: (itemEl: HTMLElement, data: any) => {
          const itemData = data.value.data;
          const desc = document.createElement('div');
          desc.style.cssText = 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;';
          const line = formatAddress(itemData);
          desc.textContent = line || itemData?.label || itemData?.name || '';
          itemEl.append(desc);
        },
        highlight: true,
      },
    });

    // ---- výběr položky ----
    selectionHandler = async (event: any) => {
      const orig = event.detail?.selection?.value?.data;
      if (!orig) return;

      // 1) doplň co nejúplnější text adresy do inputu
      const fullText = formatAddress(orig);
      input.value = fullText;

      // 2) ručně "propaguj" změnu do state (createInput naslouchá na 'input')
      input.dispatchEvent(new Event('input', { bubbles: true }));
      // pro jistotu ještě i change (kdyby sis na to někde spoléhal)
      input.dispatchEvent(new Event('change', { bubbles: true }));

      // 3) dopočítej lat/lon (z orig nebo geocode fallback)
      let lat = orig?.position?.lat ?? orig?.center?.lat ?? undefined;
      let lon = orig?.position?.lon ?? orig?.center?.lon ?? undefined;
      if (lat == null || lon == null && fullText) {
        const p = await geocodeLabel(fullText, lang);
        if (p) {
          lat = p.lat;
          lon = p.lon;
        }
      }

      // 4) zavři seznam návrhů (UX)
      try {
        acInstance?.close();
      } catch {}

      onSelect?.({
        label: fullText,
        lat,
        lon,
        raw: orig,
      });
    };

    if (selectionHandler) {
      input.addEventListener('selection', selectionHandler);
    }

    // ------- disposer -------
    return () => {
      destroyed = true;
      try {
        if (selectionHandler) input.removeEventListener('selection', selectionHandler as any);
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
  };

  return init();
}
