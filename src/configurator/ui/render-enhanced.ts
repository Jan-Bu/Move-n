// src/configurator/ui/renderer.ts
import { ConfiguratorState, STEPS, PhotoFile } from '../types';
import { StateManager } from '../state';
import { t } from '../i18n';
import { tExt } from '../i18n-extended';
import {
  createButton,
  createInput,
  createCheckbox,
  createFormGroup,
  createCounter,
  createSelect,
  createStepper,
} from './components';
import { validateAndShow, clearErrors } from './validation';
import { setupAutocomplete } from '../services/autocomplete';
import { trackStepView } from '../services/analytics';
import { submitQuote } from '../services/submit';
import { rooms } from '../data/rooms';

const VISIBLE_STEPS = [
  STEPS.ADDRESSES,
  STEPS.INVENTORY,
  STEPS.SERVICES,
  STEPS.SUMMARY,
  STEPS.CONTACT,
] as const;

type VisibleStep = typeof VISIBLE_STEPS[number];

function isVisibleStep(x: number): x is VisibleStep {
  return (VISIBLE_STEPS as readonly number[]).includes(x);
}

// ---------- Lifecycle cleanup (zabrání zdvojeným listenerům, „dvojkliku“ apod.) ----------
let disposers: Array<() => void> = [];

/**
 * Přijme synchronní disposer (() => void) NEBO Promise<(() => void) | void>.
 * Tím pádem zvládneme i knihovny, které se načítají lazy/async (autoComplete.js).
 */
function addDisposer(
  d: (() => void) | Promise<(() => void) | void> | undefined
) {
  if (!d) return;
  if (typeof d === 'function') {
    disposers.push(d);
    return;
  }
  // @ts-ignore – feature-detection na Promise
  if (typeof d.then === 'function') {
    (d as Promise<(() => void) | void>).then((fn) => {
      if (typeof fn === 'function') disposers.push(fn);
    });
  }
}

function cleanupAll() {
  for (const d of disposers) {
    try {
      d();
    } catch { }
  }
  disposers = [];
}

function renderStepper(container: HTMLElement, state: ConfiguratorState) {
  const visualIndex = isVisibleStep(state.currentStep)
    ? VISIBLE_STEPS.indexOf(state.currentStep as VisibleStep) + 1 // 1-based index pro správné zvýraznění „1“
    : 1;

  const stepper = createStepper(visualIndex, VISIBLE_STEPS.length, state.lang);
  container.appendChild(stepper);
}

export function render(container: HTMLElement, stateManager: StateManager): void {
  // vždy před novým renderem uklidíme staré listenery / autocomplete / atd.
  cleanupAll();

  const state = stateManager.getState();
  container.innerHTML = '';
  container.className = 'moving-configurator';

  const content = document.createElement('div');
  content.className = 'configurator-content';

  if (state.currentStep === STEPS.INTRO) {
    renderIntro(content, stateManager);
  } else {
    content.classList.add('has-step-content');
    const wrapper = document.createElement('div');
    wrapper.className = 'configurator-step-content';
    wrapper.setAttribute('data-step', String(state.currentStep));

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

    // Enter = „Další“, ale ne v textarea
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
        const next = wrapper.querySelector<HTMLButtonElement>('.configurator-nav .btn-primary');
        if (next) {
          e.preventDefault();
          next.click();
        }
      }
    });

    content.appendChild(wrapper);
  }

  container.appendChild(content);
  trackStepView(state.currentStep, getStepName(state.currentStep), state.lang, state.pageSlug);
}

function getStepName(step: number): string {
  const stepNames: Record<number, string> = {
    [STEPS.INTRO]: 'intro',
    [STEPS.ADDRESSES]: 'addresses',
    [STEPS.INVENTORY]: 'inventory',
    [STEPS.SERVICES]: 'services',
    [STEPS.SUMMARY]: 'summary',
    [STEPS.CONTACT]: 'contact',
    [STEPS.COMPLETE]: 'complete',
  };
  return stepNames[step] || 'unknown';
}

