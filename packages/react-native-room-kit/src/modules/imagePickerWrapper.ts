let ImagePicker:
  | {
      launchCamera: (options: Record<string, any>) => Promise<any>;
      launchImageLibrary: (options: Record<string, any>) => Promise<any>;
    }
  | undefined;

try {
  ImagePicker = require('react-native-image-picker');
} catch (error) {
  ImagePicker = undefined;
}

if (!ImagePicker?.launchCamera || !ImagePicker?.launchImageLibrary) {
  // Make sure the loaded module is actually `react-native-image-picker`, if it's not
  // reset the module to undefined so we can fallback to the default implementation
  ImagePicker = undefined;
}

export { ImagePicker };
