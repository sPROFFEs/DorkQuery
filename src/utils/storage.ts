import { UserProgress } from '../types';

// Versión de la aplicación. Cambia esto cuando haya actualizaciones significativas que afecten al progreso
const APP_VERSION = '1.0.1';  // Asegúrate de actualizar esto con cada nueva versión importante

// Estado inicial vacío de progreso
const initialUserProgress: UserProgress = {
  completedChallenges: [],
  courseProgress: {},
  hintsUsed: {}
};

// Clave para el `localStorage`
const STORAGE_KEY = 'ethical-hacking-progress';

// Obtener la versión actual de la app desde el `localStorage`
const getAppVersion = (): string => {
  const storedVersion = localStorage.getItem('appVersion');
  return storedVersion || '';  // Si no existe, devolver cadena vacía
};

// Establecer la versión actual de la app en el `localStorage`
const setAppVersion = (version: string): void => {
  localStorage.setItem('appVersion', version);
};

// Cargar el progreso del usuario desde el `localStorage`
export const loadUserProgress = (): UserProgress => {
  try {
    const storedVersion = getAppVersion();
    
    // Si la versión no coincide, puede que necesites limpiar los datos de `localStorage`
    if (storedVersion !== APP_VERSION) {
      console.log('La versión de la app ha cambiado. Actualizando los datos si es necesario.');
      setAppVersion(APP_VERSION); // Establecer la nueva versión

      // Aquí puedes añadir lógica adicional si es necesario limpiar o transformar el progreso
      // por ejemplo, si hay cambios en la estructura de los datos. Si no es necesario, puedes omitir esta parte.
    }

    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return { ...initialUserProgress };  // Si no hay datos, devolver el estado inicial

    return JSON.parse(storedData) as UserProgress;
  } catch (error) {
    console.error('Error al cargar el progreso:', error);
    return { ...initialUserProgress };  // Si hay un error, devolver el estado inicial
  }
};

// Guardar el progreso del usuario en el `localStorage`
export const saveUserProgress = (progress: UserProgress): void => {
  try {
    // Si la versión ha cambiado, puedes gestionar la actualización de los datos
    const storedVersion = getAppVersion();
    if (storedVersion !== APP_VERSION) {
      setAppVersion(APP_VERSION);  // Asegurarse de establecer la nueva versión
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));  // Guardar los datos
  } catch (error) {
    console.error('Error al guardar el progreso:', error);
  }
};

// Marcar un desafío como completado
export const completeChallenge = (challengeId: string): void => {
  const progress = loadUserProgress();

  if (!progress.completedChallenges.includes(challengeId)) {
    progress.completedChallenges.push(challengeId);
    saveUserProgress(progress);
  }
};

// Verificar si un desafío está completado
export const isChallengeCompleted = (challengeId: string): boolean => {
  const progress = loadUserProgress();
  return progress.completedChallenges.includes(challengeId);
};

// Usar una pista para un desafío
export const useHint = (challengeId: string): number => {
  const progress = loadUserProgress();

  const currentHints = progress.hintsUsed[challengeId] || 0;
  progress.hintsUsed[challengeId] = currentHints + 1;

  saveUserProgress(progress);
  return progress.hintsUsed[challengeId];
};

// Obtener el número de pistas utilizadas para un desafío
export const getHintsUsed = (challengeId: string): number => {
  const progress = loadUserProgress();
  return progress.hintsUsed[challengeId] || 0;
};

// Marcar un módulo de un curso como completado
export const completeModule = (courseId: string, moduleIndex: number): void => {
  const progress = loadUserProgress();

  if (!progress.courseProgress[courseId]) {
    progress.courseProgress[courseId] = [];
  }

  if (!progress.courseProgress[courseId].includes(moduleIndex)) {
    progress.courseProgress[courseId].push(moduleIndex);
    progress.courseProgress[courseId].sort((a, b) => a - b);  // Mantener los índices ordenados
    saveUserProgress(progress);
  }
};

// Obtener el último módulo completado de un curso
export const getLastCompletedModule = (courseId: string): number => {
  const progress = loadUserProgress();

  if (!progress.courseProgress[courseId] || progress.courseProgress[courseId].length === 0) {
    return -1;  // Ningún módulo completado
  }

  return Math.max(...progress.courseProgress[courseId]);
};

// Verificar si un módulo de un curso está completado
export const isModuleCompleted = (courseId: string, moduleIndex: number): boolean => {
  const progress = loadUserProgress();

  if (!progress.courseProgress[courseId]) {
    return false;
  }

  return progress.courseProgress[courseId].includes(moduleIndex);
};

// Restablecer todo el progreso (para la página de configuración, por ejemplo)
export const resetProgress = (): void => {
  saveUserProgress({ ...initialUserProgress });
};
