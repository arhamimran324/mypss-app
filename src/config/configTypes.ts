export type AppConfig = {
  baseUrl: string;
  loginUrl?: string;
  features: {
    camera: boolean;
    gps: boolean;
    bluetooth: boolean;
    nfc: boolean;
    notifications: boolean;
  };
};
