// src/components/EnhancedWebView.tsx
import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as Location from "expo-location";
import * as Camera from "expo-camera";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import { AppConfig } from "../config/configTypes";

// Setup notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface EnhancedWebViewProps {
  config: AppConfig;
  url: string;
  onCodeRequired?: () => void;
}

export default function EnhancedWebView({
  config,
  url,
  onCodeRequired,
}: EnhancedWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const messageQueue = useRef<
    Map<string, { resolve: Function; reject: Function }>
  >(new Map());
  const [cameraStatus, requestPermission] = Camera.useCameraPermissions();

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      if (config.features.camera) {
        if (!cameraStatus?.granted) {
          requestPermission();
        }
        console.log("Camera permission:", cameraStatus?.granted);
      }

      if (config.features.gps) {
        const { status: locationStatus } =
          await Location.requestForegroundPermissionsAsync();
        console.log("Location permission:", locationStatus);
      }

      if (config.features.notifications) {
        const { status: notificationStatus } =
          await Notifications.requestPermissionsAsync();
        console.log("Notification permission:", notificationStatus);
      }
    } catch (error) {
      console.error("Permission error:", error);
    }
  };

  // Generate the JavaScript bridge to inject
  const injectedJavaScript = useCallback(() => {
    const bridgeMethods = `
      // Create the global bridge object
      window.AppNative = window.AppNative || {};
      window.__RNBridgeCallbacks = {};

      // Generic bridge call function
      window.__callNative = function(method, args = []) {
        return new Promise((resolve, reject) => {
          const callbackId = 'cb_' + Date.now() + '_' + Math.random().toString(36).substr(2);
          
          window.__RNBridgeCallbacks[callbackId] = { resolve, reject };
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'bridge_call',
            method: method,
            args: args,
            callbackId: callbackId
          }));
          
          // Timeout after 30 seconds
          setTimeout(() => {
            if (window.__RNBridgeCallbacks[callbackId]) {
              delete window.__RNBridgeCallbacks[callbackId];
              reject(new Error('Bridge call timeout'));
            }
          }, 30000);
        });
      };

      // Camera module
      window.AppNative.camera = {
        scanQR: function() {
          return window.__callNative('scanQR');
        },
        takePhoto: function(options) {
          return window.__callNative('takePhoto', [options]);
        },
        pickImage: function(options) {
          return window.__callNative('pickImage', [options]);
        }
      };

      // Location module
      window.AppNative.location = {
        getCurrent: function(options) {
          return window.__callNative('getCurrentLocation', [options]);
        },
        watchPosition: function(callback) {
          return window.__callNative('watchPosition', [callback]);
        },
        clearWatch: function(watchId) {
          return window.__callNative('clearWatch', [watchId]);
        }
      };

      // Notifications module
      window.AppNative.notifications = {
        schedule: function(notification, options) {
          return window.__callNative('scheduleNotification', [notification, options]);
        },
        getAllScheduled: function() {
          return window.__callNative('getAllScheduledNotifications');
        },
        cancelAll: function() {
          return window.__callNative('cancelAllNotifications');
        },
        getPermissions: function() {
          return window.__callNative('getNotificationPermissions');
        }
      };

      // Utilities module
      window.AppNative.utils = {
        getDeviceInfo: function() {
          return window.__callNative('getDeviceInfo');
        },
        openExternalMap: function(lat, lng, label) {
          return window.__callNative('openExternalMap', [lat, lng, label]);
        },
        openUrl: function(url) {
          return window.__callNative('openUrl', [url]);
        },
        share: function(content) {
          return window.__callNative('share', [content]);
        },
        vibrate: function(pattern) {
          return window.__callNative('vibrate', [pattern]);
        }
      };

      // Bluetooth module (stub for future implementation)
      ${
        config.features.bluetooth
          ? `
      window.AppNative.bluetooth = {
        scanDevices: function() {
          return window.__callNative('scanBluetoothDevices');
        },
        connectToDevice: function(deviceId) {
          return window.__callNative('connectToDevice', [deviceId]);
        }
      };
      `
          : "window.AppNative.bluetooth = undefined;"
      }

      // NFC module (stub for future implementation)
      ${
        config.features.nfc
          ? `
      window.AppNative.nfc = {
        readTag: function() {
          return window.__callNative('readNFCTag');
        },
        writeTag: function(data) {
          return window.__callNative('writeNFCTag', [data]);
        }
      };
      `
          : "window.AppNative.nfc = undefined;"
      }

      // Debug info
      window.AppNative._debug = {
        version: '1.0.0',
        config: ${JSON.stringify(config.features)},
        platform: '${Platform.OS}'
      };

      // Dispatch ready event
      setTimeout(() => {
        window.dispatchEvent(new Event('AppNativeReady'));
        console.log('[Bridge] Native bridge initialized with features:', ${JSON.stringify(
          config.features
        )});
      }, 100);

      true; // Required for injectedJavaScript
    `;

    return bridgeMethods;
  }, [config.features]);

  // Handle incoming messages from WebView
  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "bridge_call") {
        const { method, args, callbackId } = data;

        try {
          let result;

          // Handle different bridge methods
          switch (method) {
            // Camera methods
            case "scanQR":
              result = await handleScanQR();
              break;
            case "takePhoto":
              result = await handleTakePhoto(args[0]);
              break;
            case "pickImage":
              result = await handlePickImage(args[0]);
              break;

            // Location methods
            case "getCurrentLocation":
              result = await handleGetCurrentLocation(args[0]);
              break;

            // Notification methods
            case "scheduleNotification":
              result = await handleScheduleNotification(args[0], args[1]);
              break;
            case "getAllScheduledNotifications":
              result = await handleGetAllScheduledNotifications();
              break;
            case "cancelAllNotifications":
              result = await handleCancelAllNotifications();
              break;
            case "getNotificationPermissions":
              result = await handleGetNotificationPermissions();
              break;

            // Utility methods
            case "getDeviceInfo":
              result = await handleGetDeviceInfo();
              break;
            case "openExternalMap":
              result = await handleOpenExternalMap(args[0], args[1], args[2]);
              break;
            case "openUrl":
              result = await handleOpenUrl(args[0]);
              break;
            case "share":
              result = await handleShare(args[0]);
              break;
            case "vibrate":
              result = await handleVibrate(args[0]);
              break;

            // Stub methods (for future implementation)
            case "scanBluetoothDevices":
              result = await handleScanBluetoothDevices();
              break;
            case "connectToDevice":
              result = await handleConnectToDevice(args[0]);
              break;
            case "readNFCTag":
              result = await handleReadNFCTag();
              break;
            case "writeNFCTag":
              result = await handleWriteNFCTag(args[0]);
              break;

            default:
              throw new Error(`Unknown method: ${method}`);
          }

          // Send success response back to WebView
          sendResponse(callbackId, result, null);
        } catch (error) {
          console.error(`Bridge method error (${method}):`, error);
          sendResponse(
            callbackId,
            null,
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  // Send response back to WebView
  const sendResponse = (
    callbackId: string,
    result: any,
    error: string | null
  ) => {
    const response = JSON.stringify({
      type: "bridge_response",
      callbackId,
      result,
      error,
    });

    webViewRef.current?.injectJavaScript(`
      (function() {
        const callback = window.__RNBridgeCallbacks['${callbackId}'];
        if (callback) {
          if (${JSON.stringify(error)}) {
            callback.reject(new Error(${JSON.stringify(error)}));
          } else {
            callback.resolve(${JSON.stringify(result)});
          }
          delete window.__RNBridgeCallbacks['${callbackId}'];
        }
      })();
      true;
    `);
  };

  // === Native Method Implementations ===

  // Camera: Scan QR Code
  const handleScanQR = async () => {
    if (!config.features.camera) {
      throw new Error("Camera feature is disabled");
    }

    // For production, you'd use a proper QR scanner
    // This is a simplified version - you might want to use expo-barcode-scanner

    if (!cameraStatus?.granted) {
      throw new Error("Camera permission not granted");
    }

    // Return mock data for now - implement actual QR scanning in production
    return {
      data: "QR_SCANNER_MOCK_DATA_" + Date.now(),
      format: "QR_CODE",
      timestamp: new Date().toISOString(),
    };
  };

  // Camera: Take Photo
  const handleTakePhoto = async (options: any = {}) => {
    if (!config.features.camera) {
      throw new Error("Camera feature is disabled");
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing || false,
      aspect: options.aspect || [4, 3],
      quality: options.quality || 0.8,
      base64: options.base64 || false,
      exif: options.exif || false,
    });

    if (result.canceled) {
      throw new Error("User cancelled photo capture");
    }

    return {
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
      base64: result.assets[0].base64,
      exif: result.assets[0].exif,
    };
  };

  // Camera: Pick Image from Gallery
  const handlePickImage = async (options: any = {}) => {
    if (!config.features.camera) {
      throw new Error("Camera feature is disabled");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing || false,
      aspect: options.aspect || [4, 3],
      quality: options.quality || 0.8,
      base64: options.base64 || false,
      exif: options.exif || false,
    });

    if (result.canceled) {
      throw new Error("User cancelled image selection");
    }

    return {
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
      base64: result.assets[0].base64,
      exif: result.assets[0].exif,
    };
  };

  // Location: Get Current Location
  const handleGetCurrentLocation = async (options: any = {}) => {
    if (!config.features.gps) {
      throw new Error("GPS feature is disabled");
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: options.accuracy || Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      speed: location.coords.speed,
      heading: location.coords.heading,
      timestamp: location.timestamp,
    };
  };

  // Notifications: Schedule Notification
  const handleScheduleNotification = async (
    notification: any,
    options: any = {}
  ) => {
    if (!config.features.notifications) {
      throw new Error("Notifications feature is disabled");
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title || "Notification",
        body: notification.body || "",
        data: notification.data || {},
        sound: notification.sound || true,
      },
      trigger: options.trigger || null,
    });

    return { identifier };
  };

  // Notifications: Get All Scheduled
  const handleGetAllScheduledNotifications = async () => {
    if (!config.features.notifications) {
      throw new Error("Notifications feature is disabled");
    }

    return await Notifications.getAllScheduledNotificationsAsync();
  };

  // Notifications: Cancel All
  const handleCancelAllNotifications = async () => {
    if (!config.features.notifications) {
      throw new Error("Notifications feature is disabled");
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    return { success: true };
  };

  // Notifications: Get Permissions
  const handleGetNotificationPermissions = async () => {
    if (!config.features.notifications) {
      throw new Error("Notifications feature is disabled");
    }

    const settings = await Notifications.getPermissionsAsync();
    return settings;
  };

  // Utilities: Get Device Info
  const handleGetDeviceInfo = async () => {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isEmulator: Platform.isTesting || false,
    };
  };

  // Utilities: Open External Map
  const handleOpenExternalMap = async (
    lat: number,
    lng: number,
    label?: string
  ) => {
    const url = Platform.select({
      ios: `maps://?q=${label || "Location"}&ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label || "Location"})`,
      default: `https://maps.google.com/?q=${lat},${lng}`,
    });

    const supported = await Linking.canOpenURL(url!);

    if (supported) {
      await Linking.openURL(url!);
      return { success: true, url };
    } else {
      throw new Error(`Cannot open map URL: ${url}`);
    }
  };

  // Utilities: Open URL
  const handleOpenUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      return { success: true, url };
    } else {
      throw new Error(`Cannot open URL: ${url}`);
    }
  };

  // Utilities: Share Content
  const handleShare = async (content: any) => {
    // This would use React Native's Share API
    // For now, return success
    return { success: true, message: "Share functionality ready" };
  };

  // Utilities: Vibrate
  const handleVibrate = async (pattern: any) => {
    // This would use React Native's Vibration API
    return { success: true, pattern };
  };

  // Bluetooth: Scan Devices (Stub)
  const handleScanBluetoothDevices = async () => {
    if (!config.features.bluetooth) {
      throw new Error("Bluetooth feature is disabled");
    }
    return [{ name: "Mock Bluetooth Device", id: "00:11:22:33:44:55" }];
  };

  // Bluetooth: Connect to Device (Stub)
  const handleConnectToDevice = async (deviceId: string) => {
    if (!config.features.bluetooth) {
      throw new Error("Bluetooth feature is disabled");
    }
    return { success: true, deviceId };
  };

  // NFC: Read Tag (Stub)
  const handleReadNFCTag = async () => {
    if (!config.features.nfc) {
      throw new Error("NFC feature is disabled");
    }
    return { data: "NFC_MOCK_DATA", format: "NDEF" };
  };

  // NFC: Write Tag (Stub)
  const handleWriteNFCTag = async (data: string) => {
    if (!config.features.nfc) {
      throw new Error("NFC feature is disabled");
    }
    return { success: true, data };
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: config.loginUrl || url }}
      startInLoadingState
      injectedJavaScript={injectedJavaScript()}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      sharedCookiesEnabled={true}
      thirdPartyCookiesEnabled={true}
      renderLoading={() => (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      )}
      onError={(error) => {
        console.error("WebView error:", error.nativeEvent);
        if (onCodeRequired && error.nativeEvent.description?.includes("403")) {
          onCodeRequired();
        }
      }}
      onHttpError={(syntheticEvent) => {
        const { statusCode } = syntheticEvent.nativeEvent;
        console.error("HTTP error:", statusCode);
        if ((statusCode === 401 || statusCode === 403) && onCodeRequired) {
          onCodeRequired();
        }
      }}
      onLoadProgress={({ nativeEvent }) => {
        if (nativeEvent.progress === 1) {
          console.log("WebView fully loaded");
        }
      }}
      // iOS specific
      allowsInlineMediaPlayback={true}
      // Android specific
      androidLayerType="hardware"
    />
  );
}