function renderIntro(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();

  const card = document.createElement('div');
  card.className = 'configurator-intro-card';

  const title = document.createElement('h2');
  title.textContent = t(state.lang, 'intro.title');
  title.className = 'configurator-title';

  const subtitle = document.createElement('p');
  subtitle.textContent = t(state.lang, 'intro.subtitle');
  subtitle.className = 'configurator-subtitle';

  const startBtn = createButton(
    t(state.lang, 'intro.cta'),
    () => stateManager.nextStep(),
    'btn-primary btn-large'
  );

  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(startBtn);
  container.appendChild(card);
}

function renderAddresses(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();

  renderStepper(container, state);

  const title = document.createElement('h3');
  title.textContent = t(state.lang, 'step.addresses');
  title.className = 'configurator-step-title';
  container.appendChild(title);

  // FROM
  const fromSection = document.createElement('div');
  fromSection.className = 'address-section';
  const fromTitle = document.createElement('h4');
  fromTitle.textContent = t(state.lang, 'address.from');
  fromSection.appendChild(fromTitle);

  const fromAddressInput = createInput(
    'text',
    state.from.address,
    (val) => stateManager.updateState({ from: { ...state.from, address: val } }),
    t(state.lang, 'address.placeholder'),
    'from.address'
  );
  fromAddressInput.autocomplete = 'off';

  // Mapy.cz autocomplete + uložíme disposer (sync i async varianta)
  addDisposer(
    setupAutocomplete(
      fromAddressInput,
      (sel) => {
        // volitelné: uložit lat/lon
        // stateManager.updateState({ from: { ...state.from, lat: sel.lat, lon: sel.lon } });
      },
      { lang: state.lang }
    )
  );

  fromSection.appendChild(
    createFormGroup(t(state.lang, 'address.label'), fromAddressInput, 'from.address')
  );

  fromSection.appendChild(
    createCheckbox(
      state.from.elevator,
      (val) => stateManager.updateState({ from: { ...state.from, elevator: val } }),
      t(state.lang, 'address.elevator')
    )
  );

  const fromFloor = createInput(
    'number',
    state.from.floor.toString(),
    (val) => stateManager.updateState({ from: { ...state.from, floor: parseInt(val) || 0 } }),
    '',
    'from.floor'
  );
  fromFloor.min = '0';
  fromFloor.max = '20';
  fromSection.appendChild(createFormGroup(t(state.lang, 'address.floor'), fromFloor, 'from.floor'));

  fromSection.appendChild(
    createCheckbox(
      state.from.narrowStairs || false,
      (val) => stateManager.updateState({ from: { ...state.from, narrowStairs: val } }),
      t(state.lang, 'address.narrowStairs')
    )
  );

  container.appendChild(fromSection);

  // TO
  const toSection = document.createElement('div');
  toSection.className = 'address-section';
  const toTitle = document.createElement('h4');
  toTitle.textContent = t(state.lang, 'address.to');
  toSection.appendChild(toTitle);

  const toAddressInput = createInput(
    'text',
    state.to.address,
    (val) => stateManager.updateState({ to: { ...state.to, address: val } }),
    t(state.lang, 'address.placeholder'),
    'to.address'
  );
  toAddressInput.autocomplete = 'off';

  addDisposer(
    setupAutocomplete(
      toAddressInput,
      (sel) => {
        // volitelné: uložit lat/lon
        // stateManager.updateState({ to: { ...state.to, lat: sel.lat, lon: sel.lon } });
      },
      { lang: state.lang }
    )
  );

  toSection.appendChild(createFormGroup(t(state.lang, 'address.label'), toAddressInput, 'to.address'));

  toSection.appendChild(
    createCheckbox(
      state.to.elevator,
      (val) => stateManager.updateState({ to: { ...state.to, elevator: val } }),
      t(state.lang, 'address.elevator')
    )
  );

  const toFloor = createInput(
    'number',
    state.to.floor.toString(),
    (val) => stateManager.updateState({ to: { ...state.to, floor: parseInt(val) || 0 } }),
    '',
    'to.floor'
  );
  toFloor.min = '0';
  toFloor.max = '20';
  toSection.appendChild(createFormGroup(t(state.lang, 'address.floor'), toFloor, 'to.floor'));

  toSection.appendChild(
    createCheckbox(
      state.to.narrowStairs || false,
      (val) => stateManager.updateState({ to: { ...state.to, narrowStairs: val } }),
      t(state.lang, 'address.narrowStairs')
    )
  );

  container.appendChild(toSection);

  if (state.distance) {
    const distanceDisplay = document.createElement('div');
    distanceDisplay.className = 'distance-display';
    distanceDisplay.textContent = `${tExt(state.lang, 'distance.result')}: ${state.distance} km`;
    container.appendChild(distanceDisplay);
  }

  renderNavButtons(container, stateManager);
}

