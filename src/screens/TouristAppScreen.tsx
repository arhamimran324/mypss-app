import React from "react";
import defaultConfig from "../config/defaultConfig";
import WebViewContainer from "../components/WebViewContainer";

export default function TouristAppScreen() {
  return <WebViewContainer url={defaultConfig.baseUrl} />;
}
