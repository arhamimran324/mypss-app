import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Constants from "expo-constants";
import TouristAppScreen from "./screens/TouristAppScreen";
import SalesAppScreen from "./screens/SalesAppScreen";
import TechnicianAppScreen from "./screens/TechnicianAppScreen";
import LocalAppScreen from "./screens/LocalAppScreen";
import { loadConfig } from "./config";
import { SafeAreaView } from "react-native-safe-area-context";

type Variant = "tourist" | "sales" | "technician" | "local";

export default function App() {
  const runtimeVariant = (Constants.expoConfig?.extra?.APP_VARIANT ||
    "tourist") as Variant;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load initial config
    loadConfig(runtimeVariant).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (runtimeVariant === "tourist")
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <TouristAppScreen />
      </SafeAreaView>
    );
  if (runtimeVariant === "sales") return <SalesAppScreen />;
  if (runtimeVariant === "technician") return <TechnicianAppScreen />;
  return <LocalAppScreen />;
}