function renderInventory(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();

  renderStepper(container, state);

  const title = document.createElement('h3');
  title.textContent = t(state.lang, 'inventory.title');
  title.className = 'configurator-step-title';
  container.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.textContent = t(state.lang, 'inventory.subtitle');
  subtitle.className = 'configurator-subtitle';
  container.appendChild(subtitle);

  rooms.forEach((room) => {
    const roomSection = document.createElement('div');
    roomSection.className = 'room-section room-accordion';

    const roomHeader = document.createElement('div');
    roomHeader.className = 'room-header';

    const roomTitle = document.createElement('h4');
    roomTitle.textContent = tExt(state.lang, `room.${room.key}`);
    roomTitle.className = 'room-title';

    const arrow = document.createElement('span');
    arrow.className = 'room-arrow';
    arrow.textContent = '▼';

    roomHeader.appendChild(roomTitle);
    roomHeader.appendChild(arrow);
    roomSection.appendChild(roomHeader);

    const grid = document.createElement('div');
    grid.className = 'inventory-grid room-content';

    room.items.forEach((item) => {
      const stateItem = state.inventory.find((i) => i.key === item.key);
      const qty = stateItem?.qty || 0;

      const card = document.createElement('div');
      card.className = 'inventory-item';

      const label = document.createElement('div');
      label.className = 'item-label';
      label.textContent = tExt(state.lang, `item.${item.key}`);

      const counter = createCounter(
        qty,
        () => stateManager.addInventoryItem(item.key, tExt(state.lang, `item.${item.key}`), 0),
        () => stateManager.removeInventoryItem(item.key),
        (newQty) => stateManager.setInventoryQty(item.key, newQty)
      );

      card.appendChild(label);
      card.appendChild(counter);
      grid.appendChild(card);
    });

    roomSection.appendChild(grid);

    roomHeader.addEventListener('click', () => {
      container.querySelectorAll('.room-accordion.expanded').forEach((el) => {
        if (el !== roomSection) el.classList.remove('expanded');
      });
      roomSection.classList.toggle('expanded');
    });

    container.appendChild(roomSection);
  });

  const otherGroup = document.createElement('div');
  otherGroup.className = 'other-items-group';
  const otherTextarea = document.createElement('textarea');
  otherTextarea.value = state.other;
  otherTextarea.placeholder = t(state.lang, 'inventory.otherPlaceholder');
  otherTextarea.className = 'configurator-textarea';
  otherTextarea.rows = 3;
  otherTextarea.addEventListener('change', (e) => {
    stateManager.updateState({ other: (e.target as HTMLTextAreaElement).value });
  });
  otherTextarea.addEventListener('blur', (e) => {
    stateManager.updateState({ other: (e.target as HTMLTextAreaElement).value });
  });
  otherGroup.appendChild(createFormGroup(t(state.lang, 'inventory.other'), otherTextarea, 'inventory'));
  container.appendChild(otherGroup);

  const volumeDisplay = document.createElement('div');
  volumeDisplay.className = 'volume-display';

  const volumeTitle = document.createElement('div');
  volumeTitle.className = 'volume-title';
  volumeTitle.textContent = t(state.lang, 'summary.itemsList');
  volumeDisplay.appendChild(volumeTitle);

  if (state.inventory.length > 0) {
    const itemsList = document.createElement('div');
    itemsList.className = 'volume-items-list';

    state.inventory.forEach((item) => {
      const itemRow = document.createElement('div');
      itemRow.className = 'volume-item-row';
      itemRow.textContent = `${item.label}: ${item.qty}x`;
      itemsList.appendChild(itemRow);
    });

    volumeDisplay.appendChild(itemsList);
  }

  container.appendChild(volumeDisplay);

  renderNavButtons(container, stateManager);
}

