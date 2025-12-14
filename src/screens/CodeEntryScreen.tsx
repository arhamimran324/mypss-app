// src/screens/CodeEntryScreen.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CodeEntryScreenProps {
  appType: "sales" | "technician" | "local" | "tourist";
  onConfigLoaded: (config: any, code: string) => void;
  onBack?: () => void;
}

type OnlineAppType = "sales" | "technician";

export default function CodeEntryScreen({
  appType,
  onConfigLoaded,
  onBack,
}: CodeEntryScreenProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter a code");
      return;
    }

    setLoading(true);

    try {
      let configUrl: string;

      if (appType === "local") {
        // For local app, code might be a JSON string with baseUrl
        try {
          const parsed = JSON.parse(code);
          if (parsed.baseUrl) {
            // QR code format
            configUrl = `${parsed.baseUrl}/app-config/offline/${
              parsed.code || "default"
            }`;
          } else {
            throw new Error("Invalid QR format");
          }
        } catch {
          // Assume it's just a code for Raspberry Pi
          configUrl = `http://192.168.4.1/app-config/offline/${code}`;
        }
      } else {
        // Online apps
        const domainMap: Record<OnlineAppType, string> = {
          sales: "mypss.eu",
          technician: "productsupportsystem.com",
        };

        if (appType === "tourist") {
          throw new Error("Tourist app does not support online config");
        }

        const domain = domainMap[appType]; // ✅ safe
        configUrl = `https://config.${domain}/app-config/${appType}/${code}`;
      }

      const response = await fetch(configUrl);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const config = await response.json();

      // Validate config structure
      if (!config.baseUrl || !config.features) {
        throw new Error("Invalid config format");
      }

      // Cache the config
      await AsyncStorage.setItem(`@config/${appType}`, JSON.stringify(config));

      // Cache the code for future use
      await AsyncStorage.setItem(`@last_code/${appType}`, code);

      onConfigLoaded(config, code);
    } catch (error) {
      Alert.alert(
        "Configuration Error",
        error instanceof Error
          ? error.message
          : "Failed to load configuration. Please check your code and connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    // This will be implemented with actual QR scanning
    Alert.alert(
      "QR Scanning",
      "QR scanning will be implemented with camera bridge"
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {appType === "sales" && "Sales App"}
          {appType === "technician" && "Technician App"}
          {appType === "local" && "Local App"}
        </Text>

        <Text style={styles.subtitle}>Enter your access code to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter code (e.g., ABC123)"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!loading}
        />

        {appType === "local" && (
          <TouchableOpacity
            style={styles.qrButton}
            onPress={handleScanQR}
            disabled={loading}
          >
            <Text style={styles.qrButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  qrButton: {
    backgroundColor: "#34C759",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
