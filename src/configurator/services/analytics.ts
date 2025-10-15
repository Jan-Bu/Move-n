import { Lang } from '../types';

export function trackEvent(
  eventName: string,
  params: Record<string, any> = {}
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

export function trackStepView(
  step: number,
  stepName: string,
  lang: Lang,
  pageSlug: string
): void {
  trackEvent('configurator_step_view', {
    step,
    step_name: stepName,
    lang,
    page_slug: pageSlug,
  });
}

export function trackItemChange(
  itemKey: string,
  qty: number,
  lang: Lang,
  pageSlug: string
): void {
  trackEvent('configurator_item_change', {
    item_key: itemKey,
    qty,
    lang,
    page_slug: pageSlug,
  });
}

export function trackSubmitSuccess(
  lang: Lang,
  pageSlug: string,
  volumeM3: number
): void {
  trackEvent('configurator_submit_success', {
    lang,
    page_slug: pageSlug,
    volume_m3: volumeM3,
  });
}

export function trackSubmitFail(
  lang: Lang,
  pageSlug: string,
  error: string
): void {
  trackEvent('configurator_submit_fail', {
    lang,
    page_slug: pageSlug,
    error,
  });
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}
