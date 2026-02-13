import React from "react";
import defaultConfig from "../config/defaultConfig";
import WebViewContainer from "../components/WebViewContainer";

export default function LocalAppScreen() {
  return <WebViewContainer url={defaultconfig?.urls?.base_webview_url} />;
}
