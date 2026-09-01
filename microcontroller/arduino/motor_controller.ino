#include <ArduinoJson.h> // Ensure you have installed the ArduinoJson library

// Define Motor Pins (Example L298N or similar)
const int ENA = 9;
const int IN1 = 8;
const int IN2 = 7;
const int IN3 = 5;
const int IN4 = 4;
const int ENB = 3;

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect.
  }
  
  // Initialize Motor Pins
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT);
  
  // Initialize stop state
  stopMotors();
}

void loop() {
  if (Serial.available()) {
    String json_str = Serial.readStringUntil('\n');
    
    // Allocate the JSON document
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, json_str);

    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      return;
    }

    // Extract velocity commands
    float v = doc["v"]; // Linear velocity
    float w = doc["w"]; // Angular velocity

    // Implement simple differential drive kinematics here
    executeMotorCommand(v, w);
  }
}

void executeMotorCommand(float v, float w) {
  // VERY basic stub logic:
  if (v == 0.0 && w == 0.0) {
    stopMotors();
  } else if (v > 0.0) {
    // Drive Forward
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, 150); // PWM speed based on v
    
    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
    analogWrite(ENB, 150);
  }
  // Implement backward, left, right...
}

void stopMotors() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
  
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 0);
}
