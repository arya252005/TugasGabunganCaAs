export const DUMMY_SENSORS = [
  {
    id: 1, sensorId: 'S-001', lokasi: 'Blok A — Padi',
    temp: 28.4, hum: 62.1, soil: 1843, moisture: 55,
    label: 0, kondisi: 'normal', status: 'ok',
    rekomendasi: 'optimal', createdAt: new Date().toISOString(),
  },
  {
    id: 2, sensorId: 'S-002', lokasi: 'Blok B — Jagung',
    temp: 31.7, hum: 46.7, soil: 3358, moisture: 18,
    label: 1, kondisi: 'kering', status: 'dry',
    rekomendasi: 'siram_sekarang', createdAt: new Date().toISOString(),
  },
  {
    id: 3, sensorId: 'S-003', lokasi: 'Blok C — Cabai',
    temp: 29.8, hum: 53.7, soil: 2785, moisture: 32,
    label: 0, kondisi: 'normal', status: 'warn',
    rekomendasi: 'siram_nanti', createdAt: new Date().toISOString(),
  },
  {
    id: 4, sensorId: 'S-004', lokasi: 'Blok D — Tomat',
    temp: 19.9, hum: 80.4, soil: 779, moisture: 81,
    label: 0, kondisi: 'basah', status: 'ok',
    rekomendasi: 'optimal', createdAt: new Date().toISOString(),
  },
]

export const DUMMY_HISTORY = [
  { time: '00:00', kelembaban: 68, kelembabanUdara: 72, suhu: 24.2, soil: 2048 },
  { time: '02:00', kelembaban: 65, kelembabanUdara: 70, suhu: 23.8, soil: 2130 },
  { time: '04:00', kelembaban: 62, kelembabanUdara: 68, suhu: 23.1, soil: 2276 },
  { time: '06:00', kelembaban: 58, kelembabanUdara: 65, suhu: 24.5, soil: 2498 },
  { time: '08:00', kelembaban: 54, kelembabanUdara: 63, suhu: 27.3, soil: 2703 },
  { time: '10:00', kelembaban: 48, kelembabanUdara: 58, suhu: 29.8, soil: 3031 },
  { time: '12:00', kelembaban: 40, kelembabanUdara: 52, suhu: 32.0, soil: 3358 },
  { time: '14:00', kelembaban: 35, kelembabanUdara: 48, suhu: 33.3, soil: 3604 },
  { time: '16:00', kelembaban: 32, kelembabanUdara: 46, suhu: 31.7, soil: 3727 },
  { time: '18:00', kelembaban: 38, kelembabanUdara: 55, suhu: 29.0, soil: 3481 },
  { time: '20:00', kelembaban: 44, kelembabanUdara: 60, suhu: 27.4, soil: 3113 },
  { time: '22:00', kelembaban: 50, kelembabanUdara: 65, suhu: 25.7, soil: 2867 },
]

export const DUMMY_SUMMARY = {
  avgMoisture:      46,
  avgTemperature:   27,
  activeSensors:    4,
  sensorsNeedWater: 1,
  sensors:          DUMMY_SENSORS,
  chartHistory:     DUMMY_HISTORY,
  prediction: {
    moistureLevel:    46,
    recommendation:   'siram_nanti',
    nextWateringTime: '14:30',
    confidence:       87,
    modelUsed:        'random_forest',
    timestamp:        new Date().toISOString(),
  },
  notifications: [
    { id: '1', type: 'danger',  message: 'Blok B — Jagung perlu disiram sekarang (18%)',          sensorId: 'S-002', isRead: false, createdAt: new Date().toISOString() },
    { id: '2', type: 'warning', message: 'Blok C — Cabai kelembaban mendekati batas minimum (32%)', sensorId: 'S-003', isRead: false, createdAt: new Date().toISOString() },
    { id: '3', type: 'info',    message: 'Blok A — Padi kondisi optimal (55%)',                    sensorId: 'S-001', isRead: true,  createdAt: new Date().toISOString() },
    { id: '4', type: 'info',    message: 'Blok D — Tomat kondisi basah (81%)',                     sensorId: 'S-004', isRead: true,  createdAt: new Date().toISOString() },
  ],
}

