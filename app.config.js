// app.config.js
const variant = process.env.APP_VARIANT || "tourist";

const configs = {
  tourist: {
    name: "Tourist App",
    slug: "tourist-app",
    extra: {
      APP_VARIANT: "tourist",
    },
    ios: {
      bundleIdentifier: "com.yourcompany.tourist",
    },
    android: {
      package: "com.yourcompany.tourist",
    },
  },
  sales: {
    name: "Sales App",
    slug: "sales-app",
    extra: {
      APP_VARIANT: "sales",
      eas: {
        projectId: "eb14370d-ac11-49a1-9671-fbe8afcf8ef1", // Your sales project ID
      },
    },
    ios: {
      bundleIdentifier: "com.yourcompany.sales",
    },
    android: {
      package: "com.yourcompany.sales",
    },
  },
  technician: {
    name: "Technician App",
    slug: "technician-app",
    extra: {
      APP_VARIANT: "technician",
      eas: {
        projectId: "f9dcf137-1b83-403c-b7c0-7e49cc1c3fb5",
      },
    },
    ios: {
      bundleIdentifier: "com.yourcompany.technician",
    },
    android: {
      package: "com.yourcompany.technician",
    },
  },
  local: {
    name: "Local App",
    slug: "local-app",
    extra: {
      APP_VARIANT: "local",
    },
    ios: {
      bundleIdentifier: "com.yourcompany.local",
    },
    android: {
      package: "com.yourcompany.local",
    },
  },
};

const baseConfig = {
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "This app needs access to your location.",
      NSCameraUsageDescription: "This app needs access to your camera.",
      NSPhotoLibraryUsageDescription:
        "This app needs access to your photo library.",
      NSBluetoothAlwaysUsageDescription: "This app uses Bluetooth.",
      NSBluetoothPeripheralUsageDescription: "This app uses Bluetooth.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    permissions: [
      "android.permission.CAMERA",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.BLUETOOTH",
      "android.permission.BLUETOOTH_ADMIN",
      "android.permission.BLUETOOTH_CONNECT",
      "android.permission.BLUETOOTH_SCAN",
      "android.permission.VIBRATE",
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
    ],
  },
  plugins: ["expo-camera", "expo-location", "expo-notifications"],
};

export default {
  ...baseConfig,
  ...configs[variant],
};
