# Luma

Luma is a safety-focused dating app that allows users to anonymously check if someone they're dating is already in a relationship, has red flags, or is trustworthy—based on community feedback.

## 🛡️ Mission

To enhance safety and transparency in online dating by providing a platform where users can share experiences, ask for advice, and search for potential red flags before meeting someone.

## ✨ Core Features

### 🔍 Name Search & Alerts
- Search for names to see if others have shared experiences
- Get alerts if someone posts about a person you're interested in
- Risk level indicators (High, Medium, Low, No Reports)

### 📝 Anonymous Posting
- Share dating experiences anonymously
- Post questions, warnings, or positive stories
- Complete privacy protection - no personal information shared

### 👥 Community Forum
- Moderated feed with verified users
- Safety tips and resources
- Supportive community environment

### ✅ User Verification
- Phone or email verification to prevent spam
- Ensures community trust and safety
- Verified badge system

### 🔒 Privacy & Safety
- Posts are completely anonymous
- Data is encrypted
- Location is never shared without consent
- No personal information stored

## 🎨 Design Philosophy

- **Clean & Modern**: Soft edges, calming colors
- **Safety-First**: Intuitive design that prioritizes user safety
- **Welcoming**: Warm, supportive interface
- **Mobile-First**: Optimized for mobile with web scalability

## 🎯 Target Audience

Women aged 18 to 40 who use dating apps like:
- Tinder
- Bumble
- Hinge
- Match

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd luma-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📱 App Structure

### Screens

- **OnboardingScreen**: Welcome flow and app introduction
- **HomeScreen**: Community feed with safety tips and posts
- **SearchScreen**: Name search functionality with risk assessment
- **PostScreen**: Anonymous posting with various post types
- **ProfileScreen**: User settings, verification, and app info

### Navigation

- Bottom tab navigation with 4 main sections
- Stack navigation for screen transitions
- Smooth onboarding flow

### Theme

- **Primary Color**: Lavender Purple (#8B5CF6)
- **Secondary Color**: Light Lavender (#A78BFA)
- **Background**: Very Light Lavender (#F8F9FF)
- **Text**: Dark Gray (#1F2937)
- **Accent**: Light Gray (#F3F4F6)

## 🔧 Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper
- **Icons**: Expo Vector Icons
- **Gradients**: Expo Linear Gradient

## 🛠️ Development

### Project Structure
```
luma-app/
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── screens/              # Screen components
│   ├── HomeScreen.js
│   ├── SearchScreen.js
│   ├── PostScreen.js
│   ├── ProfileScreen.js
│   └── OnboardingScreen.js
├── components/           # Reusable components
├── utils/               # Utility functions
└── assets/              # Images and icons
```

### Key Features Implemented

1. **Onboarding Flow**: Multi-step welcome experience
2. **Community Feed**: Anonymous posts with safety tips
3. **Name Search**: Risk assessment and reporting system
4. **Anonymous Posting**: Multiple post types with tags
5. **User Verification**: Account verification system
6. **Settings & Privacy**: Comprehensive user controls

## 🔮 Future Features

- Real-time safety check-ins
- Red flag behavior scoring
- Private notes system
- Optional background checks
- Location-based safety alerts
- Emergency contact integration
- Video verification system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the 0BSD License.

## 🆘 Support

For support, please contact:
- Email: support@luma-app.com
- Community Guidelines: Available in-app
- Safety Resources: Built into the app

## 🔒 Privacy & Security

- All posts are anonymous
- No personal information is stored
- Data is encrypted in transit and at rest
- Location services are optional and require explicit consent
- User verification helps prevent abuse

---

**Luma - Your safety companion in the dating world** 💜 