import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { loadHistory } from '../storage';
import { usageTimeKey } from '../App'; 
import { logEvent } from '../src/analytics';

export default function HistoryScreen({ usageTime }) {
  const [history, setHistory] = useState([]);

  // Загружаем историю при монтировании
  useEffect(() => {
    logEvent('history_opened');
    const load = async () => {
      const data = await loadHistory();
      setHistory(data);
    };
    load();
  }, []);

  // Форматируем секунды в чч:мм:сс
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}ч ${m}м ${s}с`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text>{item.calories} ккал</Text>
      <Text>
        Б {item.bju?.protein ?? '-'} •
        Ж {item.bju?.fat ?? '-'} •
        У {item.bju?.carbs ?? '-'}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Общий таймер использования приложения */}
      <View style={styles.usageContainer}>
        <Text style={styles.usageText}>
          Общее время использования приложения: {formatTime(usageTime)}
        </Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>История пока пуста</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  usageContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  usageText: {
    fontSize: 14,
    color: '#333',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  empty: {
    padding: 20,
    textAlign: 'center',
    color: '#999',
  },
});
