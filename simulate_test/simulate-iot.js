/**
 * CAAS 02 — IoT Simulator
 * Simulasi 1 sensor dengan data mendekati kondisi real
 *
 * node simulate-iot.js           → loop tiap 30 detik (kondisi normal)
 * node simulate-iot.js --dry     → kering: moisture 8%, temp 36°C, hum 28%
 * node simulate-iot.js --normal  → normal: moisture 55%, temp 27°C, hum 62%
 * node simulate-iot.js --wet     → basah:  moisture 82%, temp 21°C, hum 80%
 * node simulate-iot.js --once    → kirim 1x kondisi saat ini
 */

const API_URL   = 'https://caasagriculture-production-ca8e.up.railway.app'
const SENSOR_ID = 'S-001'
const LOKASI    = 'Blok A'
const INTERVAL  = 2000 // 30 detik

// ── Variasi kecil agar data terasa natural ────────────
function vary(base, range = 1.5) {
  return parseFloat((base + (Math.random() - 0.5) * range * 2).toFixed(1))
}

function moistureToSoil(moisture) {
  // ADC 4095 = sangat kering, 0 = sangat basah
  return Math.round(4095 - (moisture / 100) * 4095)
}

// ── Kirim data ke Railway ─────────────────────────────
async function send(moisture, temp, hum) {
  moisture = Math.round(Math.max(0, Math.min(100, moisture)))
  temp     = parseFloat(Math.max(15, Math.min(45, temp)).toFixed(1))
  hum      = parseFloat(Math.max(10, Math.min(99, hum)).toFixed(1))

  const soil  = moistureToSoil(moisture)
  const label = moisture <= 29 ? 1 : 0
  const time  = new Date().toLocaleTimeString('id-ID')

  const status = moisture <= 29 ? '🚨 KERING'
               : moisture <= 44 ? '⚠️  Rendah'
               : moisture <= 70 ? '✅ Normal'
               : '💧 Basah  '

  try {
    const res = await fetch(`${API_URL}/sensor/data`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sensorId: SENSOR_ID,
        lokasi:   LOKASI,
        temp, hum, soil, moisture, label,
      }),
    })

    if (res.ok) {
      console.log(`[${time}] ${status} | moisture: ${moisture}% | temp: ${temp}°C | hum: ${hum}% | soil: ${soil}`)
    } else {
      const err = await res.json()
      console.error(`[${time}] ERROR:`, err?.message || JSON.stringify(err))
    }
  } catch (err) {
    console.error(`[${time}] GAGAL:`, err.message)
  }
}

// ── 3 Skenario sesuai output ML ──────────────────────

// KERING — ML akan prediksi label=1, kondisi="kering"
// Contoh real: moisture 8%, temp 36°C, hum 28%
async function dry() {
  await send(
    vary(8,  3),   // moisture 5–11%
    vary(36, 2),   // temp 34–38°C
    vary(28, 4),   // hum 24–32%
  )
}

// NORMAL — ML prediksi label=0, kondisi="normal"
// Contoh real: moisture 55%, temp 27°C, hum 62%
async function normal() {
  await send(
    vary(55, 5),   // moisture 50–60%
    vary(27, 2),   // temp 25–29°C
    vary(62, 5),   // hum 57–67%
  )
}

// BASAH — ML prediksi label=0, kondisi="basah"
// Contoh real: moisture 82%, temp 21°C, hum 80%
async function wet() {
  await send(
    vary(82, 4),   // moisture 78–86%
    vary(21, 2),   // temp 19–23°C
    vary(80, 5),   // hum 75–85%
  )
}

// ── Main ──────────────────────────────────────────────
async function main() {
  const arg = process.argv[2]

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  CAAS 02 — IoT Simulator')
  console.log(`  Sensor : ${SENSOR_ID} | ${LOKASI}`)
  console.log(`  API    : ${API_URL}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (arg === '--dry') {
    console.log('📍 Skenario: KERING (moisture ~8%, temp ~36°C, hum ~28%)\n')
    await dry()
    return
  }

  if (arg === '--normal') {
    console.log('📍 Skenario: NORMAL (moisture ~55%, temp ~27°C, hum ~62%)\n')
    await normal()
    return
  }

  if (arg === '--wet') {
    console.log('📍 Skenario: BASAH (moisture ~82%, temp ~21°C, hum ~80%)\n')
    await wet()
    return
  }

  if (arg === '--once') {
    console.log('📍 Kirim 1x kondisi normal\n')
    await normal()
    return
  }

  // Default: loop normal tiap 30 detik
  console.log(`🔄 Loop tiap ${INTERVAL/1000} detik — Ctrl+C untuk berhenti\n`)
  await normal()
  setInterval(normal, INTERVAL)
}

main()