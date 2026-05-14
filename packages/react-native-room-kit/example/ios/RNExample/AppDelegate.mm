#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import "RNSplashScreen.h" // here

#import "RNExample-Swift.h" // here

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"RNExample";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // RN 0.82+ requires an explicit dependency provider so the
  // `RCTReactNativeFactory` can resolve third-party Fabric components
  // and TurboModules. Without this the factory falls back to an empty
  // `thirdPartyFabricComponents` map → JS-side renders crash with
  // "Unimplemented component: <RNSScreenStack>" etc.
  self.dependencyProvider = [RCTAppDependencyProvider new];

  // return [super application:application didFinishLaunchingWithOptions:launchOptions]; //This will be assigned as success instead
 
  BOOL success = [super application:application didFinishLaunchingWithOptions:launchOptions];
 
  if (success) {
    //This is where we will put the logic to get access to rootview
    UIView *rootView = self.window.rootViewController.view;
    
    rootView.backgroundColor = [UIColor blackColor]; // change with your desired backgroundColor
    
    Dynamic *t = [Dynamic new];
    UIView *animationUIView = (UIView *)[t createAnimationViewWithRootView:rootView lottieName:@"Donuts-[remix].json"];
 
    // register LottieSplashScreen to RNSplashScreen
    [RNSplashScreen showLottieSplash:animationUIView inRootView:rootView];
    // casting UIView type to AnimationView type
    LottieAnimationView *animationView = (LottieAnimationView *) animationUIView;
    // play
    [t playWithAnimationView:animationView];
    // If you want the animation layout to be forced to remove when hide is called, use this code
    [RNSplashScreen setAnimationFinished:true];
  }

  return success;
}

// RN 0.78 renamed the override from `sourceURLForBridge:` to `bundleURL`
// (no args). The factory-based delegate (`RCTReactNativeFactory`) reads
// `bundleURL` instead; without this override the default impl throws
// "RCTAppDelegate::bundleURL not implemented" at launch.
- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return true;
}

@end
