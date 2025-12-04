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
          return (
            <Marker
              key={driver.id}
              position={[driver.currentLatitude, driver.currentLongitude]}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">
                    {driver.user?.email || `Driver ${driver.id}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Vehicle: {driver.vehiclePlateNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    License: {driver.licenseNumber}
                  </p>
                  <p className="text-xs mt-1">
                    Status: {driver.isAvailable ? '🟢 Available' : '🔴 Busy'}
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
