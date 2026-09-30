import { describe, expect, it } from 'vitest';
import { getOrCreateHomeScene, HOME_SCENES, HOME_SCENE_SESSION_KEY, homeSceneIndex, setHomeSceneForSession, type SessionSceneStorage } from './homeScenes';

function storage(): SessionSceneStorage {
  const values = new Map<string, string>();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
}

describe('rotating home scenes', () => {
  it('offers five distinct illustration variants', () => {
    expect(HOME_SCENES).toHaveLength(5);
    expect(new Set(HOME_SCENES.map((scene) => scene.id)).size).toBe(5);
  });

  it('selects randomly once and keeps the scene stable for the session', () => {
    const session = storage();
    const first = getOrCreateHomeScene(session, () => 0.61);
    expect(first.id).toBe(HOME_SCENES[3].id);
    expect(session.getItem(HOME_SCENE_SESSION_KEY)).toBe(first.id);
    const random = () => { throw new Error('should not choose again in the same session'); };
    expect(getOrCreateHomeScene(session, random)).toEqual(first);
  });

  it('uses independent choices for independent browser sessions', () => {
    const firstSession = getOrCreateHomeScene(storage(), () => 0.01);
    const nextSession = getOrCreateHomeScene(storage(), () => 0.81);
    expect(firstSession.id).not.toBe(nextSession.id);
  });

  it('replaces an invalid stored scene with a valid random choice', () => {
    const session = storage();
    session.setItem(HOME_SCENE_SESSION_KEY, 'not-a-scene');
    expect(getOrCreateHomeScene(session, () => 0.99).id).toBe(HOME_SCENES[4].id);
  });

  it('allows QA to select a scene and cycle through the registry', () => {
    const session = storage();
    const chosen = setHomeSceneForSession(session, HOME_SCENES[2].id)!;
    expect(chosen.id).toBe(HOME_SCENES[2].id);
    expect(homeSceneIndex(chosen.id)).toBe(2);
    expect(setHomeSceneForSession(session, 'invalid')).toBeUndefined();
  });

  it('still selects a scene when session storage is unavailable', () => {
    const unavailable: SessionSceneStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(getOrCreateHomeScene(unavailable, () => 0.2)).toEqual(HOME_SCENES[1]);
  });
});
