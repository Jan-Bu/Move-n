var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/configurator/types.ts
var STEPS = {
  INTRO: 0,
  ADDRESSES: 1,
  INVENTORY: 2,
  SERVICES: 3,
  SUMMARY: 4,
  CONTACT: 5,
  COMPLETE: 6
};

// src/configurator/state.ts
function getDefaultAddress() {
  return {
    address: "",
    elevator: false,
    floor: 0,
    longWalk: false,
    narrowStairs: false
  };
}
function getDefaultMaterials() {
  return {
    bubble: false,
    stretch: false,
    tape: false,
    boxes_s: 0,
    boxes_m: 0,
    boxes_l: 0
  };
}
function getDefaultServices() {
  return {
    disassembly: false,
    assembly: false,
    packingService: false,
    materials: getDefaultMaterials(),
    insurance: false
  };
}
function createInitialState(lang, pageSlug) {
  return {
    lang,
    pageSlug,
    currentStep: STEPS.INTRO,
    from: getDefaultAddress(),
    to: getDefaultAddress(),
    distance: void 0,
    inventory: [],
    other: "",
    photos: [],
    services: getDefaultServices(),
    estimate: { volumeM3: 0 },
    preferredDate: "",
    preferredWindow: "",
    email: "",
    phone: "",
    consent: false
  };
}
function getStorageKey(lang, pageSlug) {
  return `move-n-configurator-${lang}-${pageSlug}`;
}
function saveState(state) {
  try {
    const key = getStorageKey(state.lang, state.pageSlug);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save configurator state:", error);
  }
}
function loadState(lang, pageSlug) {
  try {
    const key = getStorageKey(lang, pageSlug);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load configurator state:", error);
  }
  return null;
}
function clearState(lang, pageSlug) {
  try {
    const key = getStorageKey(lang, pageSlug);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear configurator state:", error);
  }
}
var StateManager = class {
  constructor(lang, pageSlug) {
    __publicField(this, "state");
    __publicField(this, "listeners", []);
    const loaded = loadState(lang, pageSlug);
    this.state = loaded || createInitialState(lang, pageSlug);
  }
  getState() {
    return { ...this.state };
  }
  updateState(updates) {
    this.state = { ...this.state, ...updates };
    saveState(this.state);
    this.notifyListeners();
  }
  setStep(step) {
    this.updateState({ currentStep: step });
  }
  nextStep() {
    if (this.state.currentStep < STEPS.COMPLETE) {
      this.setStep(this.state.currentStep + 1);
    }
  }
  prevStep() {
    if (this.state.currentStep > STEPS.INTRO) {
      this.setStep(this.state.currentStep - 1);
    }
  }
  updateInventory(inventory) {
    this.updateState({ inventory });
  }
  addInventoryItem(key, label, volumePerUnit) {
    const existing = this.state.inventory.find((item) => item.key === key);
    if (existing) {
      this.updateInventory(
        this.state.inventory.map(
          (item) => item.key === key ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      this.updateInventory([...this.state.inventory, { key, label, qty: 1, volumePerUnit }]);
    }
  }
  removeInventoryItem(key) {
    const existing = this.state.inventory.find((item) => item.key === key);
    if (existing && existing.qty > 1) {
      this.updateInventory(
        this.state.inventory.map(
          (item) => item.key === key ? { ...item, qty: item.qty - 1 } : item
        )
      );
    } else {
      this.updateInventory(this.state.inventory.filter((item) => item.key !== key));
    }
  }
  setInventoryQty(key, qty) {
    if (qty <= 0) {
      this.updateInventory(this.state.inventory.filter((item) => item.key !== key));
    } else {
      this.updateInventory(
        this.state.inventory.map((item) => item.key === key ? { ...item, qty } : item)
      );
    }
  }
  updateEstimate(volumeM3) {
    this.updateState({ estimate: { volumeM3 } });
  }
  addPhoto(photo) {
    this.updateState({ photos: [...this.state.photos, photo] });
  }
  removePhoto(index) {
    this.updateState({ photos: this.state.photos.filter((_, i) => i !== index) });
  }
  setDistance(distance) {
    this.updateState({ distance });
  }
  reset() {
    clearState(this.state.lang, this.state.pageSlug);
    this.state = createInitialState(this.state.lang, this.state.pageSlug);
    this.notifyListeners();
  }
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
};

// src/configurator/i18n.ts
var cs = {
  "intro.title": "Kalkulace st\u011Bhov\xE1n\xED",
  "intro.subtitle": "Zjist\u011Bte orienta\u010Dn\xED cenu va\u0161eho st\u011Bhov\xE1n\xED b\u011Bhem n\u011Bkolika minut",
  "intro.cta": "Konfigurovat st\u011Bhov\xE1n\xED",
  "step.addresses": "Odkud a Kam",
  "step.inventory": "Co st\u011Bhujeme",
  "step.services": "Slu\u017Eby",
  "step.summary": "Shrnut\xED",
  "step.contact": "Kontakt",
  "address.from": "Odkud st\u011Bhujeme",
  "address.to": "Kam st\u011Bhujeme",
  "address.label": "Adresa",
  "address.placeholder": "Zadejte adresu...",
  "address.elevator": "Je k dispozici v\xFDtah?",
  "address.floor": "Patro",
  "address.longWalk": "Dlouh\xE1 vzd\xE1lenost od parkov\xE1n\xED",
  "address.narrowStairs": "\xDAzk\xE9 schodi\u0161t\u011B",
  "inventory.title": "Co budeme st\u011Bhovat?",
  "inventory.subtitle": "Vyberte p\u0159edm\u011Bty, kter\xE9 chcete st\u011Bhovat",
  "inventory.other": "Dal\u0161\xED p\u0159edm\u011Bty (popi\u0161te)",
  "inventory.otherPlaceholder": "Napi\u0161te dal\u0161\xED v\u011Bci, kter\xE9 nejsou v seznamu...",
  "services.title": "Dopl\u0148kov\xE9 slu\u017Eby",
  "services.disassembly": "Demont\xE1\u017E n\xE1bytku",
  "services.assembly": "Mont\xE1\u017E n\xE1bytku",
  "services.packing": "Balen\xED v\u011Bc\xED",
  "services.materials": "Obalov\xE9 materi\xE1ly",
  "services.insurance": "Poji\u0161t\u011Bn\xED / ochrana k\u0159ehk\xFDch v\u011Bc\xED",
  "services.date": "Preferovan\xE9 datum",
  "services.time": "Preferovan\xFD \u010Das",
  "services.morning": "Dopoledne (8-12h)",
  "services.afternoon": "Odpoledne (12-16h)",
  "services.evening": "Ve\u010Der (16-20h)",
  "materials.bubble": "Bublinkov\xE1 f\xF3lie",
  "materials.stretch": "Stre\u010Dov\xE1 f\xF3lie",
  "materials.tape": "Lepic\xED p\xE1ska",
  "materials.boxes_s": "Krabice S (mal\xE9)",
  "materials.boxes_m": "Krabice M (st\u0159edn\xED)",
  "materials.boxes_l": "Krabice L (velk\xE9)",
  "contact.email": "E-mail",
  "contact.phone": "Telefon (voliteln\xE9)",
  "contact.consent": "Souhlas\xEDm se zpracov\xE1n\xEDm osobn\xEDch \xFAdaj\u016F",
  "contact.privacyLink": "Z\xE1sady ochrany osobn\xEDch \xFAdaj\u016F",
  "summary.title": "Shrnut\xED va\u0161\xED popt\xE1vky",
  "summary.from": "Z adresy",
  "summary.to": "Na adresu",
  "summary.volume": "Odhadovan\xFD objem",
  "summary.items": "P\u0159edm\u011Bty",
  "summary.itemsList": "Seznam vybran\xFDch v\u011Bc\xED",
  "summary.services": "Slu\u017Eby",
  "summary.date": "Term\xEDn",
  "btn.next": "Dal\u0161\xED",
  "btn.back": "Zp\u011Bt",
  "btn.edit": "Upravit",
  "btn.submit": "Odeslat popt\xE1vku",
  "btn.close": "Zav\u0159\xEDt",
  "complete.title": "D\u011Bkujeme!",
  "complete.message": "Va\u0161i popt\xE1vku jsme obdr\u017Eeli. Cenovou nab\xEDdku v\xE1m po\u0161leme co nejd\u0159\xEDve na e-mail.",
  "error.required": "Toto pole je povinn\xE9",
  "error.email": "Zadejte platnou e-mailovou adresu",
  "error.minItems": 'Vyberte alespo\u0148 jeden p\u0159edm\u011Bt nebo vypl\u0148te pole "Dal\u0161\xED p\u0159edm\u011Bty"',
  "error.consent": "Mus\xEDte souhlasit se zpracov\xE1n\xEDm osobn\xEDch \xFAdaj\u016F",
  "yes": "Ano",
  "no": "Ne",
  "floor": "patro",
  "item.wardrobe": "\u0160atn\xED sk\u0159\xED\u0148",
  "item.bed": "Postel",
  "item.sofa": "Pohovka",
  "item.diningTable": "J\xEDdeln\xED st\u016Fl",
  "item.chairs": "\u017Didle",
  "item.fridge": "Lednice",
  "item.freezer": "Mrazni\u010Dka",
  "item.washingMachine": "Pra\u010Dka",
  "item.dishwasher": "My\u010Dka",
  "item.oven": "Trouba",
  "item.microwave": "Mikrovlnka",
  "item.tv": "Televize",
  "item.desk": "Psac\xED st\u016Fl",
  "item.chestOfDrawers": "Komoda",
  "item.cupboard": "Sk\u0159\xED\u0148ka",
  "item.bookcase": "Knihovna",
  "item.babyCot": "D\u011Btsk\xE1 post\xFDlka",
  "item.bike": "Kolo",
  "item.boxes_s": "Krabice S",
  "item.boxes_m": "Krabice M",
  "item.boxes_l": "Krabice L"
};
var en = {
  "intro.title": "Moving Calculator",
  "intro.subtitle": "Get an estimate for your move in just a few minutes",
  "intro.cta": "Configure Your Move",
  "step.addresses": "Addresses",
  "step.inventory": "What to Move",
  "step.services": "Services",
  "step.summary": "Summary",
  "step.contact": "Contact",
  "address.from": "Moving From",
  "address.to": "Moving To",
  "address.label": "Address",
  "address.placeholder": "Enter address...",
  "address.elevator": "Elevator available?",
  "address.floor": "Floor",
  "address.longWalk": "Long distance from parking",
  "address.narrowStairs": "Narrow staircase",
  "inventory.title": "What are we moving?",
  "inventory.subtitle": "Select the items you want to move",
  "inventory.other": "Other items (describe)",
  "inventory.otherPlaceholder": "List any items not included above...",
  "services.title": "Additional Services",
  "services.disassembly": "Furniture disassembly",
  "services.assembly": "Furniture assembly",
  "services.packing": "Packing service",
  "services.materials": "Packing materials",
  "services.insurance": "Insurance / protection for fragile items",
  "services.date": "Preferred date",
  "services.time": "Preferred time",
  "services.morning": "Morning (8am-12pm)",
  "services.afternoon": "Afternoon (12pm-4pm)",
  "services.evening": "Evening (4pm-8pm)",
  "materials.bubble": "Bubble wrap",
  "materials.stretch": "Stretch film",
  "materials.tape": "Packing tape",
  "materials.boxes_s": "Small boxes",
  "materials.boxes_m": "Medium boxes",
  "materials.boxes_l": "Large boxes",
  "contact.email": "Email",
  "contact.phone": "Phone (optional)",
  "contact.consent": "I agree to the processing of personal data",
  "contact.privacyLink": "Privacy Policy",
  "summary.title": "Your Move Summary",
  "summary.from": "From",
  "summary.to": "To",
  "summary.volume": "Estimated volume",
  "summary.items": "Items",
  "summary.itemsList": "List of chosen items",
  "summary.services": "Services",
  "summary.date": "Date",
  "btn.next": "Next",
  "btn.back": "Back",
  "btn.edit": "Edit",
  "btn.submit": "Submit Request",
  "btn.close": "Close",
  "complete.title": "Thank You!",
  "complete.message": "We have received your request. We will send you a quote via email as soon as possible.",
  "error.required": "This field is required",
  "error.email": "Please enter a valid email address",
  "error.minItems": 'Select at least one item or fill in "Other items"',
  "error.consent": "You must agree to the processing of personal data",
  "yes": "Yes",
  "no": "No",
  "floor": "floor",
  "item.wardrobe": "Wardrobe",
  "item.bed": "Bed",
  "item.sofa": "Sofa",
  "item.diningTable": "Dining table",
  "item.chairs": "Chairs",
  "item.fridge": "Refrigerator",
  "item.freezer": "Freezer",
  "item.washingMachine": "Washing machine",
  "item.dishwasher": "Dishwasher",
  "item.oven": "Oven",
  "item.microwave": "Microwave",
  "item.tv": "TV",
  "item.desk": "Desk",
  "item.chestOfDrawers": "Chest of drawers",
  "item.cupboard": "Cupboard",
  "item.bookcase": "Bookcase",
  "item.babyCot": "Baby cot",
  "item.bike": "Bicycle",
  "item.boxes_s": "Small boxes",
  "item.boxes_m": "Medium boxes",
  "item.boxes_l": "Large boxes"
};
function t(lang, key) {
  return lang === "cs" ? cs[key] : en[key];
}

// src/configurator/i18n-extended.ts
var translations = {
  cs: {
    // Rooms
    "room.livingRoom": "Ob\xFDvac\xED pokoj",
    "room.bedroom": "Lo\u017Enice",
    "room.kitchen": "Kuchy\u0148",
    "room.diningRoom": "J\xEDdelna",
    "room.office": "Pracovna",
    "room.bathroom": "Koupelna",
    "room.childRoom": "D\u011Btsk\xFD pokoj",
    "room.garage": "Gar\xE1\u017E",
    "room.outdoor": "Zahrada / Terasa",
    "room.boxes": "Krabice a balen\xED",
    // Living Room Items
    "item.sofa3seat": "Pohovka 3m\xEDstn\xE1",
    "item.sofa2seat": "Pohovka 2m\xEDstn\xE1",
    "item.armchair": "K\u0159eslo",
    "item.coffeeTable": "Konferen\u010Dn\xED stolek",
    "item.tvStand": "TV stolek",
    "item.tv": "Televize",
    "item.bookcase": "Knihovna",
    "item.cabinet": "Sk\u0159\xED\u0148ka",
    "item.sideboard": "Komoda",
    "item.rug": "Koberec",
    "item.lamp": "Lampa",
    "item.plant": "Kv\u011Btina",
    // Bedroom Items
    "item.bedDouble": "Postel dvoul\u016F\u017Ekov\xE1",
    "item.bedSingle": "Postel jednol\u016F\u017Ekov\xE1",
    "item.mattressDouble": "Matrace dvoul\u016F\u017Ekov\xE1",
    "item.mattressSingle": "Matrace jednol\u016F\u017Ekov\xE1",
    "item.wardrobe2door": "\u0160atn\xED sk\u0159\xED\u0148 2dve\u0159ov\xE1",
    "item.wardrobe3door": "\u0160atn\xED sk\u0159\xED\u0148 3dve\u0159ov\xE1",
    "item.wardrobe4door": "\u0160atn\xED sk\u0159\xED\u0148 4dve\u0159ov\xE1",
    "item.nightstand": "No\u010Dn\xED stolek",
    "item.dresser": "Toaletn\xED stolek",
    "item.mirror": "Zrcadlo",
    "item.bedsideTable": "No\u010Dn\xED stolek",
    // Kitchen Items
    "item.fridge": "Lednice",
    "item.freezer": "Mrazni\u010Dka",
    "item.fridgeFreezer": "Lednice s mraz\xE1kem",
    "item.oven": "Trouba",
    "item.stove": "Spor\xE1k",
    "item.microwave": "Mikrovlnn\xE1 trouba",
    "item.dishwasher": "My\u010Dka n\xE1dob\xED",
    "item.washingMachine": "Pra\u010Dka",
    "item.dryer": "Su\u0161i\u010Dka",
    "item.kitchenTable": "Kuchy\u0148sk\xFD st\u016Fl",
    "item.kitchenChair": "Kuchy\u0148sk\xE1 \u017Eidle",
    "item.kitchenCabinet": "Kuchy\u0148sk\xE1 sk\u0159\xED\u0148ka",
    // Dining Room Items
    "item.diningTable4": "J\xEDdeln\xED st\u016Fl (4 osoby)",
    "item.diningTable6": "J\xEDdeln\xED st\u016Fl (6 osob)",
    "item.diningTable8": "J\xEDdeln\xED st\u016Fl (8 osob)",
    "item.diningChair": "J\xEDdeln\xED \u017Eidle",
    "item.bench": "Lavice",
    "item.chinaHutch": "N\xE1dobn\xED sk\u0159\xED\u0148",
    "item.serverTable": "Serv\xEDrovac\xED stolek",
    // Office Items
    "item.desk": "Psac\xED st\u016Fl",
    "item.officeChair": "Kancel\xE1\u0159sk\xE1 \u017Eidle",
    "item.filingCabinet": "Kartot\xE9ka",
    "item.bookshelf": "Knihovna",
    "item.printer": "Tisk\xE1rna",
    "item.computer": "Po\u010D\xEDta\u010D",
    "item.monitor": "Monitor",
    // Bathroom Items
    "item.washingMachineBath": "Pra\u010Dka",
    "item.shelf": "Police",
    "item.laundryBasket": "Ko\u0161 na pr\xE1dlo",
    // Child Room Items
    "item.babyCrib": "D\u011Btsk\xE1 post\xFDlka",
    "item.toddlerBed": "D\u011Btsk\xE1 postel",
    "item.changingTable": "P\u0159ebalovac\xED pult",
    "item.toyChest": "Truhla na hra\u010Dky",
    "item.kidsDesk": "D\u011Btsk\xFD st\u016Fl",
    "item.kidsChair": "D\u011Btsk\xE1 \u017Eidle",
    "item.highChair": "Vysok\xE1 \u017Eidle",
    "item.playpen": "Ohr\xE1dka",
    "item.rocking chair": "Houpac\xED k\u0159eslo",
    // Garage Items
    "item.bike": "Kolo",
    "item.lawnMower": "Seka\u010Dka na tr\xE1vu",
    "item.toolbox": "Box s n\xE1\u0159ad\xEDm",
    "item.ladder": "\u017Deb\u0159\xEDk",
    "item.workbench": "Pracovn\xED st\u016Fl",
    "item.shelving": "Reg\xE1l",
    "item.garageCabinet": "Gar\xE1\u017Eov\xE1 sk\u0159\xED\u0148",
    "item.grill": "Gril",
    "item.skiEquipment": "Ly\u017Ea\u0159sk\xE9 vybaven\xED",
    // Outdoor Items
    "item.gardenFurnitureSet": "Zahradn\xED n\xE1bytek (sada)",
    "item.gardenChair": "Zahradn\xED \u017Eidle",
    "item.gardenTable": "Zahradn\xED st\u016Fl",
    "item.umbrella": "Slune\u010Dn\xEDk",
    "item.sunLounger": "Leh\xE1tko",
    "item.planter": "Kv\u011Btin\xE1\u010D",
    "item.outdoorStorage": "Zahradn\xED \xFAlo\u017Ei\u0161t\u011B",
    // Box Items
    "item.boxSmall": "Mal\xE1 krabice",
    "item.boxMedium": "St\u0159edn\xED krabice",
    "item.boxLarge": "Velk\xE1 krabice",
    "item.wardrobeBox": "\u0160atn\xED krabice",
    // Photo upload
    "photo.title": "Fotografie",
    "photo.subtitle": "P\u0159idejte fotografie v\u011Bc\xED, kter\xE9 chcete st\u011Bhovat (voliteln\xE9)",
    "photo.addButton": "P\u0159idat fotografie",
    "photo.maxSize": "Max. velikost souboru: 5MB",
    "photo.formats": "Form\xE1ty: JPG, PNG, HEIC",
    "photo.remove": "Odstranit",
    // Distance
    "distance.calculating": "Vypo\u010D\xEDt\xE1v\xE1m vzd\xE1lenost...",
    "distance.result": "Vzd\xE1lenost",
    "distance.error": "Nepoda\u0159ilo se vypo\u010D\xEDtat vzd\xE1lenost"
  },
  en: {
    // Rooms
    "room.livingRoom": "Living Room",
    "room.bedroom": "Bedroom",
    "room.kitchen": "Kitchen",
    "room.diningRoom": "Dining Room",
    "room.office": "Office",
    "room.bathroom": "Bathroom",
    "room.childRoom": "Child Room",
    "room.garage": "Garage",
    "room.outdoor": "Garden / Patio",
    "room.boxes": "Boxes & Packing",
    // Living Room Items
    "item.sofa3seat": "3-Seater Sofa",
    "item.sofa2seat": "2-Seater Sofa",
    "item.armchair": "Armchair",
    "item.coffeeTable": "Coffee Table",
    "item.tvStand": "TV Stand",
    "item.tv": "Television",
    "item.bookcase": "Bookcase",
    "item.cabinet": "Cabinet",
    "item.sideboard": "Sideboard",
    "item.rug": "Rug",
    "item.lamp": "Lamp",
    "item.plant": "Plant",
    // Bedroom Items
    "item.bedDouble": "Double Bed",
    "item.bedSingle": "Single Bed",
    "item.mattressDouble": "Double Mattress",
    "item.mattressSingle": "Single Mattress",
    "item.wardrobe2door": "2-Door Wardrobe",
    "item.wardrobe3door": "3-Door Wardrobe",
    "item.wardrobe4door": "4-Door Wardrobe",
    "item.nightstand": "Nightstand",
    "item.dresser": "Dresser",
    "item.mirror": "Mirror",
    "item.bedsideTable": "Bedside Table",
    // Kitchen Items
    "item.fridge": "Refrigerator",
    "item.freezer": "Freezer",
    "item.fridgeFreezer": "Fridge-Freezer",
    "item.oven": "Oven",
    "item.stove": "Stove",
    "item.microwave": "Microwave",
    "item.dishwasher": "Dishwasher",
    "item.washingMachine": "Washing Machine",
    "item.dryer": "Dryer",
    "item.kitchenTable": "Kitchen Table",
    "item.kitchenChair": "Kitchen Chair",
    "item.kitchenCabinet": "Kitchen Cabinet",
    // Dining Room Items
    "item.diningTable4": "Dining Table (4 seats)",
    "item.diningTable6": "Dining Table (6 seats)",
    "item.diningTable8": "Dining Table (8 seats)",
    "item.diningChair": "Dining Chair",
    "item.bench": "Bench",
    "item.chinaHutch": "China Hutch",
    "item.serverTable": "Server Table",
    // Office Items
    "item.desk": "Desk",
    "item.officeChair": "Office Chair",
    "item.filingCabinet": "Filing Cabinet",
    "item.bookshelf": "Bookshelf",
    "item.printer": "Printer",
    "item.computer": "Computer",
    "item.monitor": "Monitor",
    // Bathroom Items
    "item.washingMachineBath": "Washing Machine",
    "item.shelf": "Shelf",
    "item.laundryBasket": "Laundry Basket",
    // Child Room Items
    "item.babyCrib": "Baby Crib",
    "item.toddlerBed": "Toddler Bed",
    "item.changingTable": "Changing Table",
    "item.toyChest": "Toy Chest",
    "item.kidsDesk": "Kids Desk",
    "item.kidsChair": "Kids Chair",
    "item.highChair": "High Chair",
    "item.playpen": "Playpen",
    "item.rocking chair": "Rocking Chair",
    // Garage Items
    "item.bike": "Bicycle",
    "item.lawnMower": "Lawn Mower",
    "item.toolbox": "Toolbox",
    "item.ladder": "Ladder",
    "item.workbench": "Workbench",
    "item.shelving": "Shelving",
    "item.garageCabinet": "Garage Cabinet",
    "item.grill": "Grill",
    "item.skiEquipment": "Ski Equipment",
    // Outdoor Items
    "item.gardenFurnitureSet": "Garden Furniture Set",
    "item.gardenChair": "Garden Chair",
    "item.gardenTable": "Garden Table",
    "item.umbrella": "Umbrella",
    "item.sunLounger": "Sun Lounger",
    "item.planter": "Planter",
    "item.outdoorStorage": "Outdoor Storage",
    // Box Items
    "item.boxSmall": "Small Box",
    "item.boxMedium": "Medium Box",
    "item.boxLarge": "Large Box",
    "item.wardrobeBox": "Wardrobe Box",
    // Photo upload
    "photo.title": "Photos",
    "photo.subtitle": "Add photos of items you want to move (optional)",
    "photo.addButton": "Add Photos",
    "photo.maxSize": "Max file size: 5MB",
    "photo.formats": "Formats: JPG, PNG, HEIC",
    "photo.remove": "Remove",
    // Distance
    "distance.calculating": "Calculating distance...",
    "distance.result": "Distance",
    "distance.error": "Unable to calculate distance"
  }
};
function tExt(lang, key) {
  return translations[lang][key] || key;
}

// src/configurator/ui/components.ts
function createButton(label, onClick, className = "btn-primary") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `configurator-btn ${className}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}
function createInput(type, value, onChange, placeholder = "", field = "") {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  input.placeholder = placeholder;
  input.className = "configurator-input";
  if (field) input.setAttribute("data-field", field);
  input.addEventListener("input", (e) => onChange(e.target.value));
  return input;
}
function createCheckbox(checked, onChange, label) {
  const labelEl = document.createElement("label");
  labelEl.className = "configurator-checkbox";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", (e) => onChange(e.target.checked));
  const span = document.createElement("span");
  span.textContent = label;
  labelEl.appendChild(input);
  labelEl.appendChild(span);
  return labelEl;
}
function createSelect(value, options, onChange) {
  const select = document.createElement("select");
  select.className = "configurator-select";
  select.value = value;
  options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });
  select.addEventListener("change", (e) => onChange(e.target.value));
  return select;
}
function createCounter(qty, onIncrement, onDecrement, onChange) {
  const container = document.createElement("div");
  container.className = "configurator-counter";
  const decrementBtn = document.createElement("button");
  decrementBtn.type = "button";
  decrementBtn.textContent = "\u2212";
  decrementBtn.className = "counter-btn";
  decrementBtn.addEventListener("click", onDecrement);
  const input = document.createElement("input");
  input.type = "number";
  input.value = qty.toString();
  input.min = "0";
  input.className = "counter-input";
  input.addEventListener("change", (e) => {
    const val = parseInt(e.target.value) || 0;
    onChange(Math.max(0, val));
  });
  const incrementBtn = document.createElement("button");
  incrementBtn.type = "button";
  incrementBtn.textContent = "+";
  incrementBtn.className = "counter-btn";
  incrementBtn.addEventListener("click", onIncrement);
  container.appendChild(decrementBtn);
  container.appendChild(input);
  container.appendChild(incrementBtn);
  return container;
}
function createFormGroup(label, control, field = "") {
  const group = document.createElement("div");
  group.className = "configurator-form-group";
  if (field) group.setAttribute("data-field", field);
  const labelEl = document.createElement("label");
  labelEl.textContent = label;
  labelEl.className = "configurator-label";
  group.appendChild(labelEl);
  group.appendChild(control);
  return group;
}
function createStepper(currentStep, totalSteps, lang) {
  const stepper = document.createElement("div");
  stepper.className = "configurator-stepper";
  stepper.setAttribute("role", "navigation");
  stepper.setAttribute("aria-label", "Progress");
  const steps = [
    t(lang, "step.addresses"),
    t(lang, "step.inventory"),
    t(lang, "step.services"),
    t(lang, "step.summary"),
    t(lang, "step.contact")
  ];
  steps.forEach((stepName, index) => {
    const stepNumber = index + 1;
    const stepEl = document.createElement("div");
    stepEl.className = "stepper-step";
    if (stepNumber < currentStep) {
      stepEl.classList.add("completed");
    } else if (stepNumber === currentStep) {
      stepEl.classList.add("active");
    }
    const circle = document.createElement("div");
    circle.className = "stepper-circle";
    circle.textContent = stepNumber.toString();
    const label = document.createElement("div");
    label.className = "stepper-label";
    label.textContent = stepName;
    stepEl.appendChild(circle);
    stepEl.appendChild(label);
    stepper.appendChild(stepEl);
  });
  return stepper;
}

// src/configurator/ui/validation.ts
function validateAddresses(state) {
  const errors = [];
  if (!state.from.address.trim()) {
    errors.push({
      field: "from.address",
      message: t(state.lang, "error.required")
    });
  }
  if (!state.to.address.trim()) {
    errors.push({
      field: "to.address",
      message: t(state.lang, "error.required")
    });
  }
  return errors;
}
function validateInventory(state) {
  const errors = [];
  const hasItems = state.inventory.length > 0 && state.inventory.some((item) => item.qty > 0);
  const hasOther = state.other.trim().length > 0;
  if (!hasItems && !hasOther) {
    errors.push({
      field: "inventory",
      message: t(state.lang, "error.minItems")
    });
  }
  return errors;
}
function validateContact(state) {
  const errors = [];
  if (!state.email.trim()) {
    errors.push({
      field: "email",
      message: t(state.lang, "error.required")
    });
  } else if (!isValidEmail(state.email)) {
    errors.push({
      field: "email",
      message: t(state.lang, "error.email")
    });
  }
  if (!state.consent) {
    errors.push({
      field: "consent",
      message: t(state.lang, "error.consent")
    });
  }
  return errors;
}
function validateStep(step, state) {
  switch (step) {
    case STEPS.ADDRESSES:
      return validateAddresses(state);
    case STEPS.INVENTORY:
      return validateInventory(state);
    case STEPS.CONTACT:
      return validateContact(state);
    default:
      return [];
  }
}
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
function displayErrors(errors, containerEl) {
  const existingErrors = containerEl.querySelectorAll(".configurator-error");
  existingErrors.forEach((el) => el.remove());
  if (errors.length === 0) return;
  const errorContainer = document.createElement("div");
  errorContainer.className = "configurator-errors";
  errorContainer.setAttribute("role", "alert");
  errorContainer.setAttribute("aria-live", "polite");
  errors.forEach((error) => {
    const errorEl = document.createElement("div");
    errorEl.className = "configurator-error";
    errorEl.textContent = error.message;
    const field = containerEl.querySelector(`[data-field="${error.field}"]`);
    if (field) {
      field.classList.add("error");
      field.parentElement?.appendChild(errorEl);
    } else {
      errorContainer.appendChild(errorEl);
    }
  });
  if (errorContainer.children.length > 0) {
    containerEl.insertBefore(errorContainer, containerEl.firstChild);
  }
}
function clearErrors(containerEl) {
  const errors = containerEl.querySelectorAll(".configurator-error, .configurator-errors");
  errors.forEach((el) => el.remove());
  const errorFields = containerEl.querySelectorAll(".error");
  errorFields.forEach((el) => el.classList.remove("error"));
}

// src/configurator/data/cities.ts
var czechCities = [
  "Praha 1",
  "Praha 2",
  "Praha 3",
  "Praha 4",
  "Praha 5",
  "Praha 6",
  "Praha 7",
  "Praha 8",
  "Praha 9",
  "Praha 10",
  "Brno-st\u0159ed",
  "Brno-sever",
  "Brno-jih",
  "Kr\xE1lovo Pole",
  "L\xED\u0161e\u0148",
  "Kom\xE1rov",
  "Ostrava-centrum",
  "Ostrava-jih",
  "Ostrava-sever",
  "Poruba",
  "Slezsk\xE1 Ostrava",
  "Moravsk\xE1 Ostrava",
  "Hav\xED\u0159ov-M\u011Bsto",
  "Hav\xED\u0159ov-Podles\xED",
  "Hav\xED\u0159ov-\u0160umbark",
  "Liberec I",
  "Liberec II",
  "Liberec III",
  "Liberec IV",
  "Liberec V",
  "Plze\u0148 1",
  "Plze\u0148 2",
  "Plze\u0148 3",
  "Plze\u0148 4",
  "Bolevec",
  "Lochot\xEDn",
  "Pardubice I",
  "Pardubice II",
  "Pardubice III",
  "Pardubice IV",
  "Zelen\xE9 P\u0159edm\u011Bst\xED",
  "Polabiny",
  "Bene\u0161ov",
  "Olomouc",
  "\u010Cesk\xE9 Bud\u011Bjovice",
  "Hradec Kr\xE1lov\xE9",
  "Karlovy Vary",
  "\xDAst\xED nad Labem",
  "Jihlava",
  "Most",
  "Zl\xEDn",
  "Kladno",
  "P\u0159\xEDbram",
  "Kutn\xE1 Hora",
  "Fr\xFDdek-M\xEDstek",
  "Kol\xEDn",
  "Mlad\xE1 Boleslav",
  "M\u011Bln\xEDk",
  "Beroun",
  "D\u011B\u010D\xEDn",
  "Teplice",
  "Chomutov",
  "P\u0159erov",
  "T\u0159eb\xED\u010D",
  "T\xE1bor",
  "Znojmo",
  "Prost\u011Bjov",
  "Karvin\xE1",
  "Opava",
  "Havl\xED\u010Dk\u016Fv Brod",
  "Jablonec nad Nisou",
  "Hodon\xEDn",
  "Vy\u0161kov",
  "Litom\u011B\u0159ice",
  "Trutnov",
  "T\u0159inec",
  "Cheb",
  "P\xEDsek",
  "Nov\xFD Ji\u010D\xEDn"
];

// src/configurator/services/autocomplete.ts
function setupAutocomplete(inputEl) {
  const datalistId = `cities-${Math.random().toString(36).substr(2, 9)}`;
  inputEl.setAttribute("list", datalistId);
  const datalist = document.createElement("datalist");
  datalist.id = datalistId;
  czechCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    datalist.appendChild(option);
  });
  inputEl.parentElement?.appendChild(datalist);
  const config = getAutocompleteConfig();
  if (config.type === "google" && config.apiKey) {
    enhanceWithGoogle(inputEl, config.apiKey);
  } else if (config.type === "photon") {
    enhanceWithPhoton(inputEl);
  }
}
function getAutocompleteConfig() {
  const type = import.meta.env?.VITE_ADDRESS_AUTOCOMPLETE || "none";
  const apiKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
  return { type, apiKey };
}
function enhanceWithGoogle(inputEl, apiKey) {
  if (typeof google === "undefined" || !google.maps) {
    loadGoogleMaps(apiKey, () => {
      initGoogleAutocomplete(inputEl);
    });
  } else {
    initGoogleAutocomplete(inputEl);
  }
}
function loadGoogleMaps(apiKey, callback) {
  if (document.querySelector('script[src*="maps.googleapis.com"]')) {
    callback();
    return;
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
}
function initGoogleAutocomplete(inputEl) {
  try {
    const autocomplete = new google.maps.places.Autocomplete(inputEl, {
      componentRestrictions: { country: "cz" },
      fields: ["formatted_address"]
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        inputEl.value = place.formatted_address;
        inputEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  } catch (error) {
    console.warn("Google Maps autocomplete failed to initialize:", error);
  }
}
function enhanceWithPhoton(inputEl) {
  let timeoutId;
  inputEl.addEventListener("input", () => {
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
async function fetchPhotonSuggestions(query) {
  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=cs&bbox=12.0,48.5,18.9,51.1`
    );
    const data = await response.json();
    return data.features.map((feature) => {
      const props = feature.properties;
      return [props.name, props.city, props.country].filter(Boolean).join(", ");
    });
  } catch (error) {
    console.warn("Photon autocomplete failed:", error);
    return [];
  }
}
function updateDatalist(inputEl, suggestions) {
  const datalistId = inputEl.getAttribute("list");
  if (!datalistId) return;
  const datalist = document.getElementById(datalistId);
  if (!datalist) return;
  datalist.innerHTML = "";
  [...czechCities, ...suggestions].forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    datalist.appendChild(option);
  });
}

