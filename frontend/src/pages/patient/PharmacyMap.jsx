import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-hot-toast';
import { 
  MapPinIcon, 
  MagnifyingGlassIcon, 
  PhoneIcon, 
  ClockIcon,
  StarIcon,
  CursorArrowRaysIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Pharmacy Icon
const pharmacyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10B981" width="32" height="32">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
      <rect x="10" y="7" width="4" height="10" rx="1" fill="white"/>
      <rect x="7" y="10" width="10" height="4" rx="1" fill="white"/>
      <circle cx="12" cy="12" r="10" fill="none" stroke="#10B981" stroke-width="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// User Location Icon
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#3B82F6"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Sample pharmacy data (in a real app, this would come from an API)
const samplePharmacies = [
  {
    id: 1,
    name: "Apollo Life Pharmacy",
    address: "123 Main Street, Downtown",
    phone: "+91 9876543210",
    rating: 4.5,
    isOpen: true,
    openHours: "8:00 AM - 10:00 PM",
    lat: 28.6139 + (Math.random() - 0.5) * 0.01,
    lng: 77.2090 + (Math.random() - 0.5) * 0.01,
    distance: "0.5 km",
    services: ["24/7", "Home Delivery", "Online Orders"]
  },
  {
    id: 2,
    name: "MedPlus Health Services",
    address: "456 Park Avenue, Central Plaza",
    phone: "+91 9876543211",
    rating: 4.2,
    isOpen: true,
    openHours: "9:00 AM - 9:00 PM",
    lat: 28.6139 + (Math.random() - 0.5) * 0.02,
    lng: 77.2090 + (Math.random() - 0.5) * 0.02,
    distance: "1.2 km",
    services: ["Insurance Claims", "Health Checkups"]
  },
  {
    id: 3,
    name: "Guardian Lifecare",
    address: "789 Health Complex, Medical District",
    phone: "+91 9876543212",
    rating: 4.7,
    isOpen: false,
    openHours: "8:00 AM - 8:00 PM",
    lat: 28.6139 + (Math.random() - 0.5) * 0.015,
    lng: 77.2090 + (Math.random() - 0.5) * 0.015,
    distance: "0.8 km",
    services: ["Prescription Delivery", "Medicine Consultation"]
  },
  {
    id: 4,
    name: "Wellness Forever",
    address: "321 Shopping Mall, Retail Zone",
    phone: "+91 9876543213",
    rating: 4.4,
    isOpen: true,
    openHours: "10:00 AM - 11:00 PM",
    lat: 28.6139 + (Math.random() - 0.5) * 0.025,
    lng: 77.2090 + (Math.random() - 0.5) * 0.025,
    distance: "1.8 km",
    services: ["Beauty Products", "Health Supplements"]
  },
  {
    id: 5,
    name: "Local Medical Store",
    address: "654 Neighborhood Block, Residential Area",
    phone: "+91 9876543214",
    rating: 4.0,
    isOpen: true,
    openHours: "7:00 AM - 10:00 PM",
    lat: 28.6139 + (Math.random() - 0.5) * 0.008,
    lng: 77.2090 + (Math.random() - 0.5) * 0.008,
    distance: "0.3 km",
    services: ["Generic Medicines", "Emergency Supplies"]
  }
];

// Component to update map center when user location changes
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const PharmacyMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [searchRadius, setSearchRadius] = useState(2); // km
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default to Delhi
  const [showUserRadius, setShowUserRadius] = useState(true);
  const mapRef = useRef(null);

  // Get user's current location
  const getUserLocation = () => {
    setLoading(true);
    toast.loading('Getting your location...', { id: 'location' });

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.', { id: 'location' });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = [latitude, longitude];
        setUserLocation(newLocation);
        setMapCenter(newLocation);
        toast.success('Location found!', { id: 'location' });
        findNearbyPharmacies(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location. Using default location.', { id: 'location' });
        // Use default location and show sample pharmacies
        setUserLocation(mapCenter);
        setPharmacies(samplePharmacies);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Find nearby pharmacies (in a real app, this would query Overpass API or backend)
  const findNearbyPharmacies = async (lat, lng) => {
    try {
      // In a real implementation, you would query the Overpass API for pharmacies
      // For now, we'll simulate by adjusting sample data around user location
      const nearbyPharmacies = samplePharmacies.map(pharmacy => ({
        ...pharmacy,
        lat: lat + (Math.random() - 0.5) * (searchRadius / 111), // Rough conversion km to degrees
        lng: lng + (Math.random() - 0.5) * (searchRadius / 111),
        distance: (Math.random() * searchRadius).toFixed(1) + ' km'
      }));

      setPharmacies(nearbyPharmacies);
      toast.success(`Found ${nearbyPharmacies.length} pharmacies nearby!`);
    } catch (error) {
      console.error('Error finding pharmacies:', error);
      toast.error('Error finding nearby pharmacies');
    }
  };

  // Search pharmacies in a new area
  const searchInArea = () => {
    if (userLocation) {
      findNearbyPharmacies(userLocation[0], userLocation[1]);
    }
  };

  // Get directions to pharmacy
  const getDirections = (pharmacy) => {
    if (userLocation) {
      const url = `https://www.openstreetmap.org/directions?from=${userLocation[0]},${userLocation[1]}&to=${pharmacy.lat},${pharmacy.lng}&route=foot`;
      window.open(url, '_blank');
    } else {
      toast.error('Please enable location to get directions');
    }
  };

  // Call pharmacy
  const callPharmacy = (phone) => {
    window.open(`tel:${phone}`);
  };

  useEffect(() => {
    // Load sample pharmacies on component mount
    setPharmacies(samplePharmacies);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏥 Find Nearby Pharmacies
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Locate pharmacies near you with real-time availability, ratings, and contact information
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={getUserLocation}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <CursorArrowRaysIcon className="h-5 w-5" />
                )}
                {loading ? 'Finding Location...' : 'Use My Location'}
              </button>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Search Radius:
                </label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={searchInArea}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                Search Area
              </button>

              <div className="text-sm text-gray-600">
                Found: <span className="font-semibold text-green-600">{pharmacies.length}</span> pharmacies
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pharmacy List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 h-[600px] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="h-6 w-6 text-green-600" />
                Nearby Pharmacies
              </h2>

              <div className="space-y-4">
                {pharmacies.map((pharmacy) => (
                  <motion.div
                    key={pharmacy.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedPharmacy?.id === pharmacy.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-600">{pharmacy.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{pharmacy.address}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pharmacy.isOpen 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pharmacy.isOpen ? 'Open' : 'Closed'}
                      </span>
                      <span className="text-sm font-medium text-blue-600">{pharmacy.distance}</span>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {pharmacy.openHours}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {pharmacy.services.map((service, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          callPharmacy(pharmacy.phone);
                        }}
                        className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <PhoneIcon className="h-3 w-3" />
                        Call
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          getDirections(pharmacy);
                        }}
                        className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CursorArrowRaysIcon className="h-3 w-3" />
                        Directions
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Interactive Map
              </h2>
              
              <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200">
                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  <MapUpdater center={mapCenter} zoom={14} />

                  {/* User Location Marker */}
                  {userLocation && (
                    <>
                      <Marker position={userLocation} icon={userIcon}>
                        <Popup>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">Your Location</div>
                            <div className="text-sm text-gray-600">Current position</div>
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Search Radius Circle */}
                      {showUserRadius && (
                        <Circle
                          center={userLocation}
                          radius={searchRadius * 1000} // Convert km to meters
                          pathOptions={{
                            color: '#3B82F6',
                            fillColor: '#3B82F6',
                            fillOpacity: 0.1,
                            weight: 2
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Pharmacy Markers */}
                  {pharmacies.map((pharmacy) => (
                    <Marker
                      key={pharmacy.id}
                      position={[pharmacy.lat, pharmacy.lng]}
                      icon={pharmacyIcon}
                      eventHandlers={{
                        click: () => setSelectedPharmacy(pharmacy),
                      }}
                    >
                      <Popup>
                        <div className="w-64">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4 text-yellow-400" />
                              <span className="text-sm">{pharmacy.rating}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{pharmacy.address}</p>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              pharmacy.isOpen 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {pharmacy.isOpen ? 'Open' : 'Closed'}
                            </span>
                            <span className="text-sm font-medium text-blue-600">{pharmacy.distance}</span>
                          </div>

                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {pharmacy.openHours}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => callPharmacy(pharmacy.phone)}
                              className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <PhoneIcon className="h-3 w-3" />
                              Call
                            </button>
                            <button
                              onClick={() => getDirections(pharmacy)}
                              className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:blue-700 transition-colors"
                            >
                              <CursorArrowRaysIcon className="h-3 w-3" />
                              Directions
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Map Controls */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showUserRadius}
                      onChange={(e) => setShowUserRadius(e.target.checked)}
                      className="rounded"
                    />
                    Show search radius
                  </label>
                </div>
                
                <div className="text-sm text-gray-600">
                  🟢 Pharmacy • 🔵 Your Location
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Selected Pharmacy Details */}
        {selectedPharmacy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedPharmacy.name}</h2>
              <button
                onClick={() => setSelectedPharmacy(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <p className="text-gray-600 mb-1">{selectedPharmacy.address}</p>
                <p className="text-gray-600 mb-1">{selectedPharmacy.phone}</p>
                <div className="flex items-center gap-1 mb-1">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-600">{selectedPharmacy.rating} rating</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Hours & Status</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedPharmacy.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedPharmacy.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>
                <p className="text-gray-600">{selectedPharmacy.openHours}</p>
                <p className="text-blue-600 font-medium">{selectedPharmacy.distance} away</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPharmacy.services.map((service, index) => (
                    <span
                      key={index}
                      className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => callPharmacy(selectedPharmacy.phone)}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
              >
                <PhoneIcon className="h-5 w-5" />
                Call Pharmacy
              </button>
              <button
                onClick={() => getDirections(selectedPharmacy)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <CursorArrowRaysIcon className="h-5 w-5" />
                Get Directions
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PharmacyMap;
