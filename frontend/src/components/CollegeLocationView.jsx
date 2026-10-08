import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import {
  MapPin,
  Navigation,
  Crosshair,
  Compass,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  Car,
  Bus,
  Train,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  RotateCcw,
  Sparkles,
  Building2,
  Info,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Map as MapIcon,
  X,
} from "lucide-react";
import Card from "./ui/Card.jsx";
import Badge from "./ui/Badge.jsx";
import {
  COLLEGE_LOCATION,
  GOOGLE_MAPS_API_KEY,
  isGoogleMapsKeyConfigured,
  calculateDistanceKm,
  estimateRoadDistanceKm,
  estimateDrivingMinutes,
  getDirectionsUrl,
} from "../config/mapConfig.js";

// ==============================================================================
// PRESET LOCATIONS FOR FAST SELECTION & TESTING
// ==============================================================================
const PRESET_LOCATIONS = [
  { name: "Ongole RTC Central Bus Stand", lat: 15.5034, lng: 80.0445, icon: Bus, tag: "8.2 km" },
  { name: "Ongole Railway Station (OGL)", lat: 15.5126, lng: 80.0528, icon: Train, tag: "10.5 km" },
  { name: "Tangutur Junction (NH-16)", lat: 15.4055, lng: 80.0122, icon: Car, tag: "14 km" },
  { name: "Singarayakonda", lat: 15.2515, lng: 80.0354, icon: Car, tag: "32 km" },
  { name: "Chirala Town", lat: 15.8246, lng: 80.3521, icon: Car, tag: "56 km" },
  { name: "Guntur City", lat: 16.3067, lng: 80.4365, icon: Car, tag: "112 km" },
  { name: "Vijayawada Central", lat: 16.5062, lng: 80.6480, icon: Car, tag: "148 km" },
];

