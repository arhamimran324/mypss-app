export default ({ config }) => {
  const appType = process.env.APP_TYPE || "tourist";

  const appSettings = {
    tourist: {
      name: "Tourist App",
      bundle: "com.mypss.tourist",
      slug: "tourist-app",
      icon: "./assets/icon.png",
    },
    sales: {
      name: "Sales App",
      bundle: "com.mypss.sales",
      slug: "sales-app",
      icon: "./assets/icon.png",
    },
    technician: {
      name: "Technician App",
      bundle: "com.mypss.technician",
      slug: "technician-app",
      icon: "./assets/icon.png",
    },
    local: {
      name: "Local Offline App",
      bundle: "com.mypss.local",
      slug: "local-app",
      icon: "./assets/icon.png",
    },
  };

  const selected = appSettings[appType];

  return {
    expo: {
      ...config,

      name: selected.name,
      slug: selected.slug,
      version: "1.0.0",

      icon: selected.icon,
      orientation: "portrait",

      splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },

      ios: {
        supportsTablet: true,
        bundleIdentifier: selected.bundle,
      },

      android: {
        package: selected.bundle,
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff",
        },
      },

      web: {
        favicon: "./assets/favicon.png",
      },

      extra: {
        appType,
        eas: {
          projectId: "6419711c-b3c6-47f2-84fc-ba8e8cc22e10", // REQUIRED
        },
      },

      owner: "arhamimran435",
    },
  };
};
