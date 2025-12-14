// src/screens/TouristAppScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, BackHandler } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EnhancedWebView from "../components/EnhancedWebView";
import CodeEntryScreen from "./CodeEntryScreen";
import { loadConfig } from "../config";
import { AppConfig } from "../config/configTypes";

export default function TouristAppScreen() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [showProfileSwitch, setShowProfileSwitch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState("default");

  useEffect(() => {
    initializeApp();
    setupBackHandler();

    return () => {
      BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    };
  }, []);

  const setupBackHandler = () => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
  };

  const handleBackPress = () => {
    // You can add custom back button behavior here
    return false; // Let system handle it
  };

  const initializeApp = async () => {
    try {
      const loadedConfig = await loadConfig("tourist");
      setConfig(loadedConfig);

      const savedProfile = await AsyncStorage.getItem("@tourist_profile");
      if (savedProfile && savedProfile !== "default") {
        setCurrentProfile(savedProfile);
      }
    } catch (error) {
      console.error("Failed to initialize app:", error);
      Alert.alert(
        "Error",
        "Failed to load app configuration. Please try again.",
        [{ text: "OK", onPress: () => initializeApp() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchProfile = async (profileCode: string) => {
    try {
      // Load profile-specific config
      const domain = "aland.se";
      const url = `https://config.${domain}/app-config/tourist/${profileCode}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load profile");

      const newConfig = await response.json();

      // Validate config
      if (!newConfig.baseUrl || !newConfig.features) {
        throw new Error("Invalid profile configuration");
      }

      setConfig(newConfig);
      setCurrentProfile(profileCode);
      setShowProfileSwitch(false);

      await AsyncStorage.setItem("@tourist_profile", profileCode);
      await AsyncStorage.setItem("@config/tourist", JSON.stringify(newConfig));
    } catch (error) {
      Alert.alert(
        "Profile Error",
        error instanceof Error ? error.message : "Failed to switch profile"
      );
    }
  };

  const handleResetToDefault = async () => {
    try {
      const defaultConfig = await loadConfig("tourist");
      setConfig(defaultConfig);
      setCurrentProfile("default");
      setShowProfileSwitch(false);

      await AsyncStorage.removeItem("@tourist_profile");
      await AsyncStorage.setItem(
        "@config/tourist",
        JSON.stringify(defaultConfig)
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reset to default");
    }
  };

  if (loading || !config) {
    return <View style={styles.loadingContainer}>{/* Loading spinner */}</View>;
  }

  return (
    <View style={styles.container}>
      <EnhancedWebView config={config} url={config.baseUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Black background for WebView edges
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
