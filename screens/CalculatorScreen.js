import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useEffect,
} from 'react-native';

import { saveCalculation } from '../storage';
import { logEvent } from '../src/analytics';


export default function CalculatorScreen({ navigation }) {
  const [sex, setSex] = useState('male'); // male | female
  const [goal, setGoal] = useState('maintain'); // maintain | lose | gain

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const [result, setResult] = useState(null);
  const [bju, setBju] = useState(null);

  //Калории
  const calculateCalories = () => {
    const a = Number(age);
    const h = Number(height);
    const w = Number(weight);

    if (!a || !h || !w) return null;

    let bmr =
      sex === 'male'
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;

    if (goal === 'lose') bmr *= 0.85;
    if (goal === 'gain') bmr *= 1.15;

    return Math.round(bmr);
  };

  //БЖУ
  const calculateBJU = (calories) => ({
    protein: Math.round((calories * 0.3) / 4),
    fat: Math.round((calories * 0.25) / 9),
    carbs: Math.round((calories * 0.45) / 4),
  });

    const handleCalculate = async () => {
    

    const calories = calculateCalories();
    if (!calories) return;

    const bjuResult = calculateBJU(calories);

    setResult(calories);
    setBju(bjuResult);

    const payload = {
        date: new Date().toISOString(),
        calories,
        bju: bjuResult,
        sex,
        goal,
        age,
        height,
        weight,
    };

    // Локально
    await saveCalculation(payload);

    logEvent('calculate_pressed', { calories, bju: bjuResult });
    };



  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Калькулятор питания</Text>

      {/* Кнопка истории */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={{ color: '#fff' }}>История расчётов</Text>
      </TouchableOpacity>

      {/* Пол */}
      <Text style={styles.label}>Пол</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, sex === 'male' && styles.active]}
          onPress={() => setSex('male')}
        >
          <Text>Мужской</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, sex === 'female' && styles.active]}
          onPress={() => setSex('female')}
        >
          <Text>Женский</Text>
        </TouchableOpacity>
      </View>

      {/* Ввод данных */}
      <TextInput
        placeholder="Возраст"
        style={styles.input}
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        placeholder="Рост (см)"
        style={styles.input}
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />
      <TextInput
        placeholder="Вес (кг)"
        style={styles.input}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      {/* Цель */}
      <Text style={styles.label}>Цель</Text>
      <TouchableOpacity
        style={[styles.goalButton, goal === 'maintain' && styles.goalActive]}
        onPress={() => setGoal('maintain')}
      >
        <Text>Поддержание веса</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.goalButton, goal === 'lose' && styles.goalActive]}
        onPress={() => setGoal('lose')}
      >
        <Text>Снижение веса</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.goalButton, goal === 'gain' && styles.goalActive]}
        onPress={() => setGoal('gain')}
      >
        <Text>Набор массы</Text>
      </TouchableOpacity>

      {/* Кнопка расчёта */}
      <TouchableOpacity style={styles.calculate} onPress={handleCalculate}>
        <Text style={{ color: '#fff' }}>Рассчитать</Text>
      </TouchableOpacity>

      {/* Результат */}
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Суточная норма: {result} ккал
          </Text>
          <Text>
            Б {bju.protein} г • Ж {bju.fat} г • У {bju.carbs} г
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  label: { marginTop: 20, fontWeight: '600' },

  row: { flexDirection: 'row', gap: 10, marginTop: 10 },

  button: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#d1f5d3',
    borderColor: '#2ecc71',
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    color: '#000',
  },

  goalButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  goalActive: {
    backgroundColor: '#2ecc71',
  },

  calculate: {
    marginTop: 20,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  result: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eef',
    borderRadius: 10,
  },

  historyButton: {
    marginBottom: 10,
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  resultText: {
    fontWeight: '600',
    marginBottom: 5,
  },
});
