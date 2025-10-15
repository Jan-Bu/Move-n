import { czechCities } from '../data/cities';

export function setupAutocomplete(inputEl: HTMLInputElement): void {
  const datalistId = `cities-${Math.random().toString(36).substr(2, 9)}`;
  inputEl.setAttribute('list', datalistId);

  const datalist = document.createElement('datalist');
  datalist.id = datalistId;

  czechCities.forEach((city) => {
    const option = document.createElement('option');
    option.value = city;
    datalist.appendChild(option);
  });

  inputEl.parentElement?.appendChild(datalist);

  const config = getAutocompleteConfig();
  if (config.type === 'google' && config.apiKey) {
    enhanceWithGoogle(inputEl, config.apiKey);
  } else if (config.type === 'photon') {
    enhanceWithPhoton(inputEl);
  }
}

interface AutocompleteConfig {
  type: 'none' | 'google' | 'photon';
  apiKey?: string;
}

function getAutocompleteConfig(): AutocompleteConfig {
  const type = (import.meta.env?.VITE_ADDRESS_AUTOCOMPLETE || 'none') as 'none' | 'google' | 'photon';
  const apiKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
  return { type, apiKey };
}

function enhanceWithGoogle(inputEl: HTMLInputElement, apiKey: string): void {
  if (typeof google === 'undefined' || !google.maps) {
    loadGoogleMaps(apiKey, () => {
      initGoogleAutocomplete(inputEl);
    });
  } else {
    initGoogleAutocomplete(inputEl);
  }
}

function loadGoogleMaps(apiKey: string, callback: () => void): void {
  if (document.querySelector('script[src*="maps.googleapis.com"]')) {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
}

function initGoogleAutocomplete(inputEl: HTMLInputElement): void {
  try {
    const autocomplete = new google.maps.places.Autocomplete(inputEl, {
      componentRestrictions: { country: 'cz' },
      fields: ['formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        inputEl.value = place.formatted_address;
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  } catch (error) {
    console.warn('Google Maps autocomplete failed to initialize:', error);
  }
}

function enhanceWithPhoton(inputEl: HTMLInputElement): void {
  let timeoutId: number;

  inputEl.addEventListener('input', () => {
    clearTimeout(timeoutId);
    const query = inputEl.value.trim();

    if (query.length < 3) return;

    timeoutId = window.setTimeout(() => {
      fetchPhotonSuggestions(query).then((suggestions) => {
        updateDatalist(inputEl, suggestions);
      });
    }, 300);
  });
}

async function fetchPhotonSuggestions(query: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=cs&bbox=12.0,48.5,18.9,51.1`
    );
    const data = await response.json();

    return data.features.map((feature: any) => {
      const props = feature.properties;
      return [props.name, props.city, props.country]
        .filter(Boolean)
        .join(', ');
    });
  } catch (error) {
    console.warn('Photon autocomplete failed:', error);
    return [];
  }
}

function updateDatalist(inputEl: HTMLInputElement, suggestions: string[]): void {
  const datalistId = inputEl.getAttribute('list');
  if (!datalistId) return;

  const datalist = document.getElementById(datalistId);
  if (!datalist) return;

  datalist.innerHTML = '';

  [...czechCities, ...suggestions].forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    datalist.appendChild(option);
  });
}

declare global {
  interface Window {
    google: any;
  }
  const google: any;
}
