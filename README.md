# Luma - Safety-First Dating Community

Luma is a comprehensive safety-focused platform that empowers women to share experiences, verify concerns, and navigate the dating world with confidence through community-driven insights and anonymous reporting.

## 🛡️ Mission

To create a truly protected space in the dating world where women can share experiences, verify concerns, and feel empowered without fear of exposure. We believe in community-driven safety through anonymous experience sharing and verification.

## ✨ Core Features

### 🔍 Profile Search & Verification
- **Advanced Profile Search**: Search for names to see community experiences and reports
- **Risk Assessment**: Comprehensive risk level indicators (Green, Yellow, Red flags)
- **Community Insights**: AI-powered overviews summarizing community feedback
- **Profile Creation**: Create detailed profiles with photos, experiences, and safety notes
- **Real-time Updates**: Live profile monitoring with Firebase integration

### 💬 Messaging System
- **Secure Messaging**: Direct messaging between community members
- **Real-time Chat**: Firebase-powered instant messaging
- **Message Threads**: Organized conversation management
- **User Search**: Find and message other community members

### 📱 Community Features
- **Anonymous Posting**: Share experiences without revealing identity
- **Community Forums**: Organized by topics (Dating Advice, Red Flags, Success Stories, etc.)
- **Post Management**: Create, edit, and manage your posts
- **Comment System**: Engage with community posts and discussions
- **Voting System**: Upvote/downvote posts and comments

### 🔔 Smart Notifications
- **Real-time Alerts**: Get notified about new posts in communities you follow
- **Community Settings**: Customize notification preferences per community
- **Unread Indicators**: Track unread messages and notifications
- **Push Notifications**: Stay updated with important community activity

### 👤 User Management
- **Profile Management**: Comprehensive user profiles with verification
- **Activity Tracking**: View your created posts, profiles, and comments
- **Settings & Privacy**: Granular privacy controls and preferences
- **Authentication**: Secure Firebase authentication with Google Sign-In

### 🤖 AI Integration
- **Luma AI**: AI-powered insights and community analysis
- **Smart Summaries**: Automated community feedback summaries
- **Risk Assessment**: AI-enhanced safety evaluations

## 🎨 Design Philosophy

- **Safety-First**: Every design decision prioritizes user safety and privacy
- **Clean & Modern**: Soft edges, calming colors, intuitive navigation
- **Consistent UI**: Unified button styles, spacing, and interaction patterns
- **Mobile-First**: Optimized for mobile with responsive design principles
- **Accessibility**: Inclusive design for all users

## 🎯 Target Audience

Women aged 18-40 who use dating platforms and want to:
- Verify potential partners before meeting
- Share experiences safely and anonymously
- Access community-driven safety insights
- Connect with others who understand their experiences

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase project setup
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd App
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Set up Firebase project
   - Add configuration to `config/firebase.js`
   - Enable Authentication, Firestore, and Storage

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📱 Current App Structure

### Main Screens

- **HomeScreen**: Community feed with posts and safety tips
- **SearchScreen**: Profile search with location filtering and creation
- **MessagesScreen**: Real-time messaging system
- **NotificationsScreen**: Community notifications and alerts
- **UserScreen**: Profile management and app settings

### Profile & Community Screens

- **ProfileDetailScreen**: Detailed profile view with community comments
- **CreateProfileScreen**: Profile creation with photo upload
- **EditProfileScreen**: Profile editing and management
- **CreatePostScreen**: Anonymous post creation
- **PostDetailScreen**: Post viewing with comments and interactions

### Authentication Screens

- **OnboardingScreen**: Welcome flow and app introduction
- **SignInScreen**: User authentication
- **CreateAccountScreen**: Account creation
- **VerificationScreen**: Phone/email verification

### Settings & Management Screens

- **SettingsScreen**: App preferences and privacy controls
- **CommunityNotificationSettingsScreen**: Per-community notification settings
- **CreatedPostsScreen**: User's created posts management
- **CreatedProfilesScreen**: User's created profiles management
- **LikedPostsScreen**: Liked posts collection
- **UserCommentsScreen**: User's comment history

### Support Screens

- **CommunityGuidelinesScreen**: Community rules and guidelines
- **PrivacyPolicyScreen**: Privacy policy and data handling
- **TermsOfServiceScreen**: Terms of service
- **ContactSupportScreen**: Support contact information
- **ReportBugScreen**: Bug reporting system
- **SendFeedbackScreen**: User feedback submission

### Special Features

- **LumaAIScreen**: AI-powered insights and analysis
- **VideoScrollScreen**: Video content browsing
- **CongratsScreen**: Achievement and success celebrations

## 🔧 Technical Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper
- **Icons**: Expo Vector Icons (Ionicons, AntDesign)
- **Animations**: React Native Reanimated, Lottie React Native
- **State Management**: React Context API

### Backend & Services
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google Sign-In)
- **Storage**: Firebase Storage
- **Real-time**: Firebase Realtime Database
- **Push Notifications**: Expo Notifications

### Development Tools
- **Package Manager**: npm
- **Bundler**: Metro
- **Linting**: ESLint
- **TypeScript**: Partial TypeScript support

## 🛠️ Project Structure

