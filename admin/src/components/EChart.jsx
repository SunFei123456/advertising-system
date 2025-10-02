import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

/**
 * 通用 ECharts 组件
 * props:
 * - option: EChartsOption 配置
 * - className / style: 容器样式
 */
export default function EChart({ option, className = '', style }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    // 初始化实例
    chartRef.current = echarts.init(ref.current, undefined, { renderer: 'canvas' })

    const handleResize = () => {
      chartRef.current && chartRef.current.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.dispose()
        chartRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    if (!option) return
    chartRef.current.setOption(option, true)
  }, [option])

  return <div ref={ref} className={className} style={style} />
}
