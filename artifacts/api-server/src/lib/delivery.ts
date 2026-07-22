// Hub location: Kanuru, Mythri Nagar, Vijayawada
export const HUB_LAT = 16.5193;
export const HUB_LNG = 80.6212;

// Free delivery within FREE_KM km; ₹RATE_PER_KM per km beyond that
export const FREE_KM = 5;
export const RATE_PER_KM = 5;

/**
 * Haversine distance between two lat/lng coordinates in km
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate delivery charge in ₹
 * Free up to FREE_KM km, ₹RATE_PER_KM per km beyond
 */
export function calcDeliveryCharge(distanceKm: number): number {
  if (distanceKm <= FREE_KM) return 0;
  return Math.round((distanceKm - FREE_KM) * RATE_PER_KM);
}