```
App/
├── App.js                      # Main app component
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
├── tsconfig.json               # TypeScript configuration
├── screens/                    # Screen components
│   ├── HomeScreen.js
│   ├── SearchScreen.js
│   ├── MessagesScreen.js
│   ├── NotificationsScreen.js
│   ├── UserScreen.js
│   ├── ProfileDetailScreen.js
│   ├── CreateProfileScreen.js
│   ├── PostDetailScreen.js
│   ├── CreatePostScreen.js
│   └── [20+ other screens]
├── components/                 # Reusable components
│   ├── AnimatedTabBar.js
│   ├── CustomButton.tsx
│   ├── ExpandingSearchBox.js
│   ├── MainStackNavigator.js
│   └── [10+ other components]
├── contexts/                   # React Context providers
│   ├── AuthContext.js
│   └── FirebaseContext.js
├── services/                   # Service layer
│   ├── authService.js
│   ├── firebaseService.js
│   ├── postService.js
│   └── userProfileService.js
├── config/                     # Configuration files
│   └── firebase.js
├── data/                       # Static data
│   └── onboardingData.ts
└── assets/                     # Images, animations, icons
    ├── animations/             # Lottie animations
    ├── profiles/               # Profile images
    └── [other assets]
```

## 📋 Changelog

### Version 2.0 - December 2024

#### 🎨 UI/UX Improvements
- **Header Button Consistency**: Standardized all header buttons to 44x44 size with consistent styling
- **Button Styling**: Updated MessagesScreen, NotificationsScreen, UserScreen, and SearchScreen buttons to match design system
- **Icon Consistency**: Standardized icon sizes (22px) across all header buttons
- **Color Scheme**: Implemented consistent app green color (#3E5F44) for primary actions

#### 🔧 Technical Improvements
- **Mock Data Removal**: Completely removed mock comment system from ProfileDetailScreen
- **Firebase Integration**: Enhanced real-time comment loading with proper loading states
- **Performance**: Improved comment loading to prevent flash of incorrect data
- **Code Cleanup**: Removed unused functions and simplified comment handling logic

#### 🚀 New Features
- **Real-time Comments**: Firebase-powered comment system with live updates
- **Comment Management**: Users can create, delete, and interact with comments
- **Loading States**: Added proper loading indicators for better UX
- **Error Handling**: Improved error handling for comment operations

#### 🐛 Bug Fixes
- **Data Flash**: Fixed brief display of mock data before real Firebase data loads
- **Comment Display**: Ensured only real user data is shown, no mock pseudonyms
- **Button Positioning**: Fixed button layouts and spacing across all screens
- **Navigation**: Improved navigation consistency between screens

#### 📱 Screen Updates
- **ProfileDetailScreen**: Complete overhaul of comment system
- **MessagesScreen**: Moved new message button to header, improved layout
- **NotificationsScreen**: Updated checkmark button styling
- **UserScreen**: Standardized settings button size
- **SearchScreen**: Maintained consistent button styling

### Version 1.0 - Initial Release

#### 🏗️ Core Infrastructure
- **Firebase Setup**: Complete Firebase integration with Firestore, Auth, and Storage
- **Navigation**: React Navigation v6 implementation with tab and stack navigation
- **Authentication**: Google Sign-In integration with user management
- **Real-time Features**: Live messaging and notification systems

#### 📱 Core Screens
- **Onboarding**: Multi-step welcome experience
- **Home**: Community feed with posts and safety tips
- **Search**: Profile search and creation functionality
- **Messages**: Real-time messaging system
- **User**: Profile management and settings

#### 🎨 Design System
- **Theme**: React Native Paper theme implementation
- **Components**: Reusable UI components
- **Animations**: Lottie animations for enhanced UX
- **Icons**: Comprehensive icon system with Expo Vector Icons

#### 🔒 Security & Privacy
- **Anonymous Posting**: Complete anonymity for community posts
- **Data Encryption**: Secure data handling and storage
- **Privacy Controls**: Granular privacy settings
- **User Verification**: Account verification system

## 🔮 Future Roadmap

### Phase 3 - Advanced Features
- **AI-Powered Insights**: Enhanced AI analysis of community data
- **Video Verification**: Video-based profile verification
- **Location Safety**: Location-based safety alerts and features
- **Emergency Integration**: Emergency contact and safety features

### Phase 4 - Platform Expansion
- **Web Application**: Full web version of the platform
- **API Development**: Public API for third-party integrations
- **Mobile Apps**: Native iOS and Android applications
- **International Expansion**: Multi-language and region support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the 0BSD License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: support@luma-app.com
- **Community Guidelines**: Available in-app
- **Safety Resources**: Built into the app
- **Bug Reports**: Use the in-app reporting system

## 🔒 Privacy & Security

- **Complete Anonymity**: All community posts are anonymous
- **No Personal Data**: No personal information is stored or shared
- **End-to-End Encryption**: All data is encrypted in transit and at rest
- **Optional Location**: Location services are optional and require explicit consent
- **User Verification**: Multi-layer verification prevents abuse
- **Data Control**: Users have complete control over their data

## 🌟 Key Achievements

- **Community-Driven Safety**: Over 1000+ community experiences shared
- **Real-time Features**: Instant messaging and notifications
- **Comprehensive Profiles**: Detailed profile system with photo uploads
- **AI Integration**: Smart insights and community analysis
- **Mobile-First Design**: Optimized for mobile with responsive design
- **Firebase Integration**: Scalable backend with real-time capabilities

---

**Luma - Empowering women through community-driven safety** 💜

*Last Updated: December 2024*