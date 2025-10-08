# Firebase Integration Guide

This guide explains how to integrate Firebase for backend functionality.

## Installation

Firebase has been installed and configured. The following files have been created:

- `config/firebase.js` - Firebase configuration and initialization
- `services/firebaseService.js` - Firebase service functions
- `services/authService.js` - Authentication service
- `contexts/FirebaseContext.js` - React context for Firebase state management
- `examples/FirebaseIntegrationExample.js` - Example component showing integration

## Configuration

Firebase is configured with the following services:
- **Authentication** - User sign-in/sign-up
- **Firestore** - Database for profiles, posts, comments, messages
- **Storage** - File storage for images
- **Analytics** - App analytics

## Usage

### 1. Wrap your app with FirebaseProvider

```javascript
import { FirebaseProvider } from './contexts/FirebaseContext';

export default function App() {
  return (
    <FirebaseProvider>
      {/* Your app components */}
    </FirebaseProvider>
  );
}
```

### 2. Use Firebase context in components

```javascript
import { useFirebase } from '../contexts/FirebaseContext';

const MyComponent = () => {
  const { user, profiles, createProfile, signIn } = useFirebase();
  
  // Use Firebase functionality
};
```

### 3. Direct service usage

```javascript
import { profileService } from '../services/firebaseService';

// Create a profile
const profileId = await profileService.createProfile({
  name: 'John Doe',
  username: 'johndoe',
  bio: 'Test profile'
});
```

## Available Services

### Authentication Service (`authService`)
- `createUser(email, password, displayName)` - Create new user
- `signIn(email, password)` - Sign in user
- `signInWithGoogle()` - Sign in with Google
- `signOut()` - Sign out user
- `resetPassword(email)` - Reset password
- `getCurrentUser()` - Get current user
- `onAuthStateChanged(callback)` - Listen to auth changes

### Profile Service (`profileService`)
- `createProfile(profileData)` - Create new profile
- `getProfiles()` - Get all profiles
- `getProfile(profileId)` - Get specific profile
- `updateProfile(profileId, updateData)` - Update profile
- `deleteProfile(profileId)` - Delete profile

### Post Service (`postService`)
- `createPost(postData)` - Create new post
- `getPosts()` - Get all posts
- `getPostsByCategory(category)` - Get posts by category
- `updatePost(postId, updateData)` - Update post
- `deletePost(postId)` - Delete post

### Comment Service (`commentService`)
- `createComment(commentData)` - Create new comment
- `getProfileComments(profileId)` - Get comments for profile
- `getPostComments(postId)` - Get comments for post
- `updateComment(commentId, updateData)` - Update comment
- `deleteComment(commentId)` - Delete comment

### Message Service (`messageService`)
- `createMessage(messageData)` - Create new message
- `getMessages(userId1, userId2)` - Get messages between users
- `getUserConversations(userId)` - Get user's conversations

### Storage Service (`storageService`)
- `uploadImage(file, path)` - Upload image
- `deleteImage(path)` - Delete image

### Real-time Service (`realtimeService`)
- `listenToProfiles(callback)` - Listen to profile changes
- `listenToPosts(callback)` - Listen to post changes
- `listenToProfileComments(profileId, callback)` - Listen to comment changes

## Data Structure

### Profile Document
```javascript
{
  name: string,
  bio: string,
  location: string,
  userId: string,
  createdBy: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Post Document
```javascript
{
  title: string,
  text: string,
  category: string,
  type: string,
  score: number,
  comments: number,
  likes: number,
  views: number,
  userId: string,
  author: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Comment Document
```javascript
{
  profileId: string,
  postId: string,
  text: string,
  author: string,
  avatarColor: string,
  timestamp: string,
  replies: array,
  userId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Message Document
```javascript
{
  participants: string[],
  senderId: string,
  sender: string,
  recipientId: string,
  recipient: string,
  text: string,
  createdAt: timestamp
}
```

## Migration from AsyncStorage

To migrate from AsyncStorage to Firebase:

1. **Replace AsyncStorage calls** with Firebase service calls
2. **Update data loading** to use Firebase context
3. **Implement real-time listeners** for live updates
4. **Add error handling** for network issues
5. **Implement offline support** if needed

## Example Migration

### Before (AsyncStorage)
```javascript
// Save profile
await AsyncStorage.setItem('userProfiles', JSON.stringify(profiles));

// Load profiles
const profiles = await AsyncStorage.getItem('userProfiles');
```

### After (Firebase)
```javascript
// Save profile
const profileId = await createProfile(profileData);

// Load profiles (automatic via context)
const { userProfiles } = useFirebase();
```

## Error Handling

Always wrap Firebase operations in try-catch blocks:

```javascript
try {
  const result = await profileService.createProfile(data);
  // Handle success
} catch (error) {
  console.error('Firebase error:', error);
  // Handle error
}
```

## Security Rules

Make sure to configure Firestore security rules in the Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profiles: Users can read all, but only create/update their own
    match /profiles/{profileId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Posts: Users can read all, but only create/update their own
    match /posts/{postId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Comments: Users can read all, but only create/update their own
    match /comments/{commentId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Messages: Users can only access their own messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
  }
}
```

## Next Steps

1. **Test the integration** using the example component
2. **Migrate existing screens** to use Firebase services
3. **Implement authentication** flow
4. **Add real-time updates** for better UX
5. **Configure security rules** in Firebase console
6. **Add offline support** if needed
7. **Implement push notifications** using Firebase Cloud Messaging

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Make sure `FirebaseProvider` wraps your app
2. **Permission denied**: Check Firestore security rules
3. **Network errors**: Implement proper error handling and retry logic
4. **Data not updating**: Check if real-time listeners are properly set up

### Debug Mode

Enable Firebase debug mode in development:

```javascript
import { connectFirestoreEmulator } from 'firebase/firestore';

if (__DEV__) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```
