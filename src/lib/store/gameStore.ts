import { create } from 'zustand'

interface Mission {
  id: string
  type: 'collect' | 'survive' | 'reach'
  target: number
  current: number
  description: string
  reward: number
  completed: boolean
}

interface Level {
  id: number
  name: string
  missions: Mission[]
  asteroidDensity: number
  resourceDensity: number
  completed: boolean
  requiredMinerals: number
}

interface GameState {
  health: number
  fuel: number
  score: number
  gameOver: boolean
  resources: {
    minerals: number
    energy: number
  }
  currentLevel: number
  levels: Level[]
  activeMissions: Mission[]
  setHealth: (health: number) => void
  setFuel: (fuel: number) => void
  addScore: (points: number) => void
  setGameOver: (isGameOver: boolean) => void
  resetGame: () => void
  collectResource: (type: 'minerals' | 'energy', amount: number) => void
  setLevel: (level: number) => void
  completeMission: (missionId: string) => void
  updateMissionProgress: (missionId: string, progress: number) => void
}

// Initial state for reset functionality
const initialState = {
  health: 100,
  fuel: 100,
  score: 0,
  gameOver: false,
  resources: {
    minerals: 0,
    energy: 0,
  },
  currentLevel: 1,
  activeMissions: [],
}

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  levels: [
    {
      id: 1,
      name: "Training Grounds",
      missions: [
        {
          id: 'collect_minerals_1',
          type: 'collect',
          target: 50,
          current: 0,
          description: 'Collect 50 minerals',
          reward: 100,
          completed: false
        },
        {
          id: 'survive_1',
          type: 'survive',
          target: 60, // seconds
          current: 0,
          description: 'Survive for 60 seconds',
          reward: 150,
          completed: false
        }
      ],
      asteroidDensity: 0.3,
      resourceDensity: 0.5,
      completed: false,
      requiredMinerals: 50
    },
    {
      id: 2,
      name: "Asteroid Belt",
      missions: [
        {
          id: 'collect_minerals_2',
          type: 'collect',
          target: 100,
          current: 0,
          description: 'Collect 100 minerals',
          reward: 200,
          completed: false
        },
        {
          id: 'survive_2',
          type: 'survive',
          target: 90,
          current: 0,
          description: 'Survive for 90 seconds',
          reward: 250,
          completed: false
        }
      ],
      asteroidDensity: 0.5,
      resourceDensity: 0.6,
      completed: false,
      requiredMinerals: 100
    },
    {
      id: 3,
      name: "Deep Space",
      missions: [
        {
          id: 'collect_minerals_3',
          type: 'collect',
          target: 150,
          current: 0,
          description: 'Collect 150 minerals',
          reward: 300,
          completed: false
        },
        {
          id: 'survive_3',
          type: 'survive',
          target: 120,
          current: 0,
          description: 'Survive for 120 seconds',
          reward: 350,
          completed: false
        }
      ],
      asteroidDensity: 0.7,
      resourceDensity: 0.7,
      completed: false,
      requiredMinerals: 150
    }
  ],
  setHealth: (health) => {
    set((state) => {
      // Set game over if health reaches 0
      if (health <= 0) {
        return { health: 0, gameOver: true };
      }
      return { health };
    });
  },
  setFuel: (fuel) => set({ fuel }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  setGameOver: (isGameOver) => set({ gameOver: isGameOver }),
  resetGame: () => set((state) => ({ 
    ...initialState,
    gameOver: false,
    levels: state.levels.map(level => ({
      ...level,
      completed: false,
      missions: level.missions.map(mission => ({
        ...mission,
        current: 0,
        completed: false
      }))
    }))
  })),
  collectResource: (type, amount) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [type]: state.resources[type] + amount,
      },
    })),
  setLevel: (level) => set({ currentLevel: level }),
  completeMission: (missionId) => 
    set((state) => ({
      levels: state.levels.map(level => ({
        ...level,
        missions: level.missions.map(mission => 
          mission.id === missionId 
            ? { ...mission, completed: true }
            : mission
        )
      }))
    })),
  updateMissionProgress: (missionId, progress) =>
    set((state) => ({
      levels: state.levels.map(level => ({
        ...level,
        missions: level.missions.map(mission =>
          mission.id === missionId
            ? { ...mission, current: progress }
            : mission
        )
      }))
    }))
})) 