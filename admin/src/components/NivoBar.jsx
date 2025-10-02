import React from 'react'
import { ResponsiveBar } from '@nivo/bar'

/**
 * Nivo 条形图封装
 * props:
 * - data: [{ company: string, count: number }]
 * - height: number (px)
 * - className: string
 * - isDark: boolean 暗色主题
 * - onBarClick: (datum) => void 点击条形回调
 */
export default function NivoBar({ data = [], height = 240, className = '', isDark = false, onBarClick }) {
  const theme = {
    textColor: isDark ? '#e5e7eb' : '#374151',
    axis: {
      ticks: { text: { fill: isDark ? '#e5e7eb' : '#374151' } },
      legend: { text: { fill: isDark ? '#e5e7eb' : '#374151' } },
      domain: { line: { stroke: isDark ? '#4b5563' : '#e5e7eb' } },
    },
    grid: { line: { stroke: isDark ? '#374151' : '#e5e7eb', strokeDasharray: '4 4' } },
    tooltip: {
      container: {
        background: isDark ? '#18181b' : '#ffffff',
        color: isDark ? '#e5e7eb' : '#111827',
        fontSize: 12,
      },
    },
  }
  const colors = isDark ? ['#34d399'] : ['#10b981']
  return (
    <div className={className} style={{ height }}>
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="company"
        margin={{ top: 16, right: 16, bottom: 28, left: 64 }}
        padding={0.3}
        colors={colors}
        theme={theme}
        axisTop={null}
        axisRight={null}
        axisBottom={{ tickSize: 0, tickPadding: 6 }}
        axisLeft={{ tickSize: 0, tickPadding: 6 }}
        enableGridY={true}
        gridYValues={5}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        onClick={(d) => onBarClick?.(d)}
        role="application"
        ariaLabel="Top companies bar chart"
      />
    </div>
  )
}
