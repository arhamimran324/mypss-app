import React from "react";
import defaultConfig from "../config/defaultConfig";
import WebViewContainer from "../components/WebViewContainer";

export default function TechnicianAppScreen() {
  return <WebViewContainer url={defaultConfig.baseUrl} />;
}
