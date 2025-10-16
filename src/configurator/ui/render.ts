import { ConfiguratorState, STEPS } from '../types';
import { StateManager } from '../state';
import { t } from '../i18n';
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
import { itemVolumes } from '../data/volumes';

const inventoryItems = [
  'wardrobe', 'bed', 'sofa', 'diningTable', 'chairs', 'fridge', 'freezer',
  'washingMachine', 'dishwasher', 'oven', 'microwave', 'tv', 'desk',
  'chestOfDrawers', 'cupboard', 'bookcase', 'babyCot', 'bike',
  'boxes_s', 'boxes_m', 'boxes_l',
];

export function render(container: HTMLElement, stateManager: StateManager): void {
  const state = stateManager.getState();
  container.innerHTML = '';
  container.className = 'moving-configurator';

  const content = document.createElement('div');
  content.className = 'configurator-content';

  switch (state.currentStep) {
    case STEPS.INTRO:
      renderIntro(content, stateManager);
      break;
    case STEPS.ADDRESSES:
      renderAddresses(content, stateManager);
      break;
    case STEPS.INVENTORY:
      renderInventory(content, stateManager);
      break;
    case STEPS.SERVICES:
      renderServices(content, stateManager);
      break;
    case STEPS.SUMMARY:
      renderSummary(content, stateManager);
      break;
    case STEPS.CONTACT:
      renderContact(content, stateManager);
      break;
    case STEPS.COMPLETE:
      renderComplete(content, stateManager);
      break;
  }

  container.appendChild(content);

  trackStepView(state.currentStep, getStepName(state.currentStep, state.lang), state.lang, state.pageSlug);
}

function getStepName(step: number, lang: any): string {
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
    (val) => stateManager.updateState({ from: { ...state.from, address: val } }),
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
    (val) => stateManager.updateState({ to: { ...state.to, address: val } }),
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

  const grid = document.createElement('div');
  grid.className = 'inventory-grid';

  inventoryItems.forEach((itemKey) => {
    const item = state.inventory.find((i) => i.key === itemKey);
    const qty = item?.qty || 0;

    const card = document.createElement('div');
    card.className = 'inventory-item';

    const label = document.createElement('div');
    label.className = 'item-label';
    label.textContent = t(state.lang, `item.${itemKey}` as any);

    const counter = createCounter(
      qty,
      () => stateManager.addInventoryItem(itemKey, t(state.lang, `item.${itemKey}` as any), itemVolumes[itemKey] || 0),
      () => stateManager.removeInventoryItem(itemKey),
      (newQty) => stateManager.setInventoryQty(itemKey, newQty)
    );

    card.appendChild(label);
    card.appendChild(counter);
    grid.appendChild(card);
  });

  container.appendChild(grid);

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
  volumeDisplay.textContent = `${t(state.lang, 'summary.volume')}: ${volume.toFixed(1)} m³`;
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
