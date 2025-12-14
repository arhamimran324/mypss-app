// src/bridge/NativeBridge.ts
import { Platform } from "react-native";
import { AppConfig } from "../config/configTypes";

export interface NativeBridgeMethods {
  // Camera
  scanQR(): Promise<{ data: string }>;
  takePhoto(): Promise<{ uri: string }>;

  // Location
  getCurrentLocation(): Promise<{ lat: number; lng: number }>;

  // Bluetooth
  scanBluetoothDevices(): Promise<Array<{ name: string; id: string }>>;
  connectToDevice(deviceId: string): Promise<void>;

  // NFC
  readNFCTag(): Promise<{ data: string }>;

  // Notifications
  scheduleNotification(
    title: string,
    body: string,
    delay: number
  ): Promise<void>;

  // Utility
  openExternalMap(lat: number, lng: number, label?: string): Promise<void>;
  getDeviceInfo(): Promise<{ platform: string; version: string }>;
}

class NativeBridge implements NativeBridgeMethods {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  // Camera Methods
  async scanQR(): Promise<{ data: string }> {
    if (!this.config.features.camera) {
      throw new Error("Camera feature is disabled");
    }

    // For now, return mock data. We'll implement native module in Step 2
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: "https://example.com/qr-data" });
      }, 500);
    });
  }

  async takePhoto(): Promise<{ uri: string }> {
    if (!this.config.features.camera) {
      throw new Error("Camera feature is disabled");
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ uri: "file:///path/to/photo.jpg" });
      }, 500);
    });
  }

  // Location Methods
  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    if (!this.config.features.gps) {
      throw new Error("GPS feature is disabled");
    }

    return new Promise((resolve) => {
      // Mock location - will be replaced with real implementation
      resolve({ lat: 59.3293, lng: 18.0686 }); // Stockholm coordinates
    });
  }

  // Bluetooth Methods (stubs for now)
  async scanBluetoothDevices() {
    if (!this.config.features.bluetooth) {
      throw new Error("Bluetooth feature is disabled");
    }
    return [];
  }

  async connectToDevice(deviceId: string) {
    if (!this.config.features.bluetooth) {
      throw new Error("Bluetooth feature is disabled");
    }
  }

  // NFC Methods (stubs for now)
  async readNFCTag() {
    if (!this.config.features.nfc) {
      throw new Error("NFC feature is disabled");
    }
    return { data: "NFC_TAG_DATA" };
  }

  // Notification Methods
  async scheduleNotification(title: string, body: string, delay: number) {
    if (!this.config.features.notifications) {
      throw new Error("Notifications feature is disabled");
    }
    console.log(`Scheduled notification: ${title} - ${body} in ${delay}ms`);
  }

  // Utility Methods
  async openExternalMap(lat: number, lng: number, label?: string) {
    const url = Platform.select({
      ios: `maps://?q=${label || "Destination"}&ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label || "Destination"})`,
    });

    // We'll implement linking in Step 2
    console.log(`Would open: ${url}`);
  }

  async getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version.toString(),
    };
  }
}

export default NativeBridge;
