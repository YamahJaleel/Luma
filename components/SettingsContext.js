import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext(null);

const STORAGE_KEYS = {
  notificationsEnabled: 'settings.notificationsEnabled',
  communityAlertsEnabled: 'settings.communityAlertsEnabled',
  locationEnabled: 'settings.locationEnabled',
  biometricEnabled: 'settings.biometricEnabled',
  autoBackupEnabled: 'settings.autoBackupEnabled',
  dataUsageEnabled: 'settings.dataUsageEnabled',
  darkModeEnabled: 'settings.darkModeEnabled',
};

export const SettingsProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [communityAlertsEnabled, setCommunityAlertsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [dataUsageEnabled, setDataUsageEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
        const map = Object.fromEntries(entries);
        if (map[STORAGE_KEYS.notificationsEnabled] != null) setNotificationsEnabled(map[STORAGE_KEYS.notificationsEnabled] === 'true');
        if (map[STORAGE_KEYS.communityAlertsEnabled] != null) setCommunityAlertsEnabled(map[STORAGE_KEYS.communityAlertsEnabled] === 'true');
        if (map[STORAGE_KEYS.locationEnabled] != null) setLocationEnabled(map[STORAGE_KEYS.locationEnabled] === 'true');
        if (map[STORAGE_KEYS.biometricEnabled] != null) setBiometricEnabled(map[STORAGE_KEYS.biometricEnabled] === 'true');
        if (map[STORAGE_KEYS.autoBackupEnabled] != null) setAutoBackupEnabled(map[STORAGE_KEYS.autoBackupEnabled] === 'true');
        if (map[STORAGE_KEYS.dataUsageEnabled] != null) setDataUsageEnabled(map[STORAGE_KEYS.dataUsageEnabled] === 'true');
        if (map[STORAGE_KEYS.darkModeEnabled] != null) setDarkModeEnabled(map[STORAGE_KEYS.darkModeEnabled] === 'true');
      } catch {}
    })();
  }, []);

  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.notificationsEnabled, String(notificationsEnabled)); }, [notificationsEnabled]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.communityAlertsEnabled, String(communityAlertsEnabled)); }, [communityAlertsEnabled]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.locationEnabled, String(locationEnabled)); }, [locationEnabled]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.biometricEnabled, String(biometricEnabled)); }, [biometricEnabled]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.autoBackupEnabled, String(autoBackupEnabled)); }, [autoBackupEnabled]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.dataUsageEnabled, String(dataUsageEnabled)); }, [dataUsageEnabled]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.darkModeEnabled, String(darkModeEnabled)); }, [darkModeEnabled]);

  const value = useMemo(
    () => ({
      notificationsEnabled, setNotificationsEnabled,
      communityAlertsEnabled, setCommunityAlertsEnabled,
      locationEnabled, setLocationEnabled,
      biometricEnabled, setBiometricEnabled,
      autoBackupEnabled, setAutoBackupEnabled,
      dataUsageEnabled, setDataUsageEnabled,
      darkModeEnabled, setDarkModeEnabled,
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