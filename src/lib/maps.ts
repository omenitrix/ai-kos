export function mapsEmbedUrl(lat?: number, lng?: number) {
  if (!lat || !lng) return null;
  if (process.env.NEXT_PUBLIC_MAPS_API_KEY) {
    return "https://www.google.com/maps/embed/v1/view?key=" + process.env.NEXT_PUBLIC_MAPS_API_KEY + "&center=" + lat + "," + lng + "&zoom=15";
  }
  return null;
}
