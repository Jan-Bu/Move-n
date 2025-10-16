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
import { validateStep, displayErrors, clearErrors } from './validation';
import { setupAutocomplete } from '../services/autocomplete';
import { trackStepView } from '../services/analytics';
import { submitQuote } from '../services/submit';
import { calculateTotalVolume } from '../data/volumes';
import { rooms, roomItems } from '../data/rooms';

export function render(container: HTMLElement, stateManager: StateManager): void {
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

  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);

  const title = document.createElement('h3');
  title.textContent = t(state.lang, 'step.addresses');
  title.className = 'configurator-step-title';
  container.appendChild(title);

  const fromSection = document.createElement('div');
  fromSection.className = 'address-section';
  const fromTitle = document.createElement('h4');
  fromTitle.textContent = t(state.lang, 'address.from');
  fromSection.appendChild(fromTitle);

  const fromAddressInput = createInput(
    'text',
    state.from.address,
    (val) => {
      stateManager.updateState({ from: { ...state.from, address: val } });
    },
    t(state.lang, 'address.placeholder'),
    'from.address'
  );
  setupAutocomplete(fromAddressInput);
  fromSection.appendChild(createFormGroup(t(state.lang, 'address.label'), fromAddressInput, 'from.address'));

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
  fromSection.appendChild(createFormGroup(t(state.lang, 'address.floor'), fromFloor));


  fromSection.appendChild(
    createCheckbox(
      state.from.narrowStairs || false,
      (val) => stateManager.updateState({ from: { ...state.from, narrowStairs: val } }),
      t(state.lang, 'address.narrowStairs')
    )
  );

  container.appendChild(fromSection);

  const toSection = document.createElement('div');
  toSection.className = 'address-section';
  const toTitle = document.createElement('h4');
  toTitle.textContent = t(state.lang, 'address.to');
  toSection.appendChild(toTitle);

  const toAddressInput = createInput(
    'text',
    state.to.address,
    (val) => {
      stateManager.updateState({ to: { ...state.to, address: val } });
    },
    t(state.lang, 'address.placeholder'),
    'to.address'
  );
  setupAutocomplete(toAddressInput);
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
  toSection.appendChild(createFormGroup(t(state.lang, 'address.floor'), toFloor));


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

  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);

  const title = document.createElement('h3');
  title.textContent = t(state.lang, 'inventory.title');
  title.className = 'configurator-step-title';
  container.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.textContent = t(state.lang, 'inventory.subtitle');
  subtitle.className = 'configurator-subtitle';
  container.appendChild(subtitle);

  rooms.forEach((room, roomIndex) => {
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
    grid.style.display = 'none';

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
        () => stateManager.addInventoryItem(item.key, tExt(state.lang, `item.${item.key}`), item.volume),
        () => stateManager.removeInventoryItem(item.key),
        (newQty) => stateManager.setInventoryQty(item.key, newQty)
      );

      card.appendChild(label);
      card.appendChild(counter);
      grid.appendChild(card);
    });

    roomSection.appendChild(grid);

    roomHeader.addEventListener('click', () => {
      const allRooms = container.querySelectorAll('.room-accordion');
      allRooms.forEach((otherRoom) => {
        if (otherRoom !== roomSection) {
          const otherContent = otherRoom.querySelector('.room-content') as HTMLElement;
          const otherArrow = otherRoom.querySelector('.room-arrow') as HTMLElement;
          if (otherContent) otherContent.style.display = 'none';
          if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
          otherRoom.classList.remove('expanded');
        }
      });

      const isExpanded = grid.style.display === 'grid';
      grid.style.display = isExpanded ? 'none' : 'grid';
      arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      roomSection.classList.toggle('expanded', !isExpanded);
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
  otherTextarea.addEventListener('input', (e) => {
    stateManager.updateState({ other: (e.target as HTMLTextAreaElement).value });
  });
  otherGroup.appendChild(createFormGroup(t(state.lang, 'inventory.other'), otherTextarea));
  container.appendChild(otherGroup);

  const volume = calculateTotalVolume(state.inventory);
  if (Math.abs(state.estimate.volumeM3 - volume) > 0.01) {
    stateManager.updateEstimate(volume);
  }

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

  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);

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
    const target = e.target as HTMLInputElement;
    if (target.files) {
      for (let i = 0; i < target.files.length; i++) {
        const file = target.files[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}: ${tExt(state.lang, 'photo.maxSize')}`);
          continue;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const photoFile: PhotoFile = {
            name: file.name,
            base64: event.target?.result as string,
            size: file.size,
            type: file.type,
          };
          stateManager.addPhoto(photoFile);
        };
        reader.readAsDataURL(file);
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

  const dateInput = createInput(
    'date',
    state.preferredDate,
    (val) => stateManager.updateState({ preferredDate: val })
  );
  container.appendChild(createFormGroup(t(state.lang, 'services.date'), dateInput));

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
  container.appendChild(createFormGroup(t(state.lang, 'services.time'), timeSelect));

  renderNavButtons(container, stateManager);
}

function renderSummary(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();

  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);

  const title = document.createElement('h3');
  title.textContent = t(state.lang, 'summary.title');
  title.className = 'configurator-step-title';
  container.appendChild(title);

  const summaryCard = document.createElement('div');
  summaryCard.className = 'summary-card';

  let servicesHtml = '';
  if (state.services.disassembly) servicesHtml += `<li>${t(state.lang, 'services.disassembly')}</li>`;
  if (state.services.assembly) servicesHtml += `<li>${t(state.lang, 'services.assembly')}</li>`;
  if (state.services.packingService) servicesHtml += `<li>${t(state.lang, 'services.packing')}</li>`;
  if (state.services.insurance) servicesHtml += `<li>${t(state.lang, 'services.insurance')}</li>`;

  summaryCard.innerHTML = `
    <div class="summary-section">
      <h4>${t(state.lang, 'summary.from')}</h4>
      <p>${state.from.address}</p>
      <p>${state.from.elevator ? t(state.lang, 'yes') : t(state.lang, 'no')} ${t(state.lang, 'address.elevator')}, ${t(state.lang, 'floor')} ${state.from.floor}</p>
    </div>
    <div class="summary-section">
      <h4>${t(state.lang, 'summary.to')}</h4>
      <p>${state.to.address}</p>
      <p>${state.to.elevator ? t(state.lang, 'yes') : t(state.lang, 'no')} ${t(state.lang, 'address.elevator')}, ${t(state.lang, 'floor')} ${state.to.floor}</p>
    </div>
    ${state.distance ? `<div class="summary-section"><h4>${tExt(state.lang, 'distance.result')}</h4><p>${state.distance} km</p></div>` : ''}
    <div class="summary-section">
      <h4>${t(state.lang, 'summary.volume')}</h4>
      <p>${state.estimate.volumeM3.toFixed(1)} m³</p>
    </div>
    <div class="summary-section">
      <h4>${t(state.lang, 'summary.items')}</h4>
      <ul>
        ${state.inventory.map((item) => `<li>${item.label}: ${item.qty}x</li>`).join('')}
        ${state.other ? `<li>${state.other}</li>` : ''}
      </ul>
    </div>
    ${servicesHtml ? `<div class="summary-section"><h4>${t(state.lang, 'summary.services')}</h4><ul>${servicesHtml}</ul></div>` : ''}
    ${state.photos.length > 0 ? `<div class="summary-section"><h4>${tExt(state.lang, 'photo.title')}</h4><p>${state.photos.length} ${state.lang === 'cs' ? 'fotografií' : 'photos'}</p></div>` : ''}
  `;

  container.appendChild(summaryCard);

  renderNavButtons(container, stateManager);
}

function renderContact(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();

  const stepper = createStepper(state.currentStep, 5, state.lang);
  container.appendChild(stepper);

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
  container.appendChild(createFormGroup(t(state.lang, 'contact.phone'), phoneInput));

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

  if (state.currentStep > STEPS.INTRO) {
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
          alert(`Error: ${result.error || 'Failed to submit'}`);
        }
      } else {
        stateManager.nextStep();
      }
    },
    'btn-primary'
  );
  navContainer.appendChild(nextBtn);

  container.appendChild(navContainer);
}
