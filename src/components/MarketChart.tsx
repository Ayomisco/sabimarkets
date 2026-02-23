"use client";

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartProps {
  currentYesPrice: number;
}

export default function MarketChart({ currentYesPrice }: ChartProps) {
  // Generate highly realistic mock historical data that accurately ends at the current live price
  const data = useMemo(() => {
    const points = [];
    let currentVal = currentYesPrice * 100;

    // Generate 30 days of data backwards
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Add random market noise
        const noise = (Math.random() - 0.5) * 8; // Max 8% swing
        let yesPrice = currentVal + noise;
        
        // Constrain between 1 and 99
        yesPrice = Math.max(1, Math.min(99, yesPrice));
        
        // Ensure the final data point perfectly matches current live odds
        if (i === 0) yesPrice = currentYesPrice * 100; 

        points.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            Yes: yesPrice,
            No: 100 - yesPrice,
        });
        currentVal = yesPrice;
    }
    return points;
  }, [currentYesPrice]);

  return (
    <div className="w-full h-[300px] min-h-[300px] -ml-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#3D2E1E" vertical={false} />
          
          <XAxis 
            dataKey="date" 
            stroke="#A69C8A" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            minTickGap={30}
            dy={10}
          />
          
          <YAxis 
            stroke="#A69C8A" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${Math.round(value)}%`}
            domain={[0, 100]}
            dx={-10}
          />
          
          <Tooltip 
             contentStyle={{ 
                 backgroundColor: '#110F0D', 
                 borderColor: '#3D2E1E', 
                 borderRadius: '12px', 
                 color: '#fff',
                 fontFamily: 'monospace',
                 boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
             }}
             itemStyle={{ fontWeight: 'bold' }}
             formatter={(value: number, name: string) => [
                 `${value.toFixed(1)}¢`, 
                 name
             ]}
             labelStyle={{ color: '#A69C8A', marginBottom: '8px' }}
          />

          <Line 
            type="monotone" 
            dataKey="Yes" 
            stroke="#00C566" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: '#00C566', stroke: '#0B0A08', strokeWidth: 3 }}
            animationDuration={1500}
          />
          
          <Line 
            type="monotone" 
            dataKey="No" 
            stroke="#E8333A" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: '#E8333A', stroke: '#0B0A08', strokeWidth: 3 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
