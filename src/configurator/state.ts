// src/configurator/state.ts
import {
  ConfiguratorState,
  Lang,
  STEPS,
  EndpointAddress,
  InventoryItem,
  Services,
  Materials,
  PhotoFile,
} from './types';

// ---------- Helpers & defaults ----------

function getDefaultAddress(): EndpointAddress {
  return {
    address: '',
    elevator: false,
    elevatorType: null,
    floor: 0,
    longWalk: false,
    narrowStairs: false,
  };
}

function getDefaultMaterials(): Materials {
  return {
    bubble: false,
    stretch: false,
    tape: false,
    boxes_s: 0,
    boxes_m: 0,
    boxes_l: 0,
  };
}

function getDefaultServices(): Services {
  return {
    disassembly: false,
    assembly: false,
    packingService: false,
    materials: getDefaultMaterials(),
    insurance: false,
  };
}

export function createInitialState(lang: Lang, pageSlug: string): ConfiguratorState {
  return {
    lang,
    pageSlug,
    currentStep: STEPS.INTRO,
    from: getDefaultAddress(),
    to: getDefaultAddress(),
    distance: undefined,
    inventory: [],
    other: '',
    photos: [],
    services: getDefaultServices(),
    estimate: { volumeM3: 0 },
    preferredDate: '',
    preferredWindow: '',
    email: '',
    phone: '',
    consent: false,
  };
}

function getStorageKey(lang: Lang, pageSlug: string): string {
  return `move-n-configurator-${lang}-${pageSlug}`;
}

function canUseStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__cfg_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function computeVolumeFromInventory(inventory: InventoryItem[]): number {
  // Součet qty * volumePerUnit pro položky, které volumePerUnit mají
  return inventory.reduce((acc, it) => acc + (it.volumePerUnit ? it.volumePerUnit * it.qty : 0), 0);
}

// ---------- Persistence ----------

export function saveState(state: ConfiguratorState): void {
  if (!canUseStorage()) return;
  try {
    const key = getStorageKey(state.lang, state.pageSlug);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save configurator state:', error);
  }
}

