export interface RoomItem {
  key: string;
  volume: number;
}

export interface Room {
  key: string;
  items: RoomItem[];
}

export const rooms: Room[] = [
  {
    key: 'livingRoom',
    items: [
      { key: 'sofa3seat', volume: 2.5 },
      { key: 'sofa2seat', volume: 1.8 },
      { key: 'armchair', volume: 1.2 },
      { key: 'coffeeTable', volume: 0.5 },
      { key: 'tvStand', volume: 0.8 },
      { key: 'tv', volume: 0.3 },
      { key: 'bookcase', volume: 1.5 },
      { key: 'cabinet', volume: 1.2 },
      { key: 'sideboard', volume: 1.5 },
      { key: 'rug', volume: 0.2 },
      { key: 'lamp', volume: 0.1 },
      { key: 'plant', volume: 0.3 },
    ],
  },
  {
    key: 'bedroom',
    items: [
      { key: 'bedDouble', volume: 2.5 },
      { key: 'bedSingle', volume: 1.5 },
      { key: 'mattressDouble', volume: 1.2 },
      { key: 'mattressSingle', volume: 0.8 },
      { key: 'wardrobe2door', volume: 2.0 },
      { key: 'wardrobe3door', volume: 3.0 },
      { key: 'wardrobe4door', volume: 4.0 },
      { key: 'nightstand', volume: 0.4 },
      { key: 'dresser', volume: 1.5 },
      { key: 'mirror', volume: 0.2 },
      { key: 'bedsideTable', volume: 0.3 },
    ],
  },
  {
    key: 'kitchen',
    items: [
      { key: 'fridge', volume: 1.5 },
      { key: 'freezer', volume: 1.2 },
      { key: 'fridgeFreezer', volume: 2.0 },
      { key: 'oven', volume: 0.8 },
      { key: 'stove', volume: 0.6 },
      { key: 'microwave', volume: 0.3 },
      { key: 'dishwasher', volume: 0.8 },
      { key: 'washingMachine', volume: 1.0 },
      { key: 'dryer', volume: 1.0 },
      { key: 'kitchenTable', volume: 1.0 },
      { key: 'kitchenChair', volume: 0.3 },
      { key: 'kitchenCabinet', volume: 0.8 },
    ],
  },
  {
    key: 'diningRoom',
    items: [
      { key: 'diningTable4', volume: 1.5 },
      { key: 'diningTable6', volume: 2.0 },
      { key: 'diningTable8', volume: 2.5 },
      { key: 'diningChair', volume: 0.4 },
      { key: 'bench', volume: 0.8 },
      { key: 'chinaHutch', volume: 2.0 },
      { key: 'serverTable', volume: 1.2 },
    ],
  },
  {
    key: 'office',
    items: [
      { key: 'desk', volume: 1.5 },
      { key: 'officeChair', volume: 0.6 },
      { key: 'filingCabinet', volume: 0.8 },
      { key: 'bookshelf', volume: 1.2 },
      { key: 'printer', volume: 0.3 },
      { key: 'computer', volume: 0.2 },
      { key: 'monitor', volume: 0.2 },
    ],
  },
  {
    key: 'bathroom',
    items: [
      { key: 'washingMachineBath', volume: 1.0 },
      { key: 'cabinet', volume: 0.6 },
      { key: 'shelf', volume: 0.3 },
      { key: 'mirror', volume: 0.1 },
      { key: 'laundryBasket', volume: 0.2 },
    ],
  },
  {
    key: 'childRoom',
    items: [
      { key: 'babyCrib', volume: 1.2 },
      { key: 'toddlerBed', volume: 1.5 },
      { key: 'changingTable', volume: 0.8 },
      { key: 'toyChest', volume: 0.6 },
      { key: 'kidsDesk', volume: 0.8 },
      { key: 'kidsChair', volume: 0.3 },
      { key: 'highChair', volume: 0.5 },
      { key: 'playpen', volume: 0.6 },
      { key: 'rocking chair', volume: 0.8 },
    ],
  },
  {
    key: 'garage',
    items: [
      { key: 'bike', volume: 0.5 },
      { key: 'lawnMower', volume: 0.8 },
      { key: 'toolbox', volume: 0.3 },
      { key: 'ladder', volume: 0.4 },
      { key: 'workbench', volume: 1.5 },
      { key: 'shelving', volume: 1.0 },
      { key: 'garageCabinet', volume: 1.2 },
      { key: 'grill', volume: 0.6 },
      { key: 'skiEquipment', volume: 0.5 },
    ],
  },
  {
    key: 'outdoor',
    items: [
      { key: 'gardenFurnitureSet', volume: 2.0 },
      { key: 'gardenChair', volume: 0.4 },
      { key: 'gardenTable', volume: 1.0 },
      { key: 'umbrella', volume: 0.3 },
      { key: 'sunLounger', volume: 0.8 },
      { key: 'planter', volume: 0.4 },
      { key: 'outdoorStorage', volume: 1.5 },
    ],
  },
  {
    key: 'boxes',
    items: [
      { key: 'boxSmall', volume: 0.05 },
      { key: 'boxMedium', volume: 0.1 },
      { key: 'boxLarge', volume: 0.2 },
      { key: 'wardrobeBox', volume: 0.5 },
    ],
  },
];

export const roomItems: Record<string, number> = rooms.reduce((acc, room) => {
  room.items.forEach(item => {
    acc[item.key] = item.volume;
  });
  return acc;
}, {} as Record<string, number>);
