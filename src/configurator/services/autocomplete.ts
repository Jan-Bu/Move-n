// src/configurator/services/autocomplete.ts
// Mapy.cz Suggest integrováno s autoComplete.js (CDN).
// Volání: const dispose = setupAutocomplete(input, (sel) => { ... }, { lang: 'cs' });

type Suggestion = {
  label: string;
  lat?: number;
  lon?: number;
  raw?: any;

  // NOVÉ: rozparsované části adresy
  street?: string;
  houseNumber?: string;
  municipality?: string; // obec/město (preferujeme municipality, jinak city/town)
  postcode?: string;
  region?: string;
  country?: string;
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
    value: item.name,
    data: item,
  }));
  queryCache.set(key, items);
  return items;
}

// Bezpečné vytažení částí adresy z položky Mapy.cz
function extractAddressParts(item: any) {
  console.log('🔎 extractAddressParts - FULL raw item:', JSON.stringify(item, null, 2));
  
  const a = item?.address ?? {};
  
  console.log('🔎 extractAddressParts - raw item:', item);
  console.log('🔎 extractAddressParts - address object:', a);
  
  // Zkusíme všechny možné zdroje dat
  const street: string | undefined = 
    a.street || 
    a.thoroughfare || 
    item?.street || 
    item?.streetName;
    
  const houseNumber: string | undefined =
    a.houseNumber || 
    a.house_num || 
    a.house || 
    item?.houseNumber ||
    item?.orientationNumber ||
    item?.registrationNumber;
    
  const municipality: string | undefined =
    a.municipality || 
    a.city || 
    a.town || 
    item?.municipality || 
    item?.city ||
    item?.location ||
    item?.region;
    
  const postcode: string | undefined = 
    a.postcode || 
    a.zip || 
    item?.postcode ||
    item?.zipCode;
    
  const region: string | undefined = 
    a.region || 
    item?.region ||
    item?.district;
    
  const country: string | undefined = 
    a.country || 
    item?.country ||
    item?.countryName;

  console.log('🔎 extractAddressParts - results:', { street, houseNumber, municipality, postcode, region, country });

  return { street, houseNumber, municipality, postcode, region, country };
}

// NOVÁ FUNKCE: Složení přesné adresy tak, jak to má být
function composeStructuredAddress({
  street,
  houseNumber,
  municipality,
  postcode,
  country,
}: {
  street?: string;
  houseNumber?: string;
  municipality?: string;
  postcode?: string;
  country?: string;
}) {
  const parts: string[] = [];
  
  // 1. Ulice + číslo popisné/evidenční
  if (street && houseNumber) {
    parts.push(`${street} ${houseNumber}`);
  } else if (street) {
    parts.push(street);
  } else if (houseNumber) {
    parts.push(houseNumber);
  }
  
  // 2. Město
  if (municipality) {
    parts.push(municipality);
  }
  
  // 3. PSČ
  if (postcode) {
    parts.push(postcode);
  }
  
  // 4. Stát
  if (country) {
    parts.push(country);
  }
  
  return parts.join(', ');
}

// Původní pomocná (zachována jako fallback)
function formatAddress(item: any): string {
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
      .replace(/\s+,/g, ',');
    if (parts) return parts;
  }
  const label = item?.label;
  const location = item?.location;
  if (label && location) return `${label}, ${location}`;
  if (label) return label;
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
  
  // Flag pro rozlišení, zda uživatel vybral z našeptávače nebo jen píše
  let isManualInput = true;

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
          
          // Zobrazíme složenou adresu
          const parts = extractAddressParts(itemData);
          const line = composeStructuredAddress(parts) || formatAddress(itemData);
          desc.textContent = line || itemData?.label || itemData?.name || '';
          itemEl.append(desc);
        },
        highlight: true,
      },
    });

    // ---- výběr položky ----
    selectionHandler = async (event: any) => {
      isManualInput = false; // uživatel vybral z našeptávače
      
      const orig = event.detail?.selection?.value?.data;
      console.log('🔍 Selection event - orig data:', orig);
      
      if (!orig) return;

      // Rozparsujeme části adresy
      const parts = extractAddressParts(orig);
      console.log('📦 Extracted parts:', parts);

      // Sestavíme adresu ručně z dostupných zdrojů
      // 1. Ulice + číslo z orig.name (např. "Kaštanová 489/34")
      const streetPart = orig.name || '';
      
      // 2. Město z orig.location nebo parts
      const cityPart = orig.location || parts.municipality || parts.region || '';
      
      // 3. PSČ - zkusíme najít v různých místech
      const postcodePart = parts.postcode || '';
      
      // 4. Stát
      const countryPart = parts.country || 'Česko';
      
      // Složíme dohromady
      const addressComponents = [
        streetPart,
        cityPart,
        postcodePart,
        countryPart
      ].filter(p => p && p.trim());
      
      const fullText = addressComponents.join(', ');
      
      console.log('✅ Final composed address:', fullText);
      console.log('   - Street:', streetPart);
      console.log('   - City:', cityPart);
      console.log('   - Postcode:', postcodePart);
      console.log('   - Country:', countryPart);
      
      // DŮLEŽITÉ: nastavíme hodnotu inputu BEZ vyvolání events
      input.value = fullText;
      console.log('💾 Input value set to:', input.value);

      // souřadnice (z orig nebo geocode fallback)
      let lat = orig?.position?.lat ?? orig?.center?.lat ?? undefined;
      let lon = orig?.position?.lon ?? orig?.center?.lon ?? undefined;
      if ((lat == null || lon == null) && fullText) {
        const p = await geocodeLabel(fullText, lang);
        if (p) {
          lat = p.lat;
          lon = p.lon;
        }
      }

      // zavři seznam návrhů
      try {
        acInstance?.close();
      } catch {}

      const suggestionData = {
        label: fullText,
        lat,
        lon,
        raw: orig,
        street: parts.street,
        houseNumber: parts.houseNumber,
        municipality: parts.municipality,
        postcode: parts.postcode,
        region: parts.region,
        country: parts.country,
      };
      
      console.log('📤 Calling onSelect with:', suggestionData);

      // >>> TADY POŠLEME STRUKTUROVANÁ DATA <<<
      onSelect?.(suggestionData);
      
      isManualInput = true; // reset flagu
    };

    if (selectionHandler) {
      input.addEventListener('selection', selectionHandler);
    }
    
    // Při ručním psaní (bez výběru z našeptávače) uložíme přesně to, co napsal uživatel
    const blurHandler = () => {
      if (isManualInput && input.value.trim()) {
        // Uživatel napsal něco a nepoužil našeptávač - uložíme přesně to co napsal
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    
    input.addEventListener('blur', blurHandler);

    // ------- disposer -------
    return () => {
      destroyed = true;
      try {
        if (selectionHandler) input.removeEventListener('selection', selectionHandler as any);
        input.removeEventListener('blur', blurHandler);
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