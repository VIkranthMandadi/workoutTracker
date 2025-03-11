import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for different workout data
export type Set = {
  reps: number;
  weight: number;
};

export type Exercise = {
  name: string;
  sets: Set[];
};

export type RunWorkout = {
  type: 'run';
  id: string;
  name: string;
  date: string;
  distance: number;
  duration: number;
};

export type LiftWorkout = {
  type: 'lift';
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
};

export type Workout = RunWorkout | LiftWorkout;

export type WorkoutStore = {
  workouts: Workout[];
  addWorkout: (workout: Workout) => void;
  removeWorkout: (id: string) => void;
  clearWorkouts: () => void;
};

// Create the store with persistence
export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      workouts: [],
      addWorkout: (workout) =>
        set((state) => ({
          workouts: [workout, ...state.workouts],
        })),
      removeWorkout: (id) =>
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        })),
      clearWorkouts: () => set({ workouts: [] }),
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ workouts: state.workouts }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Storage rehydrated successfully');
        } else {
          console.log('Failed to rehydrate storage');
        }
      },
    }
  )
);
