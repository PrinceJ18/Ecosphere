import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Car, Bike, Info, Flame, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DEMO_LOCATIONS } from '../lib/seed-data';
import { MapLocation, TripOption } from '../types';

const FILTERS = [
  { type: 'recycling', label: 'Recycling', icon: '♻️' },
  { type: 'ev_charging', label: 'EV Charging', icon: '⚡' },
  { type: 'green_park', label: 'Parks', icon: '🌳' },
  { type: 'eco_store', label: 'Eco Stores', icon: '🌿' },
  { type: 'water_refill', label: 'Water Refill', icon: '💧' },
  { type: 'tree_plantation', label: 'Plantations', icon: '🌲' },
];

// Helper to center map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(FILTERS.map(f => f.type)));
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [tripOptions, setTripOptions] = useState<TripOption[]>([]);
  const [origin, setOrigin] = useState('My Location (NYC Center)');

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const filteredLocations = DEMO_LOCATIONS.filter(l => activeFilters.has(l.type));

  // Custom Icon generator using Leaflet divIcon
  const createCustomIcon = (iconText: string, isSelected: boolean) => {
    return L.divIcon({
      html: `<div class="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border-2 transition-all ${
        isSelected 
          ? 'border-emerald-500 bg-emerald-500/20 dark:bg-emerald-500/30 scale-110' 
          : 'border-white/50 bg-white dark:bg-slate-900'
      }" style="box-shadow: 0 4px 10px rgba(0,0,0,0.3); backdrop-filter: blur(8px);">${iconText}</div>`,
      className: 'custom-map-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  // Generate trip comparison options when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      // Mock calculation based on selected location coordinate distance from central point (40.718, -73.998)
      const latDiff = Math.abs(selectedLocation.lat - 40.718);
      const lngDiff = Math.abs(selectedLocation.lng - -73.998);
      const distance = Math.round((latDiff + lngDiff) * 111 * 10) / 10; // Approx km

      const options: TripOption[] = [
        {
          mode: 'walk',
          distance,
          duration: Math.round(distance * 12),
          co2: 0,
          cost: 0,
          calories: Math.round(distance * 60),
          icon: '🚶',
        },
        {
          mode: 'bike',
          distance,
          duration: Math.round(distance * 4),
          co2: 0,
          cost: 0,
          calories: Math.round(distance * 35),
          icon: '🚲',
        },
        {
          mode: 'metro',
          distance,
          duration: Math.round(distance * 3 + 5),
          co2: Math.round(distance * 0.041 * 100) / 100,
          cost: 2.90,
          calories: Math.round(distance * 5),
          icon: '🚇',
        },
        {
          mode: 'ev',
          distance,
          duration: Math.round(distance * 2.5),
          co2: Math.round(distance * 0.053 * 100) / 100,
          cost: Math.round(distance * 0.15 * 100) / 100,
          calories: 0,
          icon: '⚡',
        },
        {
          mode: 'car',
          distance,
          duration: Math.round(distance * 2.5),
          co2: Math.round(distance * 0.21 * 100) / 100,
          cost: Math.round(distance * 0.35 * 100) / 100,
          calories: 0,
          icon: '🚗',
        },
      ];

      setTripOptions(options);
    }
  }, [selectedLocation]);

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Eco Map</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Find sustainable locations and plan green routes</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {FILTERS.map(f => (
          <motion.button
            key={f.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleFilter(f.type)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
            style={
              activeFilters.has(f.type)
                ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }
                : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
            }
          >
            <span>{f.icon}</span> {f.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Leaflet Map */}
        <div className="lg:col-span-2 stat-card stat-card--flush overflow-hidden relative" style={{ minHeight: '520px' }}>
          <div className="w-full h-full min-h-[520px] rounded-2xl z-10">
            <MapContainer
              center={[40.7180, -73.998]}
              zoom={14}
              scrollWheelZoom={true}
              style={{ height: '520px', width: '100%', borderRadius: '1rem' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="map-tiles-dark"
              />

              {selectedLocation && (
                <RecenterMap center={[selectedLocation.lat, selectedLocation.lng]} />
              )}

              {filteredLocations.map(loc => (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  icon={createCustomIcon(loc.icon, selectedLocation?.id === loc.id)}
                  eventHandlers={{
                    click: () => {
                      setSelectedLocation(loc);
                    },
                  }}
                >
                  <Popup>
                    <div className="p-1 max-w-[200px]">
                      <div className="font-semibold text-sm flex items-center gap-1">
                        <span>{loc.icon}</span>
                        <span>{loc.name}</span>
                      </div>
                      <p className="text-xs mt-1 text-slate-500">{loc.address}</p>
                      <button
                        onClick={() => setOptimizerOpen(true)}
                        className="mt-2 w-full py-1 text-center bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Navigation className="w-3 h-3" /> Optimize Trip
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Map label */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg text-xs z-20 shadow-lg border" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', borderColor: 'var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>📍 NYC Eco Map — {filteredLocations.length} locations active</span>
          </div>
        </div>

        {/* Location List & Trip Optimizer Panel */}
        <div className="space-y-6 relative overflow-hidden" style={{ minHeight: '520px' }}>
          <AnimatePresence mode="wait">
            {!optimizerOpen ? (
              <motion.div
                key="list-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nearby Locations</h3>
                  {selectedLocation && (
                    <button
                      onClick={() => setOptimizerOpen(true)}
                      className="text-xs text-emerald-500 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Plan Route
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredLocations.map((loc, i) => (
                    <motion.div
                      key={loc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedLocation(loc)}
                      className="stat-card stat-card--compact cursor-pointer transition-all hover:scale-[1.01]"
                      style={selectedLocation?.id === loc.id ? { border: '1px solid rgba(16, 185, 129, 0.4)', background: 'var(--bg-glass)' } : {}}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl mt-0.5">{loc.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{loc.name}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{loc.address}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs">
                            <span className="text-amber-500">⭐ {loc.rating}</span>
                            {loc.openHours && <span style={{ color: 'var(--text-tertiary)' }}>{loc.openHours}</span>}
                          </div>
                        </div>
                      </div>
                      {selectedLocation?.id === loc.id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-2 pt-2 border-t text-xs space-y-2" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                          <p>{loc.description}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOptimizerOpen(true);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-2 mt-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 font-semibold rounded-lg transition-colors text-xs"
                          >
                            <Navigation className="w-3.5 h-3.5" /> Optimize Route to Site
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="optimizer-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="stat-card space-y-4"
              >
                <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                  <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <Navigation className="w-4 h-4 text-emerald-500" />
                    Trip Optimizer
                  </h3>
                  <button
                    onClick={() => setOptimizerOpen(false)}
                    className="text-xs text-rose-500 font-medium hover:underline"
                  >
                    Back to List
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>From:</label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full text-xs"
                      style={{ background: 'var(--bg-secondary)' }}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>To:</label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border text-xs" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
                      <span>{selectedLocation?.icon}</span>
                      <span className="font-semibold truncate">{selectedLocation?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Travel Mode Comparison</h4>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                    {tripOptions.map((opt) => {
                      const co2Saved = Math.max(0, Math.round((tripOptions[4].co2 - opt.co2) * 100) / 100);
                      const isZeroCo2 = opt.co2 === 0;

                      return (
                        <div
                          key={opt.mode}
                          className="p-3 rounded-xl border flex flex-col gap-1"
                          style={{
                            borderColor: 'var(--border-color)',
                            background: isZeroCo2 ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                              <span>{opt.icon}</span>
                              <span className="capitalize">{opt.mode === 'ev' ? 'Electric Vehicle' : opt.mode === 'metro' ? 'Public Transit' : opt.mode}</span>
                            </span>
                            <span className="text-xs font-bold" style={{ color: isZeroCo2 ? '#10b981' : 'var(--text-secondary)' }}>
                              {opt.co2} kg CO₂
                            </span>
                          </div>

                          <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                            <span>{opt.distance} km • {opt.duration} mins</span>
                            <span>{opt.cost > 0 ? `$${opt.cost.toFixed(2)}` : 'Free'} • {opt.calories > 0 ? `${opt.calories} kcal` : '0 kcal'}</span>
                          </div>

                          {co2Saved > 0 && (
                            <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-emerald-500">
                              <Flame className="w-3 h-3 fill-current" />
                              Saves {co2Saved} kg CO₂ vs Petrol Car
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
