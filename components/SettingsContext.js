import React, { createContext, useContext, useMemo, useState } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [communityAlertsEnabled, setCommunityAlertsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [dataUsageEnabled, setDataUsageEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const value = useMemo(
    () => ({
      notificationsEnabled,
      setNotificationsEnabled,
      communityAlertsEnabled,
      setCommunityAlertsEnabled,
      locationEnabled,
      setLocationEnabled,
      biometricEnabled,
      setBiometricEnabled,
      autoBackupEnabled,
      setAutoBackupEnabled,
      dataUsageEnabled,
      setDataUsageEnabled,
      darkModeEnabled,
      setDarkModeEnabled,
    }),
    [
      notificationsEnabled,
      communityAlertsEnabled,
      locationEnabled,
      biometricEnabled,
      autoBackupEnabled,
      dataUsageEnabled,
      darkModeEnabled,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}; 