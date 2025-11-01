import { analytics } from '../config/firebase';
import { logEvent } from 'firebase/analytics';
import { Platform } from 'react-native';

/**
 * Analytics Service
 * Tracks user events and app usage for Firebase Analytics
 */
class AnalyticsService {
  /**
   * Check if analytics is available
   */
  isAvailable() {
    return analytics !== undefined && analytics !== null;
  }

  /**
   * Log a custom event
   */
  trackEvent(eventName, params = {}) {
    if (!this.isAvailable()) {
      console.log(`[Analytics] ${eventName}`, params);
      return;
    }

    try {
      logEvent(analytics, eventName, {
        ...params,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Track screen views
   */
  trackScreenView(screenName) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
    });
  }

  /**
   * Track authentication events
   */
  trackSignUp(method = 'email') {
    this.trackEvent('sign_up', { method });
  }

  trackLogin(method = 'email') {
    this.trackEvent('login', { method });
  }

  trackLogout() {
    this.trackEvent('logout');
  }

  /**
   * Track profile events
   */
  trackProfileCreated() {
    this.trackEvent('profile_created');
  }

  trackProfileViewed(profileId) {
    this.trackEvent('profile_viewed', { profile_id: profileId });
  }

  trackProfileSearched(query) {
    this.trackEvent('profile_searched', { 
      search_query: query,
      query_length: query?.length || 0,
    });
  }

  /**
   * Track post events
   */
  trackPostCreated(category) {
    this.trackEvent('post_created', { category });
  }

  trackPostViewed(postId, category) {
    this.trackEvent('post_viewed', { 
      post_id: postId,
      category,
    });
  }

  trackPostLiked(postId) {
    this.trackEvent('post_liked', { post_id: postId });
  }

  trackPostCommented(postId) {
    this.trackEvent('post_commented', { post_id: postId });
  }

  /**
   * Track messaging events
   */
  trackMessageSent(recipientId) {
    this.trackEvent('message_sent', { recipient_id: recipientId });
  }

  trackMessageReceived(senderId) {
    this.trackEvent('message_received', { sender_id: senderId });
  }

  /**
   * Track notification events
   */
  trackNotificationOpened(notificationId, type) {
    this.trackEvent('notification_opened', {
      notification_id: notificationId,
      notification_type: type,
    });
  }

  /**
   * Track search events
   */
  trackSearch(query, resultsCount) {
    this.trackEvent('search', {
      search_query: query,
      results_count: resultsCount,
    });
  }

  /**
   * Track errors
   */
  trackError(error, context = {}) {
    this.trackEvent('error', {
      error_message: error?.message || 'Unknown error',
      error_code: error?.code,
      ...context,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsed(featureName, params = {}) {
    this.trackEvent('feature_used', {
      feature_name: featureName,
      ...params,
    });
  }

  /**
   * Track user engagement
   */
  trackTimeSpent(screenName, durationSeconds) {
    this.trackEvent('time_spent', {
      screen_name: screenName,
      duration_seconds: durationSeconds,
    });
  }
}

export default new AnalyticsService();

