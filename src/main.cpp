#include <Arduino.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define DHTPIN 6
#define DHTTYPE DHT11
#define SOILPIN 5

const char ssid[]      = "Galaxy A73 5GCB26";
const char password[]  = "dzyy6328";
const char* serverUrl  = "https://caasagriculture-production-ca8e.up.railway.app/sensor/data";

// Identitas sensor — ganti sesuai perangkat
const char* SENSOR_ID = "S-001";
const char* LOKASI    = "Blok A";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println("--- CAAS 02 — Monitoring Pertanian ---");

  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Terhubung! IP: " + WiFi.localIP().toString());

  dht.begin();
  analogReadResolution(12);
}

void loop() {
  float temp     = dht.readTemperature();
  float hum      = dht.readHumidity();
  int   soil     = analogRead(SOILPIN);
  int   moisture = (int)constrain(map(soil, 4095, 0, 0, 100), 0, 100);
  int   label    = (moisture < 30) ? 1 : 0;

  if (isnan(temp) || isnan(hum)) {
    Serial.println("[ERROR] DHT11 tidak terdeteksi!");
    delay(2000);
    return;
  }

  // Tampil di Serial Monitor
  Serial.println("============ DATA SENSOR ============");
  Serial.printf("Suhu      : %.1f °C\n",  temp);
  Serial.printf("Hum Udara : %.1f %%\n",  hum);
  Serial.printf("Soil RAW  : %d\n",        soil);
  Serial.printf("Moisture  : %d %%\n",     moisture);
  Serial.printf("Label     : %d (%s)\n",   label, label == 1 ? "KERING" : "NORMAL");

  // Kirim ke Railway
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000);

    JsonDocument doc;
    doc["sensorId"] = SENSOR_ID;
    doc["lokasi"]   = LOKASI;
    doc["temp"]     = temp;
    doc["hum"]      = hum;
    doc["soil"]     = soil;
    doc["moisture"] = moisture;
    doc["label"]    = label;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    http.end();

    if (code == 201) {
      Serial.println("✓ Terkirim ke cloud!");
    } else {
      Serial.printf("✗ Gagal kirim, HTTP: %d\n", code);
    }
  } else {
    Serial.println("[!] WiFi terputus");
    WiFi.reconnect();
  }

  Serial.println("=====================================\n");
  delay(30000); // kirim tiap 30 detik
}