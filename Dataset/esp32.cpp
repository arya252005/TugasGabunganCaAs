#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ── Konfigurasi — GANTI SESUAI PERANGKAT ──────────────
const char* WIFI_SSID     = "nama_wifi";
const char* WIFI_PASSWORD = "password_wifi";
const char* API_URL       = "https://caasagriculture-production-ca8e.up.railway.app/sensor/data";

// Tiap ESP32 punya ID dan lokasi sendiri
const char* SENSOR_ID = "S-001";        // S-001, S-002, S-003, S-004
const char* LOKASI    = "Blok A — Padi"; // sesuai blok

#define DHT_PIN  4
#define DHT_TYPE DHT11
#define SOIL_PIN 34   // pin analog soil moisture

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");
}

void loop() {
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();

  // Baca soil moisture
  int soil     = analogRead(SOIL_PIN);           // raw ADC 0-4095
  int moisture = map(soil, 4095, 0, 0, 100);    // konversi ke %
  int label    = moisture <= 29 ? 1 : 0;         // 1=kering, 0=normal

  // Validasi sensor
  if (isnan(temp) || isnan(hum)) {
    Serial.println("Error baca DHT11!");
    delay(5000);
    return;
  }

  // Buat JSON payload
  String payload = "{";
  payload += "\"sensorId\":\"" + String(SENSOR_ID) + "\",";
  payload += "\"lokasi\":\"" + String(LOKASI) + "\",";
  payload += "\"temp\":" + String(temp, 1) + ",";
  payload += "\"hum\":" + String(hum, 1) + ",";
  payload += "\"soil\":" + String(soil) + ",";
  payload += "\"moisture\":" + String(moisture) + ",";
  payload += "\"label\":" + String(label);
  payload += "}";

  // Kirim ke Railway
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(payload);

    if (httpCode == 201) {
      Serial.printf("[OK] %s | soil:%d%% | temp:%.1f | hum:%.1f\n",
        SENSOR_ID, moisture, temp, hum);
    } else {
      Serial.printf("[ERR] HTTP %d\n", httpCode);
    }

    http.end();
  }

  delay(30000); // kirim tiap 30 detik
}