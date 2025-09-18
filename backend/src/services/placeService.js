// backend/src/services/placeService.js
const fetch = require('node-fetch');

const PROVIDER = process.env.PLACES_PROVIDER || 'osm';

// Google Places API (requires API key)
async function googleNearby(lat, lng, radius = 5000, type = 'gas_station', apiKey) {
  if (!apiKey || apiKey === 'YOUR_GOOGLE_PLACES_KEY') {
    throw new Error('Google Places API key not configured');
  }
  
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API error: ${data.status}`);
  }
  
  return data;
}

// OpenStreetMap Overpass API (free)
async function osmNearby(lat, lng, radius = 5000) {
  try {
    // Use a smaller radius for more accurate results (max 10km)
    const searchRadius = Math.min(radius, 10000);
    
    console.log(`Searching for fuel stations within ${searchRadius}m of ${lat}, ${lng}`);
    
    // Enhanced Overpass query to get more name details with stricter radius
    const query = `[out:json][timeout:15];(node["amenity"="fuel"](around:${searchRadius},${lat},${lng});way["amenity"="fuel"](around:${searchRadius},${lat},${lng}););out center tags;`;
    
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FuelTrackAI/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform OSM data and get addresses for the first few stations
    const transformedElements = [];
    
    for (let i = 0; i < Math.min(data.elements.length, 10); i++) {
      const element = data.elements[i];
      const center = element.center || { lat: element.lat, lon: element.lon };
      let address = formatAddress(element.tags);
      let businessName = null;
      
      // If no proper address found, try reverse geocoding for first 8 stations
      if (address === 'Address not available' && i < 8) {
        try {
          console.log(`Getting address and business name for station ${i + 1}: ${center.lat}, ${center.lon}`);
          const geocodeResult = await reverseGeocode(center.lat, center.lon);
          address = geocodeResult.address;
          businessName = geocodeResult.businessName;
          
          // Add a delay to avoid rate limiting (Nominatim allows 1 request per second)
          await new Promise(resolve => setTimeout(resolve, 1100));
        } catch (err) {
          console.error(`Failed to get address for station ${i + 1}:`, err);
          address = `Near ${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}`;
        }
      } else if (address === 'Address not available') {
        address = `Coordinates: ${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}`;
      }
      
      // Calculate distance first to validate
      const distance = calculateDistance(lat, lng, center.lat, center.lon);
      
      // Skip stations that are too far (more than the search radius + 1km buffer)
      if (distance > radius + 1000) {
        console.log(`Skipping station ${i + 1}: Too far (${distance}m > ${radius + 1000}m)`);
        continue;
      }
      
      // Generate name using business name if available
      const stationName = getGoogleMapsStyleName(element.tags, businessName);
      
      console.log(`Station ${i + 1}: "${stationName.name}" at ${distance}m (${center.lat.toFixed(4)}, ${center.lon.toFixed(4)})`);
      
      transformedElements.push({
        id: element.id,
        name: stationName.name,
        brand: stationName.brand,
        operator: element.tags?.operator || stationName.brand || 'Unknown',
        address: address,
        lat: center.lat,
        lon: center.lon,
        tags: element.tags,
        distance: distance,
        openingHours: element.tags?.opening_hours || 'Unknown',
        fuel_types: getFuelTypes(element.tags),
        googleMapsUrl: `https://www.google.com/maps?q=${center.lat},${center.lon}`,
        googleMapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lon}`,
        coordinates: `${center.lat.toFixed(6)}, ${center.lon.toFixed(6)}`
      });
    }
    
    // Sort by distance
    transformedElements.sort((a, b) => a.distance - b.distance);
    
    return {
      elements: transformedElements.slice(0, 20) // Limit to 20 results
    };
  } catch (error) {
    console.error('OSM Overpass API error:', error);
    // Fallback to Nominatim
    return await nominatimNearby(lat, lng, radius);
  }
}

// Nominatim API fallback (free)
async function nominatimNearby(lat, lng, radius = 5000) {
  try {
    // Use a more precise bounding box calculation
    const radiusKm = Math.min(radius, 10000) / 1000; // Max 10km
    
    // More accurate degree calculation for India (approximately)
    const latDegreeKm = 110.574; // km per degree latitude
    const lngDegreeKm = 111.320 * Math.cos(lat * Math.PI / 180); // km per degree longitude at this latitude
    
    const bbox = {
      left: lng - radiusKm/lngDegreeKm,
      bottom: lat - radiusKm/latDegreeKm,
      right: lng + radiusKm/lngDegreeKm,
      top: lat + radiusKm/latDegreeKm
    };
    
    console.log(`Nominatim search bbox: ${bbox.left.toFixed(4)}, ${bbox.bottom.toFixed(4)}, ${bbox.right.toFixed(4)}, ${bbox.top.toFixed(4)}`);
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&amenity=fuel&bounded=1&viewbox=${bbox.left},${bbox.top},${bbox.right},${bbox.bottom}&limit=15&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FuelTrackAI/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const transformedElements = data
      .map(place => {
        const stationLat = parseFloat(place.lat);
        const stationLng = parseFloat(place.lon);
        const distance = calculateDistance(lat, lng, stationLat, stationLng);
        
        return {
          id: place.place_id,
          name: place.display_name.split(',')[0] || 'Fuel Station',
          brand: extractBrand(place.display_name),
          operator: 'Unknown',
          address: place.display_name,
          lat: stationLat,
          lon: stationLng,
          distance: distance
        };
      })
      .filter(station => station.distance <= radius + 1000) // Filter out stations beyond radius + 1km buffer
      .sort((a, b) => a.distance - b.distance); // Sort by distance
    
    return {
      elements: transformedElements
    };
  } catch (error) {
    console.error('Nominatim API error:', error);
    return { elements: [] };
  }
}

// Helper function to format address from OSM tags
function formatAddress(tags) {
  if (!tags) return 'Address not available';
  
  const parts = [];
  
  // Try different address formats
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:district']) parts.push(tags['addr:district']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  
  // If we have a good address, return it
  if (parts.length >= 2) {
    return parts.join(', ');
  }
  
  // If no structured address, try other location indicators
  const locationParts = [];
  if (tags['addr:street']) locationParts.push(tags['addr:street']);
  if (tags['addr:city']) locationParts.push(tags['addr:city']);
  if (tags.place) locationParts.push(tags.place);
  if (tags.highway) locationParts.push(`${tags.highway} Highway`);
  if (tags.neighbourhood) locationParts.push(tags.neighbourhood);
  
  if (locationParts.length > 0) {
    return locationParts.join(', ');
  }
  
  return 'Address not available';
}

// Helper function to extract brand from display name
function extractBrand(displayName) {
  const commonBrands = ['Shell', 'BP', 'Exxon', 'Chevron', 'Total', 'Indian Oil', 'HP', 'Reliance', 'BPCL', 'HPCL'];
  const upperName = displayName.toUpperCase();
  
  for (const brand of commonBrands) {
    if (upperName.includes(brand.toUpperCase())) {
      return brand;
    }
  }
  return 'Unknown';
}

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c * 1000; // Distance in meters
  return Math.round(distance);
}

// Enhanced reverse geocoding to get both address and business name
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&extratags=1&namedetails=1`;
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'FuelTrackAI/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`Reverse geocoding failed: ${response.status}`);
      return { address: 'Address not available', businessName: null };
    }
    
    const data = await response.json();
    
    let businessName = null;
    let address = 'Address not available';
    
    // Extract business name from various sources
    if (data.namedetails) {
      businessName = data.namedetails.name || data.namedetails['name:en'] || data.namedetails['name:local'];
    }
    
    if (!businessName && data.extratags) {
      businessName = data.extratags.name || data.extratags.brand || data.extratags.operator;
    }
    
    if (!businessName && data.name) {
      businessName = data.name;
    }
    
    // Build address
    if (data.address) {
      const addr = data.address;
      const parts = [];
      
      if (addr.house_number) parts.push(addr.house_number);
      if (addr.road || addr.street) parts.push(addr.road || addr.street);
      if (addr.neighbourhood) parts.push(addr.neighbourhood);
      if (addr.suburb) parts.push(addr.suburb);
      if (addr.city || addr.town || addr.village) {
        parts.push(addr.city || addr.town || addr.village);
      }
      if (addr.county) parts.push(addr.county);
      if (addr.state || addr.state_district) parts.push(addr.state || addr.state_district);
      if (addr.postcode) parts.push(addr.postcode);
      
      if (parts.length >= 2) {
        address = parts.join(', ');
      } else if (data.display_name) {
        let cleanAddress = data.display_name.replace(/\d+\.\d+,\s*\d+\.\d+/g, '').trim();
        cleanAddress = cleanAddress.replace(/^,\s*|,\s*$/g, '');
        address = cleanAddress || 'Address not available';
      }
    }
    
    return { address, businessName };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return { address: 'Address not available', businessName: null };
  }
}

