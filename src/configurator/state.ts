import { ConfiguratorState, Lang, STEPS, EndpointAddress, InventoryItem, Services, Materials, PhotoFile } from './types';

function getDefaultAddress(): EndpointAddress {
  return {
    address: '',
    elevator: false,
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

export function saveState(state: ConfiguratorState): void {
  try {
    const key = getStorageKey(state.lang, state.pageSlug);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save configurator state:', error);
  }
}

export function loadState(lang: Lang, pageSlug: string): ConfiguratorState | null {
  try {
    const key = getStorageKey(lang, pageSlug);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as ConfiguratorState;
    }
  } catch (error) {
    console.error('Failed to load configurator state:', error);
  }
  return null;
}

export function clearState(lang: Lang, pageSlug: string): void {
  try {
    const key = getStorageKey(lang, pageSlug);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear configurator state:', error);
  }
}

export class StateManager {
  private state: ConfiguratorState;
  private listeners: Array<(state: ConfiguratorState) => void> = [];

  constructor(lang: Lang, pageSlug: string) {
    const loaded = loadState(lang, pageSlug);
    this.state = loaded || createInitialState(lang, pageSlug);
  }

  getState(): ConfiguratorState {
    return { ...this.state };
  }

  updateState(updates: Partial<ConfiguratorState>): void {
    this.state = { ...this.state, ...updates };
    saveState(this.state);
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
      this.updateInventory([...this.state.inventory, { key, label, qty: 1, volumePerUnit }]);
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

  reset(): void {
    clearState(this.state.lang, this.state.pageSlug);
    this.state = createInitialState(this.state.lang, this.state.pageSlug);
    this.notifyListeners();
  }

  subscribe(listener: (state: ConfiguratorState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}
