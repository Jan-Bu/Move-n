export const itemVolumes: Record<string, number> = {
  wardrobe: 1.5,
  bed: 2.0,
  sofa: 2.5,
  diningTable: 1.2,
  chairs: 0.3,
  fridge: 0.8,
  freezer: 0.6,
  washingMachine: 0.7,
  dishwasher: 0.5,
  oven: 0.4,
  microwave: 0.15,
  tv: 0.3,
  desk: 1.0,
  chestOfDrawers: 0.8,
  cupboard: 0.6,
  bookcase: 1.2,
  babyCot: 1.0,
  bike: 0.4,
  boxes_s: 0.03,
  boxes_m: 0.06,
  boxes_l: 0.12,
};

export function calculateTotalVolume(items: Array<{ key: string; qty: number }>): number {
  return items.reduce((total, item) => {
    const volume = itemVolumes[item.key] || 0;
    return total + volume * item.qty;
  }, 0);
}
