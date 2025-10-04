import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  getIdToken,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Authentication service
export const authService = {
  // Create user with email and password
  createUser: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Send email verification
      await sendEmailVerification(user);
      console.log("✅ Verification email sent to:", user.email);
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // Update user profile
  updateUserProfile: async (updates) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, updates);
        return user;
      }
      throw new Error('No user is currently signed in');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Send email verification
  sendEmailVerification: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
      }
      throw new Error('No user is currently signed in');
    } catch (error) {
      console.error('Error sending email verification:', error);
      throw error;
    }
  },

  // Anonymous sign-in
  signInAnonymously: async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('User signed in anonymously:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        console.log('Enable anonymous in your firebase console.');
      }
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Get ID token for backend authentication
  getIdToken: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await getIdToken(user);
        return token;
      }
      throw new Error('No user is currently signed in');
    } catch (error) {
      console.error('Error getting ID token:', error);
      throw error;
    }
  }
};

export default authService;
