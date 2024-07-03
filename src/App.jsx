import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const NUMBERS = ['0', ...Array.from({ length: 36 }, (_, i) => (i + 1).toString())];

const App = () => {
  const [number, setNumber] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60000);
  const wsRef = useRef(null);
  const containerRef = useRef(null);
  const spinTime = 5000; // Spin animation time
  const initialLoad = useRef(true);

  useEffect(() => {
    // Connect to WebSocket server on Render.com
    wsRef.current = new WebSocket('wss://hazardliskaserver.onrender.com'); // Use wss for secure WebSocket (WebSocket Secure)

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.number !== undefined) {
        if (initialLoad.current) {
          initialLoad.current = false;
        } else {
          setNumber(data.number);
        }
      }
      if (data.timeRemaining !== undefined) {
        setTimeRemaining(data.timeRemaining);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed, reconnecting...');
      setTimeout(() => {
        wsRef.current = new WebSocket('wss://hazardliskaserver.onrender.com'); // Reconnect to the same WebSocket URL
      }, 1000);
    };

    return () => {
      wsRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (number === null) return;

    const container = containerRef.current;
    const boxWidth = 70;

    const targetOffset = boxWidth * (NUMBERS.length + number - 5);

    requestAnimationFrame(() => {
      container.style.transition = `transform ${spinTime}ms ease`;
      container.style.transform = `translateX(-${targetOffset}px)`;
    });

    setTimeout(() => {
      requestAnimationFrame(() => {
        container.style.transition = `transform 1000ms ease`;
        container.style.transform = `translateX(0px)`;
      });
    }, 10000);
  }, [number]);

  return (
    <div className="App">
      <h1>Roulette Game</h1>
      <div className="roulette-container">
        <div className="roulette-line"></div>
        <div className="roulette" ref={containerRef}>
          {NUMBERS.concat(NUMBERS).concat(NUMBERS).map((num, index) => (
            <div key={index} className={`roulette-box ${num === '0' ? 'green' : index % 2 === 0 ? 'red' : 'black'}`}>
              {num}
            </div>
          ))}
          <div className='roulette-box green'>0</div>
          <div className='roulette-box red'>1</div>
          <div className='roulette-box black'>2</div>
          <div className='roulette-box red'>3</div>
          <div className='roulette-box black'>4</div>
        </div>
      </div>
      <div>Next spin in: {Math.ceil(timeRemaining / 1000)} seconds</div>
    </div>
  );
};

export default App;