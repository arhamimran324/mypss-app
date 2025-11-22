import { AppConfig } from "./configTypes";
const defaultConfig: AppConfig = {
  baseUrl: "https://aland.se",
  features: {
    camera: true,
    gps: true,
    bluetooth: false,
    nfc: false,
    notifications: false,
  },
};
export default defaultConfig;
