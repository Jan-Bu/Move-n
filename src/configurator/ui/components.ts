import { Lang } from '../types';
import { t } from '../i18n';

export function createButton(
  label: string,
  onClick: () => void,
  className: string = 'btn-primary'
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `configurator-btn ${className}`;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

export function createInput(
  type: string,
  value: string,
  onChange: (value: string) => void,
  placeholder: string = '',
  field: string = ''
): HTMLInputElement {
  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  input.placeholder = placeholder;
  input.className = 'configurator-input';
  if (field) input.setAttribute('data-field', field);
  input.addEventListener('change', (e) => onChange((e.target as HTMLInputElement).value));
  return input;
}

export function createCheckbox(
  checked: boolean,
  onChange: (checked: boolean) => void,
  label: string
): HTMLLabelElement {
  const labelEl = document.createElement('label');
  labelEl.className = 'configurator-checkbox';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', (e) => onChange((e.target as HTMLInputElement).checked));

  const span = document.createElement('span');
  span.textContent = label;

  labelEl.appendChild(input);
  labelEl.appendChild(span);

  return labelEl;
}

export function createSelect(
  value: string,
  options: Array<{ value: string; label: string }>,
  onChange: (value: string) => void
): HTMLSelectElement {
  const select = document.createElement('select');
  select.className = 'configurator-select';

  // nejdřív přidej options
  options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    // označ předvybranou možnost (funguje spolehlivě i když nastavíme value předem)
    if (opt.value === value) option.selected = true;
    select.appendChild(option);
  });

  // teprve potom nastav value (pro případ, že selected výše neodpovídal)
  select.value = value;

  // onChange handler
  const handler = (e: Event) => onChange((e.target as HTMLSelectElement).value);
  select.addEventListener('change', handler);
  // volitelné: realtime při šipkách/klávesnici
  select.addEventListener('input', handler);

  return select;
}

export function createCounter(
  qty: number,
  onIncrement: () => void,
  onDecrement: () => void,
  onChange: (qty: number) => void
): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'configurator-counter';

  const decrementBtn = document.createElement('button');
  decrementBtn.type = 'button';
  decrementBtn.textContent = '−';
  decrementBtn.className = 'counter-btn';
  decrementBtn.addEventListener('click', onDecrement);

  const input = document.createElement('input');
  input.type = 'number';
  input.value = qty.toString();
  input.min = '0';
  input.className = 'counter-input';
  input.addEventListener('change', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value) || 0;
    onChange(Math.max(0, val));
  });

  const incrementBtn = document.createElement('button');
  incrementBtn.type = 'button';
  incrementBtn.textContent = '+';
  incrementBtn.className = 'counter-btn';
  incrementBtn.addEventListener('click', onIncrement);

  container.appendChild(decrementBtn);
  container.appendChild(input);
  container.appendChild(incrementBtn);

  return container;
}

export function createFormGroup(
  label: string,
  control: HTMLElement,
  field: string = ''
): HTMLDivElement {
  const group = document.createElement('div');
  group.className = 'configurator-form-group';
  if (field) group.setAttribute('data-field', field);

  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  labelEl.className = 'configurator-label';

  group.appendChild(labelEl);
  group.appendChild(control);

  return group;
}

export function createStepper(currentStep: number, totalSteps: number, lang: Lang): HTMLDivElement {
  const stepper = document.createElement('div');
  stepper.className = 'configurator-stepper';
  stepper.setAttribute('role', 'navigation');
  stepper.setAttribute('aria-label', 'Progress');

  const steps = [
    t(lang, 'step.addresses'),
    t(lang, 'step.inventory'),
    t(lang, 'step.services'),
    t(lang, 'step.summary'),
    t(lang, 'step.contact'),
  ];

  steps.forEach((stepName, index) => {
    const stepNumber = index + 1;
    const stepEl = document.createElement('div');
    stepEl.className = 'stepper-step';

    if (stepNumber < currentStep) {
      stepEl.classList.add('completed');
    } else if (stepNumber === currentStep) {
      stepEl.classList.add('active');
    }

    const circle = document.createElement('div');
    circle.className = 'stepper-circle';
    circle.textContent = stepNumber.toString();

    const label = document.createElement('div');
    label.className = 'stepper-label';
    label.textContent = stepName;

    stepEl.appendChild(circle);
    stepEl.appendChild(label);
    stepper.appendChild(stepEl);
  });

  return stepper;
}
