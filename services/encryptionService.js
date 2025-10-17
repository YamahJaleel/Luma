import CryptoJS from 'crypto-js';
import * as Keychain from 'react-native-keychain';

class EncryptionService {
  constructor() {
    this.masterKey = null;
    this.conversationKeys = new Map();
  }

  // Initialize encryption for user
  async initializeUser(userId, password) {
    try {
      // Generate master key from password
      const salt = CryptoJS.SHA256(userId).toString();
      this.masterKey = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      });

      // Store master key securely
      await Keychain.setInternetCredentials(
        'luma_master_key',
        userId,
        this.masterKey.toString()
      );

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

      // Try to get from keychain
      const keychainData = await Keychain.getInternetCredentials(`conv_${recipientId}`);
      if (keychainData && keychainData.password) {
        const key = keychainData.password;
        this.conversationKeys.set(recipientId, key);
        return key;
      }

      // Generate new conversation key
      const newKey = CryptoJS.lib.WordArray.random(256/8).toString();
      this.conversationKeys.set(recipientId, newKey);

      // Store in keychain
      await Keychain.setInternetCredentials(
        `conv_${recipientId}`,
        recipientId,
        newKey
      );

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
      const encrypted = CryptoJS.AES.encrypt(text, conversationKey).toString();
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
      const decrypted = CryptoJS.AES.decrypt(encryptedText, conversationKey)
        .toString(CryptoJS.enc.Utf8);
      
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
      const keychainData = await Keychain.getInternetCredentials('luma_master_key');
      return keychainData && keychainData.username === userId;
    } catch (error) {
      console.error('❌ Error checking encryption status:', error);
      return false;
    }
  }

  // Simple initialization for testing (using user ID as key)
  async initializeSimple(userId) {
    try {
      // For now, use a simple key derived from user ID
      const simpleKey = CryptoJS.SHA256(userId + 'luma_salt').toString();
      this.masterKey = simpleKey;
      
      // Store in keychain
      await Keychain.setInternetCredentials(
        'luma_master_key',
        userId,
        simpleKey
      );

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

      // Try to get from keychain
      const keychainData = await Keychain.getInternetCredentials(`conv_${recipientId}`);
      if (keychainData && keychainData.password) {
        const key = keychainData.password;
        this.conversationKeys.set(recipientId, key);
        return key;
      }

      // Generate new conversation key
      const newKey = CryptoJS.lib.WordArray.random(256/8).toString();
      this.conversationKeys.set(recipientId, newKey);

      // Store in keychain
      await Keychain.setInternetCredentials(
        `conv_${recipientId}`,
        recipientId,
        newKey
      );

      console.log('✅ Generated new conversation key for:', recipientId);
      return newKey;
    } catch (error) {
      console.error('❌ Error getting conversation key:', error);
      throw error;
    }
  }
}

export default new EncryptionService();
