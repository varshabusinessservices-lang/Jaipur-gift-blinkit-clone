import React from 'react';
import { SettingsForm, SettingsField } from '../components/SettingsForm';

export function SystemSettingsPage() {
  const fields: SettingsField[] = [
    { key: 'appName', label: 'Application Name', type: 'text', readOnly: true },
    { key: 'appVersion', label: 'Application Version', type: 'text', readOnly: true },
    { key: 'buildVersion', label: 'Build ID', type: 'text', readOnly: true },
    { key: 'environment', label: 'Environment', type: 'select', options: [{label: 'Production', value: 'production'}, {label: 'Staging', value: 'staging'}, {label: 'Development', value: 'development'}], readOnly: true },
    { key: 'apiVersion', label: 'API Version', type: 'text', readOnly: true },
    { key: 'apiUrl', label: 'API Base URL', type: 'text', readOnly: true },
    { key: 'mockApiStatus', label: 'Mock API Status', type: 'status', readOnly: true, description: 'Controlled by VITE_ADMIN_USE_MOCK_API' },
    { key: 'dbStatus', label: 'Database Connection Status', type: 'status', readOnly: true },
    { key: 'prismaStatus', label: 'Prisma Status', type: 'status', readOnly: true },
    { key: 'storageStatus', label: 'Storage Status', type: 'status', readOnly: true },
    { key: 'cacheStatus', label: 'Cache Status', type: 'status', readOnly: true },
    { key: 'workerStatus', label: 'Worker Status', type: 'status', readOnly: true },
    { key: 'notificationStatus', label: 'Notification Provider Status', type: 'status', readOnly: true },
    { key: 'paymentStatus', label: 'Payment Provider Status', type: 'status', readOnly: true },
    { key: 'googleMapsStatus', label: 'Google Maps Status', type: 'status', readOnly: true },
    { key: 'nodeVersion', label: 'Node Version', type: 'text', readOnly: true },
    { key: 'timezone', label: 'Server Timezone', type: 'text', readOnly: true },
    { key: 'dbTimezone', label: 'Database Timezone', type: 'text', readOnly: true },
    { key: 'lastDeploymentTime', label: 'Last Deployment Time', type: 'text', readOnly: true },
    { key: 'healthCheck', label: 'Health Endpoint Status', type: 'status', readOnly: true }
  ];

  return (
    <SettingsForm 
      title="System Settings" 
      description="Core system configuration, environment variables, and health statuses."
      namespace="system"
      fields={fields}
    />
  );
}