export default function CollegeLocationView() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const collegeMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const infoWindowRef = useRef(null);

  // States
  const [mapType, setMapType] = useState("roadmap"); // 'roadmap' | 'satellite'
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(!isGoogleMapsKeyConfigured());
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Geolocation & User position
  const [geoStatus, setGeoStatus] = useState("idle"); // 'idle' | 'requesting' | 'granted' | 'denied' | 'error'
  const [geoMessage, setGeoMessage] = useState("");
  const [userLocation, setUserLocation] = useState(null); // { lat, lng, name }
  const [distanceInfo, setDistanceInfo] = useState(null); // { directKm, roadKm, approxMin }

  // Manual location search input
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // ============================================================================
  // 1. INITIALIZE GOOGLE MAPS
  // ============================================================================
  useEffect(() => {
    let isCancelled = false;

    // Listen for Google Maps auth failures (e.g. invalid API key)
    window.gm_authFailure = () => {
      if (!isCancelled) {
        setMapError("Google Maps authentication failed (Invalid or unconfigured API Key). Switching to Interactive Map Mode.");
        setUsingFallback(true);
        setLoadingMap(false);
      }
    };

    if (!isGoogleMapsKeyConfigured()) {
      setUsingFallback(true);
      setLoadingMap(false);
      return;
    }

    setLoadingMap(true);
    setMapError(null);

    try {
      setOptions({
        key: GOOGLE_MAPS_API_KEY,
        v: "weekly",
      });

      Promise.all([
        importLibrary("maps"),
        importLibrary("marker"),
        importLibrary("routes"),
      ])
        .then(([mapsLib, markerLib, routesLib]) => {
          if (isCancelled || !mapContainerRef.current) return;
          const { Map, InfoWindow } = mapsLib;
          const { Marker } = markerLib;
          const { DirectionsService, DirectionsRenderer } = routesLib;

          // Create Map
          const map = new Map(mapContainerRef.current, {
            center: { lat: COLLEGE_LOCATION.lat, lng: COLLEGE_LOCATION.lng },
            zoom: 15,
            mapTypeId: mapType,
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: "poi.school",
                elementType: "geometry",
                stylers: [{ color: "#f7efe1" }],
              },
              {
                featureType: "poi.school",
                elementType: "labels.icon",
                stylers: [{ color: "#a9761f" }],
              },
            ],
          });
          mapInstanceRef.current = map;

          // Custom Marker for College (Using branded SVG pin with gold gradient)
          const markerSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="46" height="56" viewBox="0 0 46 56" fill="none">
              <defs>
                <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#d4af37" />
                  <stop offset="50%" stop-color="#a9761f" />
                  <stop offset="100%" stop-color="#785012" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f1e36" flood-opacity="0.35"/>
                </filter>
              </defs>
              <path d="M23 0C10.297 0 0 10.297 0 23C0 39.5 23 56 23 56C23 56 46 39.5 46 23C46 10.297 35.703 0 23 0Z" fill="url(#brassGrad)" filter="url(#shadow)"/>
              <circle cx="23" cy="22" r="14" fill="#0f1e36" />
              <circle cx="23" cy="22" r="12" fill="#faf6ee" stroke="#d4af37" stroke-width="1.5" />
              <text x="23" y="26" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0f1e36" text-anchor="middle">QIS</text>
            </svg>
          `;

          const collegeMarker = new Marker({
            position: { lat: COLLEGE_LOCATION.lat, lng: COLLEGE_LOCATION.lng },
            map,
            title: COLLEGE_LOCATION.name,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg)}`,
              scaledSize: new google.maps.Size(46, 56),
              anchor: new google.maps.Point(23, 56),
            },
          });
          collegeMarkerRef.current = collegeMarker;

          // Custom InfoWindow Content
          const infoWindowContent = document.createElement("div");
          infoWindowContent.className = "qis-infowindow-wrapper";
          infoWindowContent.innerHTML = `
            <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; max-width: 290px; color: #0f1e36;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <img src="/qis-logo.png" alt="QIS" style="width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #a9761f; object-fit: cover;" onerror="this.style.display='none'"/>
                <div>
                  <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f1e36; line-height: 1.2;">${COLLEGE_LOCATION.name}</h4>
                  <span style="font-size: 10px; color: #a9761f; font-weight: 600; text-transform: uppercase;">Autonomous · NAAC A+</span>
                </div>
              </div>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #475569; line-height: 1.4;">
                ${COLLEGE_LOCATION.address}
              </p>
              <div style="display: flex; gap: 6px;">
                <a href="${getDirectionsUrl()}" target="_blank" rel="noopener noreferrer" 
                   style="display: inline-flex; align-items: center; justify-content: center; gap: 4px; flex: 1; padding: 7px 12px; background-color: #a9761f; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 11px; font-weight: 600; text-align: center; box-shadow: 0 2px 6px rgba(169,118,31,0.3);">
                  Get Directions ↗
                </a>
                <a href="tel:${COLLEGE_LOCATION.phone.split('/')[0].trim()}" 
                   style="display: inline-flex; align-items: center; justify-content: center; padding: 7px 10px; background-color: #0f1e36; color: #faf6ee; text-decoration: none; border-radius: 8px; font-size: 11px; font-weight: 600;">
                  Call
                </a>
              </div>
            </div>
          `;

          const infoWindow = new InfoWindow({
            content: infoWindowContent,
            pixelOffset: new google.maps.Size(0, -10),
          });
          infoWindowRef.current = infoWindow;

          // Open InfoWindow by default and on click
          infoWindow.open(map, collegeMarker);
          collegeMarker.addListener("click", () => {
            infoWindow.open(map, collegeMarker);
          });

          // Initialize Directions Renderer
          const directionsRenderer = new DirectionsRenderer({
            map,
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: "#a9761f",
              strokeWeight: 5,
              strokeOpacity: 0.85,
            },
          });
          directionsRendererRef.current = directionsRenderer;

          setLoadingMap(false);
          setUsingFallback(false);
        })
        .catch((err) => {
          console.warn("Failed to load Google Maps SDK:", err);
          if (!isCancelled) {
            setMapError("Could not load Google Maps SDK. Switching to Interactive Map Mode.");
            setUsingFallback(true);
            setLoadingMap(false);
          }
        });
    } catch (err) {
      console.warn("Google Maps init error:", err);
      if (!isCancelled) {
        setMapError("Google Maps initialization failed. Switching to Interactive Map Mode.");
        setUsingFallback(true);
        setLoadingMap(false);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [mapType]);

  // ============================================================================
  // 2. GEOLOCATION "MY LOCATION" DETECTION
  // ============================================================================
  function handleGetMyLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("unavailable");
      setGeoMessage("Geolocation is not supported by your browser. You can select your starting point below.");
      return;
    }

    setGeoStatus("requesting");
    setGeoMessage("Detecting your current location coordinates…");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGeoStatus("granted");
        setGeoMessage(`Location detected successfully (Accuracy ±${Math.round(accuracy)}m).`);

        applyUserLocation(latitude, longitude, "My Current Location");
      },
      (error) => {
        setGeoStatus("denied");
        let msg = "Location permission denied. Please allow location access or choose a starting point below.";
        if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information is currently unavailable. Please pick a location below.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out. Please try again or select a starting location below.";
        }
        setGeoMessage(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }

  // Apply user coordinates to map & distance calculator
  function applyUserLocation(lat, lng, name) {
    setUserLocation({ lat, lng, name });

    // Calculate distance
    const directKm = Math.round(calculateDistanceKm(lat, lng, COLLEGE_LOCATION.lat, COLLEGE_LOCATION.lng) * 10) / 10;
    const roadKm = estimateRoadDistanceKm(directKm);
    const approxMin = estimateDrivingMinutes(roadKm);
    setDistanceInfo({ directKm, roadKm, approxMin });

    // If Google Maps is active, drop user marker and adjust bounds / directions
    if (window.google && mapInstanceRef.current) {
      const google = window.google;
      const map = mapInstanceRef.current;
      const userLatLng = new google.maps.LatLng(lat, lng);
      const collegeLatLng = new google.maps.LatLng(COLLEGE_LOCATION.lat, COLLEGE_LOCATION.lng);

      // Remove existing user marker if any
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }

      // Create pulse user marker
      const userMarker = new google.maps.Marker({
        position: userLatLng,
        map,
        title: name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2.5,
        },
      });
      userMarkerRef.current = userMarker;

      // Fit bounds to show both
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(collegeLatLng);
      bounds.extend(userLatLng);
      map.fitBounds(bounds, { top: 70, right: 70, bottom: 70, left: 70 });

      // Request directions if within reasonable driving distance (< 500 km)
      if (roadKm < 500 && directionsRendererRef.current) {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
          {
            origin: userLatLng,
            destination: collegeLatLng,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsRendererRef.current.setDirections(result);
              // Extract real distance from Google Maps result if available
              const route = result.routes[0]?.legs[0];
              if (route) {
                const distanceKm = Math.round((route.distance.value / 1000) * 10) / 10;
                const durationMin = Math.round(route.duration.value / 60);
                setDistanceInfo({ directKm, roadKm: distanceKm, approxMin: durationMin });
              }
            }
          }
        );
      }
    }
  }

  // ============================================================================
  // 3. MANUAL LOCATION SEARCH
  // ============================================================================
  function handleManualSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    // If Google Geocoding is available
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        setSearching(false);
        if (status === "OK" && results[0]) {
          const loc = results[0].geometry.location;
          applyUserLocation(loc.lat(), loc.lng(), results[0].formatted_address);
          setGeoStatus("granted");
          setGeoMessage(`Location resolved: ${results[0].formatted_address}`);
        } else {
          fallbackCitySearch(searchQuery);
        }
      });
    } else {
      setSearching(false);
      fallbackCitySearch(searchQuery);
    }
  }

  function fallbackCitySearch(query) {
    const q = query.toLowerCase();
    const match = PRESET_LOCATIONS.find((p) => p.name.toLowerCase().includes(q));
    if (match) {
      applyUserLocation(match.lat, match.lng, match.name);
      setGeoStatus("granted");
      setGeoMessage(`Resolved to nearest hub: ${match.name}`);
    } else {
      setGeoStatus("error");
      setGeoMessage(`Could not find "${query}". Please choose one of the preset hubs below.`);
    }
  }

  // Recenter map on College
  function handleRecenterCollege() {
    if (mapInstanceRef.current && window.google) {
      mapInstanceRef.current.panTo({ lat: COLLEGE_LOCATION.lat, lng: COLLEGE_LOCATION.lng });
      mapInstanceRef.current.setZoom(15);
      if (infoWindowRef.current && collegeMarkerRef.current) {
        infoWindowRef.current.open(mapInstanceRef.current, collegeMarkerRef.current);
      }
    }
  }

  // Toggle map type (roadmap vs satellite)
  function toggleMapType() {
    const nextType = mapType === "roadmap" ? "satellite" : "roadmap";
    setMapType(nextType);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(nextType);
    }
  }

  // Google Maps Embed fallback URL
  const embedUrl = `https://www.google.com/maps?q=${COLLEGE_LOCATION.lat},${COLLEGE_LOCATION.lng}&hl=en&z=15&output=embed`;

  return (
    <div className="space-y-6 pb-12">
      {/* --- TOP INSTITUTION HEADER & BADGE --- */}
      <Card className="p-6 bg-gradient-to-r from-[var(--paper-raised)] via-paper to-[var(--paper-raised)] border border-brass/30 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            {/* Official QIS College Logo */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md border-2 border-brass/60 flex items-center justify-center shrink-0 glow-brass"
            >
              <img
                src="/qis-logo.png"
                alt="QIS College of Engineering and Technology Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </motion.div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brass/15 text-brass border border-brass/40 font-semibold">
                  Campus Navigation & GPS Portal
                </span>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Geolocation Ready
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl text-ink font-bold leading-tight">
                {COLLEGE_LOCATION.name}
              </h1>
              <p className="text-xs md:text-sm text-ink-soft mt-0.5">
                {COLLEGE_LOCATION.subtitle} · Ongole, Andhra Pradesh
              </p>
            </div>
          </div>

          {/* Quick Actions Top Bar */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <motion.button
              onClick={handleGetMyLocation}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              disabled={geoStatus === "requesting"}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ink text-brass border border-brass/50 hover:border-brass text-xs font-semibold shadow-sm transition-all cursor-pointer btn-tactile"
              title="Detect your current location"
            >
              <Crosshair size={15} className={geoStatus === "requesting" ? "animate-spin text-brass" : "text-brass"} />
              <span>{geoStatus === "requesting" ? "Detecting..." : "My Location"}</span>
            </motion.button>

            <motion.a
              href={getDirectionsUrl(userLocation?.lat, userLocation?.lng)}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brass to-amber-600 text-ink font-bold text-xs shadow-md transition-all cursor-pointer glow-brass"
            >
              <Navigation size={15} />
              <span>Get Directions</span>
              <ExternalLink size={12} className="opacity-80" />
            </motion.a>
          </div>
        </div>
      </Card>

      {/* --- NOTICE / API KEY STATE BANNER --- */}
      {usingFallback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-ink flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-brass flex items-center justify-center shrink-0">
              <Info size={16} />
            </div>
            <div>
              <div className="font-semibold text-ink">Interactive Campus Map Mode (Live)</div>
              <div className="text-ink-soft text-[11px]">
                Displaying interactive Google Maps embed with full turn-by-turn navigation & distance estimation. To enable customized JavaScript API features, add your API key in <code className="px-1.5 py-0.5 rounded bg-amber-500/15 font-mono text-[10px]">frontend/.env</code>.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="px-3 py-1.5 rounded-lg bg-brass/20 text-brass hover:bg-brass hover:text-ink font-medium border border-brass/40 transition-colors shrink-0 cursor-pointer"
          >
            How to add API Key ⚙️
          </button>
        </motion.div>
      )}

      {/* --- GEOLOCATION STATUS BANNER --- */}
      {geoMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={`px-4 py-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            geoStatus === "granted"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : geoStatus === "requesting"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {geoStatus === "granted" && <CheckCircle2 size={15} className="text-emerald-500" />}
            {geoStatus === "requesting" && <Crosshair size={15} className="animate-spin text-blue-500" />}
            {(geoStatus === "denied" || geoStatus === "error" || geoStatus === "unavailable") && (
              <AlertTriangle size={15} className="text-amber-500" />
            )}
            <span>{geoMessage}</span>
          </div>
          <button
            onClick={() => setGeoMessage("")}
            className="text-ink-soft hover:text-ink opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* --- MAIN GRID: MAP + CONTROLS & DISTANCE PANEL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: INTERACTIVE MAP CONTAINER (8 Columns on Desktop) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="overflow-hidden border border-rule shadow-md relative bg-paper rounded-2xl flex flex-col">
            
            {/* Map Top Bar Controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--paper-raised)] border-b border-rule/80 text-xs gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-brass" />
                <span className="font-semibold text-ink">Ongole Campus Geo-Coordinate</span>
                <span className="font-mono text-[11px] text-ink-soft hidden sm:inline">
                  [{COLLEGE_LOCATION.lat}, {COLLEGE_LOCATION.lng}]
                </span>
              </div>

              {/* Floating Map Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMapType}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper border border-rule hover:border-brass text-ink text-xs transition-all cursor-pointer font-medium"
                  title="Toggle Map / Satellite"
                >
                  <Layers size={13} className="text-brass" />
                  <span className="capitalize">{mapType === "roadmap" ? "Satellite View" : "Street Map"}</span>
                </button>

                <button
                  onClick={handleRecenterCollege}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper border border-rule hover:border-brass text-ink text-xs transition-all cursor-pointer font-medium"
                  title="Reset center to QIS College"
                >
                  <RotateCcw size={13} className="text-brass" />
                  <span className="hidden sm:inline">Recenter</span>
                </button>
              </div>
            </div>

            {/* Map Canvas / Container */}
            <div className="relative w-full h-[420px] md:h-[500px] bg-canvas/60">
              {/* Google Maps JS Container */}
              <div
                ref={mapContainerRef}
                className={`w-full h-full ${usingFallback ? "hidden" : "block"}`}
              />

              {/* Interactive Fallback Embed when API key is missing or errored */}
              {usingFallback && (
                <iframe
                  title="QIS College of Engineering & Technology Campus Map"
                  src={embedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}

              {/* Loading State Overlay */}
              {loadingMap && !usingFallback && (
                <div className="absolute inset-0 bg-paper/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                  <div className="w-10 h-10 rounded-full border-3 border-brass/30 border-t-brass animate-spin" />
                  <span className="font-mono text-xs text-ink-soft">Loading Google Maps API…</span>
                </div>
              )}

              {/* Floating Quick Compass Badge over Map */}
              <div className="absolute bottom-4 left-4 z-10 bg-ink/90 text-paper backdrop-blur-md px-3 py-2 rounded-xl border border-brass/40 shadow-lg text-[11px] flex items-center gap-2">
                <Compass size={14} className="text-brass animate-spin-slow" />
                <div>
                  <div className="font-semibold text-paper">QISCET Main Campus</div>
                  <div className="text-[10px] text-paper/70 font-mono">Pondur Rd, Ongole</div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Manual Starting Location Search */}
            <div className="p-4 bg-[var(--paper-raised)] border-t border-rule space-y-3">
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search starting location (e.g. Ongole Railway Station, Guntur, Vijayawada)…"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-paper border border-rule focus:border-brass outline-none text-ink transition-colors"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 bg-ink text-brass border border-brass rounded-xl text-xs font-semibold hover:bg-brass hover:text-ink transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                >
                  {searching ? "Searching…" : "Calculate Route"}
                </motion.button>
              </form>

              {/* Preset Hub Location Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider shrink-0 mr-1">
                  Preset Hubs:
                </span>
                {PRESET_LOCATIONS.map((preset) => (
                  <motion.button
                    key={preset.name}
                    type="button"
                    onClick={() => applyUserLocation(preset.lat, preset.lng, preset.name)}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all shrink-0 cursor-pointer ${
                      userLocation?.name === preset.name
                        ? "bg-brass text-ink border-brass font-bold shadow-sm"
                        : "bg-paper text-ink-soft border-rule hover:border-brass hover:text-brass"
                    }`}
                  >
                    <preset.icon size={11} />
                    <span>{preset.name.split(" ")[0]}</span>
                    <span className="text-[9px] opacity-75 font-mono">({preset.tag})</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: DISTANCE CALCULATOR & CAMPUS DETAILS (4 Columns on Desktop) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. DISTANCE & TRAVEL ESTIMATE CARD */}
          <Card className="p-5 border border-rule/80 card-interactive shadow-sm bg-gradient-to-b from-paper to-[var(--paper-raised)]">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brass/15 border border-brass/40 flex items-center justify-center text-brass">
                  <Navigation size={16} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-ink">Distance & Navigation</h3>
                  <div className="text-[10px] font-mono text-ink-soft">Real-time GPS Calculation</div>
                </div>
              </div>

              {userLocation && (
                <Badge variant="success" className="text-[10px]">Location Active</Badge>
              )}
            </div>

            {distanceInfo ? (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-canvas/70 border border-brass/30">
                  <div className="text-[11px] text-ink-soft flex items-center justify-between">
                    <span>Starting From:</span>
                    <span className="font-mono text-[10px] text-brass">GPS Origin</span>
                  </div>
                  <div className="text-xs font-semibold text-ink mt-0.5 truncate" title={userLocation?.name}>
                    {userLocation?.name || "Detected Location"}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-rule/60">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-ink-soft block">Est. Driving Road</span>
                      <span className="font-display text-2xl font-bold text-brass">
                        {distanceInfo.roadKm} <span className="text-xs font-normal">km</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-ink-soft block">Travel Time (~45km/h)</span>
                      <span className="font-display text-2xl font-bold text-ink">
                        ~{distanceInfo.approxMin} <span className="text-xs font-normal">mins</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-ink-soft mt-2 flex items-center gap-1">
                    <span>Direct Air Distance: {distanceInfo.directKm} km</span>
                  </div>
                </div>

                <motion.a
                  href={getDirectionsUrl(userLocation?.lat, userLocation?.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brass to-amber-600 text-ink font-bold text-xs flex items-center justify-center gap-2 shadow-md glow-brass cursor-pointer"
                >
                  <Navigation size={14} />
                  <span>Start Turn-by-Turn GPS Navigation</span>
                  <ExternalLink size={12} />
                </motion.a>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-canvas/40 border border-rule text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-brass/10 border border-brass/30 text-brass flex items-center justify-center mx-auto">
                  <Crosshair size={18} />
                </div>
                <div className="text-xs font-medium text-ink">No Starting Location Selected</div>
                <p className="text-[11px] text-ink-soft leading-relaxed">
                  Click <b>"My Location"</b> above or pick a nearby station/bus stop to calculate road distance and travel time to campus.
                </p>
                <button
                  onClick={handleGetMyLocation}
                  className="px-3.5 py-1.5 rounded-lg bg-ink text-brass border border-brass/40 hover:border-brass text-xs font-semibold cursor-pointer"
                >
                  Detect My Location
                </button>
              </div>
            )}
          </Card>

          {/* 2. CAMPUS ADDRESS & CONTACT CARD */}
          <Card className="p-5 border border-rule/80 card-interactive shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brass/15 border border-brass/40 flex items-center justify-center text-brass">
                <Building2 size={16} />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-ink">Campus Address</h3>
                <div className="text-[10px] font-mono text-ink-soft">Vengamukkapalem, Ongole</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-brass shrink-0 mt-0.5" />
                <div className="text-ink leading-relaxed">
                  <div className="font-semibold">{COLLEGE_LOCATION.name}</div>
                  <div className="text-ink-soft text-[11px]">{COLLEGE_LOCATION.address}</div>
                  <div className="text-[10px] font-mono text-brass mt-0.5">{COLLEGE_LOCATION.landmark}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-rule/60">
                <Phone size={14} className="text-brass shrink-0" />
                <a href={`tel:${COLLEGE_LOCATION.phone.split('/')[0].trim()}`} className="text-ink hover:text-brass transition-colors">
                  {COLLEGE_LOCATION.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-brass shrink-0" />
                <a href={`mailto:${COLLEGE_LOCATION.email}`} className="text-ink hover:text-brass transition-colors">
                  {COLLEGE_LOCATION.email}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock size={14} className="text-brass shrink-0" />
                <span className="text-ink-soft text-[11px]">{COLLEGE_LOCATION.officeHours}</span>
              </div>
            </div>
          </Card>

          {/* 3. MAJOR TRANSIT HUBS */}
          <Card className="p-5 border border-rule/80 card-interactive shadow-sm space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-ink-soft font-semibold flex items-center gap-1.5">
              <Car size={13} className="text-brass" />
              <span>Transit Distances to Campus</span>
            </h4>

            <div className="space-y-2">
              {COLLEGE_LOCATION.landmarks.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-canvas/50 text-xs border border-rule/40 hover:border-brass/40 transition-colors"
                >
                  <span className="text-ink truncate mr-2">{l.name}</span>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-brass">{l.distanceKm} km</span>
                    <span className="text-[10px] text-ink-soft block font-mono">~{l.approxMin} min</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* --- MODAL: GOOGLE MAPS API SETUP GUIDE --- */}
      <AnimatePresence>
        {showApiKeyModal && (
          <div className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-paper-raised border-2 border-brass rounded-2xl shadow-2xl p-6 text-ink space-y-4"
            >
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brass/20 text-brass flex items-center justify-center">
                    <MapIcon size={17} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold">Google Maps API Setup</h3>
                    <div className="text-[11px] font-mono text-ink-soft">Environment Configuration</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="p-1 rounded-lg hover:bg-canvas text-ink-soft hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs space-y-3 leading-relaxed text-ink-soft">
                <p>
                  To switch from Interactive Embed Mode to full Google Maps JavaScript API with customized markers and interactive clustering:
                </p>

                <ol className="list-decimal list-inside space-y-2 bg-canvas/60 p-3.5 rounded-xl border border-rule font-medium text-ink">
                  <li>
                    Create a project in the{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brass underline"
                    >
                      Google Cloud Console ↗
                    </a>
                  </li>
                  <li>
                    Enable these <b>4 Google Maps APIs</b>:
                    <ul className="list-disc list-inside pl-4 pt-1 font-mono text-[11px] text-ink-soft">
                      <li>Maps JavaScript API</li>
                      <li>Places API</li>
                      <li>Geocoding API</li>
                      <li>Distance Matrix API</li>
                    </ul>
                  </li>
                  <li>Generate an API Key under <b>APIs & Services &gt; Credentials</b>.</li>
                  <li>
                    Open <code className="px-1.5 py-0.5 rounded bg-brass/15 font-mono text-brass">frontend/.env</code> and set:
                    <pre className="mt-1.5 p-2 rounded bg-ink text-brass font-mono text-[11px] overflow-x-auto">
                      VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourActualKeyHere
                    </pre>
                  </li>
                </ol>

                <p className="text-[11px]">
                  <b>Note:</b> Even without an API key, the current interactive map mode provides full zoom/pan, satellite toggle, distance calculation, and direct GPS turn-by-turn navigation!
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 rounded-xl bg-ink text-brass border border-brass font-semibold text-xs hover:bg-brass hover:text-ink transition-colors cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