// src/configurator/services/analytics.ts
function trackEvent(eventName, params = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}
function trackStepView(step, stepName, lang, pageSlug) {
  trackEvent("configurator_step_view", {
    step,
    step_name: stepName,
    lang,
    page_slug: pageSlug
  });
}
function trackSubmitSuccess(lang, pageSlug, volumeM3) {
  trackEvent("configurator_submit_success", {
    lang,
    page_slug: pageSlug,
    volume_m3: volumeM3
  });
}
function trackSubmitFail(lang, pageSlug, error) {
  trackEvent("configurator_submit_fail", {
    lang,
    page_slug: pageSlug,
    error
  });
}

// src/configurator/services/submit.ts
async function submitQuote(state) {
  const payload = {
    lang: state.lang,
    pageSlug: state.pageSlug,
    from: state.from,
    to: state.to,
    distance: state.distance,
    inventory: state.inventory,
    other: state.other || void 0,
    photos: state.photos,
    services: state.services,
    estimate: state.estimate,
    preferredDate: state.preferredDate || void 0,
    preferredWindow: state.preferredWindow || void 0,
    email: state.email,
    phone: state.phone || void 0,
    consent: state.consent,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    const apiUrl = "/.netlify/functions/send-moving-quote";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to submit quote");
    }
    trackSubmitSuccess(state.lang, state.pageSlug, state.estimate.volumeM3);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    trackSubmitFail(state.lang, state.pageSlug, errorMessage);
    console.error("Failed to submit quote:", error);
    return {
      success: false,
      error: errorMessage
    };
  }
}

