import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTIONS = {
  USER_PROFILES: 'userProfiles',
  USER_SETTINGS: 'userSettings',
  USER_PREFERENCES: 'userPreferences'
};

export const userProfileService = {
  // Initialize user profile and settings after signup
  initializeUserProfile: async (userId, initialData = {}) => {
    try {
      const profileData = {
        ...initialData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isVerified: false,
        profileComplete: false
      };

      const settingsData = {
        userId,
        notificationsEnabled: true,
        communityAlertsEnabled: true,
        locationEnabled: false,
        autoBackupEnabled: true,
        dataUsageEnabled: false,
        darkModeEnabled: false,
        communityNotificationSettings: {},
        updatedAt: serverTimestamp()
      };

      const preferencesData = {
        userId,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        contentFilters: {
          explicit: false,
          violence: false,
          sensitive: false
        },
        privacySettings: {
          profileVisibility: 'public',
          messagePermission: 'following',
          activityVisibility: 'followers'
        },
        updatedAt: serverTimestamp()
      };

      // Create documents in Firestore
      await Promise.all([
        setDoc(doc(db, COLLECTIONS.USER_PROFILES, userId), profileData),
        setDoc(doc(db, COLLECTIONS.USER_SETTINGS, userId), settingsData),
        setDoc(doc(db, COLLECTIONS.USER_PREFERENCES, userId), preferencesData)
      ]);

      return {
        profile: profileData,
        settings: settingsData,
        preferences: preferencesData
      };
    } catch (error) {
      console.error('Error initializing user profile:', error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const docRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updateData) => {
    try {
      const docRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Get user settings
  getUserSettings: async (userId) => {
    try {
      const docRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }

      // If document doesn't exist, create default settings
      const defaultSettings = {
        userId,
        notificationsEnabled: true,
        communityAlertsEnabled: true,
        locationEnabled: false,
        autoBackupEnabled: true,
        dataUsageEnabled: false,
        darkModeEnabled: false,
        communityNotificationSettings: {},
        updatedAt: serverTimestamp()
      };

      try {
        await setDoc(docRef, defaultSettings);
        return { id: userId, ...defaultSettings };
      } catch (setError) {
        console.warn('Failed to create default settings, using local defaults:', setError);
        return { id: userId, ...defaultSettings };
      }
    } catch (error) {
      console.warn('Error getting user settings (offline mode):', error);
      // Return default settings if offline
      return {
        id: userId,
        notificationsEnabled: true,
        communityAlertsEnabled: true,
        locationEnabled: false,
        autoBackupEnabled: true,
        dataUsageEnabled: false,
        darkModeEnabled: false,
        communityNotificationSettings: {},
      };
    }
  },

  // Update user settings
  updateUserSettings: async (userId, updateData) => {
    try {
      const docRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  // Get user preferences
  getUserPreferences: async (userId) => {
    try {
      const docRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  },


  // Update user preferences
  updateUserPreferences: async (userId, updateData) => {
    try {
      const docRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
};

export default userProfileService;
