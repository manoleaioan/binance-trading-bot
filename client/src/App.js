import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import logo from './logo.svg';
import {
  BarChart, Bar, Line, LineChart, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid, Legend, Cell, ResponsiveContainer
} from 'recharts';

import './App.css';

const socket = io("http://localhost:3001", {
  transport: ['websocket', 'polling']
})


const App = ({ }) => {
  const [data, setData] = useState([]);

  // 1. listen for a cpu event and update the state
  useEffect(() => {
    socket.on('cpu', price => {
      setData(currentData => [...currentData.slice(-50), price]);
    });
  }, []);

  const styles = {
    container: {
      maxWidth: 700,
      margin: "0 auto"
    },
    tooltipWrapper: {
      background: "#444444",
      border: "none"
    },
    tooltip: {
      color: "#ebebeb"
    }
  };


  // 2. render the line chart using the state
  return (
    <div>
      <h1>Real Time Data</h1>

      {/* <LineChart data={data} height={250} width={700}>
        <Tooltip
          contentStyle={styles.tooltipWrapper}
          labelStyle={styles.tooltip}
          formatter={value => `${value}`}
        />
        <Line dataKey="price" isAnimationActive={false} />
        <XAxis dataKey="name" />
        <YAxis dataKey="price" fill="#f7931a" domain={[-0.005, 0.005]} />
      </LineChart> */}

      {/* <AreaChart data={data} height={250} width={700}>
        <Tooltip
          contentStyle={styles.tooltipWrapper}
          labelStyle={styles.tooltip}
          formatter={value => `${value}`}
        />
        <Area
          dataKey="price"
          stroke="none"
          fillOpacity={1}
          fill="#f7931a"
        />
        <XAxis dataKey="tick" />
        <YAxis dataKey="price" fill="#f7931a" domain={['auto', 'auto']} />
      </AreaChart> */}

      <ResponsiveContainer width="100%" height={400}>
        <BarChart width={700} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3c4253" />
          <XAxis dataKey="tick" />
          <YAxis datakey="price" fill="#f7931a" domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Legend />
          {/* <Bar dataKey="price" fill={(1 == 1 ? "#ff0000" : "#8884d8")} isAnimationActive={false} /> */}

          <Bar
            dataKey="price"
            fill="#8884d8"
            isAnimationActive={false}
          >
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index > 0 ? (entry.price > data[index - 1].price ? '#4DA19C' : '#E25D5C') : '#E25D5C'} />
              ))
            }
          </Bar>

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
};

export default App;