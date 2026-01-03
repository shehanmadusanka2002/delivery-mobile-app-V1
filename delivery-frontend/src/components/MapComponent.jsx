import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Create custom vehicle icons for different vehicle types
const carIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDA3YmZmIj48cGF0aCBkPSJNMTguOTIgNi4wMUMxOC43MiA1LjQyIDE4LjE2IDUgMTcuNSA1aC0xMWMtLjY2IDAtMS4yMS40Mi0xLjQyIDEuMDFMMyAxMnY4YzAgLjU1LjQ1IDEgMSAxaDFjLjU1IDAgMS0uNDUgMS0xdi0xaDEydi0xYzAgLjU1LjQ1IDEgMSAxaDFjLjU1IDAgMS0uNDUgMS0xdi04bC0yLjA4LTUuOTl6TTYuNSAxNmMtLjgzIDAtMS41LS42Ny0xLjUtMS41UzUuNjcgMTMgNi41IDEzczEuNS42NyAxLjUgMS41UzcuMzMgMTYgNi41IDE2em0xMSAwYy0uODMgMC0xLjUtLjY3LTEuNS0xLjVzLjY3LTEuNSAxLjUtMS41IDEuNS42NyAxLjUgMS41LS42NyAxLjUtMS41IDEuNXpNNSAxMWwxLjUtNC41aDExTDE5IDExSDV6Ii8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const bikeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmY2NjAwIj48cGF0aCBkPSJNMTUuNSA1LjVjMS4xIDAgMi0uOSAyLTJzLS45LTItMi0yLTIgLjktMiAyIC45IDIgMiAyek01IDEwLjVjLTIuOCAwLTUgMi4yLTUgNXMyLjIgNSA1IDUgNS0yLjIgNS01LTIuMi01LTUtNXptMCA4LjVjLTEuOSAwLTMuNS0xLjYtMy41LTMuNXMxLjYtMy41IDMuNS0zLjUgMy41IDEuNiAzLjUgMy41LTEuNiAzLjUtMy41IDMuNXptMTAuOC0xMC41Yy0uNC0uNC0xLS40LTEuNCAwbC0yLjEgMi4xLTEuNS0xLjUtLjgtLjhjLS40LS40LTEtLjQtMS40IDBzLS40IDEgMCAxLjRsLjggLjggMS41IDEuNS0yLjEgMi4xYy0uNC40LS40IDEgMCAxLjRzMSAuNCAxLjQgMGwyLjEtMi4xIDEuNSAxLjUuOC44Yy40LjQgMSAuNCAxLjQgMHMuNC0xIDAtMS40bC0uOC0uOC0xLjUtMS41IDIuMS0yLjFjLjQtLjQuNC0xIDAtMS40ek0xOSAxMC41Yy0yLjggMC01IDIuMi01IDVzMi4yIDUgNSA1IDUtMi4yIDUtNS0yLjItNS01LTV6bTAgOC41Yy0xLjkgMC0zLjUtMS42LTMuNS0zLjVzMS42LTMuNSAzLjUtMy41IDMuNSAxLjYgMy41IDMuNS0xLjYgMy41LTMuNSAzLjV6Ii8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const tukTukIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZjYzAwIj48cGF0aCBkPSJNMTcgNWgtMlYzSDl2Mkg3Yy0xLjEgMC0yIC45LTIgMnYxNGMwIDEuMS45IDIgMiAyaDEwYzEuMSAwIDItLjkgMi0yVjdjMC0xLjEtLjktMi0yLTJ6bS02IDE0Yy0xLjEgMC0yLS45LTItMnMyLS45IDItMiAyIC45IDIgMi0uOSAyLTIgMnptNiAwYy0xLjEgMC0yLS45LTItMnMyLS45IDItMiAyIC45IDIgMi0uOSAyLTIgMnpNNyA3aDEwdjZIN3Y2aC0yVjdjMC0xLjEuOS0yIDItMnptMCAwaDF2Nmg4VjdIOXYtMmg2djJoMWMxLjEgMCAyIC45IDIgMnY2SDd6Ii8+PHBhdGggZD0iTTEyIDEwYy44MyAwIDEuNS0uNjcgMS41LTEuNVMxMi44MyA3IDEyIDcgMTAuNSA3LjY3IDEwLjUgOC41IDExLjE3IDEwIDEyIDEweiIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Helper function to get the appropriate icon based on vehicle type
const getVehicleIcon = (vehicleType) => {
  if (!vehicleType) return carIcon;
  
  const type = vehicleType.toLowerCase();
  if (type.includes('tuk')) return tukTukIcon;
  if (type.includes('bike') || type.includes('motorcycle')) return bikeIcon;
  if (type.includes('car')) return carIcon;
  
  // Default to car icon if type is unknown
  return carIcon;
};

const MapComponent = ({ drivers = [] }) => {
  const colomboPosition = [6.9271, 79.8612];

  return (
    <MapContainer
      center={colomboPosition}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
      className="rounded-lg shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {drivers.map((driver) => {
        // Only show driver if they have valid coordinates
        if (driver.currentLatitude && driver.currentLongitude) {
          const vehicleIcon = getVehicleIcon(driver.vehicleType);
          
          return (
            <Marker
              key={driver.id}
              position={[driver.currentLatitude, driver.currentLongitude]}
              icon={vehicleIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-blue-600">
                    {driver.vehicleType === 'Tuk' ? '🛺' : driver.vehicleType === 'Bike' ? '🏍️' : '🚗'} Driver #{driver.id}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vehicle: {driver.vehicleType || 'N/A'}
                  </p>
                  <p className="text-xs mt-2 text-green-600 font-semibold">
                    ✅ Available
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {driver.currentLatitude.toFixed(4)}, {driver.currentLongitude.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default MapComponent;
