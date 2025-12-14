// config/index.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultConfig from "./defaultConfig";
import { AppConfig } from "./configTypes";

const CONFIG_CACHE_KEY = (appType: string) => `@config/${appType}`;
const LAST_CODE_KEY = (appType: string) => `@last_code/${appType}`;
const CACHE_TIMESTAMP_KEY = (appType: string) => `@config_timestamp/${appType}`;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function loadConfig(
  appType: string,
  forceRefresh = false
): Promise<AppConfig> {
  try {
    // For tourist app, always use default or cached
    if (appType === "tourist") {
      const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY(appType));
      if (cached) {
        return JSON.parse(cached);
      }
      await AsyncStorage.setItem(
        CONFIG_CACHE_KEY(appType),
        JSON.stringify(defaultConfig)
      );
      return defaultConfig;
    }

    // Check cache validity
    if (!forceRefresh) {
      const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY(appType));
      const timestamp = await AsyncStorage.getItem(
        CACHE_TIMESTAMP_KEY(appType)
      );

      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < CACHE_DURATION) {
          return JSON.parse(cached);
        }
      }
    }

    // Get the last used code
    const lastCode = await AsyncStorage.getItem(LAST_CODE_KEY(appType));
    if (!lastCode && appType !== "tourist") {
      throw new Error("No configuration code found");
    }

    const code = lastCode || "default";
    const domainMap: Record<string, string> = {
      tourist: "aland.se",
      sales: "mypss.eu",
      technician: "productsupportsystem.com",
      local: "local",
    };

    const domain = domainMap[appType] ?? "aland.se";

    // Construct URL based on app type
    let url: string;
    if (appType === "local") {
      const baseUrl =
        (await AsyncStorage.getItem("@local_base_url")) || "http://192.168.4.1";
      url = `${baseUrl}/app-config/offline/${code}`;
    } else {
      url = `https://config.${domain}/app-config/${appType}/${code}`;
    }

    // Fetch fresh config
    const response = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status}`);
    }

    const json = await response.json();

    // Validate config structure
    if (!json.baseUrl || !json.features) {
      throw new Error("Invalid config format received");
    }

    // Cache the config
    await AsyncStorage.setItem(CONFIG_CACHE_KEY(appType), JSON.stringify(json));
    await AsyncStorage.setItem(
      CACHE_TIMESTAMP_KEY(appType),
      Date.now().toString()
    );

    return json as AppConfig;
  } catch (error) {
    console.error(`Failed to load config for ${appType}:`, error);

    // Try to return cached config as fallback
    const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY(appType));
    if (cached) {
      return JSON.parse(cached);
    }

    // Return default config as last resort
    return defaultConfig;
  }
}

export async function clearConfigCache(appType: string) {
  await AsyncStorage.removeItem(CONFIG_CACHE_KEY(appType));
  await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY(appType));
}

export async function getLastCode(appType: string): Promise<string | null> {
  return AsyncStorage.getItem(LAST_CODE_KEY(appType));
}

export async function setLastCode(appType: string, code: string) {
  await AsyncStorage.setItem(LAST_CODE_KEY(appType), code);
}
