// frontend/src/components/StationSearch.js
import React, { useState } from 'react';
import { findStations } from '../services/api';

export default function StationSearch({ onStationSelect }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [showManualInput, setShowManualInput] = useState(false);

  async function searchNearby() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser. Please enable location services.');
      return;
    }

    setLoading(true);
    setError('');
    setStations([]);

    try {
      // Request location with high accuracy
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const data = await findStations(latitude, longitude);
      
      if (data.success && data.stations) {
        // New unified format
        setStations(data.stations.map(station => ({
          name: station.name,
          vicinity: station.address,
          place_id: station.id,
          brand: station.brand,
          distance: station.distance,
          fuelTypes: station.fuelTypes,
          openingHours: station.openingHours,
          googleMapsUrl: station.googleMapsUrl,
          googleMapsDirectionsUrl: station.googleMapsDirectionsUrl,
          coordinates: station.coordinates,
          geometry: { location: { lat: station.lat, lng: station.lng } }
        })));
      } else if (data.provider === 'google' && data.data && data.data.results) {
        // Legacy Google format
        setStations(data.data.results);
      } else if (data.provider === 'osm' && data.data && data.data.elements) {
        // Legacy OSM format
        setStations(data.data.elements.map(e => ({
          name: e.name || 'Unknown Station',
          vicinity: e.address || 'Unknown Address',
          place_id: e.id,
          brand: e.brand,
          distance: e.distance,
          geometry: { location: { lat: e.lat, lng: e.lon } }
        })));
      } else {
        setStations([]);
        setError('No stations found in your area. Try expanding your search or check your location.');
      }
    } catch (err) {
      console.error('Station search error:', err);
      
      if (err.code === 1) {
        setError('❌ Location access denied. Please:\n1. Click the location icon in your browser\n2. Select "Allow" for location access\n3. Try searching again');
      } else if (err.code === 2) {
        setError('📍 Location unavailable. Please check:\n1. GPS is enabled on your device\n2. You have internet connection\n3. Try again in a few moments');
      } else if (err.code === 3) {
        setError('⏱️ Location request timed out. This might be due to:\n1. Weak GPS signal\n2. Try moving to an open area\n3. Refresh and try again');
      } else {
        setError('⚠️ Failed to find stations. Please:\n1. Check your internet connection\n2. Ensure location services are enabled\n3. Try again or add stations manually');
      }
    } finally {
      setLoading(false);
    }
  }

  async function searchManualLocation() {
    if (!manualLocation.lat || !manualLocation.lng) {
      setError('Please enter both latitude and longitude');
      return;
    }

    setLoading(true);
    setError('');
    setStations([]);

    try {
      const data = await findStations(parseFloat(manualLocation.lat), parseFloat(manualLocation.lng));
      
      if (data.success && data.stations) {
        setStations(data.stations.map(station => ({
          name: station.name,
          vicinity: station.address,
          place_id: station.id,
          brand: station.brand,
          distance: station.distance,
          fuelTypes: station.fuelTypes,
          openingHours: station.openingHours,
          googleMapsUrl: station.googleMapsUrl,
          googleMapsDirectionsUrl: station.googleMapsDirectionsUrl,
          coordinates: station.coordinates,
          geometry: { location: { lat: station.lat, lng: station.lng } }
        })));
      } else {
        setStations([]);
        setError('No stations found at the specified location.');
      }
    } catch (err) {
      console.error('Manual search error:', err);
      setError('Failed to search at the specified location. Please check coordinates and try again.');
    } finally {
      setLoading(false);
    }
  }

  function selectStation(station) {
    if (onStationSelect) {
      onStationSelect({
        name: station.name,
        placeId: station.place_id,
        address: station.vicinity || station.formatted_address,
        brand: station.brand,
        distance: station.distance
      });
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>Find Nearby Gas Stations</h5>
      </div>
      <div className="card-body">
        <div className="d-flex gap-2 mb-3">
          <button 
            className="btn btn-primary flex-fill" 
            onClick={searchNearby}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner me-2"></span>
                Searching...
              </>
            ) : (
              <>📍 Use My Location</>
            )}
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => setShowManualInput(!showManualInput)}
          >
            📝 Manual
          </button>
        </div>

        {showManualInput && (
          <div className="mb-3 p-3 bg-light rounded">
            <h6>Enter Location Manually</h6>
            <div className="row">
              <div className="col-6">
                <input
                  type="number"
                  step="any"
                  className="form-control form-control-sm"
                  placeholder="Latitude"
                  value={manualLocation.lat}
                  onChange={(e) => setManualLocation({...manualLocation, lat: e.target.value})}
                />
              </div>
              <div className="col-6">
                <input
                  type="number"
                  step="any"
                  className="form-control form-control-sm"
                  placeholder="Longitude"
                  value={manualLocation.lng}
                  onChange={(e) => setManualLocation({...manualLocation, lng: e.target.value})}
                />
              </div>
            </div>
            <button 
              className="btn btn-sm btn-success mt-2 w-100"
              onClick={searchManualLocation}
              disabled={loading}
            >
              Search This Location
            </button>
            <small className="text-muted d-block mt-1">
              💡 You can get coordinates from Google Maps by right-clicking on a location
            </small>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {stations.length > 0 && (
          <div>
            <h6>⛽ Found {stations.length} Nearby Stations:</h6>
            <small className="text-muted mb-2 d-block">
              💡 Addresses are being fetched in real-time. Click "View" to see exact location on Google Maps.
            </small>
            <div className="list-group">
              {stations.slice(0, 10).map((station, index) => (
                <div
                  key={station.place_id || index}
                  className="list-group-item"
                >
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">
                        {station.name}
                        {station.brand && station.brand !== station.name && (
                          <small className="text-muted"> ({station.brand})</small>
                        )}
                      </h6>
                      {station.distance && (
                        <small className="text-primary">📏 {station.distance}m away</small>
                      )}
                    </div>
                    <div className="btn-group btn-group-sm">
                      {station.googleMapsUrl && (
                        <a
                          href={station.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                          title="View on Google Maps"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🗺️ View
                        </a>
                      )}
                      {station.googleMapsDirectionsUrl && (
                        <a
                          href={station.googleMapsDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-success btn-sm"
                          title="Get Directions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🧭 Directions
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <p className="mb-2 text-muted">
                    📍 {station.vicinity || station.formatted_address || 'Address not available'}
                  </p>
                  
                  {station.coordinates && (
                    <p className="mb-1">
                      <small className="text-secondary">📌 {station.coordinates}</small>
                    </p>
                  )}
                  
                  {station.fuelTypes && (
                    <p className="mb-1">
                      <small className="text-info">⛽ {station.fuelTypes.join(', ')}</small>
                    </p>
                  )}
                  
                  {station.openingHours && station.openingHours !== 'Unknown' && (
                    <p className="mb-2">
                      <small className="text-warning">🕒 {station.openingHours}</small>
                    </p>
                  )}
                  
                  <button
                    className="btn btn-success btn-sm w-100"
                    onClick={() => selectStation(station)}
                  >
                    ✨ Use This Station
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <small className="text-muted">
                💡 Click on any station to auto-fill it in your fuel entry form
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}