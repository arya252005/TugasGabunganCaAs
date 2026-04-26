import { useMemo } from 'react'

function SensorChart({ data, loading }) {
  const W   = 600
  const H   = 220
  const PAD = { top: 24, right: 30, bottom: 40, left: 44 }
  const iW  = W - PAD.left - PAD.right
  const iH  = H - PAD.top - PAD.bottom

  const chartData = useMemo(() => {
    if (!data || !data.length) return []
    if (data.length <= 10) return data
    const chunk = Math.ceil(data.length / 10)
    const out = []
    for (let i = 0; i < data.length; i += chunk) {
      const s   = data.slice(i, i + chunk)
      const avg = k => Math.round(s.reduce((a, d) => a + (d[k] || 0), 0) / s.length)
      out.push({ time: s[s.length-1].time || '', kelembaban: avg('kelembaban'), kelembabanUdara: avg('kelembabanUdara') })
    }
    return out
  }, [data])

  const toX = i => PAD.left + (i / Math.max(chartData.length - 1, 1)) * iW
  const toY = v => PAD.top  + iH - (Math.max(0, Math.min(100, v)) / 100) * iH

  const smooth = key => {
    if (!chartData.length) return ''
    if (chartData.length === 1) return `M ${toX(0)} ${toY(chartData[0][key])}`
    let d = `M ${toX(0).toFixed(1)} ${toY(chartData[0][key]).toFixed(1)}`
    for (let i = 1; i < chartData.length; i++) {
      const cx = ((toX(i-1) + toX(i)) / 2).toFixed(1)
      d += ` C ${cx} ${toY(chartData[i-1][key]).toFixed(1)}, ${cx} ${toY(chartData[i][key]).toFixed(1)}, ${toX(i).toFixed(1)} ${toY(chartData[i][key]).toFixed(1)}`
    }
    return d
  }

  const mPath = smooth('kelembaban')
  const hPath = smooth('kelembabanUdara')
  const mArea = mPath ? `${mPath} L ${toX(chartData.length-1).toFixed(1)} ${(PAD.top+iH).toFixed(1)} L ${PAD.left} ${(PAD.top+iH).toFixed(1)} Z` : ''

  const getColor = v => v <= 29 ? '#C0392B' : v <= 44 ? '#E67E22' : '#27AE60'
  const xStep   = Math.max(1, Math.ceil(chartData.length / 5))

  if (loading) return (
    <div style={{
      width: '100%', height: H,
      background: 'linear-gradient(90deg,rgba(92,51,23,0.05) 25%,rgba(92,51,23,0.09) 50%,rgba(92,51,23,0.05) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8,
    }}/>
  )

  if (!chartData.length) return (
    <div style={{ height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>no data sensor</span>
    </div>
  )

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#27AE60" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#27AE60" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="cClip">
          <rect x={PAD.left} y={PAD.top} width={iW} height={iH}/>
        </clipPath>
      </defs>

      <rect x={PAD.left} y={PAD.top} width={iW} height={iH} rx="4" fill="rgba(92,51,23,0.015)"/>

      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={PAD.left} y1={toY(v)} x2={PAD.left+iW} y2={toY(v)}
            stroke={v === 0 ? 'rgba(92,51,23,0.15)' : 'rgba(92,51,23,0.06)'}
            strokeWidth="1"/>
          <text x={PAD.left-8} y={toY(v)+4} textAnchor="end" fontSize="10"
            fill="rgba(92,51,23,0.35)" fontFamily="IBM Plex Mono,monospace">{v}%</text>
        </g>
      ))}

      <rect x={PAD.left} y={toY(29)} width={iW} height={toY(0)-toY(29)}
        fill="rgba(192,57,43,0.04)" clipPath="url(#cClip)"/>
      <line x1={PAD.left} y1={toY(29)} x2={PAD.left+iW} y2={toY(29)}
        stroke="rgba(192,57,43,0.2)" strokeWidth="1" strokeDasharray="4 4"/>

      <text x={PAD.left+iW-4} y={toY(29)-4} textAnchor="end" fontSize="9"
        fill="rgba(192,57,43,0.45)" fontFamily="IBM Plex Mono,monospace">kering ≤29%</text>

      <rect x={PAD.left} y={toY(44)} width={iW} height={toY(29)-toY(44)}
        fill="rgba(230,126,34,0.04)" clipPath="url(#cClip)"/>
      <line x1={PAD.left} y1={toY(44)} x2={PAD.left+iW} y2={toY(44)}
        stroke="rgba(230,126,34,0.2)" strokeWidth="1" strokeDasharray="4 4"/>
      <text x={PAD.left+iW-4} y={toY(44)-4} textAnchor="end" fontSize="9"
        fill="rgba(230,126,34,0.45)" fontFamily="IBM Plex Mono,monospace">rendah ≤44%</text>

      {hPath && <path d={hPath} stroke="#2E86C1" strokeWidth="1.5" fill="none"
        strokeLinecap="round" opacity="0.5" clipPath="url(#cClip)"/>}

      {mArea && <path d={mArea} fill="url(#gM)" clipPath="url(#cClip)"/>}
      
      {mPath && <path d={mPath} stroke="#1E8449" strokeWidth="2.5" fill="none"
        strokeLinecap="round" clipPath="url(#cClip)"/>}

      {chartData.map((d, i) => {
        const isEnd = i === 0 || i === chartData.length - 1
        return (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.kelembaban)}
              r={isEnd ? 4.5 : 3}
              fill={getColor(d.kelembaban)} stroke="white" strokeWidth="1.5"/>
            {isEnd && (
              <text x={toX(i)} y={toY(d.kelembaban) - 10}
                textAnchor="middle" fontSize="10" fontWeight="600"
                fill={getColor(d.kelembaban)} fontFamily="IBM Plex Mono,monospace">
                {d.kelembaban}%
              </text>
            )}
          </g>
        )
      })}

      {chartData.length > 0 && (() => {
        const last = chartData[chartData.length - 1]
        return (
          <text x={toX(chartData.length-1)+8} y={toY(last.kelembabanUdara)+4}
            fontSize="10" fill="#2E86C1" fontFamily="IBM Plex Mono,monospace" opacity="0.7">
            {last.kelembabanUdara}%
          </text>
        )
      })()}

      {chartData.map((d, i) => {
        if (i % xStep !== 0 && i !== chartData.length - 1) return null
        return (
          <text key={i} x={toX(i)} y={H-8} textAnchor="middle" fontSize="10"
            fill="rgba(92,51,23,0.38)" fontFamily="IBM Plex Mono,monospace">
            {d.time}
          </text>
        )
      })}

      <line x1={PAD.left} y1={PAD.top+iH} x2={PAD.left+iW} y2={PAD.top+iH}
        stroke="rgba(92,51,23,0.1)" strokeWidth="1"/>
    </svg>
  )
}

export default SensorChart