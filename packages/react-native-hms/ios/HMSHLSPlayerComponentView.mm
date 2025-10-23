#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import <react/renderer/components/RNHMSSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNHMSSpec/EventEmitters.h>
#import <react/renderer/components/RNHMSSpec/Props.h>
#import <react/renderer/components/RNHMSSpec/RCTComponentViewHelpers.h>
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

// Forward declare Swift classes - linker will resolve at link time
@class HMSHLSPlayer;
@class HMSManager;

@interface HMSHLSPlayerComponentView : RCTViewComponentView
@end

@implementation HMSHLSPlayerComponentView {
  id _view;  // Use id to avoid needing full Swift class definition at compile time
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const HMSHLSPlayerProps>();
    _props = defaultProps;

    // Dynamically load Swift class to avoid circular dependency
    Class HMSHLSPlayerClass = NSClassFromString(@"HMSHLSPlayer");
    _view = [[HMSHLSPlayerClass alloc] initWithFrame:self.bounds];

    // Set HMS collection from shared static reference
    Class HMSManagerClass = NSClassFromString(@"HMSManager");
    NSDictionary *hmsCollection = [HMSManagerClass performSelector:@selector(getSharedHmsCollection)];
    [_view performSelector:@selector(setHms:) withObject:hmsCollection];

    self.contentView = (UIView *)_view;
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<HMSHLSPlayerProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<HMSHLSPlayerProps const>(props);

  // Handle url prop changes
  if (oldViewProps.url != newViewProps.url) {
    NSString *urlString = newViewProps.url.empty() ? nil : [NSString stringWithUTF8String:newViewProps.url.c_str()];
    [_view performSelector:@selector(setUrl:) withObject:urlString];
  }

  // Handle enableStats prop
  if (oldViewProps.enableStats != newViewProps.enableStats) {
    [_view performSelector:@selector(setEnableStats:) withObject:@(newViewProps.enableStats)];
  }

  // Handle enableControls prop
  if (oldViewProps.enableControls != newViewProps.enableControls) {
    [_view performSelector:@selector(setEnableControls:) withObject:@(newViewProps.enableControls)];
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [_view performSelector:@selector(setUrl:) withObject:nil];
  [_view performSelector:@selector(setEnableStats:) withObject:@(NO)];
  [_view performSelector:@selector(setEnableControls:) withObject:@(YES)];
}

@end

Class<RCTComponentViewProtocol> HMSHLSPlayerCls(void)
{
  return HMSHLSPlayerComponentView.class;
}