// Generate Google Maps style station names with business name priority
function getGoogleMapsStyleName(tags, businessName = null) {
  if (!tags && !businessName) return { name: 'Fuel Station', brand: 'Unknown' };
  
  let brand = tags?.brand || tags?.operator || 'Unknown';
  let name = businessName || tags?.name || '';
  
  // If we have a business name from reverse geocoding, prioritize it
  if (businessName) {
    // If the business name already looks complete and proper, use it as is
    if (/^[A-Z][a-z]+.*(?:Petrol|Service|Station|Bunk|Petroleum|Oil|Energy|Petroleums)/i.test(businessName)) {
      return { name: businessName, brand: brand };
    }
    
    // Clean the business name
    let cleanName = cleanStationName(businessName, brand);
    
    // If it's a proper business name, add appropriate suffix
    if (cleanName && cleanName.length > 2 && !/^(HP|BP|IOCL|HPCL|BPCL)$/i.test(cleanName)) {
      // Check if it already has a business-like suffix
      if (/(?:Petroleum|Petroleums|Service|Station|Bunk|Oil|Energy)$/i.test(cleanName)) {
        return { name: cleanName, brand: brand };
      } else {
        // Add appropriate suffix based on brand or default
        const suffix = getBrandSuffix(brand);
        return { name: `${cleanName} ${suffix}`, brand: brand };
      }
    }
  }
  
  // Fallback to tag-based naming
  if (name && name !== brand) {
    // Check if name already contains business info
    if (name.toLowerCase().includes('petrol') || 
        name.toLowerCase().includes('fuel') || 
        name.toLowerCase().includes('station') ||
        name.toLowerCase().includes('service') ||
        name.toLowerCase().includes('petroleum')) {
      return { name: name, brand: brand };
    } else {
      // Add appropriate suffix
      const suffix = getBrandSuffix(brand);
      return { name: `${name} ${suffix}`, brand: brand };
    }
  }
  
  // Use brand-based naming as last resort
  const mappedName = getBrandName(brand);
  return { name: mappedName, brand: brand };
}

