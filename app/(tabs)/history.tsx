import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  X,
  Trash2,
  Timer,
  Dumbbell,
} from 'lucide-react-native';
import { useWorkoutStore } from '../../components/WorkoutStore';
import type {
  Workout,
  RunWorkout,
  LiftWorkout,
} from '../../components/WorkoutStore';
import { Calendar } from 'react-native-calendars';

type MarkedDates = {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
};

export default function HistoryScreen() {
  const { workouts, removeWorkout, clearWorkouts } = useWorkoutStore();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [dateWorkouts, setDateWorkouts] = useState<Workout[]>([]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format date for calendar marking (YYYY-MM-DD)
  const formatCalendarDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Create the marked dates object for the calendar
  useEffect(() => {
    const marked: MarkedDates = {};

    workouts.forEach((workout) => {
      const dateStr = formatCalendarDate(workout.date);
      marked[dateStr] = {
        marked: true,
        dotColor: '#3498db',
        selected: selectedDate === dateStr,
      };
    });

    // If a date is selected, make sure it's highlighted
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#3498db',
      };
    }

    setMarkedDates(marked);
  }, [workouts, selectedDate]);

  // Update the workouts shown when a date is selected
  useEffect(() => {
    if (selectedDate) {
      // Find workouts for this date
      const filteredWorkouts = workouts.filter(
        (workout) => formatCalendarDate(workout.date) === selectedDate
      );
      setDateWorkouts(filteredWorkouts);
    } else {
      setDateWorkouts([]);
    }
  }, [selectedDate, workouts]);

  const getWorkoutSummary = (workout: Workout): string => {
    if (workout.type === 'run') {
      return `${workout.distance} miles in ${workout.duration} mins`;
    }
    return `${workout.exercises.length} exercises`;
  };

  const viewWorkoutDetails = (workout: Workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const handleDeleteWorkout = (id: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => removeWorkout(id),
          style: 'destructive',
        },
      ]
    );
  };

  const handleClearAllWorkouts = () => {
    Alert.alert(
      'Clear All Workouts',
      'Are you sure you want to delete all workout history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          onPress: () => {
            clearWorkouts();
            setSelectedDate(null);
            setDateWorkouts([]);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const renderWorkoutDetails = (workout: Workout) => {
    if (workout.type === 'run') {
      return (
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{workout.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDate}>{formatDate(workout.date)}</Text>

          <View style={styles.runDetails}>
            <View style={styles.runDetailItem}>
              <Text style={styles.runDetailLabel}>Distance</Text>
              <Text style={styles.runDetailValue}>
                {workout.distance} miles
              </Text>
            </View>
            <View style={styles.runDetailItem}>
              <Text style={styles.runDetailLabel}>Duration</Text>
              <Text style={styles.runDetailValue}>{workout.duration} mins</Text>
            </View>
            <View style={styles.runDetailItem}>
              <Text style={styles.runDetailLabel}>Pace</Text>
              <Text style={styles.runDetailValue}>
                {(workout.duration / workout.distance).toFixed(2)} min/mile
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{workout.name}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <X size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.modalDate}>{formatDate(workout.date)}</Text>

        <ScrollView style={styles.exercisesList}>
          {workout.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>

              <View style={styles.setsHeader}>
                <Text style={styles.setHeaderText}>Set</Text>
                <Text style={styles.setHeaderText}>Reps</Text>
                <Text style={styles.setHeaderText}>Weight</Text>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setText}>{setIndex + 1}</Text>
                  <Text style={styles.setText}>{set.reps}</Text>
                  <Text style={styles.setText}>{set.weight}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Calendar</Text>
      </View>

      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          todayTextColor: '#3498db',
          arrowColor: '#3498db',
          dotColor: '#3498db',
          textDayFontWeight: '600',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
        }}
      />

      <View style={styles.dateWorkoutsContainer}>
        {selectedDate ? (
          <>
            <Text style={styles.selectedDateText}>
              Workouts on{' '}
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            {dateWorkouts.length > 0 ? (
              <ScrollView style={styles.workoutsList}>
                {dateWorkouts.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.workoutCard}
                    onPress={() => viewWorkoutDetails(workout)}
                  >
                    <View style={styles.workoutCardContent}>
                      <View
                        style={[
                          styles.workoutIconContainer,
                          {
                            backgroundColor:
                              workout.type === 'run' ? '#2ecc71' : '#3498db',
                          },
                        ]}
                      >
                        {workout.type === 'run' ? (
                          <Timer size={24} color="#fff" />
                        ) : (
                          <Dumbbell size={24} color="#fff" />
                        )}
                      </View>
                      <View style={styles.workoutInfo}>
                        <Text style={styles.workoutName}>{workout.name}</Text>
                        <Text style={styles.workoutSummary}>
                          {getWorkoutSummary(workout)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteWorkout(workout.id)}
                      >
                        <Trash2 size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyDateContainer}>
                <Text style={styles.emptyDateText}>
                  No workouts on this date
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noDateSelectedContainer}>
            <Text style={styles.noDateSelectedText}>
              Select a date to view workouts
            </Text>
          </View>
        )}
      </View>

      {workouts.length > 0 && (
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={handleClearAllWorkouts}
        >
          <Text style={styles.clearAllText}>Clear All History</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedWorkout && (
          <View style={styles.modalContainer}>
            {renderWorkoutDetails(selectedWorkout)}
          </View>
        )}
      </Modal>
    </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateWorkoutsContainer: {
    flex: 1,
    padding: 15,
    paddingBottom: 80, // Add padding for the clear all button
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  workoutsList: {
    flex: 1,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  workoutIconContainer: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workoutSummary: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 10,
  },
  emptyDateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyDateText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  noDateSelectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDateSelectedText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  clearAllButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearAllText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalDate: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
  },
  exercisesList: {
    maxHeight: '80%',
  },
  exerciseItem: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  setsHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  setHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#777',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  setText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  runDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  runDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  runDetailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  runDetailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
