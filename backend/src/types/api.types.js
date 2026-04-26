/**
 * @typedef {Object} SensorData
 * @property {string}  sensorId        
 * @property {string}  lokasi          
 * @property {number}  temp            
 * @property {number}  hum             
 * @property {number}  soil           
 * @property {number}  moisture        
 * @property {number}  label           
 * @property {string}  kondisi         
 * @property {'ok'|'warn'|'dry'} status 
 * @property {string}  rekomendasi     
 * @property {string}  createdAt       
 */

/**
 * @typedef {Object} ChartPoint
 * @property {string} time            
 * @property {number} kelembaban      
 * @property {number} kelembabanUdara 
 * @property {number} suhu            
 * @property {number} soil            
 */

/**
 * @typedef {Object} PredictionData
 * @property {number} moistureLevel      
 * @property {string} recommendation     
 * @property {string} nextWateringTime   
 * @property {number} confidence         
 * @property {string} modelUsed          
 * @property {string} timestamp          
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {number}          avgMoisture      
 * @property {number}          avgTemperature   
 * @property {number}          activeSensors    
 * @property {number}          sensorsNeedWater 
 * @property {SensorData[]}    sensors          
 * @property {PredictionData}  prediction       
 * @property {Notification[]}  notifications    
 * @property {ChartPoint[]}    chartHistory     
 */

// export const DUMMY_SENSORS = [
//   { sensorId: 'S-001', lokasi: 'Blok A - Padi',   temp: 28.4, hum: 62.1, soil: 1843, moisture: 55, label: 0, kondisi: 'normal', status: 'ok',   rekomendasi: 'optimal',        createdAt: new Date().toISOString() },
//   { sensorId: 'S-002', lokasi: 'Blok B - Jagung', temp: 31.7, hum: 46.7, soil: 3358, moisture: 18, label: 1, kondisi: 'kering', status: 'dry',   rekomendasi: 'siram_sekarang', createdAt: new Date().toISOString() },
//   { sensorId: 'S-003', lokasi: 'Blok C - Cabai',  temp: 29.8, hum: 53.7, soil: 2785, moisture: 32, label: 0, kondisi: 'normal', status: 'warn',  rekomendasi: 'siram_nanti',    createdAt: new Date().toISOString() },
//   { sensorId: 'S-004', lokasi: 'Blok D - Tomat',  temp: 19.9, hum: 80.4, soil: 779,  moisture: 81, label: 0, kondisi: 'basah',  status: 'ok',    rekomendasi: 'optimal',        createdAt: new Date().toISOString() },
// ]

// export const DUMMY_PREDICTION = {
//   moistureLevel:    46,
//   recommendation:   'siram_nanti',
//   nextWateringTime: '14:30',
//   confidence:       87,
//   modelUsed:        'random_forest',
//   timestamp:        new Date().toISOString(),
// }

// export const DUMMY_NOTIFICATIONS = [
//   { id: '1', type: 'danger',  message: 'Blok B - Jagung perlu disiram sekarang (18%)',          sensorId: 'S-002', isRead: false, createdAt: new Date().toISOString() },
//   { id: '2', type: 'warning', message: 'Blok C - Cabai kelembaban mendekati batas minimum (32%)', sensorId: 'S-003', isRead: false, createdAt: new Date().toISOString() },
//   { id: '3', type: 'info',    message: 'Blok A - Padi kondisi optimal (55%)',                    sensorId: 'S-001', isRead: true,  createdAt: new Date().toISOString() },
//   { id: '4', type: 'info',    message: 'Blok D - Tomat kondisi basah (81%)',                     sensorId: 'S-004', isRead: true,  createdAt: new Date().toISOString() },
// ]

// export const DUMMY_CHART = [
//   { time: '00:00', kelembaban: 68, kelembabanUdara: 72, suhu: 24.2, soil: 2048 },
//   { time: '02:00', kelembaban: 65, kelembabanUdara: 70, suhu: 23.8, soil: 2130 },
//   { time: '04:00', kelembaban: 62, kelembabanUdara: 68, suhu: 23.1, soil: 2276 },
//   { time: '06:00', kelembaban: 58, kelembabanUdara: 65, suhu: 24.5, soil: 2498 },
//   { time: '08:00', kelembaban: 54, kelembabanUdara: 63, suhu: 27.3, soil: 2703 },
//   { time: '10:00', kelembaban: 48, kelembabanUdara: 58, suhu: 29.8, soil: 3031 },
//   { time: '12:00', kelembaban: 40, kelembabanUdara: 52, suhu: 32.0, soil: 3358 },
//   { time: '14:00', kelembaban: 35, kelembabanUdara: 48, suhu: 33.3, soil: 3604 },
//   { time: '16:00', kelembaban: 32, kelembabanUdara: 46, suhu: 31.7, soil: 3727 },
//   { time: '18:00', kelembaban: 38, kelembabanUdara: 55, suhu: 29.0, soil: 3481 },
//   { time: '20:00', kelembaban: 44, kelembabanUdara: 60, suhu: 27.4, soil: 3113 },
//   { time: '22:00', kelembaban: 50, kelembabanUdara: 65, suhu: 25.7, soil: 2867 },
// ]

// export const DUMMY_SUMMARY = {
//   avgMoisture:      46,
//   avgTemperature:   27,
//   activeSensors:    4,
//   sensorsNeedWater: 1,
//   sensors:          DUMMY_SENSORS,
//   prediction:       DUMMY_PREDICTION,
//   notifications:    DUMMY_NOTIFICATIONS,
//   chartHistory:     DUMMY_CHART,
// }