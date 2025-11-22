import { ConfiguratorState, Payload } from '../types';
import { trackSubmitSuccess, trackSubmitFail } from './analytics';

export async function submitQuote(state: ConfiguratorState): Promise<{ success: boolean; error?: string }> {
  const payload: Payload = {
    lang: state.lang,
    pageSlug: state.pageSlug,
    from: state.from,
    to: state.to,
    distance: state.distance,
    inventory: state.inventory,
    other: state.other || undefined,
    photos: state.photos,
    services: state.services,
    estimate: state.estimate,
    preferredDate: state.preferredDate || undefined,
    preferredWindow: state.preferredWindow || undefined,
    email: state.email,
    phone: state.phone || undefined,
    consent: state.consent,
    timestamp: new Date().toISOString(),
  };

  // Debug logging
  console.log('=== SUBMITTING QUOTE ===');
  console.log('From address:', payload.from);
  console.log('To address:', payload.to);
  console.log('Distance:', payload.distance);
  console.log('Volume:', payload.estimate.volumeM3);
  console.log('Full payload:', JSON.stringify(payload, null, 2));

  try {
    const apiUrl = '/.netlify/functions/send-moving-quote';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to submit quote');
    }

    trackSubmitSuccess(state.lang, state.pageSlug, state.estimate.volumeM3);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    trackSubmitFail(state.lang, state.pageSlug, errorMessage);

    console.error('Failed to submit quote:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
