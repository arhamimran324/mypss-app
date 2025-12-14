// src/screens/TestBridgeScreen.tsx
import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { AppConfig } from "../config/configTypes";

// Import or create a default config for testing
const testConfig: AppConfig = {
  baseUrl: "https://aland.se",
  loginUrl: "https://aland.se/app-login?token=test123",
  features: {
    camera: true,
    gps: true,
    bluetooth: true,
    nfc: true,
    notifications: true,
  },
};

export default function TestBridgeScreen() {
  const webViewRef = useRef<WebView>(null);

  // This is the bridge JavaScript that gets injected into WebView
  const injectedJavaScript = `
    (function() {
      console.log('[Bridge] Starting bridge injection...');
      
      // Create the AppNative object
      window.AppNative = window.AppNative || {};
      
      // Mock implementation for testing
      // In real app, these will call postMessage to Native
      window.AppNative.utils = {
        getDeviceInfo: function() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                platform: navigator.userAgent.includes('iPhone') ? 'iOS' : 'Android',
                version: '1.0.0'
              });
            }, 100);
          });
        },
        
        openExternalMap: function(lat, lng, label) {
          console.log('[Mock] Would open map:', lat, lng, label);
          return Promise.resolve();
        }
      };
      
      window.AppNative.camera = {
        scanQR: function() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: 'https://example.com/test-qr-data' });
            }, 500);
          });
        },
        
        takePhoto: function() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({ uri: 'file:///mock/photo.jpg' });
            }, 500);
          });
        }
      };
      
      window.AppNative.location = {
        getCurrent: function() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({ lat: 59.3293, lng: 18.0686 }); // Stockholm
            }, 100);
          });
        }
      };
      
      window.AppNative.bluetooth = {
        scanDevices: function() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve([{ name: 'Mock Device', id: '00:11:22:33:44:55' }]);
            }, 300);
          });
        },
        
        connectToDevice: function(deviceId) {
          console.log('[Mock] Connecting to:', deviceId);
          return Promise.resolve();
        }
      };
      
      window.AppNative.nfc = {
        readTag: function() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: 'NFC_MOCK_DATA' });
            }, 200);
          });
        }
      };
      
      window.AppNative.notifications = {
        schedule: function(title, body, delay) {
          console.log('[Mock] Scheduling:', title, body, delay);
          return Promise.resolve();
        }
      };
      
      console.log('[Bridge] Bridge injected successfully!');
      console.log('[Bridge] Available modules:', Object.keys(window.AppNative));
      
      // Dispatch ready event
      setTimeout(() => {
        window.dispatchEvent(new Event('AppNativeReady'));
      }, 100);
      
      true; // Required for injectedJavaScript
    })();
  `;

  // Simple test HTML
  const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 20px;
          background: #f5f5f5;
          margin: 0;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        button {
          background: #007AFF;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin: 5px 0;
          transition: opacity 0.2s;
        }
        button:hover {
          opacity: 0.9;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .result {
          margin-top: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          font-family: monospace;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .loading {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }
        .status {
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 600;
        }
        .feature-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 10px 0;
        }
        .feature-tag {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .enabled {
          background: #34C759;
          color: white;
        }
        .disabled {
          background: #8E8E93;
          color: white;
          opacity: 0.6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔧 Native Bridge Test</h1>
        
        <div id="status" class="status loading">
          ⏳ Waiting for bridge...
        </div>
        
        <div class="card">
          <h2>Bridge Status</h2>
          <button onclick="checkBridge()">Check Bridge</button>
          <div id="bridgeResult" class="result"></div>
        </div>
        
        <div class="card">
          <h2>Device Info</h2>
          <button onclick="testDeviceInfo()">Get Device Info</button>
          <div id="deviceResult" class="result"></div>
        </div>
        
        <div class="card">
          <h2>Camera</h2>
          <button onclick="testScanQR()">Scan QR Code</button>
          <button onclick="testTakePhoto()">Take Photo</button>
          <div id="cameraResult" class="result"></div>
        </div>
        
        <div class="card">
          <h2>Location</h2>
          <button onclick="testLocation()">Get Location</button>
          <button onclick="testOpenMap()">Open Map</button>
          <div id="locationResult" class="result"></div>
        </div>
        
        <div class="card">
          <h2>Run All Tests</h2>
          <button onclick="runAllTests()" style="background: linear-gradient(135deg, #667eea, #764ba2);">
            🚀 Run Complete Test Suite
          </button>
          <div id="allTestsResult" class="result"></div>
        </div>
      </div>
      
      <script>
        let testResults = [];
        
        function showResult(elementId, message, isError = false) {
          const element = document.getElementById(elementId);
          element.textContent = message;
          element.className = 'result ' + (isError ? 'error' : 'success');
          console.log(isError ? '❌' : '✅', message);
        }
        
        function updateStatus(message, type = 'loading') {
          const status = document.getElementById('status');
          status.textContent = message;
          status.className = 'status ' + type;
        }
        
        function checkBridge() {
          if (!window.AppNative) {
            showResult('bridgeResult', '❌ Bridge not found!\\nMake sure injectedJavaScript is working.', true);
            return;
          }
          
          let modules = [];
          for (const module in window.AppNative) {
            modules.push(module);
          }
          
          showResult('bridgeResult', 
            '✅ Bridge is ready!\\n\\n' +
            'Available modules:\\n' +
            modules.join(', ') + '\\n\\n' +
            'Total: ' + modules.length + ' modules'
          );
        }
        
        async function testDeviceInfo() {
          try {
            if (!window.AppNative?.utils?.getDeviceInfo) {
              throw new Error('Device info not available');
            }
            
            const info = await window.AppNative.utils.getDeviceInfo();
            showResult('deviceResult', 
              '📱 Device Information:\\n' +
              'Platform: ' + info.platform + '\\n' +
              'Version: ' + info.version + '\\n' +
              'Time: ' + new Date().toLocaleTimeString()
            );
          } catch (error) {
            showResult('deviceResult', '❌ Error: ' + error.message, true);
          }
        }
        
        async function testScanQR() {
          try {
            const result = await window.AppNative.camera.scanQR();
            showResult('cameraResult', 
              '📷 QR Scan Result:\\n' +
              'Data: ' + result.data + '\\n' +
              'Length: ' + result.data.length + ' chars'
            );
          } catch (error) {
            showResult('cameraResult', '❌ QR Error: ' + error.message, true);
          }
        }
        
        async function testTakePhoto() {
          try {
            const result = await window.AppNative.camera.takePhoto();
            showResult('cameraResult', 
              '📸 Photo Captured:\\n' +
              'URI: ' + result.uri + '\\n' +
              'Mock implementation for testing'
            );
          } catch (error) {
            showResult('cameraResult', '❌ Photo Error: ' + error.message, true);
          }
        }
        
        async function testLocation() {
          try {
            const location = await window.AppNative.location.getCurrent();
            showResult('locationResult', 
              '📍 Current Location:\\n' +
              'Latitude: ' + location.lat + '\\n' +
              'Longitude: ' + location.lng + '\\n' +
              '(Mock data for testing)'
            );
          } catch (error) {
            showResult('locationResult', '❌ Location Error: ' + error.message, true);
          }
        }
        
        async function testOpenMap() {
          try {
            await window.AppNative.utils.openExternalMap(59.3293, 18.0686, 'Stockholm');
            showResult('locationResult', 
              '🗺️ Map Opening...\\n' +
              'This is a mock call.\\n' +
              'In real app, it would open maps app.'
            );
          } catch (error) {
            showResult('locationResult', '❌ Map Error: ' + error.message, true);
          }
        }
        
        async function runAllTests() {
          const tests = [
            { name: 'Bridge Check', func: checkBridge },
            { name: 'Device Info', func: testDeviceInfo },
            { name: 'QR Scan', func: testScanQR },
            { name: 'Take Photo', func: testTakePhoto },
            { name: 'Location', func: testLocation },
            { name: 'Open Map', func: testOpenMap },
          ];
          
          showResult('allTestsResult', '🚀 Starting all tests...\\n\\n');
          
          for (let i = 0; i < tests.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const resultBox = document.getElementById('allTestsResult');
            try {
              await tests[i].func();
              resultBox.textContent += '✅ ' + tests[i].name + '\\n';
            } catch (error) {
              resultBox.textContent += '❌ ' + tests[i].name + ': ' + error.message + '\\n';
            }
          }
          
          const resultBox = document.getElementById('allTestsResult');
          resultBox.textContent += '\\n🎉 All tests completed!';
        }
        
        // Auto-check when bridge is ready
        if (window.AppNative) {
          updateStatus('✅ Bridge ready!', 'success');
          setTimeout(checkBridge, 500);
        } else {
          window.addEventListener('AppNativeReady', function() {
            updateStatus('✅ Bridge ready!', 'success');
            setTimeout(checkBridge, 500);
            setTimeout(testDeviceInfo, 1000);
          });
          
          // Fallback check
          setTimeout(() => {
            if (!window.AppNative) {
              updateStatus('❌ Bridge not found after 3 seconds', 'error');
            }
          }, 3000);
        }
        
        // Log to console
        console.log('Test page loaded');
        console.log('AppNative available:', typeof window.AppNative !== 'undefined');
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: testHTML }}
        style={styles.webview}
        injectedJavaScript={injectedJavaScript}
        onLoad={() => console.log("Test WebView loaded")}
        onError={(error) => console.error("WebView error:", error.nativeEvent)}
        onMessage={(event) => {
          console.log("Message from WebView:", event.nativeEvent.data);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
  },
});
