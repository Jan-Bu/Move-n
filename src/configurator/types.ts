export type Lang = 'cs' | 'en';

export type TimeWindow = 'morning' | 'afternoon' | 'evening';

export interface EndpointAddress {
  address: string;
  elevator: boolean;
  floor: number;
  longWalk?: boolean;
  narrowStairs?: boolean;
}

export interface InventoryItem {
  key: string;
  label: string;
  qty: number;
  /**
   * m³ per unit (optional, pokud je k dispozici pro odhad objemu)
   */
  volumePerUnit?: number;
}

export interface Materials {
  bubble: boolean;
  stretch: boolean;
  tape: boolean;
  boxes_s: number;
  boxes_m: number;
  boxes_l: number;
}

export interface Services {
  disassembly: boolean;
  assembly: boolean;
  packingService: boolean;
  materials: Materials;
  insurance: boolean;
}

export interface Estimate {
  /** Odhadovaný objem v m³ */
  volumeM3: number;
}

export interface PhotoFile {
  name: string;
  base64: string;
  size: number;
  type: string;
}

export const STEPS = {
  INTRO: 0,
  ADDRESSES: 1,
  INVENTORY: 2,
  SERVICES: 3,
  SUMMARY: 4,
  CONTACT: 5,
  COMPLETE: 6
} as const;

/**
 * Klíč a hodnota kroků (pro přesné typování v UI/logice routeru)
 */
export type StepKey = keyof typeof STEPS;
export type StepId = (typeof STEPS)[StepKey];

export interface ConfiguratorState {
  lang: Lang;
  pageSlug: string;
  currentStep: number; // nebo StepId, pokud chceš přísnější typ
  from: EndpointAddress;
  to: EndpointAddress;
  distance?: number;
  inventory: InventoryItem[];
  other: string;
  photos: PhotoFile[];
  services: Services;
  estimate: Estimate;
  preferredDate: string;
  preferredWindow: TimeWindow | '';
  email: string;
  phone: string;
  consent: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Payload pro odeslání (odvozené z ConfiguratorState, aby nedocházelo k driftu).
 * - některá pole jsou volitelná proti stavu (preferredDate/Window, phone, other)
 * - přidán timestamp
 */
export type Payload = Omit<
  ConfiguratorState,
  'currentStep' | 'preferredWindow' | 'preferredDate' | 'phone' | 'consent'
> & {
  preferredDate?: string;
  preferredWindow?: TimeWindow;
  phone?: string;
  other?: string;
  timestamp: string;
};
