import type { ElevatorType } from '../types';

// Konstanty pro kalkulaci
const VEHICLE_CAPACITY_M3 = 17;
const BASE_LOAD_TIME_MINUTES = 120; // pro plný náklad 17m³
const STAIR_SURCHARGE_PER_FLOOR = 200; // CZK

// Hodinová sazba a cena za km
const DEFAULT_HOURLY_RATE = 500; // CZK per worker
const PRICE_PER_KM = 20; // CZK per km (one-way distance)
const DEFAULT_WORKERS = 2;

// Floor coefficients
const FLOOR_COEFFICIENTS = {
  ground: 1.0,
  withElevator: 1.2,
  stairs: 1.5,
};

// Elevator capacity mapping
type ElevatorCapacity = 'none' | '1-3-person' | '4-6-person' | '7-9-person' | '10plus-person';

function mapElevatorType(elevatorType: ElevatorType | null | undefined, hasElevator: boolean): ElevatorCapacity {
  if (!hasElevator || !elevatorType) return 'none';

  switch (elevatorType) {
    case 'elevator_1_3': return '1-3-person';
    case 'elevator_4_6': return '4-6-person';
    case 'elevator_7_9': return '7-9-person';
    case 'elevator_10plus': return '10plus-person';
    default: return 'none';
  }
}

// Určení, jestli předmět se vejde do výtahu
function itemFitsInElevator(itemKey: string, elevatorSize: ElevatorCapacity): boolean {
  if (elevatorSize === 'none') return false;

  // Kategorie předmětů podle velikosti
  const verySmallItems = ['boxSmall', 'boxMedium', 'boxLarge', 'bag', 'tv', 'microwave', 'monitor', 'computer', 'printer', 'lamp', 'plant', 'mirror', 'shelf', 'laundryBasket', 'kidsChair', 'toolbox'];

  const smallItems = [...verySmallItems, 'coffeeTable', 'nightstand', 'bedsideTable', 'kitchenChair', 'diningChair', 'officeChair', 'toyChest', 'highChair', 'bike', 'umbrella', 'planter'];

  const mediumItems = [...smallItems, 'armchair', 'tvStand', 'dresser', 'kitchenTable', 'desk', 'changingTable', 'kidsDesk', 'ladder', 'gardenChair', 'gardenTable', 'sunLounger'];

  const largeItems = [...mediumItems, 'sofa2seat', 'cabinet', 'sideboard', 'kitchenCabinet', 'bench', 'filingCabinet', 'bookshelf', 'toddlerBed', 'playpen', 'shelving', 'garageCabinet', 'grill'];

  const veryLargeItems = [...largeItems, 'sofa3seat', 'bookcase', 'bedSingle', 'mattressSingle', 'serverTable', 'workbench', 'outdoorStorage'];

  // 1-3 person elevator
  if (elevatorSize === '1-3-person') {
    return verySmallItems.includes(itemKey);
  }

  // 4-6 person elevator
  if (elevatorSize === '4-6-person') {
    return mediumItems.includes(itemKey);
  }

  // 7-9 person elevator
  if (elevatorSize === '7-9-person') {
    return veryLargeItems.includes(itemKey);
  }

  // 10+ person elevator - fits everything
  return true;
}

// Odhad váhy předmětu
function estimateItemWeight(itemKey: string): number {
  const weights: Record<string, number> = {
    // Heavy items (120+ kg)
    sofa4seat: 150,
    sofa3seat: 120,
    wardrobe4door: 150,
    wardrobe3door: 120,
    chinaHutch: 130,

    // Medium-heavy (80-120 kg)
    sofa2seat: 90,
    bedDouble: 100,
    mattressDouble: 80,
    wardrobe2door: 100,
    fridge: 90,
    fridgeFreezer: 100,
    washingMachine: 80,
    washingMachineBath: 80,
    dryer: 80,
    dryerBath: 80,
    bookcase: 90,
    diningTable: 85,

    // Light-medium (50-80 kg)
    armchair: 60,
    bedSingle: 70,
    mattressSingle: 50,
    dresser: 65,
    sideboard: 70,
    tvStand: 55,
    kitchenTable: 60,
    freezer: 75,
    dishwasher: 70,
    desk: 65,
    filingCabinet: 60,
    bookshelf: 70,
    babyCrib: 50,
    toddlerBed: 55,
    changingTable: 50,
    workbench: 75,
    shelving: 60,
    garageCabinet: 65,
    gardenFurnitureSet: 80,
  };

  return weights[itemKey] || 0; // 0 = lehký předmět
}

// Získání příplatku za těžký předmět
function getHeavyItemSurcharge(weight: number, quantity: number): number {
  if (weight >= 120) return 1500 * quantity;
  if (weight >= 80) return 900 * quantity;
  if (weight >= 50) return 400 * quantity;
  return 0;
}

export interface PriceCalculationInput {
  volumeM3: number;
  distanceKm: number;
  items: Array<{ key: string; qty: number }>;
  floorFrom: number;
  floorTo: number;
  elevatorFrom: ElevatorType | null | undefined;
  elevatorTo: ElevatorType | null | undefined;
  hasElevatorFrom: boolean;
  hasElevatorTo: boolean;
  workers?: number;
  hourlyRate?: number;
}

