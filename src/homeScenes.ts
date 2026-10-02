export type HomeSceneTag = 'ALL_YEAR' | 'OCTOBER' | 'DECEMBER';

export interface HomeScene {
  id: string;
  name: string;
  description: string;
  file: string;
  /** CSS object position for the portrait art when a wide viewport crops vertically. */
  focalPosition: string;
  tags?: readonly HomeSceneTag[];
}

export const HOME_SCENES: HomeScene[] = [
  { id: 'road-at-dawn', name: 'Road at Dawn', description: 'A winding road crosses misty hills at first light.', file: 'road-at-dawn.webp', focalPosition: '50% 56%', tags: ['ALL_YEAR'] },
  { id: 'evening-inn', name: 'Evening Inn', description: 'A lantern-lit inn offers a place to pause beside the road.', file: 'evening-inn.webp', focalPosition: '58% 58%', tags: ['ALL_YEAR'] },
  { id: 'railway-stop', name: 'Railway Stop', description: 'A quiet country station waits beneath the evening sky.', file: 'railway-stop.webp', focalPosition: '58% 60%', tags: ['ALL_YEAR'] },
  { id: 'camp-beside-the-road', name: 'Camp Beside the Road', description: 'A small campfire glows beside a covered wagon.', file: 'camp-beside-the-road.webp', focalPosition: '42% 58%', tags: ['ALL_YEAR'] },
  { id: 'river-crossing', name: 'River Crossing', description: 'A lantern marks the landing beside a broad, calm river.', file: 'river-crossing.webp', focalPosition: '58% 58%', tags: ['ALL_YEAR'] },
  { id: 'town-at-dusk', name: 'Town at Dusk', description: 'Lamplight gathers along a quiet main street at sundown.', file: 'town-at-dusk.webp', focalPosition: '42% 58%', tags: ['ALL_YEAR'] },
];

export const HOME_SCENE_LAST_KEY = 'lgws.home-background.last.v1';
export const QA_HOME_SCENE_LAST_KEY = 'lgws.qa.home-background.last.v1';

export interface HomeSceneStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface HomeSceneRotation {
  readonly current: HomeScene;
  enterHome(): HomeScene;
  preview(id: string): HomeScene | undefined;
}

function sceneById(id: string | null): HomeScene | undefined {
  return HOME_SCENES.find((scene) => scene.id === id);
}

/** Picks once for a Home visit, avoiding the previous visit when another scene exists. */
export function chooseHomeScene(storage: HomeSceneStorage, random: () => number = Math.random, key = HOME_SCENE_LAST_KEY): HomeScene {
  let previousId: string | null = null;
  try { previousId = storage.getItem(key); } catch { /* Storage may be disabled. */ }
  const choices = HOME_SCENES.length > 1
    ? HOME_SCENES.filter((scene) => scene.id !== previousId)
    : HOME_SCENES;
  const value = random();
  const index = Number.isFinite(value) ? Math.max(0, Math.min(choices.length - 1, Math.floor(value * choices.length))) : 0;
  const selected = choices[index];
  try { storage.setItem(key, selected.id); } catch { /* Keep the in-memory selection for this visit. */ }
  return selected;
}

/** Keeps one choice stable through Home renders; only lifecycle entry rotates it. */
export function createHomeSceneRotation(storage: HomeSceneStorage, key = HOME_SCENE_LAST_KEY, random: () => number = Math.random, initialSceneId?: string): HomeSceneRotation {
  let current = sceneById(initialSceneId ?? null) ?? chooseHomeScene(storage, random, key);
  return {
    get current() { return current; },
    enterHome() { current = chooseHomeScene(storage, random, key); return current; },
    preview(id) { const scene = setHomeSceneForPreview(storage, id, key); if (scene) current = scene; return scene; },
  };
}

export function setHomeSceneForPreview(storage: HomeSceneStorage, id: string, key = QA_HOME_SCENE_LAST_KEY): HomeScene | undefined {
  const scene = sceneById(id);
  if (!scene) return undefined;
  try { storage.setItem(key, scene.id); } catch { /* QA still gets a valid scene for this render. */ }
  return scene;
}

export function homeSceneIndex(id: string): number {
  return Math.max(0, HOME_SCENES.findIndex((scene) => scene.id === id));
}
