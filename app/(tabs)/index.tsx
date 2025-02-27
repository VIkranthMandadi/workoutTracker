import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Dumbbell, History, Plus } from 'lucide-react-native';
import { useWorkoutStore } from '../../components/WorkoutStore';

export default function HomeScreen() {
  const { workouts } = useWorkoutStore();
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  const { workoutId } = useLocalSearchParams();

  useEffect(() => {
    // Get the 2 most recent workouts
    if (workouts.length > 0) {
      setRecentWorkouts(
        workouts.slice(0, 2).map((workout) => ({
          id: workout.id,
          name: workout.name,
          date: formatRelativeDate(workout.date),
          exercises: workout.exercises.length,
        }))
      );
    }
  }, [workouts]);

  const formatRelativeDate = (dateString: any) => {
    const now = new Date();
    const workoutDate = new Date(dateString);
    const diffTime = Math.abs(now - workoutDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const startNewWorkout = () => {
    router.push('/workout');
  };

  const viewHistory = () => {
    router.push('/history');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>Welcome to Workout Tracker</Text>
          <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={startNewWorkout}>
          <View style={styles.actionIconContainer}>
            <Plus size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Start New Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={viewHistory}>
          <View
            style={[styles.actionIconContainer, { backgroundColor: '#9b59b6' }]}
          >
            <History size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>View History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.length > 0 ? (
          recentWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => router.push("/history")} // Navigate to the workout details page
            >
              <View style={styles.workoutIconContainer}>
                <Dumbbell size={24} color="#fff" />
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDate}>{workout.date}</Text>
              </View>
              <Text style={styles.workoutExercises}>
                {workout.exercises} exercises
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent workouts</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tips</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Rest Between Sets</Text>
          <Text style={styles.tipText}>
            For strength training, rest 2-3 minutes between sets. For endurance,
            keep rest periods shorter at 30-60 seconds.
          </Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Track Your Progress</Text>
          <Text style={styles.tipText}>
            Consistently recording your workouts helps you see improvements and
            stay motivated.
          </Text>
        </View>
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
    position: 'relative',
    height: 200,
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    backgroundColor: '#3498db',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  workoutIconContainer: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  workoutDate: {
    fontSize: 14,
    color: '#777',
  },
  workoutExercises: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  tipCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
