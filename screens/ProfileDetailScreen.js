import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const { width } = Dimensions.get('window');

const ProfileDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { profile } = route.params;

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'green':
        return '#4CAF50';
      case 'yellow':
        return '#FF9800';
      case 'red':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getRiskLevelText = (level) => {
    switch (level) {
      case 'green':
        return 'Green Flag';
      case 'yellow':
        return 'Yellow Flag';
      case 'red':
        return 'Red Flag';
      default:
        return 'Unknown';
    }
  };

  const getFlagIcon = (flag) => {
    switch (flag) {
      case 'trustworthy':
        return 'shield-checkmark';
      case 'responsive':
        return 'chatbubble-ellipses';
      case 'genuine':
        return 'heart';
      case 'verified':
        return 'checkmark-circle';
      case 'helpful':
        return 'hand-left';
      case 'community_leader':
        return 'star';
      case 'trusted':
        return 'shield';
      case 'friendly':
        return 'happy';
      case 'active':
        return 'flash';
      case 'new_user':
        return 'person-add';
      case 'inconsistent':
        return 'alert-circle';
      case 'ghosting':
        return 'close-circle';
      case 'unreliable':
        return 'warning';
      case 'catfish':
        return 'fish';
      case 'fake_profile':
        return 'person-remove';
      case 'harassment':
        return 'warning';
      case 'aggressive':
        return 'thunder';
      case 'inappropriate':
        return 'close';
      default:
        return 'flag';
    }
  };

  const getFlagColor = (flag) => {
    if (
      [
        'trustworthy',
        'responsive',
        'genuine',
        'verified',
        'helpful',
        'community_leader',
        'trusted',
        'friendly',
        'active',
        'new_user',
      ].includes(flag)
    ) {
      return '#4CAF50';
    } else if (['inconsistent', 'ghosting', 'unreliable'].includes(flag)) {
      return '#FF9800';
    } else {
      return '#F44336';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image and Basic Info */}
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: profile.avatar }} style={styles.profileImage} />
            <View style={[styles.onlineIndicator, { backgroundColor: profile.isOnline ? '#4CAF50' : '#9E9E9E' }]} />
          </View>
          
          <Text style={[styles.profileName, { color: theme.colors.text }]}>{profile.name}</Text>
          <Text style={[styles.profileUsername, theme.dark && { color: theme.colors.text }]}>{profile.username}</Text>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: profile.isOnline ? '#4CAF50' : '#9E9E9E' }]} />
            <Text style={[styles.statusText, theme.dark && { color: theme.colors.text }]}>
              {profile.isOnline ? 'Online' : `Last seen ${profile.lastSeen}`}
            </Text>
          </View>
        </View>

        {/* Risk Level */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Risk Assessment</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskLevelColor(profile.riskLevel) }]}>
            <Ionicons 
              name={profile.riskLevel === 'green' ? 'shield-checkmark' : profile.riskLevel === 'yellow' ? 'warning' : 'alert'} 
              size={20} 
              color="white" 
            />
            <Text style={styles.riskText}>{getRiskLevelText(profile.riskLevel)}</Text>
          </View>
        </View>

        {/* Mutual Friends */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mutual Connections</Text>
          <View style={styles.mutualContainer}>
            <Ionicons name="people" size={20} color="#718096" />
            <Text style={[styles.mutualText, theme.dark && { color: theme.colors.text }]}>{profile.mutualFriends} mutual friends</Text>
          </View>
        </View>

        {/* Reports */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Community Reports</Text>
          <View style={styles.reportsContainer}>
            <Ionicons name="document-text" size={20} color="#718096" />
            <Text style={[styles.reportsText, theme.dark && { color: theme.colors.text }]}>
              {profile.reports} report{profile.reports !== 1 ? 's' : ''} filed
            </Text>
          </View>
        </View>

        {/* Flags */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Flags & Indicators</Text>
          <View style={styles.flagsContainer}>
            {profile.flags.map((flag, index) => (
              <View key={index} style={styles.flagItem}>
                <Ionicons name={getFlagIcon(flag)} size={16} color={getFlagColor(flag)} />
                <Text style={[styles.flagText, { color: getFlagColor(flag) }, theme.dark && { color: theme.colors.text }]}>
                  {flag.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble" size={20} color="white" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Ionicons name="flag" size={20} color="#E6D7C3" />
            <Text style={[styles.actionButtonText, { color: '#E6D7C3' }]}>Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  placeholder: { width: 40 },
  content: { flex: 1 },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: { position: 'relative', marginBottom: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F0F0' },
  onlineIndicator: { position: 'absolute', bottom: 4, right: 4, width: 20, height: 20, borderRadius: 10, borderWidth: 3, borderColor: 'white' },
  profileName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  profileUsername: { fontSize: 16, color: '#718096', marginBottom: 12 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 14, color: '#718096' },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  riskText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  mutualContainer: { flexDirection: 'row', alignItems: 'center' },
  mutualText: { fontSize: 16, color: '#718096', marginLeft: 12 },
  reportsContainer: { flexDirection: 'row', alignItems: 'center' },
  reportsText: { fontSize: 16, color: '#718096', marginLeft: 12 },
  flagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  flagItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  flagText: { fontSize: 12, fontWeight: '500', marginLeft: 4, textTransform: 'capitalize' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 30 },
  actionButton: { backgroundColor: '#3E5F44', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginHorizontal: 8 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D9A299' },
  actionButtonText: { color: '#FFFFFF', fontWeight: '600' },
});

export default ProfileDetailScreen; 