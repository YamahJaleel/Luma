import CryptoJS from 'crypto-js';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EncryptionService {
  constructor() {
    this.masterKey = null;
    this.conversationKeys = new Map();
    this.useKeychain = true; // Flag to track if keychain is available
  }

  // Derive a deterministic AES key and IV from a secret string
  // This avoids any need for runtime randomness (works in Expo Go)
  getDeterministicKeyAndIv(secret) {
    // 32 bytes (256-bit) key from SHA-256(secret)
    const keyHashHex = CryptoJS.SHA256(`${secret}::key`).toString();
    const key = CryptoJS.enc.Hex.parse(keyHashHex);

    // 16 bytes (128-bit) IV from first 16 bytes of SHA-256(secret + 'iv')
    const ivHashHex = CryptoJS.SHA256(`${secret}::iv`).toString();
    const iv = CryptoJS.enc.Hex.parse(ivHashHex.substring(0, 32));

    return { key, iv };
  }

  // Check if keychain is available and working
  async checkKeychainAvailability() {
    try {
      if (!Keychain || typeof Keychain.setInternetCredentials !== 'function') {
        console.warn('⚠️ Keychain not available, falling back to AsyncStorage');
        this.useKeychain = false;
        return false;
      }
      
      // Test keychain with a dummy operation
      await Keychain.setInternetCredentials('test_keychain', 'test_user', 'test_password');
      await Keychain.getInternetCredentials('test_keychain');
      await Keychain.resetInternetCredentials('test_keychain');
      
      console.log('✅ Keychain is available and working');
      this.useKeychain = true;
      return true;
    } catch (error) {
      console.warn('⚠️ Keychain not working, falling back to AsyncStorage:', error.message);
      this.useKeychain = false;
      return false;
    }
  }

  // Secure storage with fallback
  async secureSet(key, username, password) {
    try {
      // Ensure availability flag is correct before using keychain
      if (this.useKeychain) {
        await this.checkKeychainAvailability();
      }
      if (this.useKeychain) {
        return await Keychain.setInternetCredentials(key, username, password);
      } else {
        // Fallback to AsyncStorage with deterministic AES (no random salt/iv)
        const payload = JSON.stringify({ username, password });
        const { key: aesKey, iv } = this.getDeterministicKeyAndIv('luma_fallback_key');
        const encrypted = CryptoJS.AES.encrypt(payload, aesKey, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();
        await AsyncStorage.setItem(`secure_${key}`, encrypted);
        return true;
      }
    } catch (error) {
      console.error('❌ Error in secureSet:', error);
      throw error;
    }
  }

  // Secure retrieval with fallback
  async secureGet(key) {
    try {
      // Ensure availability flag is correct before using keychain
      if (this.useKeychain) {
        await this.checkKeychainAvailability();
      }
      if (this.useKeychain) {
        return await Keychain.getInternetCredentials(key);
      } else {
        // Fallback to AsyncStorage with deterministic AES (no random salt/iv)
        const encryptedData = await AsyncStorage.getItem(`secure_${key}`);
        if (!encryptedData) return null;
        const { key: aesKey, iv } = this.getDeterministicKeyAndIv('luma_fallback_key');
        const decryptedData = CryptoJS.AES.decrypt(encryptedData, aesKey, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString(CryptoJS.enc.Utf8);
        const { username, password } = JSON.parse(decryptedData);
        return { username, password };
      }
    } catch (error) {
      console.error('❌ Error in secureGet:', error);
      return null;
    }
  }

  // Secure deletion with fallback
  async secureDelete(key) {
    try {
      // Ensure availability flag is correct before using keychain
      if (this.useKeychain) {
        await this.checkKeychainAvailability();
      }
      if (this.useKeychain) {
        return await Keychain.resetInternetCredentials(key);
      } else {
        await AsyncStorage.removeItem(`secure_${key}`);
        return true;
      }
    } catch (error) {
      console.error('❌ Error in secureDelete:', error);
      throw error;
    }
  }

  // Initialize encryption for user
  async initializeUser(userId, password) {
    try {
      // Check keychain availability first
      await this.checkKeychainAvailability();
      
      // Generate master key from password
      const salt = CryptoJS.SHA256(userId).toString();
      this.masterKey = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      });

      // Store master key securely
      await this.secureSet('luma_master_key', userId, this.masterKey.toString());

      console.log('✅ Encryption initialized for user:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error initializing encryption:', error);
      throw error;
    }
  }

  // Get or create conversation key
  async getConversationKey(recipientId) {
    try {
      // Check if key exists locally
      if (this.conversationKeys.has(recipientId)) {
        return this.conversationKeys.get(recipientId);
      }

      // Try to get from secure storage
      const keychainData = await this.secureGet(`conv_${recipientId}`);
      if (keychainData && keychainData.password) {
        const key = keychainData.password;
        this.conversationKeys.set(recipientId, key);
        return key;
      }

      // Generate deterministic conversation key (no RNG)
      // Uses masterKey (if available) plus recipient to derive a stable key
      const entropySource = `${this.masterKey || 'luma_master'}::conv::${recipientId}`;
      const newKey = CryptoJS.SHA256(entropySource).toString();
      this.conversationKeys.set(recipientId, newKey);

      // Store in secure storage
      await this.secureSet(`conv_${recipientId}`, recipientId, newKey);

      console.log('✅ Generated new conversation key for:', recipientId);
      return newKey;
    } catch (error) {
      console.error('❌ Error getting conversation key:', error);
      throw error;
    }
  }

  // Encrypt message
  async encryptMessage(text, recipientId) {
    try {
      const conversationKey = await this.getConversationKey(recipientId);
      // Use deterministic key+iv to avoid RNG in Expo Go
      const { key, iv } = this.getDeterministicKeyAndIv(conversationKey);
      const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }).toString();
      console.log('✅ Message encrypted for:', recipientId);
      return encrypted;
    } catch (error) {
      console.error('❌ Error encrypting message:', error);
      throw error;
    }
  }

  // Decrypt message
  async decryptMessage(encryptedText, senderId) {
    try {
      const conversationKey = await this.getConversationKey(senderId);
      const { key, iv } = this.getDeterministicKeyAndIv(conversationKey);
      const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }).toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        console.warn('⚠️ Failed to decrypt message from:', senderId);
        return '[Encrypted message - decryption failed]';
      }
      
      console.log('✅ Message decrypted from:', senderId);
      return decrypted;
    } catch (error) {
      console.error('❌ Error decrypting message:', error);
      return '[Encrypted message - decryption failed]';
    }
  }

  // Check if user has encryption initialized
  async isEncryptionInitialized(userId) {
    try {
      // Ensure availability flag is correct before using secure storage
      await this.checkKeychainAvailability();
      const keychainData = await this.secureGet('luma_master_key');
      return keychainData && keychainData.username === userId;
    } catch (error) {
      console.error('❌ Error checking encryption status:', error);
      return false;
    }
  }

  // Simple initialization for testing (using user ID as key)
  async initializeSimple(userId) {
    try {
      // Check keychain availability first
      await this.checkKeychainAvailability();
      
      // For now, use a simple key derived from user ID
      const simpleKey = CryptoJS.SHA256(userId + 'luma_salt').toString();
      this.masterKey = simpleKey;
      
      // Store in secure storage
      await this.secureSet('luma_master_key', userId, simpleKey);

      console.log('✅ Simple encryption initialized for user:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error initializing simple encryption:', error);
      throw error;
    }
  }

  // Get conversation key for simple implementation
  async getSimpleConversationKey(recipientId) {
    try {
      // Check if key exists locally
      if (this.conversationKeys.has(recipientId)) {
        return this.conversationKeys.get(recipientId);
      }

      // Try to get from secure storage
      const keychainData = await this.secureGet(`conv_${recipientId}`);
      if (keychainData && keychainData.password) {
        const key = keychainData.password;
        this.conversationKeys.set(recipientId, key);
        return key;
      }

      // Generate new conversation key
      const newKey = CryptoJS.lib.WordArray.random(256/8).toString();
      this.conversationKeys.set(recipientId, newKey);

      // Store in secure storage
      await this.secureSet(`conv_${recipientId}`, recipientId, newKey);

      console.log('✅ Generated new conversation key for:', recipientId);
      return newKey;
    } catch (error) {
      console.error('❌ Error getting conversation key:', error);
      throw error;
    }
  }
}

export default new EncryptionService();
