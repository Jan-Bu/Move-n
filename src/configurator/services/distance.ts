const ENV_KEY = (import.meta as { env?: { VITE_MAPYCZ_KEY?: string } }).env?.VITE_MAPYCZ_KEY;
const HARDCODED_DEV_KEY =
  'eyJpIjoyNTcsImMiOjE2Njc0ODU2MjN9.c_UlvdpHGTI_Jb-TNMYlDYuIkCLJaUpi911RdlwPsAY';
const API_KEY = ENV_KEY || HARDCODED_DEV_KEY;

const MAPYCZ_ROUTING_API = 'https://api.mapy.cz/v1/routing/route';

// Calculate actual road distance using Mapy.cz Routing API
// Returns distance in kilometers
export async function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  try {
    const url = new URL(MAPYCZ_ROUTING_API);
    url.searchParams.set('apikey', API_KEY);
    url.searchParams.set('start', `${lon1},${lat1}`); // Mapy.cz uses lon,lat format
    url.searchParams.set('end', `${lon2},${lat2}`);
    url.searchParams.set('routeType', 'car_fast'); // Fastest car route
    url.searchParams.set('lang', 'cs');

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error('Routing API error:', response.status);
      // Fallback to Haversine formula
      return calculateDistanceHaversine(lat1, lon1, lat2, lon2);
    }

    const data = await response.json();

    // Extract distance from response (in meters, convert to km)
    const distanceMeters = data?.length || 0;
    let distanceKm = distanceMeters / 1000;

    console.log('📍 Routing API distance:', distanceKm, 'km');

    if (distanceKm === 0) {
      // Fallback to Haversine if routing failed
      distanceKm = calculateDistanceHaversine(lat1, lon1, lat2, lon2);
    }

    // Minimum distance for local moves (same city)
    const MIN_DISTANCE = 5;
    if (distanceKm < MIN_DISTANCE) {
      console.log(`📍 Distance ${distanceKm} km is below minimum, using ${MIN_DISTANCE} km`);
      distanceKm = MIN_DISTANCE;
    }

    return Math.round(distanceKm * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error('Error calculating route distance:', error);
    // Fallback to Haversine formula
    return calculateDistanceHaversine(lat1, lon1, lat2, lon2);
  }
}

// Haversine formula as fallback
// Returns distance in kilometers (straight line)
function calculateDistanceHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distance = R * c;

  // Minimum distance for local moves (same city)
  const MIN_DISTANCE = 5;
  if (distance < MIN_DISTANCE) {
    console.log(`📍 Haversine distance ${distance} km is below minimum, using ${MIN_DISTANCE} km`);
    distance = MIN_DISTANCE;
  }

  console.log('📍 Haversine fallback distance:', Math.round(distance * 10) / 10, 'km');
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
