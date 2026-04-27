#include <Arduino.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "model_local.h" 

#define DHTPIN 6
#define DHTTYPE DHT11
#define SOILPIN 5

const char ssid[]      = "********";
const char password[]  = "********";
const char* serverUrl  = "https://caasagriculture-production-ca8e.up.railway.app/sensor/data";

const char* SENSOR_ID = "S-01";
const char* LOKASI    = "Telkom";

DHT dht(DHTPIN, DHTTYPE);

// Menginisialisasi objek AI (Random Forest)
Eloquent::ML::Port::RandomForest model_ai;

void setup() {
  Serial.begin(115200);
  Serial.println("--- CAAS 02 — Lokal dan Global ---");

  // 1. Koneksi WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Terhubung!");

  // 2. Inisialisasi Sensor
  dht.begin();
  analogReadResolution(12); // ESP32-S3 menggunakan resolusi 12-bit
}

void loop() {
  // --- 3. PENGAMBILAN DATA SENSOR ---
  float temp     = dht.readTemperature();
  float hum      = dht.readHumidity();
  int   soilRaw  = analogRead(SOILPIN);
  
  // Kalkulasi Moisture % hanya untuk tampilan (Decision tetap di Soil RAW)
  int moisture = (int)constrain(map(soilRaw, 4095, 0, 0, 100), 0, 100);

  if (isnan(temp) || isnan(hum)) {
    Serial.println("[ERROR] DHT11 tidak terdeteksi!");
    delay(2000);
    return;
  }

 // --- 4. PROSES KEPUTUSAN AI (DATA DRIVEN) ---
  // 4 Parameter sesuai dengan urutan kolom dataset saat ditrain :
  // x[0] = temp, x[1] = hum, x[2] = soil, x[3] = moisture_percent
  float input_ml[4] = { temp, hum, (float)soilRaw, (float)moisture };
  
  // memprediksi kondisi berdasarkan data training
  int label_ai = model_ai.predict(input_ml);

  // --- 5. TAMPILKAN HASIL KE SERIAL MONITOR ---
  Serial.println("================= DATA SENSOR =================");
  Serial.printf("Suhu      : %.1f °C\n", temp);
  Serial.printf("Hum Udara : %.1f %%\n",  hum);
  Serial.printf("Soil RAW  : %d\n",       soilRaw);
  Serial.printf("Moisture  : %d %%\n",    moisture);
  Serial.printf("Label AI  : %d (%s)\n",  label_ai, label_ai == 1 ? "KERING (BUTUH SIRAM)" : "NORMAL");

  // --- 6. PENGIRIMAN DATA KE CLOUD (RAILWAY) ---
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;
    doc["sensorId"] = SENSOR_ID;
    doc["lokasi"]   = LOKASI;
    doc["temp"]     = temp;
    doc["hum"]      = hum;
    doc["soil"]     = soilRaw;
    doc["moisture"] = moisture;
    doc["label"]    = label_ai;

    String body;
    serializeJson(doc, body);
    int code = http.POST(body);
    
    if (code == 201) {
      Serial.println("✓ Keputusan AI Terkirim ke Cloud!");
    } else {
      Serial.printf("✗ Gagal kirim, HTTP: %d\n", code);
    }
    http.end();
  }

  Serial.println("===============================================\n");
  
  // Interval pengiriman (disarankan 10-30 detik untuk penghematan daya/bandwidth)
  delay(10000); 
}
