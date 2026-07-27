import React, { useState } from 'react';
import { useShopStore } from '../../store/shopStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MapPin, Navigation, Search, CheckCircle } from 'lucide-react';

export const GoogleMapsLocationModal = () => {
  const { isLocationModalOpen, setLocationModalOpen, currentLocation, setLocation } = useShopStore();
  const [searchInput, setSearchInput] = useState('');
  const [selectedAddr, setSelectedAddr] = useState(currentLocation);

  const presetLocations = [
    { address: 'C-12, Malviya Nagar, Jaipur, Rajasthan', pincode: '302017', lat: 26.8549, lng: 75.8236 },
    { address: 'Plot 4, C-Scheme, Ashok Nagar, Jaipur', pincode: '302001', lat: 26.9124, lng: 75.7873 },
    { address: 'Vaishali Nagar, Near Amrapali Circle, Jaipur', pincode: '302021', lat: 26.9178, lng: 75.7397 },
    { address: 'Raja Park, Near Pink Square Mall, Jaipur', pincode: '302004', lat: 26.8921, lng: 75.8322 }
  ];

  const handleUseCurrentGPS = () => {
    // Simulated geolocation using Google Maps API coordinates
    const gpsLoc = { address: 'Current GPS Location (Malviya Nagar Express Hub)', pincode: '302017', lat: 26.8549, lng: 75.8236 };
    setSelectedAddr(gpsLoc);
  };

  const handleSave = () => {
    setLocation(selectedAddr);
    setLocationModalOpen(false);
  };

  return (
    <Modal
      isOpen={isLocationModalOpen}
      onClose={() => setLocationModalOpen(false)}
      title="Select Delivery Location (Google Maps)"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* GPS Button */}
        <button
          onClick={handleUseCurrentGPS}
          className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          <Navigation className="h-4 w-4" /> Detect My Current Location via GPS
        </button>

        {/* Search Input */}
        <div>
          <Input
            placeholder="Search area, landmark or pincode in Jaipur..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            icon={<Search className="h-4 w-4 text-slate-400" />}
          />
        </div>

        {/* Simulated Google Maps Interactive Map View */}
        <div className="relative h-56 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-center p-4">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <MapPin className="h-6 w-6" />
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedAddr.address}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">10-Minute Delivery Available in this zone!</p>
          </div>
        </div>

        {/* Saved & Quick Locations */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Popular Jaipur Delivery Zones</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presetLocations.map((loc, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAddr(loc)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${selectedAddr.address === loc.address ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{loc.address}</p>
                  {selectedAddr.address === loc.address && <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0 ml-1" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Pincode: {loc.pincode}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={() => setLocationModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Confirm Location</Button>
        </div>
      </div>
    </Modal>
  );
};