function renderServices(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();

  renderStepper(container, state);

  const title = document.createElement('h3');
  title.textContent = t(state.lang, 'services.title');
  title.className = 'configurator-step-title';
  container.appendChild(title);

  const servicesGroup = document.createElement('div');
  servicesGroup.className = 'services-group';

  servicesGroup.appendChild(
    createCheckbox(
      state.services.disassembly,
      (val) => stateManager.updateState({ services: { ...state.services, disassembly: val } }),
      t(state.lang, 'services.disassembly')
    )
  );

  servicesGroup.appendChild(
    createCheckbox(
      state.services.assembly,
      (val) => stateManager.updateState({ services: { ...state.services, assembly: val } }),
      t(state.lang, 'services.assembly')
    )
  );

  servicesGroup.appendChild(
    createCheckbox(
      state.services.packingService,
      (val) => stateManager.updateState({ services: { ...state.services, packingService: val } }),
      t(state.lang, 'services.packing')
    )
  );

  servicesGroup.appendChild(
    createCheckbox(
      state.services.insurance,
      (val) => stateManager.updateState({ services: { ...state.services, insurance: val } }),
      t(state.lang, 'services.insurance')
    )
  );

  container.appendChild(servicesGroup);

  // Photos
  const photoSection = document.createElement('div');
  photoSection.className = 'photo-section';

  const photoTitle = document.createElement('h4');
  photoTitle.textContent = tExt(state.lang, 'photo.title');
  photoSection.appendChild(photoTitle);

  const photoSubtitle = document.createElement('p');
  photoSubtitle.className = 'configurator-subtitle';
  photoSubtitle.textContent = tExt(state.lang, 'photo.subtitle');
  photoSection.appendChild(photoSubtitle);

  const photoGrid = document.createElement('div');
  photoGrid.className = 'photo-grid';

  state.photos.forEach((photo, index) => {
    const photoCard = document.createElement('div');
    photoCard.className = 'photo-card';

    const img = document.createElement('img');
    img.src = photo.base64;
    img.alt = photo.name;
    img.className = 'photo-preview';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = tExt(state.lang, 'photo.remove');
    removeBtn.className = 'btn-remove-photo';
    removeBtn.onclick = () => stateManager.removePhoto(index);

    photoCard.appendChild(img);
    photoCard.appendChild(removeBtn);
    photoGrid.appendChild(photoCard);
  });

  photoSection.appendChild(photoGrid);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/jpeg,image/png,image/heic';
  fileInput.multiple = true;
  fileInput.style.display = 'none';
  fileInput.onchange = async (e) => {
    const target = (e.target as HTMLInputElement);
    if (target.files) {
      for (let i = 0; i < target.files.length; i++) {
        const file = target.files[i];

        if (file.type === 'image/heic') {
          alert(tExt(state.lang, 'photo.heicNotice') || 'HEIC may not preview on some browsers.');
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}: ${tExt(state.lang, 'photo.maxSize')}`);
          continue;
        }

        try {
          const dataUrl = await downscaleToDataUrl(file, 1600, 0.82);
          const photoFile: PhotoFile = {
            name: file.name,
            base64: dataUrl,
            size: dataUrl.length,
            type: 'image/jpeg',
          };
          stateManager.addPhoto(photoFile);
        } catch (err) {
          console.error('Image processing failed', err);
        }
      }
      target.value = '';
    }
  };

  const addPhotoBtn = createButton(
    tExt(state.lang, 'photo.addButton'),
    () => fileInput.click(),
    'btn-secondary'
  );

  photoSection.appendChild(addPhotoBtn);
  photoSection.appendChild(fileInput);

  const photoInfo = document.createElement('p');
  photoInfo.className = 'photo-info';
  photoInfo.textContent = `${tExt(state.lang, 'photo.maxSize')} • ${tExt(state.lang, 'photo.formats')}`;
  photoSection.appendChild(photoInfo);

  container.appendChild(photoSection);

  // Date / Time
  const dateInput = createInput(
    'date',
    state.preferredDate,
    (val) => stateManager.updateState({ preferredDate: val }),
    '',
    'preferredDate'
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateInput.min = today.toISOString().slice(0, 10);
  container.appendChild(createFormGroup(t(state.lang, 'services.date'), dateInput, 'preferredDate'));

  const timeSelect = createSelect(
    state.preferredWindow,
    [
      { value: '', label: '-' },
      { value: 'morning', label: t(state.lang, 'services.morning') },
      { value: 'afternoon', label: t(state.lang, 'services.afternoon') },
      { value: 'evening', label: t(state.lang, 'services.evening') },
    ],
    (val) => stateManager.updateState({ preferredWindow: val as any })
  );
  container.appendChild(createFormGroup(t(state.lang, 'services.time'), timeSelect, 'preferredWindow'));

  renderNavButtons(container, stateManager);
}

function renderSummary(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();

  renderStepper(container, state);

  const title = document.createElement('h3');
  title.textContent = t(state.lang, 'summary.title');
  title.className = 'configurator-step-title';
  container.appendChild(title);

  const card = document.createElement('div');
  card.className = 'summary-card';

  const sec = (heading: string, body: Node) => {
    const wrap = document.createElement('div');
    wrap.className = 'summary-section';
    const h4 = document.createElement('h4'); h4.textContent = heading;
    wrap.appendChild(h4); wrap.appendChild(body);
    card.appendChild(wrap);
  };

  // From
  {
    const p = document.createElement('p');
    p.textContent = state.from.address;
    const p2 = document.createElement('p');
    p2.textContent = `${state.from.elevator ? t(state.lang, 'yes') : t(state.lang, 'no')} ${t(state.lang, 'address.elevator1')}, ${t(state.lang, 'floor')} ${state.from.floor}`;
    const frag = document.createDocumentFragment(); frag.append(p, p2);
    sec(t(state.lang, 'summary.from'), frag);
  }

  // To
  {
    const p = document.createElement('p');
    p.textContent = state.to.address;
    const p2 = document.createElement('p');
    p2.textContent = `${state.to.elevator ? t(state.lang, 'yes') : t(state.lang, 'no')} ${t(state.lang, 'address.elevator1')}, ${t(state.lang, 'floor')} ${state.to.floor}`;
    const frag = document.createDocumentFragment(); frag.append(p, p2);
    sec(t(state.lang, 'summary.to'), frag);
  }

  if (state.distance) {
    const p = document.createElement('p');
    p.textContent = `${state.distance} km`;
    sec(tExt(state.lang, 'distance.result'), p);
  }

  // Items
  {
    const ul = document.createElement('ul');
    state.inventory.forEach((it) => {
      const li = document.createElement('li');
      li.textContent = `${it.label}: ${it.qty}x`;
      ul.appendChild(li);
    });
    if (state.other) {
      const li = document.createElement('li'); li.textContent = state.other; ul.appendChild(li);
    }
    sec(t(state.lang, 'summary.items'), ul);
  }

  // Services
  {
    const selected = [
      state.services.disassembly && t(state.lang, 'services.disassembly'),
      state.services.assembly && t(state.lang, 'services.assembly'),
      state.services.packingService && t(state.lang, 'services.packing'),
      state.services.insurance && t(state.lang, 'services.insurance'),
    ].filter(Boolean) as string[];
    if (selected.length) {
      const ul = document.createElement('ul');
      selected.forEach((s) => { const li = document.createElement('li'); li.textContent = s; ul.appendChild(li); });
      sec(t(state.lang, 'summary.services'), ul);
    }
  }

  // Photos
  if (state.photos.length > 0) {
    const p = document.createElement('p');
    p.textContent = `${state.photos.length} ${state.lang === 'cs' ? 'fotografií' : 'photos'}`;
    sec(tExt(state.lang, 'photo.title'), p);
  }

  container.appendChild(card);
  renderNavButtons(container, stateManager);
}

function renderContact(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();

  renderStepper(container, state);

  const title = document.createElement('h3');
  title.textContent = t(state.lang, 'step.contact');
  title.className = 'configurator-step-title';
  container.appendChild(title);

  const emailInput = createInput(
    'email',
    state.email,
    (val) => stateManager.updateState({ email: val }),
    '',
    'email'
  );
  emailInput.required = true;
  container.appendChild(createFormGroup(t(state.lang, 'contact.email'), emailInput, 'email'));

  const phoneInput = createInput(
    'tel',
    state.phone,
    (val) => stateManager.updateState({ phone: val }),
    '+420...'
  );
  container.appendChild(createFormGroup(t(state.lang, 'contact.phone'), phoneInput, 'phone'));

  const consentCheckbox = createCheckbox(
    state.consent,
    (val) => stateManager.updateState({ consent: val }),
    t(state.lang, 'contact.consent')
  );
  consentCheckbox.setAttribute('data-field', 'consent');
  container.appendChild(consentCheckbox);

  renderNavButtons(container, stateManager, true);
}

function renderComplete(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();

  const card = document.createElement('div');
  card.className = 'configurator-complete-card';

  const title = document.createElement('h2');
  title.textContent = t(state.lang, 'complete.title');
  title.className = 'configurator-title';

  const message = document.createElement('p');
  message.textContent = t(state.lang, 'complete.message');
  message.className = 'configurator-subtitle';

  const closeBtn = createButton(
    t(state.lang, 'btn.close'),
    () => {
      stateManager.reset();
      stateManager.setStep(STEPS.INTRO);
    },
    'btn-secondary'
  );

  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(closeBtn);
  container.appendChild(card);
}

function renderNavButtons(container: HTMLElement, stateManager: StateManager, isSubmit: boolean = false): void {
  const state = stateManager.getState();
  const navContainer = document.createElement('div');
  navContainer.className = 'configurator-nav';

  if (state.currentStep > STEPS.INTRO && state.currentStep !== STEPS.COMPLETE) {
    const backBtn = createButton(
      t(state.lang, 'btn.back'),
      () => stateManager.prevStep(),
      'btn-secondary'
    );
    navContainer.appendChild(backBtn);
  }

  const nextBtn = createButton(
    isSubmit ? t(state.lang, 'btn.submit') : t(state.lang, 'btn.next'),
    async () => {
      if (nextBtn.disabled) return;
      nextBtn.disabled = true;

      clearErrors(container);
      const errs = validateAndShow(state.currentStep, state, container);
      if (errs.length) { nextBtn.disabled = false; return; }

      if (isSubmit) {
        try {
          const result = await submitQuote(state);
          if (result.success) stateManager.nextStep();
          else alert(`Error: ${result.error || 'Failed to submit'}`);
        } finally {
          nextBtn.disabled = false;
        }
      } else {
        stateManager.nextStep();
        nextBtn.disabled = false;
      }
    },
    'btn-primary'
  );
  navContainer.appendChild(nextBtn);

  container.appendChild(navContainer);
}

/* ------------------------------ Helpers ------------------------------ */

// POZOR: už nepoužíváme bindAutocompleteOnce – čistíme vše přes disposers + cleanupAll

async function downscaleToDataUrl(file: File, maxSide = 1600, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}
