import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userProfileService } from '../services/userProfileService';
import { auth } from '../config/firebase';

const SettingsContext = createContext(null);

const STORAGE_KEYS = {
  notificationsEnabled: 'settings.notificationsEnabled',
  communityAlertsEnabled: 'settings.communityAlertsEnabled',
  locationEnabled: 'settings.locationEnabled',
  autoBackupEnabled: 'settings.autoBackupEnabled',
  dataUsageEnabled: 'settings.dataUsageEnabled',
  darkModeEnabled: 'settings.darkModeEnabled',
  communityNotificationSettings: 'settings.communityNotificationSettings',
};

export const SettingsProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [communityAlertsEnabled, setCommunityAlertsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [dataUsageEnabled, setDataUsageEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [communityNotificationSettings, setCommunityNotificationSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from Firebase when user is authenticated
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Try to get settings from Firebase first
          const settings = await userProfileService.getUserSettings(user.uid);
          if (settings) {
            setNotificationsEnabled(settings.notificationsEnabled ?? true);
            setCommunityAlertsEnabled(settings.communityAlertsEnabled ?? true);
            setLocationEnabled(settings.locationEnabled ?? false);
            setAutoBackupEnabled(settings.autoBackupEnabled ?? true);
            setDataUsageEnabled(settings.dataUsageEnabled ?? false);
            setDarkModeEnabled(settings.darkModeEnabled ?? false);
            setCommunityNotificationSettings(settings.communityNotificationSettings ?? {});
          } else {
            // Fall back to AsyncStorage if Firebase settings don't exist
            const entries = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
            const map = Object.fromEntries(entries);
            
            if (map[STORAGE_KEYS.notificationsEnabled] != null) setNotificationsEnabled(map[STORAGE_KEYS.notificationsEnabled] === 'true');
            if (map[STORAGE_KEYS.communityAlertsEnabled] != null) setCommunityAlertsEnabled(map[STORAGE_KEYS.communityAlertsEnabled] === 'true');
            if (map[STORAGE_KEYS.locationEnabled] != null) setLocationEnabled(map[STORAGE_KEYS.locationEnabled] === 'true');
            if (map[STORAGE_KEYS.autoBackupEnabled] != null) setAutoBackupEnabled(map[STORAGE_KEYS.autoBackupEnabled] === 'true');
            if (map[STORAGE_KEYS.dataUsageEnabled] != null) setDataUsageEnabled(map[STORAGE_KEYS.dataUsageEnabled] === 'true');
            if (map[STORAGE_KEYS.darkModeEnabled] != null) setDarkModeEnabled(map[STORAGE_KEYS.darkModeEnabled] === 'true');
            if (map[STORAGE_KEYS.communityNotificationSettings] != null) {
              try {
                setCommunityNotificationSettings(JSON.parse(map[STORAGE_KEYS.communityNotificationSettings]));
              } catch {
                setCommunityNotificationSettings({});
              }
            }

            // Save local settings to Firebase
            await userProfileService.updateUserSettings(user.uid, {
              notificationsEnabled,
              communityAlertsEnabled,
              locationEnabled,
              autoBackupEnabled,
              dataUsageEnabled,
              darkModeEnabled,
              communityNotificationSettings
            });
          }
        } else {
          // If not authenticated, use AsyncStorage
          const entries = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
          const map = Object.fromEntries(entries);
          
          if (map[STORAGE_KEYS.notificationsEnabled] != null) setNotificationsEnabled(map[STORAGE_KEYS.notificationsEnabled] === 'true');
          if (map[STORAGE_KEYS.communityAlertsEnabled] != null) setCommunityAlertsEnabled(map[STORAGE_KEYS.communityAlertsEnabled] === 'true');
          if (map[STORAGE_KEYS.locationEnabled] != null) setLocationEnabled(map[STORAGE_KEYS.locationEnabled] === 'true');
          if (map[STORAGE_KEYS.autoBackupEnabled] != null) setAutoBackupEnabled(map[STORAGE_KEYS.autoBackupEnabled] === 'true');
          if (map[STORAGE_KEYS.dataUsageEnabled] != null) setDataUsageEnabled(map[STORAGE_KEYS.dataUsageEnabled] === 'true');
          if (map[STORAGE_KEYS.darkModeEnabled] != null) setDarkModeEnabled(map[STORAGE_KEYS.darkModeEnabled] === 'true');
          if (map[STORAGE_KEYS.communityNotificationSettings] != null) {
            try {
              setCommunityNotificationSettings(JSON.parse(map[STORAGE_KEYS.communityNotificationSettings]));
            } catch {
              setCommunityNotificationSettings({});
            }
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to both Firebase and AsyncStorage
  const saveSettings = async (settings) => {
    // Always save to AsyncStorage first as backup
    try {
      const entries = Object.entries(settings).map(([key, value]) => [
        `settings.${key}`,
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      ]);
      await AsyncStorage.multiSet(entries);
    } catch (error) {
      console.warn('Error saving settings to AsyncStorage:', error);
    }

    // Then try to save to Firebase
    try {
      const user = auth.currentUser;
      if (user) {
        await userProfileService.updateUserSettings(user.uid, settings);
      }
    } catch (error) {
      // If Firebase update fails, we still have the local copy
      console.warn('Error saving settings to Firebase (will sync when online):', error);
    }
  };

  // Update individual settings
  useEffect(() => {
    saveSettings({
      notificationsEnabled,
      communityAlertsEnabled,
      locationEnabled,
      autoBackupEnabled,
      dataUsageEnabled,
      darkModeEnabled,
      communityNotificationSettings
    });
  }, [
    notificationsEnabled,
    communityAlertsEnabled,
    locationEnabled,
    autoBackupEnabled,
    dataUsageEnabled,
    darkModeEnabled,
    communityNotificationSettings
  ]);

  const updateCommunityNotificationSetting = (communityId, enabled) => {
    setCommunityNotificationSettings(prev => ({
      ...prev,
      [communityId]: enabled
    }));
  };

  const isCommunityNotificationEnabled = (communityId) => {
    return communityNotificationSettings[communityId] === true;
  };

  const value = useMemo(
    () => ({
      notificationsEnabled,
      setNotificationsEnabled,
      communityAlertsEnabled,
      setCommunityAlertsEnabled,
      locationEnabled,
      setLocationEnabled,
      autoBackupEnabled,
      setAutoBackupEnabled,
      dataUsageEnabled,
      setDataUsageEnabled,
      darkModeEnabled,
      setDarkModeEnabled,
      communityNotificationSettings,
      updateCommunityNotificationSetting,
      isCommunityNotificationEnabled,
      isLoading
    }),
    [
      notificationsEnabled,
      communityAlertsEnabled,
      locationEnabled,
      autoBackupEnabled,
      dataUsageEnabled,
      darkModeEnabled,
      communityNotificationSettings,
      isLoading
    ]
  );

  if (isLoading) {
    return null; // Or a loading spinner component
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};