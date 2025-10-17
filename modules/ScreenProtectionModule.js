import { NativeModules, Platform } from 'react-native';

/**
 * Screen Protection Native Module Bridge
 * 
 * This module provides a unified interface for screen protection across platforms.
 * It bridges the native Android and iOS implementations with a simple JavaScript API.
 * 
 * Features:
 * - Android: FLAG_SECURE prevents screenshots and screen recording
 * - iOS: Blur overlay when app goes to background or screenshot is detected
 * - Cross-platform API with platform-specific optimizations
 * - Error handling and fallback mechanisms
 */

class ScreenProtectionModule {
  constructor() {
    this.nativeModule = null;
    this.isEnabled = false;
    this.initializeNativeModule();
  }

  /**
   * Initialize the appropriate native module based on platform
   * This method detects the platform and sets up the corresponding native module
   */
  initializeNativeModule() {
    try {
      if (Platform.OS === 'android') {
        this.nativeModule = NativeModules.ScreenProtectionAndroid;
      } else if (Platform.OS === 'ios') {
        this.nativeModule = NativeModules.ScreenProtectionIOS;
      }
      
      if (this.nativeModule) {
        console.log(`✅ Screen Protection native module initialized for ${Platform.OS}`);
      } else {
        console.warn(`⚠️ Screen Protection native module not available for ${Platform.OS}`);
      }
    } catch (error) {
      console.error('❌ Error initializing Screen Protection native module:', error);
    }
  }

  /**
   * Enable screen protection
   * This method enables platform-specific screen protection features
   * 
   * @returns {Promise<boolean>} Success status
   */
  async enable() {
    try {
      if (!this.nativeModule) {
        console.warn('⚠️ Screen Protection not available on this platform');
        return false;
      }

      const result = await this.nativeModule.enable();
      this.isEnabled = true;
      
      console.log('✅ Screen Protection enabled:', result);
      return result.success || false;
    } catch (error) {
      console.error('❌ Error enabling Screen Protection:', error);
      return false;
    }
  }

  /**
   * Disable screen protection
   * This method disables platform-specific screen protection features
   * 
   * @returns {Promise<boolean>} Success status
   */
  async disable() {
    try {
      if (!this.nativeModule) {
        console.warn('⚠️ Screen Protection not available on this platform');
        return false;
      }

      const result = await this.nativeModule.disable();
      this.isEnabled = false;
      
      console.log('✅ Screen Protection disabled:', result);
      return result.success || false;
    } catch (error) {
      console.error('❌ Error disabling Screen Protection:', error);
      return false;
    }
  }

  /**
   * Check if screen protection is currently enabled
   * This method returns the current status of screen protection
   * 
   * @returns {Promise<boolean>} Current enabled status
   */
  async isEnabled() {
    try {
      if (!this.nativeModule) {
        return false;
      }

      const result = await this.nativeModule.isEnabled();
      this.isEnabled = result.enabled || false;
      
      return this.isEnabled;
    } catch (error) {
      console.error('❌ Error checking Screen Protection status:', error);
      return false;
    }
  }

  /**
   * Get platform-specific information
   * This method returns information about the current platform and module availability
   * 
   * @returns {Object} Platform information
   */
  getPlatformInfo() {
    return {
      platform: Platform.OS,
      hasNativeModule: !!this.nativeModule,
      isEnabled: this.isEnabled,
      version: '1.0.0'
    };
  }

  /**
   * Check if screen protection is supported on this platform
   * This method determines if the native module is available
   * 
   * @returns {boolean} Support status
   */
  isSupported() {
    return !!this.nativeModule;
  }
}

// Export singleton instance
export default new ScreenProtectionModule();
