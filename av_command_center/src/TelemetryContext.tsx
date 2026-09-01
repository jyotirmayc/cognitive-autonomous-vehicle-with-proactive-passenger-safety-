import React, { createContext, useContext, useState, useEffect } from 'react';

type TelemetryState = {
  isDemoActive: boolean;
  speed: string;
  steering: string;
  driverState: 'NORMAL' | 'WARNING' | 'EMERGENCY';
  drowsinessScore: string;
  gasState: 'SAFE' | 'LEAK_DETECTED';
  doorState: 'UNLOCKED' | 'LOCKED';
  riskScore: string;
  ttc: string;
  decision: 'CRUISE' | 'SLOW' | 'EMERGENCY PULL-OVER' | 'HARDWARE KILL';
  motorcycleStatus: 'TRACKING' | 'APPROACHING' | 'HAZARD';
  hardwareCut: boolean;
  startDemo: () => void;
};

const initialState: TelemetryState = {
  isDemoActive: false,
  speed: '0.00',
  steering: '+0.0',
  driverState: 'NORMAL',
  drowsinessScore: '0.01',
  gasState: 'SAFE',
  doorState: 'UNLOCKED',
  riskScore: '0.12',
  ttc: '8.4 s',
  decision: 'CRUISE',
  motorcycleStatus: 'TRACKING',
  hardwareCut: false,
  startDemo: () => {},
};

const TelemetryContext = createContext<TelemetryState>(initialState);

export const useTelemetry = () => useContext(TelemetryContext);

export const TelemetryProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<Omit<TelemetryState, 'startDemo'>>(initialState);

  const startDemo = () => {
    setState(prev => ({ ...prev, isDemoActive: true }));
    
    // T=0: Start driving
    setTimeout(() => {
      setState(prev => ({
        ...prev, speed: '2.54', steering: '+1.2', decision: 'CRUISE', doorState: 'UNLOCKED'
      }));
    }, 1000);

    // T=5s: Motorcycle approaches rapidly
    setTimeout(() => {
      setState(prev => ({
        ...prev, 
        motorcycleStatus: 'APPROACHING', 
        riskScore: '0.64', 
        ttc: '2.8 s', 
        decision: 'SLOW',
        speed: '1.24',
        doorState: 'LOCKED'
      }));
    }, 5000);

    // T=10s: Motorcycle passes, back to cruise
    setTimeout(() => {
      setState(prev => ({
        ...prev, 
        motorcycleStatus: 'TRACKING', 
        riskScore: '0.18', 
        ttc: '9.1 s', 
        decision: 'CRUISE',
        speed: '2.45',
        doorState: 'UNLOCKED'
      }));
    }, 10000);

    // T=15s: Driver starts falling asleep
    setTimeout(() => {
      setState(prev => ({
        ...prev, 
        driverState: 'WARNING', 
        drowsinessScore: '0.65'
      }));
    }, 15000);

    // T=18s: Driver fully asleep, trigger emergency pull-over
    setTimeout(() => {
      setState(prev => ({
        ...prev, 
        driverState: 'EMERGENCY', 
        drowsinessScore: '0.98',
        decision: 'EMERGENCY PULL-OVER',
        speed: '1.10',
        steering: '-4.5' // Steering right to pull over
      }));
    }, 18000);

    // T=23s: Parked safely
    setTimeout(() => {
      setState(prev => ({
        ...prev, 
        speed: '0.00',
        steering: '0.0',
        doorState: 'UNLOCKED'
      }));
    }, 23000);
    
    // T=28s: Surprise Gas Leak!
    setTimeout(() => {
      setState(prev => ({
        ...prev, 
        gasState: 'LEAK_DETECTED',
        decision: 'HARDWARE KILL',
        hardwareCut: true
      }));
    }, 28000);

    // T=35s: Reset
    setTimeout(() => {
      setState(prev => ({ ...initialState, isDemoActive: false }));
    }, 35000);
  };

  return (
    <TelemetryContext.Provider value={{ ...state, startDemo }}>
      {children}
    </TelemetryContext.Provider>
  );
};