export function loadState(lang: Lang, pageSlug: string): ConfiguratorState | null {
  if (!canUseStorage()) return null;
  try {
    const key = getStorageKey(lang, pageSlug);
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as ConfiguratorState;

    // Ochrana proti starším uloženým verzím – doplň chybějící části
    return {
      ...createInitialState(lang, pageSlug),
      ...parsed,
      from: { ...getDefaultAddress(), ...(parsed.from ?? {}) },
      to: { ...getDefaultAddress(), ...(parsed.to ?? {}) },
      services: {
        ...getDefaultServices(),
        ...(parsed.services ?? {}),
        materials: {
          ...getDefaultMaterials(),
          ...(parsed.services?.materials ?? {}),
        },
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load configurator state:', error);
    return null;
  }
}

export function clearState(lang: Lang, pageSlug: string): void {
  if (!canUseStorage()) return;
  try {
    const key = getStorageKey(lang, pageSlug);
    localStorage.removeItem(key);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to clear configurator state:', error);
  }
}

// ---------- State Manager ----------

export class StateManager {
  private state: ConfiguratorState;
  private listeners: Array<(state: ConfiguratorState) => void> = [];
  private saveTimer: number | null = null; // debounce ukládání

  constructor(lang: Lang, pageSlug: string) {
    const loaded = loadState(lang, pageSlug);
    this.state = loaded || createInitialState(lang, pageSlug);
  }

  getState(): ConfiguratorState {
    // Vrať kopii, ať si ji nikdo omylem nemutuje zvenčí
    return { ...this.state };
  }

  // --------- Publikované API (beze změn + pár nových pohodlných setterů) ---------

  updateState(updates: Partial<ConfiguratorState>): void {
    const next = { ...this.state, ...updates };

    // Pokud se změnil inventář, přepočti odhad objemu
    if (updates.inventory) {
      const volumeM3 = computeVolumeFromInventory(next.inventory);
      next.estimate = { volumeM3 };
    }

    this.state = next;
    this.debouncedSave();
    this.notifyListeners();
  }

  setStep(step: number): void {
    this.updateState({ currentStep: step });
  }

  nextStep(): void {
    if (this.state.currentStep < STEPS.COMPLETE) {
      this.setStep(this.state.currentStep + 1);
    }
  }

  prevStep(): void {
    if (this.state.currentStep > STEPS.INTRO) {
      this.setStep(this.state.currentStep - 1);
    }
  }

  updateInventory(inventory: InventoryItem[]): void {
    this.updateState({ inventory });
  }

  addInventoryItem(key: string, label: string, volumePerUnit: number): void {
    const existing = this.state.inventory.find((item) => item.key === key);
    if (existing) {
      this.updateInventory(
        this.state.inventory.map((item) =>
          item.key === key ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      this.updateInventory([
        ...this.state.inventory,
        { key, label, qty: 1, volumePerUnit },
      ]);
    }
  }

  removeInventoryItem(key: string): void {
    const existing = this.state.inventory.find((item) => item.key === key);
    if (existing && existing.qty > 1) {
      this.updateInventory(
        this.state.inventory.map((item) =>
          item.key === key ? { ...item, qty: item.qty - 1 } : item
        )
      );
    } else {
      this.updateInventory(this.state.inventory.filter((item) => item.key !== key));
    }
  }

  setInventoryQty(key: string, qty: number): void {
    if (qty <= 0) {
      this.updateInventory(this.state.inventory.filter((item) => item.key !== key));
    } else {
      this.updateInventory(
        this.state.inventory.map((item) => (item.key === key ? { ...item, qty } : item))
      );
    }
  }

  updateEstimate(volumeM3: number): void {
    this.updateState({ estimate: { volumeM3 } });
  }

  addPhoto(photo: PhotoFile): void {
    this.updateState({ photos: [...this.state.photos, photo] });
  }

  removePhoto(index: number): void {
    this.updateState({ photos: this.state.photos.filter((_, i) => i !== index) });
  }

  setDistance(distance: number): void {
    this.updateState({ distance });
  }

  // ---- nové pohodlné settery (bezpečné, volitelné použít) ----
  setFromAddress(addr: Partial<EndpointAddress>): void {
    this.updateState({ from: { ...this.state.from, ...addr } });
  }

  setToAddress(addr: Partial<EndpointAddress>): void {
    this.updateState({ to: { ...this.state.to, ...addr } });
  }

  setServices(svc: Partial<Services>): void {
    this.updateState({ services: { ...this.state.services, ...svc } });
  }

  setMaterials(mat: Partial<Materials>): void {
    this.updateState({
      services: {
        ...this.state.services,
        materials: { ...this.state.services.materials, ...mat },
      },
    });
  }

  setOther(text: string): void {
    this.updateState({ other: text });
  }

  setPreferredDate(date: string): void {
    this.updateState({ preferredDate: date });
  }

  setPreferredWindow(win: ConfiguratorState['preferredWindow']): void {
    this.updateState({ preferredWindow: win });
  }

  setEmail(email: string): void {
    this.updateState({ email });
  }

  setPhone(phone: string): void {
    this.updateState({ phone });
  }

  setConsent(consent: boolean): void {
    this.updateState({ consent });
  }

  reset(): void {
    clearState(this.state.lang, this.state.pageSlug);
    this.state = createInitialState(this.state.lang, this.state.pageSlug);
    this.debouncedSave();
    this.notifyListeners();
  }

  subscribe(listener: (state: ConfiguratorState) => void): () => void {
    this.listeners.push(listener);
    // ihned po přihlášení pošli aktuální stav (užitečné pro první render)
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // ---------- interní ----------

  private notifyListeners(): void {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private debouncedSave(): void {
    if (this.saveTimer != null) {
      window.clearTimeout(this.saveTimer);
    }
    this.saveTimer = window.setTimeout(() => {
      saveState(this.state);
      this.saveTimer = null;
    }, 150); // 150 ms je příjemný kompromis pro rychlé klikání
  }
}
