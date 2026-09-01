#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// ---------------------------------------------------------
// WIFI CONFIGURATION
// ---------------------------------------------------------
const char* ssid     = "YOUR_WIFI_NETWORK_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// ---------------------------------------------------------
// ROS 2 BRIDGE CONFIGURATION (Your Laptop's IP Address)
// ---------------------------------------------------------
// Open CMD on your laptop, type 'ipconfig', and find your IPv4 Address.
const char* rosbridge_ip = "192.168.1.100"; 
const uint16_t rosbridge_port = 9090;

WebSocketsClient webSocket;

// ---------------------------------------------------------
// HARDWARE PINS (Attach LEDs or Relays here)
// ---------------------------------------------------------
const int PIN_ENGINE_RELAY = 23; // High = Engine ON, Low = Cut Power
const int PIN_HAZARD_LED   = 22; // High = Hazards flashing
const int PIN_WINDOWS_UP   = 21; // High = Windows rolled up
const int PIN_MOTOR_PWM    = 19; // Simulating throttle

bool hazards_active = false;
unsigned long last_hazard_toggle = 0;

void setup() {
  Serial.begin(115200);
  
  pinMode(PIN_ENGINE_RELAY, OUTPUT);
  pinMode(PIN_HAZARD_LED, OUTPUT);
  pinMode(PIN_WINDOWS_UP, OUTPUT);
  pinMode(PIN_MOTOR_PWM, OUTPUT);

  // Set default safe states
  digitalWrite(PIN_ENGINE_RELAY, HIGH); // Engine running
  digitalWrite(PIN_WINDOWS_UP, HIGH);   // Windows closed
  digitalWrite(PIN_HAZARD_LED, LOW);    // Hazards off
  analogWrite(PIN_MOTOR_PWM, 0);        // Zero throttle

  // 1. Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected! IP address: ");
  Serial.println(WiFi.localIP());

  // 2. Connect to the ROS 2 WebBridge (The Laptop/Dashboard)
  Serial.println("Connecting to ROS 2 Bridge...");
  webSocket.begin(rosbridge_ip, rosbridge_port, "/");
  webSocket.onEvent(webSocketEvent);
  
  // Reconnect settings
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  // Handle Hazard Lights flashing asynchronously
  if (hazards_active) {
    if (millis() - last_hazard_toggle > 500) { // Flash every 500ms
      digitalWrite(PIN_HAZARD_LED, !digitalRead(PIN_HAZARD_LED));
      last_hazard_toggle = millis();
    }
  } else {
    digitalWrite(PIN_HAZARD_LED, LOW);
  }
}

// ---------------------------------------------------------
// WEBSOCKET EVENT HANDLER
// ---------------------------------------------------------
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WSc] Disconnected from ROS 2 Bridge!");
      // Failsafe: Cut motor if we lose connection to the brain
      analogWrite(PIN_MOTOR_PWM, 0); 
      break;
      
    case WStype_CONNECTED:
      Serial.println("[WSc] Connected to ROS 2 Bridge!");
      // Tell ROSBridge we want to subscribe to the hardware emergency topics
      subscribeToTopic("/hardware/engine_cut", "std_msgs/Bool");
      subscribeToTopic("/hardware/windows_cmd", "std_msgs/String");
      subscribeToTopic("/hardware/hazards_cmd", "std_msgs/Bool");
      subscribeToTopic("/safe_cmd_vel", "geometry_msgs/Twist");
      break;
      
    case WStype_TEXT:
      // We received a JSON message from the Dashboard/ROS!
      handleROSMessage((char*)payload);
      break;
  }
}

// Subscribe helper formatted for rosbridge v2 protocol
void subscribeToTopic(const char* topicName, const char* msgType) {
  StaticJsonDocument<200> doc;
  doc["op"] = "subscribe";
  doc["topic"] = topicName;
  doc["type"] = msgType;
  
  char output[200];
  serializeJson(doc, output);
  webSocket.sendTXT(output);
  Serial.print("Subscribed to: ");
  Serial.println(topicName);
}

// ---------------------------------------------------------
// PARSE INCOMING COMMANDS FROM THE DASHBOARD/AI BRAIN
// ---------------------------------------------------------
void handleROSMessage(char* payload) {
  // Parse the JSON payload
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload);
  if (error) return;

  const char* op = doc["op"];
  if (String(op) != "publish") return; // Only process published messages

  const char* topic = doc["topic"];
  JsonObject msg = doc["msg"];

  // 1. ENGINE CUT COMMAND (From Gas Safety)
  if (String(topic) == "/hardware/engine_cut") {
    bool cut_engine = msg["data"];
    if (cut_engine) {
      Serial.println("EMERGENCY: CUTTING ENGINE POWER!");
      digitalWrite(PIN_ENGINE_RELAY, LOW); // Kill relay
      analogWrite(PIN_MOTOR_PWM, 0);       // Kill throttle
    }
  }
  
  // 2. WINDOWS COMMAND (From Gas Safety)
  else if (String(topic) == "/hardware/windows_cmd") {
    const char* cmd = msg["data"];
    if (String(cmd) == "OPEN_ALL") {
      Serial.println("EMERGENCY: ROLLING DOWN WINDOWS!");
      digitalWrite(PIN_WINDOWS_UP, LOW); // Drop windows
    }
  }
  
  // 3. HAZARDS COMMAND (From Emergency Parking / Gas Safety)
  else if (String(topic) == "/hardware/hazards_cmd") {
    bool activate = msg["data"];
    if (activate) {
      Serial.println("EMERGENCY: HAZARDS ACTIVATED!");
      hazards_active = true;
    }
  }

  // 4. NORMAL DRIVING THROTTLE (From Safety Manager)
  else if (String(topic) == "/safe_cmd_vel") {
    float linear_x = msg["linear"]["x"];
    
    // Map speed (e.g. 0.0 to 5.0 m/s) to PWM (0 to 255)
    // Only apply throttle if engine relay is active
    if (digitalRead(PIN_ENGINE_RELAY) == HIGH) {
      int pwm_val = map(linear_x * 100, 0, 500, 0, 255);
      pwm_val = constrain(pwm_val, 0, 255);
      analogWrite(PIN_MOTOR_PWM, pwm_val);
    }
  }
}
