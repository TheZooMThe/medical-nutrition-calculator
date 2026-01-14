import React, { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalculatorScreen from './screens/CalculatorScreen';
import HistoryScreen from './screens/HistoryScreen';
import { initAnalytics, logEvent } from './src/analytics';

const Stack = createNativeStackNavigator();
const USAGE_KEY = 'appUsageTime';

import { initDB } from './storage';

export default function App() {
  const [usageTime, setUsageTime] = useState(0); // сек
  const startTimeRef = useRef(Date.now());
  const appState = useRef(AppState.currentState);

  // Инициализация аналитики 
  useEffect(() => {
    initAnalytics(); 
    (async () => {
      await initDB();
    })();
  }, []);

  // Загружаем сохранённое время при старте
  useEffect(() => {
    const loadTime = async () => {
      const savedTime = await AsyncStorage.getItem(USAGE_KEY);
      if (savedTime) setUsageTime(Number(savedTime));
    };
    loadTime();
  }, []);

  // Таймер обновления каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setUsageTime((prev) => prev + elapsed);
      startTimeRef.current = Date.now();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Обработка смены состояния приложения
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        await AsyncStorage.setItem(USAGE_KEY, usageTime.toString());
        logEvent('session_time_update', { totalTime: usageTime });
      }
      if (nextAppState === 'active') startTimeRef.current = Date.now();
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [usageTime]);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Calculator" options={{ title: 'Калькулятор питания' }}>
          {(props) => <CalculatorScreen {...props} usageTime={usageTime} />}
        </Stack.Screen>
        <Stack.Screen name="History" options={{ title: 'История расчётов' }}>
          {(props) => <HistoryScreen {...props} usageTime={usageTime} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
