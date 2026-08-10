import { ConfiguratorState, Payload } from '../types';
import { calculateMovingPrice } from './priceCalculator';
import { trackGoogleAdsConversion, trackSubmitSuccess, trackSubmitFail } from './analytics';

export async function submitQuote(state: ConfiguratorState): Promise<{ success: boolean; error?: string }> {
  const priceEstimate = state.distance !== undefined && state.estimate.volumeM3 > 0
    ? calculateMovingPrice({
        volumeM3: state.estimate.volumeM3,
        distanceKm: state.distance,
        items: state.inventory.map(({ key, qty }) => ({ key, qty })),
        floorFrom: state.from.floor,
        floorTo: state.to.floor,
        elevatorFrom: state.from.elevatorType ?? null,
        elevatorTo: state.to.elevatorType ?? null,
        hasElevatorFrom: state.from.elevator,
        hasElevatorTo: state.to.elevator,
        heavyItemsCount: state.services.hasHeavyItems ? state.services.heavyItemsCount : 0,
      })
    : undefined;

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
    priceEstimate: priceEstimate
      ? {
          numberOfTrips: priceEstimate.numberOfTrips,
          loadTimeMinutes: priceEstimate.loadTimeMinutes,
          unloadTimeMinutes: priceEstimate.unloadTimeMinutes,
          totalHours: priceEstimate.totalHours,
          laborPrice: priceEstimate.laborPrice,
          transportPrice: priceEstimate.transportPrice,
          stairSurcharge: priceEstimate.stairSurcharge,
          heavyItemSurcharge: priceEstimate.heavyItemSurcharge,
          finalPrice: priceEstimate.finalPrice,
        }
      : undefined,
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
    trackGoogleAdsConversion();

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
