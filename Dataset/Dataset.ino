
\\ Data Basah
void setup() {
  Serial.begin(115200);
  while(!Serial);
  Serial.println("temp,hum,soil,moisture_percent,label");

  for (int i = 0; i < 10000; i++) {
    float t = 18.0 + (random(0, 50) / 10.0);    // Sejuk (<24°C)
    float h = 71.0 + (random(0, 240) / 10.0);   // Hum Udara Basah (>70%)
    int s_persen = random(61, 101);             // Soil Basah (>60%)
    int s_raw = map(s_persen, 0, 100, 4095, 0); 
    int label = 0;                              // Aman

    Serial.printf("%.2f,%.2f,%d,%d,%d\n", t, h, s_raw, s_persen, label);
    if (i % 500 == 0) delay(5);
  }
}
void loop() {}


\\ Data Kering
void setup() {
  Serial.begin(115200);
  while(!Serial); // Menunggu Serial Monitor terbuka
  
  // Header CSV
  Serial.println("temp,hum,soil,moisture_percent,label");

  for (int i = 0; i < 10000; i++) {
    float t = 30.1 + (random(0, 50) / 10.0);    // Panas (>30°C)
    float h = 30.0 + (random(0, 190) / 10.0);   // Hum Udara Kering (<50%)
    int s_persen = random(0, 30);               // Soil Kering (<30%)
    int s_raw = map(s_persen, 0, 100, 4095, 0); 
    int label = 1;                              // Siram

    Serial.printf("%.2f,%.2f,%d,%d,%d\n", t, h, s_raw, s_persen, label);

    if (i % 500 == 0) delay(5); // Stabilisasi memori
  }
}
void loop() {}