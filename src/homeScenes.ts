export interface HomeScene {
  id: string;
  name: string;
  description: string;
  file: string;
}

export const HOME_SCENES: HomeScene[] = [
  { id: 'moonlit-road', name: 'Moonlit Road', description: 'A lantern-lit lane leading toward a distant chapel.', file: 'moonlit-road.svg' },
  { id: 'rainy-crossroads', name: 'Rainy Crossroads', description: 'A quiet crossroads under rain-dark hills.', file: 'rainy-crossroads.svg' },
  { id: 'hillside-dawn', name: 'Hillside at Dawn', description: 'The first light touches a winding hillside path.', file: 'hillside-dawn.svg' },
  { id: 'marsh-lights', name: 'Marsh Lights', description: 'Small warm lights glimmer beyond a misty marsh.', file: 'marsh-lights.svg' },
  { id: 'mountain-pass', name: 'Mountain Pass', description: 'A narrow path climbs toward a far-off waystation.', file: 'mountain-pass.svg' },
];

export const HOME_SCENE_SESSION_KEY = 'lgws.home-scene.v1';

export interface SessionSceneStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function sceneById(id: string | null): HomeScene | undefined {
  return HOME_SCENES.find((scene) => scene.id === id);
}

export function getOrCreateHomeScene(storage: SessionSceneStorage, random: () => number = Math.random): HomeScene {
  try {
    const saved = sceneById(storage.getItem(HOME_SCENE_SESSION_KEY));
    if (saved) return saved;
  } catch { /* Private browsing can disable storage; use an in-memory choice. */ }
  const value = random();
  const index = Number.isFinite(value) ? Math.max(0, Math.min(HOME_SCENES.length - 1, Math.floor(value * HOME_SCENES.length))) : 0;
  const selected = HOME_SCENES[index];
  try { storage.setItem(HOME_SCENE_SESSION_KEY, selected.id); } catch { /* The current page still gets a scene. */ }
  return selected;
}

export function setHomeSceneForSession(storage: SessionSceneStorage, id: string): HomeScene | undefined {
  const scene = sceneById(id);
  if (!scene) return undefined;
  try { storage.setItem(HOME_SCENE_SESSION_KEY, scene.id); } catch { /* QA still gets a valid scene for this render. */ }
  return scene;
}

export function homeSceneIndex(id: string): number {
  return Math.max(0, HOME_SCENES.findIndex((scene) => scene.id === id));
}
