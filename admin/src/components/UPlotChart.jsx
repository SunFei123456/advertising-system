import React, { useEffect, useRef } from 'react'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

/**
 * uPlot 趋势图组件（极简封装）
 * props:
 * - data: [x[], y[]] 其中 x 为时间戳(ms)，y 为数值
 * - className / style: 容器样式
 * - options: 额外 uPlot 选项覆盖
 * - isDark: 是否暗色主题
 * - xTickFormatter: x 轴刻度格式化函数 (ts:number)=>string
 */
export default function UPlotChart({ data, className = '', style, options, isDark = false, xTickFormatter }) {
  const ref = useRef(null)
  const chart = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const axisColor = isDark ? '#9CA3AF' : '#6B7280'
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
    const lineColor = '#3b82f6'
    const areaColor = isDark ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.12)'
    const pointFill = isDark ? '#18181b' : '#ffffff'
    const base = {
      width: ref.current.clientWidth || 600,
      height: (style && style.height) ? parseInt(style.height, 10) : 220,
      padding: [8, 8, 24, 32],
      series: [
        {},
        {
          label: 'Value',
          width: 2,
          stroke: lineColor,
          fill: areaColor,
          points: {
            show: true,
            size: 3,
            stroke: lineColor,
            fill: pointFill,
          },
        },
      ],
      axes: [
        {
          stroke: axisColor,
          grid: { stroke: gridColor },
          values: xTickFormatter
            ? (u, splits) => splits.map(xTickFormatter)
            : undefined,
        },
        {
          stroke: axisColor,
          grid: { stroke: gridColor },
        },
      ],
      cursor: { x: true, y: true },
    }
    chart.current = new uPlot({ ...base, ...options }, data, ref.current)

    const onResize = () => {
      if (!ref.current || !chart.current) return
      chart.current.setSize({ width: ref.current.clientWidth, height: base.height })
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (chart.current) {
        chart.current.destroy()
        chart.current = null
      }
    }
  }, [isDark, xTickFormatter, style?.height, options])

  useEffect(() => {
    if (chart.current && data) {
      chart.current.setData(data)
    }
  }, [data])

  return <div ref={ref} className={className} style={style} />
}
