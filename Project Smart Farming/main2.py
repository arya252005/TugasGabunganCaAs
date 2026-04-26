from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd

# Inisialisasi aplikasi FastAPI
app = FastAPI(
    title="API Prediksi Kelembapan Tanah",
    description="API Machine Learning untuk menentukan tanaman butuh disiram atau tidak",
    version="1.0"
)

# Load model Machine Learning yang sudah kamu export sebelumnya
# Pastikan nama file modelnya sesuai
try:
    model = joblib.load('model_farming.pkl')
except Exception as e:
    model = None
    print(f"Gagal memuat model: {e}")

# Definisikan format input JSON yang akan dikirim oleh NestJS
class SensorData(BaseModel):
    temp: float
    hum: float
    soil: float

# Endpoint default untuk mengecek apakah API berjalan
@app.get("/")
def read_root():
    return {"status": "Aktif", "message": "API Machine Learning siap digunakan. Kirim POST request ke /predict"}

# Endpoint untuk melakukan prediksi
@app.post("/predict")
def predict_soil_status(data: SensorData):
    if model is None:
        raise HTTPException(status_code=500, detail="Model ML tidak ditemukan di server.")

    try:
        # 1. Masukkan data ke dalam format DataFrame (sesuai kolom saat kamu training)
        input_data = pd.DataFrame([[data.temp, data.hum, data.soil]], columns=['temp', 'hum', 'soil'])
        
        # 2. Lakukan prediksi menggunakan model (hasilnya array, kita ambil elemen ke-0)
        prediction = int(model.predict(input_data)[0])
        
        # 3. Tentukan status berdasarkan label di notebook kamu (0=Basah/Normal, 1=Kering)
        if prediction == 1:
            status = "Kering"
            keterangan = "Tanaman perlu disiram"
            siram = True
        else:
            status = "Normal/Basah"
            keterangan = "Kelembapan aman, tidak perlu disiram"
            siram = False
            
        # 4. Kembalikan hasil dalam bentuk JSON untuk dibaca oleh NestJS
        return {
            "success": True,
            "data_sensor": {
                "suhu": data.temp,
                "kelembapan_udara": data.hum,
                "kelembapan_tanah": data.soil
            },
            "hasil_prediksi": {
                "kode_label": prediction,
                "status_tanah": status,
                "rekomendasi_siram": siram,
                "keterangan": keterangan
            }
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Terjadi kesalahan saat memproses prediksi: {str(e)}")