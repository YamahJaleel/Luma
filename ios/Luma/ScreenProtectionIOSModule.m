//
//  ScreenProtectionIOSModule.m
//  Luma
//
//  Screen Protection iOS Native Module
//
//  This module provides screen protection functionality for iOS devices.
//  It uses UIVisualEffectView with UIBlurEffect to blur the screen when
//  the app goes to background or when screenshots are detected.
//
//  Key Features:
//  - Blur overlay when app goes to background
//  - Blur overlay when screenshot is detected
//  - Smooth animations for better UX
//  - Automatic cleanup when app becomes active
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <UIKit/UIKit.h>

@interface ScreenProtectionIOSModule : NSObject <RCTBridgeModule>

@property (nonatomic, strong) UIVisualEffectView *blurView;
@property (nonatomic, assign) BOOL isEnabled;
@property (nonatomic, assign) BOOL isBlurred;

@end

@implementation ScreenProtectionIOSModule

RCT_EXPORT_MODULE(ScreenProtectionIOS);

- (instancetype)init {
    self = [super init];
    if (self) {
        _isEnabled = NO;
        _isBlurred = NO;
        
        // Set up notification observers for app lifecycle events
        [self setupNotificationObservers];
    }
    return self;
}

- (void)dealloc {
    // Remove notification observers
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

/**
 * Set up notification observers for app lifecycle events
 * This allows us to automatically blur the screen when the app goes to background
 */
- (void)setupNotificationObservers {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(applicationWillResignActive:)
                                                 name:UIApplicationWillResignActiveNotification
                                               object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(applicationDidBecomeActive:)
                                                 name:UIApplicationDidBecomeActiveNotification
                                               object:nil];
    
    // Listen for screenshot notifications
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(userDidTakeScreenshot:)
                                                 name:UIApplicationUserDidTakeScreenshotNotification
                                               object:nil];
}

/**
 * Enable screen protection
 * This sets up the blur view and enables automatic blurring
 */
RCT_EXPORT_METHOD(enable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        self.isEnabled = YES;
        
        // Create blur view if it doesn't exist
        if (!self.blurView) {
            [self createBlurView];
        }
        
        NSDictionary *result = @{
            @"success": @YES,
            @"message": @"Screen protection enabled",
            @"platform": @"ios"
        };
        
        resolve(result);
    } @catch (NSException *exception) {
        reject(@"ENABLE_ERROR", @"Failed to enable screen protection", exception);
    }
}

/**
 * Disable screen protection
 * This removes the blur view and disables automatic blurring
 */
RCT_EXPORT_METHOD(disable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        self.isEnabled = NO;
        
        // Remove blur view if it exists
        if (self.blurView) {
            [self removeBlurView];
        }
        
        NSDictionary *result = @{
            @"success": @YES,
            @"message": @"Screen protection disabled",
            @"platform": @"ios"
        };
        
        resolve(result);
    } @catch (NSException *exception) {
        reject(@"DISABLE_ERROR", @"Failed to disable screen protection", exception);
    }
}

/**
 * Check if screen protection is currently enabled
 */
RCT_EXPORT_METHOD(isEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSDictionary *result = @{
            @"enabled": @(self.isEnabled),
            @"platform": @"ios"
        };
        
        resolve(result);
    } @catch (NSException *exception) {
        reject(@"STATUS_ERROR", @"Failed to get screen protection status", exception);
    }
}

/**
 * Create the blur view
 * This creates a UIVisualEffectView with UIBlurEffect for screen protection
 */
- (void)createBlurView {
    // Get the main window
    UIWindow *window = [UIApplication sharedApplication].keyWindow;
    if (!window) {
        // Try to get the first window if keyWindow is nil
        NSArray *windows = [UIApplication sharedApplication].windows;
        if (windows.count > 0) {
            window = windows[0];
        }
    }
    
    if (window) {
        // Create blur effect
        UIBlurEffect *blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleRegular];
        
        // Create visual effect view
        self.blurView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
        self.blurView.frame = window.bounds;
        self.blurView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        self.blurView.alpha = 0.0;
        
        // Add to window
        [window addSubview:self.blurView];
    }
}

/**
 * Show blur view with animation
 * This animates the blur view to become visible
 */
- (void)showBlurView {
    if (self.blurView && !self.isBlurred) {
        self.isBlurred = YES;
        
        [UIView animateWithDuration:0.3
                              delay:0.0
                            options:UIViewAnimationOptionCurveEaseInOut
                         animations:^{
                             self.blurView.alpha = 1.0;
                         }
                         completion:nil];
    }
}

/**
 * Hide blur view with animation
 * This animates the blur view to become invisible
 */
- (void)hideBlurView {
    if (self.blurView && self.isBlurred) {
        self.isBlurred = NO;
        
        [UIView animateWithDuration:0.3
                              delay:0.0
                            options:UIViewAnimationOptionCurveEaseInOut
                         animations:^{
                             self.blurView.alpha = 0.0;
                         }
                         completion:nil];
    }
}

/**
 * Remove blur view completely
 * This removes the blur view from the window
 */
- (void)removeBlurView {
    if (self.blurView) {
        [self.blurView removeFromSuperview];
        self.blurView = nil;
        self.isBlurred = NO;
    }
}

/**
 * Handle app going to background
 * This automatically shows the blur view when the app loses focus
 */
- (void)applicationWillResignActive:(NSNotification *)notification {
    if (self.isEnabled) {
        [self showBlurView];
    }
}

/**
 * Handle app becoming active
 * This automatically hides the blur view when the app regains focus
 */
- (void)applicationDidBecomeActive:(NSNotification *)notification {
    if (self.isEnabled) {
        [self hideBlurView];
    }
}

/**
 * Handle screenshot detection
 * This shows the blur view when a screenshot is taken
 */
- (void)userDidTakeScreenshot:(NSNotification *)notification {
    if (self.isEnabled) {
        // Show blur immediately
        [self showBlurView];
        
        // Hide blur after a short delay
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [self hideBlurView];
        });
    }
}

@end