// Get appropriate suffix based on brand
function getBrandSuffix(brand) {
  const suffixMap = {
    'Indian Oil': 'Petrol Pump',
    'IOCL': 'Petrol Pump',
    'Hindustan Petroleum': 'Petrol Pump',
    'HPCL': 'Petrol Pump',
    'HP': 'Petrol Pump',
    'Bharat Petroleum': 'Petrol Pump',
    'BPCL': 'Petrol Pump',
    'Reliance': 'Petrol Pump',
    'Shell': 'Service Station',
    'Essar': 'Service Station',
    'Nayara': 'Energy Station'
  };
  
  return suffixMap[brand] || 'Service Station';
}

// Get brand-based name
function getBrandName(brand) {
  const brandMapping = {
    'Indian Oil': 'Indian Oil Petrol Pump',
    'IOCL': 'Indian Oil Petrol Pump',
    'Hindustan Petroleum': 'HP Petrol Pump',
    'HPCL': 'HP Petrol Pump',
    'HP': 'HP Petrol Pump',
    'Bharat Petroleum': 'BPCL Petrol Pump',
    'BPCL': 'BPCL Petrol Pump',
    'Reliance': 'Reliance Petrol Pump',
    'Shell': 'Shell Service Station',
    'Essar': 'Essar Service Station',
    'Nayara': 'Nayara Energy Station'
  };
  
  return brandMapping[brand] || (brand !== 'Unknown' ? `${brand} Service Station` : 'Fuel Station');
}

// Clean and enhance station names to match Google Maps style
function cleanStationName(name, brand) {
  if (!name) return null;
  
  // Common patterns in Indian petrol pump names
  const patterns = [
    // Remove redundant brand mentions
    new RegExp(`^${brand}\\s+`, 'i'),
    // Clean up common prefixes/suffixes
    /^(Sri|Shri|Mr\.?|Mrs\.?)\s+/i,
    /\s+(Petrol\s+Pump|Service\s+Station|Fuel\s+Station|Petrol\s+Bunk)$/i
  ];
  
  let cleanName = name.trim();
  
  // Apply cleaning patterns
  patterns.forEach(pattern => {
    cleanName = cleanName.replace(pattern, '').trim();
  });
  
  // Capitalize properly
  cleanName = cleanName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  return cleanName;
}

// Extract fuel types from tags
function getFuelTypes(tags) {
  const fuelTypes = [];
  if (tags['fuel:petrol'] === 'yes') fuelTypes.push('Petrol');
  if (tags['fuel:diesel'] === 'yes') fuelTypes.push('Diesel');
  if (tags['fuel:cng'] === 'yes') fuelTypes.push('CNG');
  if (tags['fuel:lpg'] === 'yes') fuelTypes.push('LPG');
  if (tags['fuel:electric'] === 'yes') fuelTypes.push('Electric');
  
  return fuelTypes.length > 0 ? fuelTypes : ['Petrol', 'Diesel']; // Default assumption
}

// Search for specific business names near coordinates
async function searchNearbyBusinesses(lat, lon, radius = 100) {
  try {
    const radiusKm = radius / 1000;
    const bbox = {
      left: lon - radiusKm/111,
      bottom: lat - radiusKm/111,
      right: lon + radiusKm/111,
      top: lat + radiusKm/111
    };
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&amenity=fuel&bounded=1&viewbox=${bbox.left},${bbox.top},${bbox.right},${bbox.bottom}&limit=5&addressdetails=1&extratags=1&namedetails=1`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'FuelTrackAI/1.0' }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return data.map(place => ({
      name: place.display_name.split(',')[0] || place.name || 'Fuel Station',
      fullName: place.name || place.display_name.split(',')[0],
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      distance: calculateDistance(lat, lon, parseFloat(place.lat), parseFloat(place.lon))
    })).sort((a, b) => a.distance - b.distance);
    
  } catch (error) {
    console.error('Business search error:', error);
    return [];
  }
}

module.exports = { googleNearby, osmNearby, nominatimNearby };
