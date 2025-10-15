import { ConfiguratorState, ValidationError, STEPS } from '../types';
import { t } from '../i18n';

export function validateAddresses(state: ConfiguratorState): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!state.from.address.trim()) {
    errors.push({
      field: 'from.address',
      message: t(state.lang, 'error.required'),
    });
  }

  if (!state.to.address.trim()) {
    errors.push({
      field: 'to.address',
      message: t(state.lang, 'error.required'),
    });
  }

  return errors;
}

export function validateInventory(state: ConfiguratorState): ValidationError[] {
  const errors: ValidationError[] = [];

  const hasItems = state.inventory.length > 0 && state.inventory.some((item) => item.qty > 0);
  const hasOther = state.other.trim().length > 0;

  if (!hasItems && !hasOther) {
    errors.push({
      field: 'inventory',
      message: t(state.lang, 'error.minItems'),
    });
  }

  return errors;
}

export function validateContact(state: ConfiguratorState): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!state.email.trim()) {
    errors.push({
      field: 'email',
      message: t(state.lang, 'error.required'),
    });
  } else if (!isValidEmail(state.email)) {
    errors.push({
      field: 'email',
      message: t(state.lang, 'error.email'),
    });
  }

  if (!state.consent) {
    errors.push({
      field: 'consent',
      message: t(state.lang, 'error.consent'),
    });
  }

  return errors;
}

export function validateStep(step: number, state: ConfiguratorState): ValidationError[] {
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

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function displayErrors(errors: ValidationError[], containerEl: HTMLElement): void {
  const existingErrors = containerEl.querySelectorAll('.configurator-error');
  existingErrors.forEach((el) => el.remove());

  if (errors.length === 0) return;

  const errorContainer = document.createElement('div');
  errorContainer.className = 'configurator-errors';
  errorContainer.setAttribute('role', 'alert');
  errorContainer.setAttribute('aria-live', 'polite');

  errors.forEach((error) => {
    const errorEl = document.createElement('div');
    errorEl.className = 'configurator-error';
    errorEl.textContent = error.message;

    const field = containerEl.querySelector(`[data-field="${error.field}"]`);
    if (field) {
      field.classList.add('error');
      field.parentElement?.appendChild(errorEl);
    } else {
      errorContainer.appendChild(errorEl);
    }
  });

  if (errorContainer.children.length > 0) {
    containerEl.insertBefore(errorContainer, containerEl.firstChild);
  }
}

export function clearErrors(containerEl: HTMLElement): void {
  const errors = containerEl.querySelectorAll('.configurator-error, .configurator-errors');
  errors.forEach((el) => el.remove());

  const errorFields = containerEl.querySelectorAll('.error');
  errorFields.forEach((el) => el.classList.remove('error'));
}
