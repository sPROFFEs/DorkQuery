import { UserProgress } from '../types';

// Clave para la versión de la app en localStorage
const APP_VERSION_KEY = 'appVersion';
const APP_VERSION = '1.0.2';  // Cambia esto cada vez que actualices la app

// Estado inicial vacío de progreso
const initialUserProgress: UserProgress = {
  completedChallenges: [],
  courseProgress: {},
  hintsUsed: {}
};

// Clave para el `localStorage`
const STORAGE_KEY = 'ethical-hacking-progress';

// Función para encriptar datos usando base64
const encodeData = (data: any): string => {
  const jsonData = JSON.stringify(data);
  return btoa(jsonData);  // Convierte a base64
};

// Función para desencriptar los datos codificados en base64
const decodeData = (encodedData: string): any => {
  const jsonData = atob(encodedData);  // Convierte de base64 a string
  return JSON.parse(jsonData);  // Convierte el string de nuevo a un objeto
};

// Obtener la versión actual de la app desde el `localStorage`
const getAppVersion = (): string => {
  const storedVersion = localStorage.getItem(APP_VERSION_KEY);
  return storedVersion || '';  // Si no existe, devolver cadena vacía
};

// Establecer la versión actual de la app en el `localStorage`
const setAppVersion = (version: string): void => {
  localStorage.setItem(APP_VERSION_KEY, version);
};

// Chequear si la versión ha cambiado y limpiar el cache si es necesario
const checkAndClearCache = (): void => {
  const storedVersion = getAppVersion();

  // Si la versión ha cambiado, limpiamos el cache y el localStorage
  if (storedVersion !== APP_VERSION) {
    console.log('La versión de la app ha cambiado, limpiando cache y localStorage...');
    localStorage.clear();  // Elimina todo el localStorage
    sessionStorage.clear();  // Si usas sessionStorage también puedes limpiarlo
    window.location.reload(); // Recargar la página para aplicar los cambios
    setAppVersion(APP_VERSION);  // Establecer la nueva versión
  }
};

// Llamar a la función de chequeo al inicio de la aplicación
checkAndClearCache();

// Cargar el progreso del usuario desde el `localStorage`
export const loadUserProgress = (): UserProgress => {
  try {
    const encodedData = localStorage.getItem(STORAGE_KEY);
    if (!encodedData) return { ...initialUserProgress };  // Si no hay datos, devolver el estado inicial

    return decodeData(encodedData) as UserProgress;
  } catch (error) {
    console.error('Error al cargar el progreso:', error);
    return { ...initialUserProgress };  // Si hay un error, devolver el estado inicial
  }
};

// Guardar el progreso del usuario en el `localStorage` (codificado)
export const saveUserProgress = (progress: UserProgress): void => {
  try {
    const encodedProgress = encodeData(progress);  // Codificar el progreso
    localStorage.setItem(STORAGE_KEY, encodedProgress);  // Guardar en localStorage
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
