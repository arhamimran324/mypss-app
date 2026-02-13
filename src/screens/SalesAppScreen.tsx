// src/screens/SalesAppScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EnhancedWebView from "../components/EnhancedWebView";
import CodeEntryScreen from "./CodeEntryScreen";
import { AppConfig } from "../config/configTypes";

export default function SalesAppScreen() {
  const [config, setConfig] = useState<any | null>(null);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingConfig();
  }, []);

  const checkExistingConfig = async () => {
    try {
      const cached = await AsyncStorage.getItem("@config/sales");
      const lastCode = await AsyncStorage.getItem("@last_code/sales");

      if (cached && lastCode) {
        // Validate cached config
        const parsed = JSON.parse(cached);
        if (parsed.baseUrl && parsed.features) {
          setConfig(parsed);
        } else {
          // Invalid cache, show code entry
          setShowCodeEntry(true);
        }
      } else {
        // No cached config
        setShowCodeEntry(true);
      }
    } catch (error) {
      console.error("Error checking config:", error);
      setShowCodeEntry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigLoaded = (newConfig: AppConfig, code: string) => {
    setConfig(newConfig);
    setShowCodeEntry(false);

    // Store for future
    AsyncStorage.setItem("@config/sales", JSON.stringify(newConfig));
    AsyncStorage.setItem("@last_code/sales", code);
  };

  const handleCodeRequired = () => {
    setShowCodeEntry(true);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("@config/sales");
          await AsyncStorage.removeItem("@last_code/sales");
          setConfig(null);
          setShowCodeEntry(true);
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.loadingContainer}>{/* Loading spinner */}</View>;
  }

  if (showCodeEntry || !config) {
    return (
      <CodeEntryScreen appType="sales" onConfigLoaded={handleConfigLoaded} />
    );
  }

  return (
    <View style={styles.container}>
      <EnhancedWebView
        config={config}
        url={config?.urls?.base_webview_url}
        onCodeRequired={handleCodeRequired}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
