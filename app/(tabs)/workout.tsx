import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Timer,
  Dumbbell,
} from 'lucide-react-native';
import { useWorkoutStore } from '../../components/WorkoutStore';
import type {
  Workout,
  RunWorkout,
  LiftWorkout,
  Exercise,
  Set,
} from '../../components/WorkoutStore';

type WorkoutType = 'run' | 'lift' | null;

export default function WorkoutScreen() {
  const { addWorkout } = useWorkoutStore();
  const [workoutType, setWorkoutType] = useState<WorkoutType>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState<Array<Exercise & { id: string }>>([
    { id: '1', name: '', sets: [{ reps: 0, weight: 0 }] },
  ]);

  const resetForm = () => {
    setWorkoutName('');
    setDistance('');
    setDuration('');
    setExercises([{ id: '1', name: '', sets: [{ reps: 0, weight: 0 }] }]);
  };

  const handleBack = () => {
    Alert.alert(
      'Go Back',
      'Are you sure you want to go back? Any unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go Back',
          onPress: () => {
            setWorkoutType(null);
            resetForm();
          },
        },
      ]
    );
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: [{ reps: 0, weight: 0 }] },
    ]);
  };

  const removeExercise = (exerciseId: string) => {
    if (exercises.length === 1) {
      Alert.alert(
        'Cannot Remove',
        'You need at least one exercise in your workout.'
      );
      return;
    }
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, name } : ex)));
  };

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] }
          : ex
      )
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          if (ex.sets.length === 1) {
            Alert.alert(
              'Cannot Remove',
              'You need at least one set for each exercise.'
            );
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

  const updateSetValue = (
    exerciseId: string,
    setIndex: number,
    field: keyof Set,
    value: string
  ) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const newSets = [...ex.sets];
          newSets[setIndex] = {
            ...newSets[setIndex],
            [field]:
              field === 'reps' ? parseInt(value) || 0 : parseFloat(value) || 0,
          };
          return { ...ex, sets: newSets };
        }
        return ex;
      })
    );
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      Alert.alert('Missing Information', 'Please enter a workout name.');
      return;
    }

    if (workoutType === 'run') {
      if (!distance.trim() || !duration.trim()) {
        Alert.alert(
          'Missing Information',
          'Please enter both distance and duration.'
        );
        return;
      }

      const runWorkout: RunWorkout = {
        id: Date.now().toString(),
        type: 'run',
        name: workoutName,
        date: new Date().toISOString().split('T')[0],
        distance: parseFloat(distance),
        duration: parseFloat(duration),
      };

      addWorkout(runWorkout);
    } else {
      for (const exercise of exercises) {
        if (!exercise.name.trim()) {
          Alert.alert(
            'Missing Information',
            'Please enter a name for all exercises.'
          );
          return;
        }
      }

      const liftWorkout: LiftWorkout = {
        id: Date.now().toString(),
        type: 'lift',
        name: workoutName,
        date: new Date().toISOString().split('T')[0],
        exercises: exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets,
        })),
      };

      addWorkout(liftWorkout);
    }

    Alert.alert('Workout Saved', 'Your workout has been saved successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setWorkoutType(null);
          resetForm();
          router.push('/history');
        },
      },
    ]);
  };

  const renderWorkoutTypeSelection = () => (
    <View style={styles.workoutTypeContainer}>
      <Text style={styles.workoutTypeTitle}>Choose Workout Type</Text>
      <View style={styles.workoutTypeButtons}>
        <TouchableOpacity
          style={styles.workoutTypeButton}
          onPress={() => setWorkoutType('run')}
        >
          <Timer size={40} color="#fff" />
          <Text style={styles.workoutTypeText}>Run Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.workoutTypeButton}
          onPress={() => setWorkoutType('lift')}
        >
          <Dumbbell size={40} color="#fff" />
          <Text style={styles.workoutTypeText}>Lift Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRunWorkoutForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Workout Name"
        placeholderTextColor="#777"
        value={workoutName}
        onChangeText={setWorkoutName}
      />
      <TextInput
        style={styles.input}
        placeholder="Distance (miles)"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={distance}
        onChangeText={setDistance}
      />
      <TextInput
        style={styles.input}
        placeholder="Duration (minutes)"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
        <Save size={20} color="#fff" />
        <Text style={styles.saveButtonText}>Save Workout</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLiftWorkoutForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Workout Name"
        placeholderTextColor="#777"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <View style={styles.exercisesContainer}>
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
                  value={set.reps.toString()}
                  onChangeText={(text) =>
                    updateSetValue(exercise.id, setIndex, 'reps', text)
                  }
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={set.weight.toString()}
                  onChangeText={(text) =>
                    updateSetValue(exercise.id, setIndex, 'weight', text)
                  }
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

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={addExercise}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
        <Save size={20} color="#fff" />
        <Text style={styles.saveButtonText}>Save Workout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Your Workout</Text>
      </View>

      {workoutType === null && renderWorkoutTypeSelection()}
      {workoutType === 'run' && renderRunWorkoutForm()}
      {workoutType === 'lift' && renderLiftWorkoutForm()}
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
  workoutTypeContainer: {
    padding: 20,
  },
  workoutTypeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  workoutTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  workoutTypeButton: {
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '45%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  workoutTypeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exercisesContainer: {
    marginTop: 20,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  setsHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  setNumber: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 8,
    marginHorizontal: 5,
    textAlign: 'center',
  },
  removeSetButton: {
    padding: 8,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 10,
  },
  addSetText: {
    color: '#3498db',
    marginLeft: 5,
  },
  addExerciseButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  addExerciseText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
