// App.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  LogBox,
  Platform,
  TouchableOpacity,
} from "react-native";
import Constants from "expo-constants";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import TouristAppScreen from "./screens/TouristAppScreen";
import SalesAppScreen from "./screens/SalesAppScreen";
import TechnicianAppScreen from "./screens/TechnicianAppScreen";
import LocalAppScreen from "./screens/LocalAppScreen";
import { loadConfig } from "./config";
import ErrorBoundary from "./components/ErrorBoundary";

// Ignore specific warnings
LogBox.ignoreLogs([
  "Remote debugger",
  "Non-serializable values were found in the navigation state",
]);

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

type Variant = "tourist" | "sales" | "technician" | "local";

export default function App() {
  const runtimeVariant = (Constants.expoConfig?.extra?.APP_VARIANT ||
    "technician") as Variant;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load initial configuration
      await loadConfig(runtimeVariant);

      // Simulate some loading time for splash screen
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to initialize app:", error);
      setError("Failed to initialize application. Please restart.");
    } finally {
      setLoading(false);
      await SplashScreen.hideAsync();
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorContainer}>
          <View style={styles.errorTitle}>Error</View>
          <View style={styles.errorMessage}>{error}</View>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              initializeApp();
            }}
          >
            Retry
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderScreen = () => {
    switch (runtimeVariant) {
      case "tourist":
        return <TouristAppScreen />;
      case "sales":
        return <SalesAppScreen />;
      case "technician":
        return <TechnicianAppScreen />;
      case "local":
        return <LocalAppScreen />;
      default:
        return <TouristAppScreen />;
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        {renderScreen()}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    padding: 24,
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
