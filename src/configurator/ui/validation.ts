import { ConfiguratorState, ValidationError, STEPS } from '../types';
import { t } from '../i18n';

// Precompiled once
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAddresses(state: ConfiguratorState): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!state.from.address?.trim()) {
    errors.push({ field: 'from.address', message: t(state.lang, 'error.required') });
  }
  if (!state.to.address?.trim()) {
    errors.push({ field: 'to.address', message: t(state.lang, 'error.required') });
  }
  return errors;
}

export function validateInventory(state: ConfiguratorState): ValidationError[] {
  const errors: ValidationError[] = [];
  const hasItems = Array.isArray(state.inventory) && state.inventory.some((item) => (item?.qty ?? 0) > 0);
  const hasOther = (state.other ?? '').trim().length > 0;

  if (!hasItems && !hasOther) {
    errors.push({ field: 'inventory', message: t(state.lang, 'error.minItems') });
  }
  return errors;
}

export function validateContact(state: ConfiguratorState): ValidationError[] {
  const errors: ValidationError[] = [];
  const email = (state.email ?? '').trim();

  if (!email) {
    errors.push({ field: 'email', message: t(state.lang, 'error.required') });
  } else if (!EMAIL_RE.test(email)) {
    errors.push({ field: 'email', message: t(state.lang, 'error.email') });
  }

  if (!state.consent) {
    errors.push({ field: 'consent', message: t(state.lang, 'error.consent') });
  }
  return errors;
}

export function validateStep(step: number, state: ConfiguratorState): ValidationError[] {
  switch (step) {
    case STEPS.ADDRESSES: return validateAddresses(state);
    case STEPS.INVENTORY: return validateInventory(state);
    case STEPS.CONTACT:   return validateContact(state);
    default:              return [];
  }
}

export function displayErrors(errors: ValidationError[], containerEl: HTMLElement): void {
  // Remove old errors and reset fields first
  clearErrors(containerEl);

  if (errors.length === 0) return;

  // Summary container (screen readers)
  const summary = document.createElement('div');
  summary.className = 'configurator-errors';
  summary.setAttribute('role', 'alert');
  summary.setAttribute('aria-live', 'polite');

  // Use a fragment to minimize reflow
  const frag = document.createDocumentFragment();
  frag.appendChild(summary);

  // Group by field so dupes don’t create multiple bubbles on same field
  const byField = new Map<string, string[]>();
  for (const e of errors) {
    byField.set(e.field, [...(byField.get(e.field) ?? []), e.message]);
  }

  byField.forEach((messages, fieldName) => {
    const fieldWrapper = containerEl.querySelector<HTMLElement>(`[data-field="${fieldName}"]`);
    const msg = messages[0]; // ukaz první, nechť zbytek je v souhrnu

    // Always append to summary (good for a11y & quick glance)
    const p = document.createElement('div');
    p.className = 'configurator-error';
    p.textContent = msg;
    summary.appendChild(p);

    // If we find a concrete field, mark it and attach inline error
    if (fieldWrapper) {
      fieldWrapper.classList.add('error');

      // Try to find focusable control inside wrapper (input/select/textarea/button)
      const control = fieldWrapper.querySelector<HTMLElement>(
        'input, select, textarea, button, [contenteditable="true"]'
      );

      const errId = `err-${fieldName.replace(/[^\w-]+/g, '-')}`;

      const inline = document.createElement('div');
      inline.className = 'configurator-error';
      inline.id = errId;
      inline.textContent = msg;

      // a11y flags
      fieldWrapper.setAttribute('aria-invalid', 'true');

      if (control) {
        const prev = control.getAttribute('aria-describedby');
        control.setAttribute('aria-describedby', prev ? `${prev} ${errId}` : errId);
        // Insert right after the control if possible, else append to wrapper
        control.insertAdjacentElement('afterend', inline);
      } else {
        fieldWrapper.appendChild(inline);
      }
    }
  });

  // Insert at the very top of the section
  containerEl.insertBefore(frag, containerEl.firstChild);
}

/**
 * Remove all error DOM + a11y flags.
 */
export function clearErrors(containerEl: HTMLElement): void {
  containerEl.querySelectorAll('.configurator-error, .configurator-errors').forEach((el) => el.remove());
  containerEl.querySelectorAll<HTMLElement>('[data-field].error').forEach((el) => {
    el.classList.remove('error');
    el.removeAttribute('aria-invalid');
    // Also clean aria-describedby from inner controls
    el.querySelectorAll<HTMLElement>('input, select, textarea, button, [contenteditable="true"]').forEach((ctrl) => {
      const desc = ctrl.getAttribute('aria-describedby');
      if (!desc) return;
      // Filter out ids that start with err-
      const kept = desc
        .split(/\s+/)
        .filter((id) => !id.startsWith('err-'))
        .join(' ')
        .trim();
      if (kept) ctrl.setAttribute('aria-describedby', kept);
      else ctrl.removeAttribute('aria-describedby');
    });
  });
}

/**
 * Convenience: validate current step, render errors, and focus first invalid field.
 * Returns the array of errors so caller can decide whether to proceed.
 */
export function validateAndShow(step: number, state: ConfiguratorState, containerEl: HTMLElement): ValidationError[] {
  const errs = validateStep(step, state);
  displayErrors(errs, containerEl);
  if (errs.length) focusFirstError(containerEl, errs);
  return errs;
}

/**
 * Move focus to the first erroneous control; if none, focus the summary box.
 */
export function focusFirstError(containerEl: HTMLElement, errors?: ValidationError[]): void {
  const firstField = (errors?.[0]?.field) ?? null;
  if (firstField) {
    const firstWrapper = containerEl.querySelector<HTMLElement>(`[data-field="${firstField}"]`);
    const focusable = firstWrapper?.querySelector<HTMLElement>('input, select, textarea, button, [tabindex], [contenteditable="true"]');
    if (focusable) {
      focusable.focus();
      return;
    }
  }
  // Fallback: focus the error summary
  const summary = containerEl.querySelector<HTMLElement>('.configurator-errors');
  summary?.focus?.();
}
