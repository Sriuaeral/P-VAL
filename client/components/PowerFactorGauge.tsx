// import GaugeChart from 'react-gauge-chart';


// interface PowerFactorGaugeProps {
//   value: number;
// }

// const PowerFactorGauge: React.FC<PowerFactorGaugeProps> = ({ value }) => {
//   return (
//       <GaugeChart
//         id="power-factor-gauge"
//         nrOfLevels={20}
//         percent={value}  // value is between 0 and 1
//         arcPadding={0.02}
//         colors={["#FF5F6D", "#FFC371", "#00C9A7"]}
//         textColor="#000"
//         needleColor="#444"
//         animate={true}
//         arcWidth={0.3}
//         formatTextValue={(val) => `${(parseFloat(val)).toFixed(2)}`}
//       />
//   );
// };

// export default PowerFactorGauge;


import React, { useEffect, useState } from "react";

interface PowerFactorGaugeProps {
  value: number; // expected between 0.8 and 1.2 to simulate Lag to Lead
}
const greenRange = [-0.95,-0.96,-0.97,-0.98,-0.99,0.95,0.96,0.97,0.98,0.99,1.0]; // Green range for the gauge
const redRange = [-1.0, -0.96]; // Red range for the gauge  
const getNeedleAngle = (value: number) => {
  if (greenRange.includes(value)) {
    return 0; // Keep needle at center for green range
  }
  // Normalize value to range between -1 (Lag) and +1 (Lead)
  const normalized = Math.max(-1, Math.min(1, (value - 1) * 10)); // e.g. 1.05 -> 0.5
  return normalized * 45; // Map to -45deg to +45deg
};

// Utility to convert polar coords to cartesian
const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

// Generate arc path from angle to angle
const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArc, 0, end.x, end.y,
  ].join(" ");
};

const PowerFactorGauge: React.FC<PowerFactorGaugeProps> = ({ value }) => {
  const [needleAngle, setNeedleAngle] = useState(0);

  const calculateAngle = (val: number) => {
    const clamped = Math.max(0.8, Math.min(1.2, val));
    const normalized = (clamped - 1) * 2.5; // 0.8 → -0.5, 1.2 → 0.5
    return normalized * 45; // Maps to -22.5 to +22.5
  };

  useEffect(() => {
    setNeedleAngle(getNeedleAngle(value));
  }, [value]);

  const centerX = 125;
  const centerY = 120;
  const radius = 95;

  return (
   <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
  <svg width="350" height="370" viewBox="0 0 240 200">
    {/* Clean Arc Segments */}
    <path d={describeArc(centerX, centerY, radius, 180, 216)} stroke="#FF0000" strokeWidth="25" fill="none" strokeLinecap="butt" />
    <path d={describeArc(centerX, centerY, radius, 216, 252)} stroke="#FFA500" strokeWidth="25" fill="none" strokeLinecap="butt" />
    <path d={describeArc(centerX, centerY, radius, 252, 288)} stroke="#00FF00" strokeWidth="25" fill="none" strokeLinecap="butt" />
    <path d={describeArc(centerX, centerY, radius, 288, 324)} stroke="#FFA500" strokeWidth="25" fill="none" strokeLinecap="butt" />
    <path d={describeArc(centerX, centerY, radius, 324, 360)} stroke="#FF0000" strokeWidth="25" fill="none" strokeLinecap="butt" />

    {/* Needle */}
    <g style={{ transition: "transform 0.8s ease" }} transform={`rotate(${needleAngle}, ${centerX}, ${centerY})`}>
      <line x1={centerX} y1={centerY} x2={centerX} y2={centerY - 60} stroke="#0033A0" strokeWidth="6" />
    </g>

    {/* Center Dot */}
    <circle cx={centerX} cy={centerY} r="6" fill="#0033A0" />

    {/* Lag and Lead Labels */}
    <text x="20" y="140" fontSize="12" fill="#666">Lag</text>
    <text x="205" y="140" fontSize="12" fill="#666">Lead</text>

    {/* Center Value */}
    <text x="125" y="145" textAnchor="middle" fontWeight="bold" fontSize="14" fill="#0033A0">
      {value.toFixed(2)}
    </text>
  </svg>
</div>

  );
};

export default PowerFactorGauge;
