#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import <react/renderer/components/RNHMSSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNHMSSpec/EventEmitters.h>
#import <react/renderer/components/RNHMSSpec/Props.h>
#import <react/renderer/components/RNHMSSpec/RCTComponentViewHelpers.h>
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

// Forward declare Swift classes - linker will resolve at link time
@class HmssdkDisplayView;
@class HMSManager;

@interface HMSViewComponentView : RCTViewComponentView
@end

@implementation HMSViewComponentView {
  id _view;  // Use id to avoid needing full Swift class definition at compile time
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const HMSViewProps>();
    _props = defaultProps;

    // Dynamically load Swift class to avoid circular dependency
    Class HmssdkDisplayViewClass = NSClassFromString(@"HmssdkDisplayView");
    _view = [[HmssdkDisplayViewClass alloc] initWithFrame:self.bounds];

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
  const auto &oldViewProps = *std::static_pointer_cast<HMSViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<HMSViewProps const>(props);

  // Handle data prop changes - compare individual fields (direct values, not optionals)
  bool dataChanged =
    oldViewProps.data.trackId != newViewProps.data.trackId ||
    oldViewProps.data.id != newViewProps.data.id ||
    oldViewProps.data.mirror != newViewProps.data.mirror;

  if (dataChanged) {
    NSMutableDictionary *dataDict = [NSMutableDictionary new];
    const auto &data = newViewProps.data;

    if (!data.trackId.empty()) {
      dataDict[@"trackId"] = [NSString stringWithUTF8String:data.trackId.c_str()];
    }
    if (!data.id.empty()) {
      dataDict[@"id"] = [NSString stringWithUTF8String:data.id.c_str()];
    }
    dataDict[@"mirror"] = @(data.mirror);

    [_view performSelector:@selector(setData:) withObject:dataDict];
  }

  // Handle autoSimulcast prop
  if (oldViewProps.autoSimulcast != newViewProps.autoSimulcast) {
    [_view performSelector:@selector(setAutoSimulcast:) withObject:@(newViewProps.autoSimulcast)];
  }

  // Handle scaleType prop
  if (oldViewProps.scaleType != newViewProps.scaleType) {
    NSString *scaleType = newViewProps.scaleType.empty() ? @"ASPECT_FILL" : [NSString stringWithUTF8String:newViewProps.scaleType.c_str()];
    [_view performSelector:@selector(setScaleType:) withObject:scaleType];
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [_view performSelector:@selector(setData:) withObject:@{}];
}

@end

Class<RCTComponentViewProtocol> HMSViewCls(void)
{
  return HMSViewComponentView.class;
}
