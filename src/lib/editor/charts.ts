export type ChartType = "bar" | "line" | "pie" | "donut" | "area" | "scatter";

export interface ChartData {
  labels: string[];
  values: number[];
  colors: string[];
}

export function generateDefaultChartData(type: ChartType): ChartData {
  return {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    values: [30, 45, 25, 60, 40],
    colors: ["#C4653A", "#2563EB", "#16A34A", "#CA8A04", "#7C3AED"],
  };
}

export function renderChartSVG(data: ChartData, type: ChartType, width: number, height: number): string {
  const padding = 40;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const maxVal = Math.max(...data.values, 1);

  if (type === "bar") {
    const barW = chartW / data.values.length * 0.7;
    const gap = chartW / data.values.length * 0.3;
    const bars = data.values.map((v, i) => {
      const barH = (v / maxVal) * chartH;
      const x = padding + i * (barW + gap) + gap / 2;
      const y = height - padding - barH;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${data.colors[i % data.colors.length]}" rx="3">
        <title>${data.labels[i]}: ${v}</title></rect>`;
    }).join("");
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${bars}</svg>`;
  }

  if (type === "line") {
    const points = data.values.map((v, i) => {
      const x = padding + (i / (data.values.length - 1 || 1)) * chartW;
      const y = height - padding - (v / maxVal) * chartH;
      return `${x},${y}`;
    }).join(" ");
    const dots = data.values.map((v, i) => {
      const x = padding + (i / (data.values.length - 1 || 1)) * chartW;
      const y = height - padding - (v / maxVal) * chartH;
      return `<circle cx="${x}" cy="${y}" r="4" fill="${data.colors[0]}" stroke="white" stroke-width="2">
        <title>${data.labels[i]}: ${v}</title></circle>`;
    }).join("");
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <polyline points="${points}" fill="none" stroke="${data.colors[0]}" stroke-width="3" stroke-linejoin="round"/>
      ${dots}</svg>`;
  }

  if (type === "pie" || type === "donut") {
    const total = data.values.reduce((a, b) => a + b, 0) || 1;
    let cumulative = 0;
    const centerX = width / 2; const centerY = height / 2;
    const outerR = Math.min(width, height) / 2 - padding;
    const innerR = type === "donut" ? outerR * 0.5 : 0;
    const slices = data.values.map((v, i) => {
      const startAngle = (cumulative / total) * 360;
      cumulative += v;
      const endAngle = (cumulative / total) * 360;
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;
      const x1 = centerX + outerR * Math.cos(startRad);
      const y1 = centerY + outerR * Math.sin(startRad);
      const x2 = centerX + outerR * Math.cos(endRad);
      const y2 = centerY + outerR * Math.sin(endRad);
      const largeArc = v / total > 0.5 ? 1 : 0;
      const outerPath = `M${x1},${y1} A${outerR},${outerR} 0 ${largeArc},1 ${x2},${y2} L${centerX},${centerY} Z`;
      let innerPath = "";
      if (innerR > 0) {
        const ix1 = centerX + innerR * Math.cos(startRad);
        const iy1 = centerY + innerR * Math.sin(startRad);
        const ix2 = centerX + innerR * Math.cos(endRad);
        const iy2 = centerY + innerR * Math.sin(endRad);
        innerPath = ` L${ix2},${iy2} A${innerR},${innerR} 0 ${largeArc},0 ${ix1},${iy1} Z`;
      }
      return `<path d="${outerPath}${innerPath}" fill="${data.colors[i % data.colors.length]}">
        <title>${data.labels[i]}: ${v}</title></path>`;
    }).join("");
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${slices}</svg>`;
  }
  if (type === "area") {
    const points = data.values.map((v, i) => {
      const x = padding + (i / (data.values.length - 1 || 1)) * chartW;
      const y = height - padding - (v / maxVal) * chartH;
      return `${x},${y}`;
    }).join(" ");
    const bottom = `${padding + chartW},${height - padding}`;
    const areaPath = `M${padding + 0},${height - padding} ${points} L${bottom} Z`;
    const dots = data.values.map((v, i) => {
      const x = padding + (i / (data.values.length - 1 || 1)) * chartW;
      const y = height - padding - (v / maxVal) * chartH;
      return `<circle cx="${x}" cy="${y}" r="4" fill="${data.colors[0]}" stroke="white" stroke-width="2"><title>${data.labels[i]}: ${v}</title></circle>`;
    }).join("");
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <path d="${areaPath}" fill="${data.colors[0]}" opacity="0.3"/>
      <polyline points="${points}" fill="none" stroke="${data.colors[0]}" stroke-width="3" stroke-linejoin="round"/>
      ${dots}</svg>`;
  }

  if (type === "scatter") {
    const dots = data.values.map((v, i) => {
      const x = padding + (i / (data.values.length - 1 || 1)) * chartW;
      const y = height - padding - (v / maxVal) * chartH;
      const r = 4 + (v / maxVal) * 8;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${data.colors[i % data.colors.length]}" opacity="0.8">
        <title>${data.labels[i]}: ${v}</title></circle>`;
    }).join("");
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${dots}</svg>`;
  }

  return "";
}