import { create } from 'zustand'

export type TutorialStep = 
  | 'movement'
  | 'boost'
  | 'powerups'
  | 'resources'
  | 'missions'
  | 'complete'

interface TutorialState {
  isActive: boolean
  currentStep: TutorialStep
  completedSteps: Set<TutorialStep>
  startTutorial: () => void
  endTutorial: () => void
  completeStep: (step: TutorialStep) => void
  setCurrentStep: (step: TutorialStep) => void
}

const initialState = {
  isActive: true,
  currentStep: 'movement' as TutorialStep,
  completedSteps: new Set<TutorialStep>(),
}

export const useTutorialStore = create<TutorialState>((set) => ({
  ...initialState,
  startTutorial: () => set(initialState),
  endTutorial: () => set({ isActive: false }),
  completeStep: (step) => set((state) => {
    const newCompletedSteps = new Set(state.completedSteps).add(step)
    return { completedSteps: newCompletedSteps }
  }),
  setCurrentStep: (step) => set({ currentStep: step }),
})) 