export interface PriceCalculationResult {
  numberOfTrips: number;
  itemsFitInElevator: string[];
  itemsNeedStairs: string[];
  stairSurcharge: number;
  heavyItemSurcharge: number;
  loadTimeMinutes: number;
  unloadTimeMinutes: number;
  totalHours: number;
  laborPrice: number;
  transportPrice: number;
  finalPrice: number;
  breakdown: {
    laborPrice: number;
    transportPrice: number;
    stairSurcharge: number;
    heavyItemSurcharge: number;
  };
}

export function calculateMovingPrice(input: PriceCalculationInput): PriceCalculationResult {
  const {
    volumeM3,
    distanceKm,
    items,
    floorFrom,
    floorTo,
    elevatorFrom,
    elevatorTo,
    hasElevatorFrom,
    hasElevatorTo,
    workers = DEFAULT_WORKERS,
    hourlyRate = DEFAULT_HOURLY_RATE,
  } = input;

  // 1. Počet jízd
  const numberOfTrips = Math.ceil(volumeM3 / VEHICLE_CAPACITY_M3);

  // 2. Mapování výtahů
  const elevatorFromSize = mapElevatorType(elevatorFrom, hasElevatorFrom);
  const elevatorToSize = mapElevatorType(elevatorTo, hasElevatorTo);

  // 3. Kontrola, které předměty se vejdou do výtahu
  const itemsFitInElevatorFrom: string[] = [];
  const itemsNeedStairsFrom: string[] = [];
  const itemsFitInElevatorTo: string[] = [];
  const itemsNeedStairsTo: string[] = [];

  items.forEach(({ key, qty }) => {
    for (let i = 0; i < qty; i++) {
      if (itemFitsInElevator(key, elevatorFromSize)) {
        itemsFitInElevatorFrom.push(key);
      } else {
        itemsNeedStairsFrom.push(key);
      }

      if (itemFitsInElevator(key, elevatorToSize)) {
        itemsFitInElevatorTo.push(key);
      } else {
        itemsNeedStairsTo.push(key);
      }
    }
  });

  // 4. Určení koeficientu pro nakládání/vykládání
  const totalItemsFrom = itemsFitInElevatorFrom.length + itemsNeedStairsFrom.length;
  const totalItemsTo = itemsFitInElevatorTo.length + itemsNeedStairsTo.length;

  let coefficientFrom = FLOOR_COEFFICIENTS.ground;
  if (floorFrom > 0) {
    const stairPercentFrom = itemsNeedStairsFrom.length / Math.max(totalItemsFrom, 1);
    if (stairPercentFrom > 0.5) {
      coefficientFrom = FLOOR_COEFFICIENTS.stairs;
    } else if (hasElevatorFrom) {
      coefficientFrom = FLOOR_COEFFICIENTS.withElevator;
    } else {
      coefficientFrom = FLOOR_COEFFICIENTS.stairs;
    }
  }

  let coefficientTo = FLOOR_COEFFICIENTS.ground;
  if (floorTo > 0) {
    const stairPercentTo = itemsNeedStairsTo.length / Math.max(totalItemsTo, 1);
    if (stairPercentTo > 0.5) {
      coefficientTo = FLOOR_COEFFICIENTS.stairs;
    } else if (hasElevatorTo) {
      coefficientTo = FLOOR_COEFFICIENTS.withElevator;
    } else {
      coefficientTo = FLOOR_COEFFICIENTS.stairs;
    }
  }

  // 5. Výpočet času
  const volumeFactor = volumeM3 / VEHICLE_CAPACITY_M3;
  const loadTimeMinutes = BASE_LOAD_TIME_MINUTES * volumeFactor * coefficientFrom;
  const unloadTimeMinutes = BASE_LOAD_TIME_MINUTES * volumeFactor * coefficientTo;
  const totalMinutes = loadTimeMinutes + unloadTimeMinutes;
  const totalHours = totalMinutes / 60;

  // 6. Příplatek za schody
  const stairItemsCount = new Set([...itemsNeedStairsFrom, ...itemsNeedStairsTo]).size;
  const avgFloor = ((floorFrom || 0) + (floorTo || 0)) / 2;
  const stairSurcharge = stairItemsCount > 0 ? STAIR_SURCHARGE_PER_FLOOR * Math.ceil(avgFloor) : 0;

  // 7. Příplatek za těžké předměty
  let heavyItemSurcharge = 0;
  items.forEach(({ key, qty }) => {
    const weight = estimateItemWeight(key);
    heavyItemSurcharge += getHeavyItemSurcharge(weight, qty);
  });

  // 8. Ceny
  const laborPrice = Math.ceil(totalHours * hourlyRate * workers);
  // Transport: 20 Kč per km (one-way distance only)
  const transportPrice = Math.ceil(distanceKm * PRICE_PER_KM);
  const finalPrice = laborPrice + transportPrice + stairSurcharge + heavyItemSurcharge;

  return {
    numberOfTrips,
    itemsFitInElevator: Array.from(new Set([...itemsFitInElevatorFrom, ...itemsFitInElevatorTo])),
    itemsNeedStairs: Array.from(new Set([...itemsNeedStairsFrom, ...itemsNeedStairsTo])),
    stairSurcharge,
    heavyItemSurcharge,
    loadTimeMinutes: Math.ceil(loadTimeMinutes),
    unloadTimeMinutes: Math.ceil(unloadTimeMinutes),
    totalHours: Math.round(totalHours * 100) / 100,
    laborPrice,
    transportPrice,
    finalPrice,
    breakdown: {
      laborPrice,
      transportPrice,
      stairSurcharge,
      heavyItemSurcharge,
    },
  };
}
