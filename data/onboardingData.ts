export interface OnboardingData {
  id: number;
  animation: any; // We'll use placeholder for now since we don't have Lottie files
  title: string;
  subtitle: string;
  description: string;
  textColor: string;
  backgroundColor: string;
}

const data: OnboardingData[] = [
  {
    id: 1,
    animation: require('../assets/animations/Waving.json'),
    title: 'Welcome to Luma',
    subtitle: 'Your safety companion in the dating world',
    description: 'Connect with a community that prioritizes your safety and well-being while dating. Share experiences, get advice, and stay protected.',
    textColor: '#3E5F44',
    backgroundColor: '#FAF6F0',
  },
  {
    id: 2,
    animation: require('../assets/animations/Cat_in_Box.json'),
    title: 'Anonymous Sharing',
    subtitle: 'Share experiences safely',
    description: 'Post about your dating experiences anonymously. Your privacy is our top priority. Help others while staying completely protected.',
    textColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  {
    id: 3,
    animation: require('../assets/animations/Eye Searching.json'),
    title: 'Search & Verify',
    subtitle: 'Check before you connect',
    description: 'Search names to see if others have shared experiences or red flags about someone. Make informed decisions about who you meet.',
    textColor: '#005b4f',
    backgroundColor: '#ffa3ce',
  },
  {
    id: 4,
    animation: require('../assets/animations/Conversation.json'),
    title: 'Community Support',
    subtitle: "You're not alone",
    description: 'Get advice, share stories, and support each other in a safe, moderated environment. Connect with people who understand.',
    textColor: '#059669',
    backgroundColor: '#D1FAE5',
  },
  {
    id: 5,
    animation: require('../assets/animations/Security.json'),
    title: 'Protected by Encryption',
    subtitle: 'Your data is secure',
    description: 'All your information is encrypted and protected. Your privacy and security are our highest priorities.',
    textColor: '#1E40AF',
    backgroundColor: '#DBEAFE',
  },
  {
    id: 6,
    animation: require('../assets/animations/cat.json'),
    title: 'Get Started',
    subtitle: 'Join our community',
    description: 'Ready to start your journey? Create your account and join users who trust our platform for safe connections.',
    textColor: '#EA580C',
    backgroundColor: '#FEF3C7',
  },
];

export default data; 