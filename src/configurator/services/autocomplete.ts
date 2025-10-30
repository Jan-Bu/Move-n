// src/configurator/services/autocomplete.ts
// Mapy.cz Suggest integrováno s autoComplete.js (CDN).
// Volání: const dispose = setupAutocomplete(input, (sel) => { ... }, { lang: 'cs' });

type Suggestion = {
  label: string;
  lat?: number;
  lon?: number;
  raw?: unknown;

  // New: parsed address parts
  street?: string;
  houseNumber?: string;
  municipality?: string;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoComplete?: any;
  }
}

const DEFAULTS = {
  lang: 'cs',
  limit: 5,
  minChars: 3,
};

const MAPYCZ_SUGGEST = 'https://api.mapy.cz/v1/suggest';

const ENV_KEY = (import.meta as { env?: { VITE_MAPYCZ_KEY?: string } }).env?.VITE_MAPYCZ_KEY;
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

// Query cache
const queryCache = new Map<string, Array<{ value: string; data: unknown }>>();

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await res.json() as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: Array<{ value: string; data: unknown }> = (json.items || []).map((item: any) => ({
    value: item.name,
    data: item,
  }));
  queryCache.set(key, items);
  return items;
}

// Extract address parts from Mapy.cz item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Compose structured address
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

  // 1. Street + house number
  if (street && houseNumber) {
    parts.push(`${street} ${houseNumber}`);
  } else if (street) {
    parts.push(street);
  } else if (houseNumber) {
    parts.push(houseNumber);
  }

  // 2. City
  if (municipality) {
    parts.push(municipality);
  }

  // 3. Postcode
  if (postcode) {
    parts.push(postcode);
  }

  // 4. Country
  if (country) {
    parts.push(country);
  }

  return parts.join(', ');
}

// Format address fallback
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Geocode fallback for coordinates
async function geocodeLabel(label: string, lang: string) {
  const url = new URL('https://api.mapy.cz/v1/geocode');
  url.searchParams.set('query', label);
  url.searchParams.set('limit', '1');
  url.searchParams.set('lang', lang);
  url.searchParams.set('apikey', API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await res.json() as any;
  const item = json?.items?.[0];
  const lat = item?.position?.lat ?? item?.center?.lat;
  const lon = item?.position?.lon ?? item?.center?.lon;
  return lat != null && lon != null ? { lat, lon } : null;
}

// Public API
export function setupAutocomplete(
  input: HTMLInputElement,
  onSelect?: (s: Suggestion) => void,
  opts: SetupOptions = {}
) {
  const { lang, limit, minChars } = { ...DEFAULTS, ...opts };

  // Wrap input for library styles
  let wrapper: HTMLDivElement | null = null;
  if (!input.parentElement?.classList.contains('autoComplete_wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'autoComplete_wrapper';
    input.parentElement?.insertBefore(wrapper, input);
    wrapper.appendChild(input);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let acInstance: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let selectionHandler: any = null;
  let destroyed = false;

  // Flag to distinguish between autocomplete selection vs manual input
  let isManualInput = true;

  const init = async () => {
    await loadAutoCompleteLib();
    if (destroyed) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acInstance = new (window.autoComplete as any)({
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
          } catch (err) {
            console.error('Autocomplete fetch error:', err);
            return [];
          }
        },
        cache: false,
      },
      resultsList: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Selection handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectionHandler = async (event: any) => {
      isManualInput = false; // user selected from autocomplete
      
      const orig = event.detail?.selection?.value?.data;
      console.log('🔍 Selection event - orig data:', orig);
      
      if (!orig) return;

      // Parse address parts
      const parts = extractAddressParts(orig);
      console.log('📦 Extracted parts:', parts);

      // Compose address from available sources
      // 1. Street + number from orig.name (e.g. "Kaštanová 489/34")
      const streetPart = orig.name || '';

      // 2. City from orig.location or parts
      const cityPart = orig.location || parts.municipality || parts.region || '';

      // 3. Postcode
      const postcodePart = parts.postcode || '';

      // 4. Country
      const countryPart = parts.country || 'Česko';

      // Compose final address
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

      // Set input value without triggering events
      input.value = fullText;
      console.log('💾 Input value set to:', input.value);

      // Coordinates (from orig or geocode fallback)
      let lat = orig?.position?.lat ?? orig?.center?.lat ?? undefined;
      let lon = orig?.position?.lon ?? orig?.center?.lon ?? undefined;
      if ((lat == null || lon == null) && fullText) {
        const p = await geocodeLabel(fullText, lang);
        if (p) {
          lat = p.lat;
          lon = p.lon;
        }
      }

      // Close suggestions list
      try {
        acInstance?.close();
      } catch (err) {
        console.error('Close autocomplete error:', err);
      }

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

      // Send structured data
      onSelect?.(suggestionData);

      isManualInput = true; // reset flag
    };

    if (selectionHandler) {
      input.addEventListener('selection', selectionHandler);
    }

    // On manual input (without using autocomplete) save exactly what user typed
    const blurHandler = () => {
      if (isManualInput && input.value.trim()) {
        // User typed without using autocomplete - save exactly what they typed
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    input.addEventListener('blur', blurHandler);

    // Disposer
    return () => {
      destroyed = true;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (selectionHandler) input.removeEventListener('selection', selectionHandler as any);
        input.removeEventListener('blur', blurHandler);
      } catch (err) {
        console.error('Remove event listeners error:', err);
      }
      try {
        const list = document.querySelector('.autoComplete_result_list');
        if (list && list.parentElement) list.parentElement.removeChild(list);

        if (wrapper && wrapper.parentElement) {
          wrapper.parentElement.insertBefore(input, wrapper);
          wrapper.remove();
        }
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    };
  };

  return init();
}