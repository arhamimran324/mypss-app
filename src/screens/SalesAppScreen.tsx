import React from "react";
import defaultConfig from "../config/defaultConfig";
import WebViewContainer from "../components/WebViewContainer";

export default function SalesAppScreen() {
  return <WebViewContainer url={defaultConfig.baseUrl} />;
}
