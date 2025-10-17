import { NativeModules, Platform } from 'react-native';

// Screen Protection Service
// Provides platform-specific screen protection functionality
class ScreenProtectionService {
  constructor() {
    this.isEnabled = false;
    this.nativeModule = null;
    
    // Initialize platform-specific native module
    this.initializeNativeModule();
  }

  // Initialize the appropriate native module based on platform
  initializeNativeModule() {
    try {
      if (Platform.OS === 'android') {
        // For Android, we'll use a custom native module
        this.nativeModule = NativeModules.ScreenProtectionAndroid;
      } else if (Platform.OS === 'ios') {
        // For iOS, we'll use a custom native module
        this.nativeModule = NativeModules.ScreenProtectionIOS;
      }
      
      if (this.nativeModule) {
        console.log('✅ Screen Protection native module initialized for', Platform.OS);
      } else {
        console.warn('⚠️ Screen Protection native module not available for', Platform.OS);
      }
    } catch (error) {
      console.error('❌ Error initializing Screen Protection native module:', error);
    }
  }

  // Enable screen protection
  async enable() {
    try {
      if (!this.nativeModule) {
        console.warn('⚠️ Screen Protection not available on this platform');
        return false;
      }

      const result = await this.nativeModule.enable();
      this.isEnabled = true;
      console.log('✅ Screen Protection enabled');
      return result;
    } catch (error) {
      console.error('❌ Error enabling Screen Protection:', error);
      return false;
    }
  }

  // Disable screen protection
  async disable() {
    try {
      if (!this.nativeModule) {
        console.warn('⚠️ Screen Protection not available on this platform');
        return false;
      }

      const result = await this.nativeModule.disable();
      this.isEnabled = false;
      console.log('✅ Screen Protection disabled');
      return result;
    } catch (error) {
      console.error('❌ Error disabling Screen Protection:', error);
      return false;
    }
  }

  // Check if screen protection is enabled
  isScreenProtectionEnabled() {
    return this.isEnabled;
  }

  // Get platform-specific status
  getPlatformInfo() {
    return {
      platform: Platform.OS,
      hasNativeModule: !!this.nativeModule,
      isEnabled: this.isEnabled
    };
  }
}

export default new ScreenProtectionService();