export const DUMMY_RIWAYAT = {
  data: [
    { id:1,  sensorId:'S-001', lokasi:'Blok A — Padi',   moisture:55, temp:28.4, hum:62.1, soil:1843, label:0, kondisi:'normal', status:'ok',   createdAt: new Date(Date.now()-1000*60*5).toISOString()  },
    { id:2,  sensorId:'S-002', lokasi:'Blok B — Jagung', moisture:18, temp:31.7, hum:46.7, soil:3358, label:1, kondisi:'kering', status:'dry',  createdAt: new Date(Date.now()-1000*60*10).toISOString() },
    { id:3,  sensorId:'S-003', lokasi:'Blok C — Cabai',  moisture:32, temp:29.8, hum:53.7, soil:2785, label:0, kondisi:'normal', status:'warn', createdAt: new Date(Date.now()-1000*60*15).toISOString() },
    { id:4,  sensorId:'S-004', lokasi:'Blok D — Tomat',  moisture:81, temp:19.9, hum:80.4, soil:779,  label:0, kondisi:'basah',  status:'ok',   createdAt: new Date(Date.now()-1000*60*20).toISOString() },
    { id:5,  sensorId:'S-001', lokasi:'Blok A — Padi',   moisture:52, temp:29.1, hum:60.3, soil:1920, label:0, kondisi:'normal', status:'ok',   createdAt: new Date(Date.now()-1000*60*35).toISOString() },
    { id:6,  sensorId:'S-002', lokasi:'Blok B — Jagung', moisture:22, temp:32.1, hum:44.2, soil:3200, label:1, kondisi:'kering', status:'dry',  createdAt: new Date(Date.now()-1000*60*40).toISOString() },
    { id:7,  sensorId:'S-003', lokasi:'Blok C — Cabai',  moisture:28, temp:31.2, hum:51.0, soil:2950, label:1, kondisi:'kering', status:'dry',  createdAt: new Date(Date.now()-1000*60*45).toISOString() },
    { id:8,  sensorId:'S-004', lokasi:'Blok D — Tomat',  moisture:76, temp:20.5, hum:78.9, soil:850,  label:0, kondisi:'basah',  status:'ok',   createdAt: new Date(Date.now()-1000*60*50).toISOString() },
    { id:9,  sensorId:'S-001', lokasi:'Blok A — Padi',   moisture:48, temp:30.0, hum:58.0, soil:2100, label:0, kondisi:'normal', status:'warn', createdAt: new Date(Date.now()-1000*60*65).toISOString() },
    { id:10, sensorId:'S-002', lokasi:'Blok B — Jagung', moisture:12, temp:33.5, hum:42.0, soil:3700, label:1, kondisi:'kering', status:'dry',  createdAt: new Date(Date.now()-1000*60*70).toISOString() },
    { id:11, sensorId:'S-003', lokasi:'Blok C — Cabai',  moisture:35, temp:28.9, hum:55.4, soil:2650, label:0, kondisi:'normal', status:'warn', createdAt: new Date(Date.now()-1000*60*75).toISOString() },
    { id:12, sensorId:'S-004', lokasi:'Blok D — Tomat',  moisture:85, temp:18.7, hum:82.1, soil:710,  label:0, kondisi:'basah',  status:'ok',   createdAt: new Date(Date.now()-1000*60*80).toISOString() },
  ],
  total: 12, page: 1, limit: 50, totalPages: 1,
}

export const DUMMY_RIWAYAT_STATS = {
  avg: 46, min: 12, max: 85, totalRecords: 12,
  trend: [
    { date: '16 Apr', avgMoisture: 62, count: 8  },
    { date: '17 Apr', avgMoisture: 55, count: 10 },
    { date: '18 Apr', avgMoisture: 48, count: 9  },
    { date: '19 Apr', avgMoisture: 52, count: 11 },
    { date: '20 Apr', avgMoisture: 44, count: 8  },
    { date: '21 Apr', avgMoisture: 46, count: 12 },
    { date: '22 Apr', avgMoisture: 46, count: 4  },
  ],
}

export const DUMMY_SENSOR_LIST = [
  { sensorId: 'S-001', lokasi: 'Blok A — Padi'   },
  { sensorId: 'S-002', lokasi: 'Blok B — Jagung' },
  { sensorId: 'S-003', lokasi: 'Blok C — Cabai'  },
  { sensorId: 'S-004', lokasi: 'Blok D — Tomat'  },
]

export const DUMMY_NOTIFICATIONS_PAGE = {
  data: [
    { id:1,  type:'danger',  message:'Blok B — Jagung perlu disiram sekarang (18%)',           sensorId:'S-002', lokasi:'Blok B — Jagung', moisture:18, isRead:false, createdAt: new Date(Date.now()-1000*60*3).toISOString()  },
    { id:2,  type:'warning', message:'Blok C — Cabai kelembaban mendekati batas minimum (32%)', sensorId:'S-003', lokasi:'Blok C — Cabai',  moisture:32, isRead:false, createdAt: new Date(Date.now()-1000*60*8).toISOString()  },
    { id:3,  type:'info',    message:'Blok A — Padi kondisi optimal (55%)',                     sensorId:'S-001', lokasi:'Blok A — Padi',   moisture:55, isRead:true,  createdAt: new Date(Date.now()-1000*60*15).toISOString() },
    { id:4,  type:'info',    message:'Blok D — Tomat kondisi basah optimal (81%)',              sensorId:'S-004', lokasi:'Blok D — Tomat',  moisture:81, isRead:true,  createdAt: new Date(Date.now()-1000*60*22).toISOString() },
    { id:5,  type:'danger',  message:'Blok B — Jagung kritis, kelembaban sangat rendah (12%)', sensorId:'S-002', lokasi:'Blok B — Jagung', moisture:12, isRead:true,  createdAt: new Date(Date.now()-1000*60*60).toISOString() },
    { id:6,  type:'warning', message:'Blok C — Cabai mulai mengering (28%)',                    sensorId:'S-003', lokasi:'Blok C — Cabai',  moisture:28, isRead:true,  createdAt: new Date(Date.now()-1000*60*90).toISOString() },
    { id:7,  type:'info',    message:'Blok A — Padi normal setelah disiram (62%)',              sensorId:'S-001', lokasi:'Blok A — Padi',   moisture:62, isRead:true,  createdAt: new Date(Date.now()-1000*60*120).toISOString()},
    { id:8,  type:'danger',  message:'Blok B — Jagung perlu disiram segera (20%)',              sensorId:'S-002', lokasi:'Blok B — Jagung', moisture:20, isRead:true,  createdAt: new Date(Date.now()-1000*60*180).toISOString()},
  ],
  total: 8, unreadCount: 2, page: 1, totalPages: 1,
}