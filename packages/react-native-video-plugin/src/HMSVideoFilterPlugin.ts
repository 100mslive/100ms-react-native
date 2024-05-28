import { HMSVideoPlugin } from './HMSVideoPlugin';

type SupportedFilters =
  | 'hue'
  | 'saturation'
  | 'brightness'
  | 'contrast'
  | 'smoothness'
  | 'redness'
  | 'sharpness'
  | 'exposure';

export class HMSVideoFilterPlugin extends HMSVideoPlugin {
  static NAME = 'HMSVideoFilterPlugin';

  constructor() {
    super(HMSVideoFilterPlugin.NAME);
  }

  setHue(val: number) {
    return this.setFilter('hue', val);
  }
  setSaturation(val: number) {
    return this.setFilter('saturation', val);
  }
  setBrightness(val: number) {
    return this.setFilter('brightness', val);
  }
  setContrast(val: number) {
    return this.setFilter('contrast', val);
  }
  setSmoothness(val: number) {
    return this.setFilter('smoothness', val);
  }
  setRedness(val: number) {
    return this.setFilter('redness', val);
  }
  setSharpness(val: number) {
    return this.setFilter('sharpness', val);
  }
  setExposure(val: number) {
    return this.setFilter('exposure', val);
  }
  private setFilter(filter: SupportedFilters, value: number): Promise<boolean> {
    const data = {
      id: '12345',
      filter,
      value,
    };
    return this.nativeModule.setVideoFilterParameter(data);
  }
}