// src/configurator/data/volumes.ts
var itemVolumes = {
  wardrobe: 1.5,
  bed: 2,
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
  desk: 1,
  chestOfDrawers: 0.8,
  cupboard: 0.6,
  bookcase: 1.2,
  babyCot: 1,
  bike: 0.4,
  boxes_s: 0.03,
  boxes_m: 0.06,
  boxes_l: 0.12
};
function calculateTotalVolume(items) {
  return items.reduce((total, item) => {
    const volume = itemVolumes[item.key] || 0;
    return total + volume * item.qty;
  }, 0);
}

// src/configurator/data/rooms.ts
var rooms = [
  {
    key: "livingRoom",
    items: [
      { key: "sofa3seat", volume: 2.5 },
      { key: "sofa2seat", volume: 1.8 },
      { key: "armchair", volume: 1.2 },
      { key: "coffeeTable", volume: 0.5 },
      { key: "tvStand", volume: 0.8 },
      { key: "tv", volume: 0.3 },
      { key: "bookcase", volume: 1.5 },
      { key: "cabinet", volume: 1.2 },
      { key: "sideboard", volume: 1.5 },
      { key: "rug", volume: 0.2 },
      { key: "lamp", volume: 0.1 },
      { key: "plant", volume: 0.3 }
    ]
  },
  {
    key: "bedroom",
    items: [
      { key: "bedDouble", volume: 2.5 },
      { key: "bedSingle", volume: 1.5 },
      { key: "mattressDouble", volume: 1.2 },
      { key: "mattressSingle", volume: 0.8 },
      { key: "wardrobe2door", volume: 2 },
      { key: "wardrobe3door", volume: 3 },
      { key: "wardrobe4door", volume: 4 },
      { key: "nightstand", volume: 0.4 },
      { key: "dresser", volume: 1.5 },
      { key: "mirror", volume: 0.2 },
      { key: "bedsideTable", volume: 0.3 }
    ]
  },
  {
    key: "kitchen",
    items: [
      { key: "fridge", volume: 1.5 },
      { key: "freezer", volume: 1.2 },
      { key: "fridgeFreezer", volume: 2 },
      { key: "oven", volume: 0.8 },
      { key: "stove", volume: 0.6 },
      { key: "microwave", volume: 0.3 },
      { key: "dishwasher", volume: 0.8 },
      { key: "washingMachine", volume: 1 },
      { key: "dryer", volume: 1 },
      { key: "kitchenTable", volume: 1 },
      { key: "kitchenChair", volume: 0.3 },
      { key: "kitchenCabinet", volume: 0.8 }
    ]
  },
  {
    key: "diningRoom",
    items: [
      { key: "diningTable4", volume: 1.5 },
      { key: "diningTable6", volume: 2 },
      { key: "diningTable8", volume: 2.5 },
      { key: "diningChair", volume: 0.4 },
      { key: "bench", volume: 0.8 },
      { key: "chinaHutch", volume: 2 },
      { key: "serverTable", volume: 1.2 }
    ]
  },
  {
    key: "office",
    items: [
      { key: "desk", volume: 1.5 },
      { key: "officeChair", volume: 0.6 },
      { key: "filingCabinet", volume: 0.8 },
      { key: "bookshelf", volume: 1.2 },
      { key: "printer", volume: 0.3 },
      { key: "computer", volume: 0.2 },
      { key: "monitor", volume: 0.2 }
    ]
  },
  {
    key: "bathroom",
    items: [
      { key: "washingMachineBath", volume: 1 },
      { key: "cabinet", volume: 0.6 },
      { key: "shelf", volume: 0.3 },
      { key: "mirror", volume: 0.1 },
      { key: "laundryBasket", volume: 0.2 }
    ]
  },
  {
    key: "childRoom",
    items: [
      { key: "babyCrib", volume: 1.2 },
      { key: "toddlerBed", volume: 1.5 },
      { key: "changingTable", volume: 0.8 },
      { key: "toyChest", volume: 0.6 },
      { key: "kidsDesk", volume: 0.8 },
      { key: "kidsChair", volume: 0.3 },
      { key: "highChair", volume: 0.5 },
      { key: "playpen", volume: 0.6 },
      { key: "rocking chair", volume: 0.8 }
    ]
  },
  {
    key: "garage",
    items: [
      { key: "bike", volume: 0.5 },
      { key: "lawnMower", volume: 0.8 },
      { key: "toolbox", volume: 0.3 },
      { key: "ladder", volume: 0.4 },
      { key: "workbench", volume: 1.5 },
      { key: "shelving", volume: 1 },
      { key: "garageCabinet", volume: 1.2 },
      { key: "grill", volume: 0.6 },
      { key: "skiEquipment", volume: 0.5 }
    ]
  },
  {
    key: "outdoor",
    items: [
      { key: "gardenFurnitureSet", volume: 2 },
      { key: "gardenChair", volume: 0.4 },
      { key: "gardenTable", volume: 1 },
      { key: "umbrella", volume: 0.3 },
      { key: "sunLounger", volume: 0.8 },
      { key: "planter", volume: 0.4 },
      { key: "outdoorStorage", volume: 1.5 }
    ]
  },
  {
    key: "boxes",
    items: [
      { key: "boxSmall", volume: 0.05 },
      { key: "boxMedium", volume: 0.1 },
      { key: "boxLarge", volume: 0.2 },
      { key: "wardrobeBox", volume: 0.5 }
    ]
  }
];
var roomItems = rooms.reduce((acc, room) => {
  room.items.forEach((item) => {
    acc[item.key] = item.volume;
  });
  return acc;
}, {});

