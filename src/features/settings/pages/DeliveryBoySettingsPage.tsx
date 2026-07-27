import React from 'react';
import { SettingsForm, SettingsField } from '../components/SettingsForm';

export function DeliveryBoySettingsPage() {
  const fields: SettingsField[] = [
    { key: 'autoAssignEnabled', label: 'Auto-Assign Orders', type: 'toggle' },
    { key: 'maxActiveAssignments', label: 'Maximum Active Assignments', type: 'number' },
    { key: 'searchRadiusKm', label: 'Search Radius (KM)', type: 'number' },
    { key: 'assignmentTimeoutSeconds', label: 'Assignment Timeout (Seconds)', type: 'number' },
    { key: 'backgroundTrackingEnabled', label: 'Background Tracking Enabled', type: 'toggle' },
    { key: 'realtimePollingIntervalSeconds', label: 'Real-time Polling Interval (Seconds)', type: 'number' },
    { key: 'codCollectionLimit', label: 'COD Collection Limit', type: 'number' },
    { key: 'autoPayoutThreshold', label: 'Auto-Payout Threshold', type: 'number' },
    { key: 'distanceCalculationMode', label: 'Distance Calculation Mode', type: 'select', options: [{label: 'Haversine', value: 'haversine'}, {label: 'Google Maps API', value: 'google_maps'}] },
    { key: 'returnDistanceIncluded', label: 'Return Distance Logic Included', type: 'toggle' },
    { key: 'verificationThresholdKm', label: 'Verification Threshold (KM)', type: 'number' }
  ];

  return (
    <SettingsForm 
      title="Delivery Boy Settings" 
      description="Manage rider assignment logic, constraints, and delivery verification."
      namespace="delivery-boy"
      fields={fields}
    />
  );
}
