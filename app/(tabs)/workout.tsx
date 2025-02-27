import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react-native';
import { useWorkoutStore } from '../../components/WorkoutStore';

export default function WorkoutScreen() {
  const { addWorkout } = useWorkoutStore();
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([
    { id: '1', name: '', sets: [{ reps: '', weight: '' }] }
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: [{ reps: '', weight: '' }] }
    ]);
  };

  const removeExercise = (exerciseId) => {
    if (exercises.length === 1) {
      Alert.alert('Cannot Remove', 'You need at least one exercise in your workout.');
      return;
    }
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseName = (id: any, name: any) => {
    setExercises(
      exercises.map(ex => (ex.id === id ? { ...ex, name } : ex))
    );
  };

  const addSet = (exerciseId) => {
    setExercises(
      exercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, sets: [...ex.sets, { reps: '', weight: '' }] } 
          : ex
      )
    );
  };

  const removeSet = (exerciseId, setIndex) => {
    setExercises(
      exercises.map(ex => {
        if (ex.id === exerciseId) {
          if (ex.sets.length === 1) {
            Alert.alert('Cannot Remove', 'You need at least one set for each exercise.');
            return ex;
          }
          const newSets = [...ex.sets];
          newSets.splice(setIndex, 1);
          return { ...ex, sets: newSets };
        }
        return ex;
      })
    );
  };

  const updateSetValue = (exerciseId, setIndex, field, value) => {
    setExercises(
      exercises.map(ex => {
        if (ex.id === exerciseId) {
          const newSets = [...ex.sets];
          newSets[setIndex] = { ...newSets[setIndex], [field]: value };
          return { ...ex, sets: newSets };
        }
        return ex;
      })
    );
  };

  const saveWorkout = () => {
    // Validate workout name
    if (!workoutName.trim()) {
      Alert.alert('Missing Information', 'Please enter a workout name.');
      return;
    }

    // Validate exercises
    for (const exercise of exercises) {
      if (!exercise.name.trim()) {
        Alert.alert('Missing Information', 'Please enter a name for all exercises.');
        return;
      }

      for (const set of exercise.sets) {
        if (!set.reps.trim() || !set.weight.trim()) {
          Alert.alert('Missing Information', 'Please enter reps and weight for all sets.');
          return;
        }
      }
    }

    // Save workout
    const workout = {
      id: Date.now().toString(),
      name: workoutName,
      date: new Date().toISOString(),
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(set => ({
          reps: parseInt(set.reps, 10),
          weight: parseFloat(set.weight)
        }))
      }))
    };

    addWorkout(workout);
    Alert.alert(
      'Workout Saved',
      'Your workout has been saved successfully!',
      [{ text: 'OK', onPress: () => router.push('/history') }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Your Workout</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Workout Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Upper Body, Leg Day"
          placeholderTextColor="#777"
          value={workoutName}
          onChangeText={setWorkoutName}
        />

        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          {exercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <TextInput
                  style={styles.exerciseNameInput}
                  placeholder="Enter Exercise Name"
                  placeholderTextColor="#777"
                  value={exercise.name}
                  onChangeText={(text) => updateExerciseName(exercise.id, text)}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeExercise(exercise.id)}
                >
                  <Trash2 size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>

              <View style={styles.setsHeader}>
                <Text style={styles.setsHeaderText}>Set</Text>
                <Text style={styles.setsHeaderText}>Reps</Text>
                <Text style={styles.setsHeaderText}>Weight</Text>
                <Text style={styles.setsHeaderText}></Text>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setNumber}>{setIndex + 1}</Text>
                  <TextInput
                    style={styles.setInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={set.reps}
                    onChangeText={(text) => updateSetValue(exercise.id, setIndex, 'reps', text)}
                  />
                  <TextInput
                    style={styles.setInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={set.weight}
                    onChangeText={(text) => updateSetValue(exercise.id, setIndex, 'weight', text)}
                  />
                  <TouchableOpacity
                    style={styles.removeSetButton}
                    onPress={() => removeSet(exercise.id, setIndex)}
                  >
                    <Trash2 size={16} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => addSet(exercise.id)}
              >
                <Plus size={16} color="#3498db" />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
            <Plus size={20} color="#fff" />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#555" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exercisesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  removeButton: {
    padding: 5,
  },
  setsHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  setsHeaderText: {
    flex: 1, // Adjust this value based on your needs
    fontSize: 14,
    fontWeight: '600',
    color: '#777',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  setNumber: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  // Change this style
  setInput: {
    // Remove flex: 1 and use a fixed width
    width: 80, // Adjust this value based on your needs
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 8,
    marginLeft: 30,
    marginHorizontal: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeSetButton: {
    padding: 8,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 5,
  },
  addSetText: {
    marginLeft: 5,
    color: '#3498db',
    fontWeight: '600',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  addExerciseText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});