// src/configurator/ui/render-enhanced.ts
function render(container, stateManager) {
  const state = stateManager.getState();
  container.innerHTML = "";
  container.className = "moving-configurator";
  const content = document.createElement("div");
  content.className = "configurator-content";
  if (state.currentStep === STEPS.INTRO) {
    renderIntro(content, stateManager);
  } else {
    content.classList.add("has-step-content");
    const wrapper = document.createElement("div");
    wrapper.className = "configurator-step-content";
    switch (state.currentStep) {
      case STEPS.ADDRESSES:
        renderAddresses(wrapper, stateManager);
        break;
      case STEPS.INVENTORY:
        renderInventory(wrapper, stateManager);
        break;
      case STEPS.SERVICES:
        renderServices(wrapper, stateManager);
        break;
      case STEPS.SUMMARY:
        renderSummary(wrapper, stateManager);
        break;
      case STEPS.CONTACT:
        renderContact(wrapper, stateManager);
        break;
      case STEPS.COMPLETE:
        renderComplete(wrapper, stateManager);
        break;
    }
    content.appendChild(wrapper);
  }
  container.appendChild(content);
  trackStepView(state.currentStep, getStepName(state.currentStep), state.lang, state.pageSlug);
}
function getStepName(step) {
  const stepNames = {
    [STEPS.INTRO]: "intro",
    [STEPS.ADDRESSES]: "addresses",
    [STEPS.INVENTORY]: "inventory",
    [STEPS.SERVICES]: "services",
    [STEPS.SUMMARY]: "summary",
    [STEPS.CONTACT]: "contact",
    [STEPS.COMPLETE]: "complete"
  };
  return stepNames[step] || "unknown";
}
function renderIntro(container, stateManager) {
  const state = stateManager.getState();
  const card = document.createElement("div");
  card.className = "configurator-intro-card";
  const title = document.createElement("h2");
  title.textContent = t(state.lang, "intro.title");
  title.className = "configurator-title";
  const subtitle = document.createElement("p");
  subtitle.textContent = t(state.lang, "intro.subtitle");
  subtitle.className = "configurator-subtitle";
  const startBtn = createButton(
    t(state.lang, "intro.cta"),
    () => stateManager.nextStep(),
    "btn-primary btn-large"
  );
  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(startBtn);
  container.appendChild(card);
}
function renderAddresses(container, stateManager) {
  const state = stateManager.getState();
  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);
  const title = document.createElement("h3");
  title.textContent = t(state.lang, "step.addresses");
  title.className = "configurator-step-title";
  container.appendChild(title);
  const fromSection = document.createElement("div");
  fromSection.className = "address-section";
  const fromTitle = document.createElement("h4");
  fromTitle.textContent = t(state.lang, "address.from");
  fromSection.appendChild(fromTitle);
  const fromAddressInput = createInput(
    "text",
    state.from.address,
    (val) => {
      stateManager.updateState({ from: { ...state.from, address: val } });
    },
    t(state.lang, "address.placeholder"),
    "from.address"
  );
  setupAutocomplete(fromAddressInput);
  fromSection.appendChild(createFormGroup(t(state.lang, "address.label"), fromAddressInput, "from.address"));
  fromSection.appendChild(
    createCheckbox(
      state.from.elevator,
      (val) => stateManager.updateState({ from: { ...state.from, elevator: val } }),
      t(state.lang, "address.elevator")
    )
  );
  const fromFloor = createInput(
    "number",
    state.from.floor.toString(),
    (val) => stateManager.updateState({ from: { ...state.from, floor: parseInt(val) || 0 } }),
    "",
    "from.floor"
  );
  fromFloor.min = "0";
  fromFloor.max = "20";
  fromSection.appendChild(createFormGroup(t(state.lang, "address.floor"), fromFloor));
  fromSection.appendChild(
    createCheckbox(
      state.from.longWalk || false,
      (val) => stateManager.updateState({ from: { ...state.from, longWalk: val } }),
      t(state.lang, "address.longWalk")
    )
  );
  fromSection.appendChild(
    createCheckbox(
      state.from.narrowStairs || false,
      (val) => stateManager.updateState({ from: { ...state.from, narrowStairs: val } }),
      t(state.lang, "address.narrowStairs")
    )
  );
  container.appendChild(fromSection);
  const toSection = document.createElement("div");
  toSection.className = "address-section";
  const toTitle = document.createElement("h4");
  toTitle.textContent = t(state.lang, "address.to");
  toSection.appendChild(toTitle);
  const toAddressInput = createInput(
    "text",
    state.to.address,
    (val) => {
      stateManager.updateState({ to: { ...state.to, address: val } });
    },
    t(state.lang, "address.placeholder"),
    "to.address"
  );
  setupAutocomplete(toAddressInput);
  toSection.appendChild(createFormGroup(t(state.lang, "address.label"), toAddressInput, "to.address"));
  toSection.appendChild(
    createCheckbox(
      state.to.elevator,
      (val) => stateManager.updateState({ to: { ...state.to, elevator: val } }),
      t(state.lang, "address.elevator")
    )
  );
  const toFloor = createInput(
    "number",
    state.to.floor.toString(),
    (val) => stateManager.updateState({ to: { ...state.to, floor: parseInt(val) || 0 } }),
    "",
    "to.floor"
  );
  toFloor.min = "0";
  toFloor.max = "20";
  toSection.appendChild(createFormGroup(t(state.lang, "address.floor"), toFloor));
  toSection.appendChild(
    createCheckbox(
      state.to.longWalk || false,
      (val) => stateManager.updateState({ to: { ...state.to, longWalk: val } }),
      t(state.lang, "address.longWalk")
    )
  );
  toSection.appendChild(
    createCheckbox(
      state.to.narrowStairs || false,
      (val) => stateManager.updateState({ to: { ...state.to, narrowStairs: val } }),
      t(state.lang, "address.narrowStairs")
    )
  );
  container.appendChild(toSection);
  if (state.distance) {
    const distanceDisplay = document.createElement("div");
    distanceDisplay.className = "distance-display";
    distanceDisplay.textContent = `${tExt(state.lang, "distance.result")}: ${state.distance} km`;
    container.appendChild(distanceDisplay);
  }
  renderNavButtons(container, stateManager);
}
function renderInventory(container, stateManager) {
  const state = stateManager.getState();
  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);
  const title = document.createElement("h3");
  title.textContent = t(state.lang, "inventory.title");
  title.className = "configurator-step-title";
  container.appendChild(title);
  const subtitle = document.createElement("p");
  subtitle.textContent = t(state.lang, "inventory.subtitle");
  subtitle.className = "configurator-subtitle";
  container.appendChild(subtitle);
  rooms.forEach((room, roomIndex) => {
    const roomSection = document.createElement("div");
    roomSection.className = "room-section room-accordion";
    const roomHeader = document.createElement("div");
    roomHeader.className = "room-header";
    const roomTitle = document.createElement("h4");
    roomTitle.textContent = tExt(state.lang, `room.${room.key}`);
    roomTitle.className = "room-title";
    const arrow = document.createElement("span");
    arrow.className = "room-arrow";
    arrow.textContent = "\u25BC";
    roomHeader.appendChild(roomTitle);
    roomHeader.appendChild(arrow);
    roomSection.appendChild(roomHeader);
    const grid = document.createElement("div");
    grid.className = "inventory-grid room-content";
    grid.style.display = "none";
    room.items.forEach((item) => {
      const stateItem = state.inventory.find((i) => i.key === item.key);
      const qty = stateItem?.qty || 0;
      const card = document.createElement("div");
      card.className = "inventory-item";
      const label = document.createElement("div");
      label.className = "item-label";
      label.textContent = tExt(state.lang, `item.${item.key}`);
      const counter = createCounter(
        qty,
        () => stateManager.addInventoryItem(item.key, tExt(state.lang, `item.${item.key}`), item.volume),
        () => stateManager.removeInventoryItem(item.key),
        (newQty) => stateManager.setInventoryQty(item.key, newQty)
      );
      card.appendChild(label);
      card.appendChild(counter);
      grid.appendChild(card);
    });
    roomSection.appendChild(grid);
    roomHeader.addEventListener("click", () => {
      const allRooms = container.querySelectorAll(".room-accordion");
      allRooms.forEach((otherRoom) => {
        if (otherRoom !== roomSection) {
          const otherContent = otherRoom.querySelector(".room-content");
          const otherArrow = otherRoom.querySelector(".room-arrow");
          if (otherContent) otherContent.style.display = "none";
          if (otherArrow) otherArrow.style.transform = "rotate(0deg)";
          otherRoom.classList.remove("expanded");
        }
      });
      const isExpanded = grid.style.display === "grid";
      grid.style.display = isExpanded ? "none" : "grid";
      arrow.style.transform = isExpanded ? "rotate(0deg)" : "rotate(180deg)";
      roomSection.classList.toggle("expanded", !isExpanded);
    });
    container.appendChild(roomSection);
  });
  const otherGroup = document.createElement("div");
  otherGroup.className = "other-items-group";
  const otherTextarea = document.createElement("textarea");
  otherTextarea.value = state.other;
  otherTextarea.placeholder = t(state.lang, "inventory.otherPlaceholder");
  otherTextarea.className = "configurator-textarea";
  otherTextarea.rows = 3;
  otherTextarea.addEventListener("input", (e) => {
    stateManager.updateState({ other: e.target.value });
  });
  otherGroup.appendChild(createFormGroup(t(state.lang, "inventory.other"), otherTextarea));
  container.appendChild(otherGroup);
  const volume = calculateTotalVolume(state.inventory);
  if (Math.abs(state.estimate.volumeM3 - volume) > 0.01) {
    stateManager.updateEstimate(volume);
  }
  const volumeDisplay = document.createElement("div");
  volumeDisplay.className = "volume-display";
  const volumeTitle = document.createElement("div");
  volumeTitle.className = "volume-title";
  volumeTitle.textContent = t(state.lang, "summary.itemsList");
  volumeDisplay.appendChild(volumeTitle);
  if (state.inventory.length > 0) {
    const itemsList = document.createElement("div");
    itemsList.className = "volume-items-list";
    state.inventory.forEach((item) => {
      const itemRow = document.createElement("div");
      itemRow.className = "volume-item-row";
      itemRow.textContent = `${item.label}: ${item.qty}x`;
      itemsList.appendChild(itemRow);
    });
    volumeDisplay.appendChild(itemsList);
  }
  container.appendChild(volumeDisplay);
  renderNavButtons(container, stateManager);
}
function renderServices(container, stateManager) {
  const state = stateManager.getState();
  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);
  const title = document.createElement("h3");
  title.textContent = t(state.lang, "services.title");
  title.className = "configurator-step-title";
  container.appendChild(title);
  const servicesGroup = document.createElement("div");
  servicesGroup.className = "services-group";
  servicesGroup.appendChild(
    createCheckbox(
      state.services.disassembly,
      (val) => stateManager.updateState({ services: { ...state.services, disassembly: val } }),
      t(state.lang, "services.disassembly")
    )
  );
  servicesGroup.appendChild(
    createCheckbox(
      state.services.assembly,
      (val) => stateManager.updateState({ services: { ...state.services, assembly: val } }),
      t(state.lang, "services.assembly")
    )
  );
  servicesGroup.appendChild(
    createCheckbox(
      state.services.packingService,
      (val) => stateManager.updateState({ services: { ...state.services, packingService: val } }),
      t(state.lang, "services.packing")
    )
  );
  servicesGroup.appendChild(
    createCheckbox(
      state.services.insurance,
      (val) => stateManager.updateState({ services: { ...state.services, insurance: val } }),
      t(state.lang, "services.insurance")
    )
  );
  container.appendChild(servicesGroup);
  const photoSection = document.createElement("div");
  photoSection.className = "photo-section";
  const photoTitle = document.createElement("h4");
  photoTitle.textContent = tExt(state.lang, "photo.title");
  photoSection.appendChild(photoTitle);
  const photoSubtitle = document.createElement("p");
  photoSubtitle.className = "configurator-subtitle";
  photoSubtitle.textContent = tExt(state.lang, "photo.subtitle");
  photoSection.appendChild(photoSubtitle);
  const photoGrid = document.createElement("div");
  photoGrid.className = "photo-grid";
  state.photos.forEach((photo, index) => {
    const photoCard = document.createElement("div");
    photoCard.className = "photo-card";
    const img = document.createElement("img");
    img.src = photo.base64;
    img.alt = photo.name;
    img.className = "photo-preview";
    const removeBtn = document.createElement("button");
    removeBtn.textContent = tExt(state.lang, "photo.remove");
    removeBtn.className = "btn-remove-photo";
    removeBtn.onclick = () => stateManager.removePhoto(index);
    photoCard.appendChild(img);
    photoCard.appendChild(removeBtn);
    photoGrid.appendChild(photoCard);
  });
  photoSection.appendChild(photoGrid);
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/jpeg,image/png,image/heic";
  fileInput.multiple = true;
  fileInput.style.display = "none";
  fileInput.onchange = async (e) => {
    const target = e.target;
    if (target.files) {
      for (let i = 0; i < target.files.length; i++) {
        const file = target.files[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}: ${tExt(state.lang, "photo.maxSize")}`);
          continue;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const photoFile = {
            name: file.name,
            base64: event.target?.result,
            size: file.size,
            type: file.type
          };
          stateManager.addPhoto(photoFile);
        };
        reader.readAsDataURL(file);
      }
      target.value = "";
    }
  };
  const addPhotoBtn = createButton(
    tExt(state.lang, "photo.addButton"),
    () => fileInput.click(),
    "btn-secondary"
  );
  photoSection.appendChild(addPhotoBtn);
  photoSection.appendChild(fileInput);
  const photoInfo = document.createElement("p");
  photoInfo.className = "photo-info";
  photoInfo.textContent = `${tExt(state.lang, "photo.maxSize")} \u2022 ${tExt(state.lang, "photo.formats")}`;
  photoSection.appendChild(photoInfo);
  container.appendChild(photoSection);
  const dateInput = createInput(
    "date",
    state.preferredDate,
    (val) => stateManager.updateState({ preferredDate: val })
  );
  container.appendChild(createFormGroup(t(state.lang, "services.date"), dateInput));
  const timeSelect = createSelect(
    state.preferredWindow,
    [
      { value: "", label: "-" },
      { value: "morning", label: t(state.lang, "services.morning") },
      { value: "afternoon", label: t(state.lang, "services.afternoon") },
      { value: "evening", label: t(state.lang, "services.evening") }
    ],
    (val) => stateManager.updateState({ preferredWindow: val })
  );
  container.appendChild(createFormGroup(t(state.lang, "services.time"), timeSelect));
  renderNavButtons(container, stateManager);
}
function renderSummary(container, stateManager) {
  const state = stateManager.getState();
  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);
  const title = document.createElement("h3");
  title.textContent = t(state.lang, "summary.title");
  title.className = "configurator-step-title";
  container.appendChild(title);
  const summaryCard = document.createElement("div");
  summaryCard.className = "summary-card";
  let servicesHtml = "";
  if (state.services.disassembly) servicesHtml += `<li>${t(state.lang, "services.disassembly")}</li>`;
  if (state.services.assembly) servicesHtml += `<li>${t(state.lang, "services.assembly")}</li>`;
  if (state.services.packingService) servicesHtml += `<li>${t(state.lang, "services.packing")}</li>`;
  if (state.services.insurance) servicesHtml += `<li>${t(state.lang, "services.insurance")}</li>`;
  summaryCard.innerHTML = `
    <div class="summary-section">
      <h4>${t(state.lang, "summary.from")}</h4>
      <p>${state.from.address}</p>
      <p>${state.from.elevator ? t(state.lang, "yes") : t(state.lang, "no")} ${t(state.lang, "address.elevator")}, ${t(state.lang, "floor")} ${state.from.floor}</p>
    </div>
    <div class="summary-section">
      <h4>${t(state.lang, "summary.to")}</h4>
      <p>${state.to.address}</p>
      <p>${state.to.elevator ? t(state.lang, "yes") : t(state.lang, "no")} ${t(state.lang, "address.elevator")}, ${t(state.lang, "floor")} ${state.to.floor}</p>
    </div>
    ${state.distance ? `<div class="summary-section"><h4>${tExt(state.lang, "distance.result")}</h4><p>${state.distance} km</p></div>` : ""}
    <div class="summary-section">
      <h4>${t(state.lang, "summary.volume")}</h4>
      <p>${state.estimate.volumeM3.toFixed(1)} m\xB3</p>
    </div>
    <div class="summary-section">
      <h4>${t(state.lang, "summary.items")}</h4>
      <ul>
        ${state.inventory.map((item) => `<li>${item.label}: ${item.qty}x</li>`).join("")}
        ${state.other ? `<li>${state.other}</li>` : ""}
      </ul>
    </div>
    ${servicesHtml ? `<div class="summary-section"><h4>${t(state.lang, "summary.services")}</h4><ul>${servicesHtml}</ul></div>` : ""}
    ${state.photos.length > 0 ? `<div class="summary-section"><h4>${tExt(state.lang, "photo.title")}</h4><p>${state.photos.length} ${state.lang === "cs" ? "fotografi\xED" : "photos"}</p></div>` : ""}
  `;
  container.appendChild(summaryCard);
  renderNavButtons(container, stateManager);
}
function renderContact(container, stateManager) {
  const state = stateManager.getState();
  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);
  const title = document.createElement("h3");
  title.textContent = t(state.lang, "step.contact");
  title.className = "configurator-step-title";
  container.appendChild(title);
  const emailInput = createInput(
    "email",
    state.email,
    (val) => stateManager.updateState({ email: val }),
    "",
    "email"
  );
  emailInput.required = true;
  container.appendChild(createFormGroup(t(state.lang, "contact.email"), emailInput, "email"));
  const phoneInput = createInput(
    "tel",
    state.phone,
    (val) => stateManager.updateState({ phone: val }),
    "+420..."
  );
  container.appendChild(createFormGroup(t(state.lang, "contact.phone"), phoneInput));
  const consentCheckbox = createCheckbox(
    state.consent,
    (val) => stateManager.updateState({ consent: val }),
    t(state.lang, "contact.consent")
  );
  consentCheckbox.setAttribute("data-field", "consent");
  container.appendChild(consentCheckbox);
  renderNavButtons(container, stateManager, true);
}
function renderComplete(container, stateManager) {
  const state = stateManager.getState();
  const card = document.createElement("div");
  card.className = "configurator-complete-card";
  const title = document.createElement("h2");
  title.textContent = t(state.lang, "complete.title");
  title.className = "configurator-title";
  const message = document.createElement("p");
  message.textContent = t(state.lang, "complete.message");
  message.className = "configurator-subtitle";
  const closeBtn = createButton(
    t(state.lang, "btn.close"),
    () => {
      stateManager.reset();
      stateManager.setStep(STEPS.INTRO);
    },
    "btn-secondary"
  );
  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(closeBtn);
  container.appendChild(card);
}
function renderNavButtons(container, stateManager, isSubmit = false) {
  const state = stateManager.getState();
  const navContainer = document.createElement("div");
  navContainer.className = "configurator-nav";
  if (state.currentStep > STEPS.INTRO) {
    const backBtn = createButton(
      t(state.lang, "btn.back"),
      () => stateManager.prevStep(),
      "btn-secondary"
    );
    navContainer.appendChild(backBtn);
  }
  const nextBtn = createButton(
    isSubmit ? t(state.lang, "btn.submit") : t(state.lang, "btn.next"),
    async () => {
      clearErrors(container);
      const errors = validateStep(state.currentStep, state);
      if (errors.length > 0) {
        displayErrors(errors, container);
        return;
      }
      if (isSubmit) {
        const result = await submitQuote(state);
        if (result.success) {
          stateManager.nextStep();
        } else {
          alert(`Error: ${result.error || "Failed to submit"}`);
        }
      } else {
        stateManager.nextStep();
      }
    },
    "btn-primary"
  );
  navContainer.appendChild(nextBtn);
  container.appendChild(navContainer);
}

// src/configurator/index.ts
function init() {
  const root = document.getElementById("moving-configurator-root");
  if (!root) {
    return;
  }
  if (root.hasAttribute("data-initialized")) {
    return;
  }
  console.log("\u{1F680} Configurator: Initializing...");
  root.setAttribute("data-initialized", "true");
  const lang = root.getAttribute("data-lang") || "cs";
  const pageSlug = root.getAttribute("data-slug") || "unknown";
  console.log("\u{1F4CD} Configurator: Lang=" + lang + ", Slug=" + pageSlug);
  const stateManager = new StateManager(lang, pageSlug);
  stateManager.subscribe((state) => {
    render(root, stateManager);
  });
  render(root, stateManager);
  console.log("\u2705 Configurator: Initialized successfully");
}
function checkAndInit() {
  const root = document.getElementById("moving-configurator-root");
  if (root && !root.hasAttribute("data-initialized")) {
    init();
  }
}
var observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      checkAndInit();
    }
  }
});
function startObserver() {
  checkAndInit();
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startObserver);
} else {
  startObserver();
}
