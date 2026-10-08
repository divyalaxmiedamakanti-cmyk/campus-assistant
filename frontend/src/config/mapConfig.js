// ==============================================================================
// QIS COLLEGE OF ENGINEERING AND TECHNOLOGY - CAMPUS LOCATION CONFIG
// ==============================================================================
// This file centralizes the college location coordinates, address, and Google
// Maps configuration.
// ==============================================================================

// ==============================================================================
// 1. PLACE YOUR COLLEGE LATITUDE & LONGITUDE HERE
// ==============================================================================
export const COLLEGE_LOCATION = {
  name: "QIS College of Engineering and Technology",
  shortName: "QISCET",
  subtitle: "Autonomous · NAAC 'A+' Grade · NBA Accredited · Affiliated to JNTUK",
  
  // Exact Coordinates for QIS College of Engineering & Technology, Ongole:
  lat: 15.485189, // Latitude
  lng: 80.027622, // Longitude
  
  // Full Campus Address:
  address: "Vengamukkapalem, Pondur Road, Ongole, Prakasam District, Andhra Pradesh 523272, India",
  landmark: "Near Ongole Bypass / Pondur Road Junction",
  pincode: "523272",
  city: "Ongole",
  state: "Andhra Pradesh",
  country: "India",
  
  // Contact & Office Information:
  phone: "+91 92464 19542 / +91 92464 19543",
  email: "principal@qiscet.edu.in",
  admissionsEmail: "admissions@qiscet.edu.in",
  website: "https://www.qiscet.edu.in",
  officeHours: "Monday – Saturday: 09:00 AM – 05:00 PM IST",
  
  // Nearby Major Hubs & Landmarks:
  landmarks: [
    { name: "Ongole RTC Central Bus Stand", distanceKm: 8.2, approxMin: 18 },
    { name: "Ongole Railway Station (OGL)", distanceKm: 10.5, approxMin: 22 },
    { name: "Tangutur Junction", distanceKm: 14.0, approxMin: 20 },
    { name: "Singarayakonda", distanceKm: 32.0, approxMin: 35 },
    { name: "Chirala", distanceKm: 56.0, approxMin: 60 },
    { name: "Guntur City", distanceKm: 112.0, approxMin: 120 },
    { name: "Vijayawada Airport (VGA)", distanceKm: 152.0, approxMin: 160 },
  ],
};

// ==============================================================================
// 2. GOOGLE MAPS API KEY CONFIGURATION
// ==============================================================================
// Loaded securely from Vite environment variable `VITE_GOOGLE_MAPS_API_KEY`.
// Never hardcode your API key in source code.
// Set it in: frontend/.env as VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
// ==============================================================================
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Check if API key is valid (not empty and not the placeholder)
export const isGoogleMapsKeyConfigured = () => {
  return (
    Boolean(GOOGLE_MAPS_API_KEY) &&
    GOOGLE_MAPS_API_KEY.trim() !== "" &&
    !GOOGLE_MAPS_API_KEY.includes("YOUR_GOOGLE_MAPS_API_KEY")
  );
};

// ==============================================================================
// 3. HAVERSINE DISTANCE FORMULA (CLIENT-SIDE OFFLINE FALLBACK)
// ==============================================================================
// Calculates direct great-circle distance between two lat/lng coordinates in km.
// ==============================================================================
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimates road driving distance (typically ~1.25x direct distance in Indian road networks)
export function estimateRoadDistanceKm(directKm) {
  return Math.round(directKm * 1.25 * 10) / 10;
}

// Estimates driving time in minutes based on distance
export function estimateDrivingMinutes(roadKm) {
  // Average 45 km/h for mixed suburban/highway driving
  const hours = roadKm / 45;
  return Math.max(5, Math.round(hours * 60));
}

// Generates Google Maps Directions URL
export function getDirectionsUrl(originLat = null, originLng = null) {
  const dest = `${COLLEGE_LOCATION.lat},${COLLEGE_LOCATION.lng}`;
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${dest}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}
