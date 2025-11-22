import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultConfig from "./defaultConfig";
import { AppConfig } from "./configTypes";

const CONFIG_CACHE_KEY = (appType: string) => `@config/${appType}`;

export async function loadConfig(appType: string): Promise<AppConfig> {
  try {
    if (appType === "tourist") {
      await AsyncStorage.setItem(
        CONFIG_CACHE_KEY(appType),
        JSON.stringify(defaultConfig)
      );
      return defaultConfig;
    }

    const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY(appType));
    if (cached) return JSON.parse(cached);

    const code = "default";
    const domainMap: Record<string, string> = {
      tourist: "aland.se",
      sales: "mypss.eu",
      technician: "productsupportsystem.com",
      local: "local",
    };

    const domain = domainMap[appType] ?? "aland.se";
    const url = `https://config.${domain}/app-config/${appType}/${code}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Failed to fetch config");
    const json = await resp.json();
    await AsyncStorage.setItem(CONFIG_CACHE_KEY(appType), JSON.stringify(json));
    return json as AppConfig;
  } catch (e) {
    return defaultConfig;
  }
}
