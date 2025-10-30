export type Lang = 'cs' | 'en';

export type TimeWindow = string;

export type ElevatorType = 'small_personal' | 'large_personal' | 'freight';

export interface EndpointAddress {
  address: string;
  elevator: boolean;
  floor: number;
  longWalk?: boolean;
  narrowStairs?: boolean;
  elevatorType?: ElevatorType | null;
}

export interface InventoryItem {
  key: string;
  label: string;
  qty: number;
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
  currentStep: number; 
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


export type Payload = Omit<
  ConfiguratorState,
  'currentStep' | 'preferredWindow' | 'preferredDate' | 'phone' | 'consent'
> & {
  preferredDate?: string;
  preferredWindow?: TimeWindow; // string ve formátu "HH:MM"
  phone?: string;
  other?: string;
  timestamp: string;
};