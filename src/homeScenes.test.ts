import { describe, expect, it } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { chooseHomeScene, createHomeSceneRotation, HOME_SCENE_LAST_KEY, HOME_SCENES, homeSceneIndex, QA_HOME_SCENE_LAST_KEY, type HomeSceneStorage } from './homeScenes';

function storage(): HomeSceneStorage {
  const values = new Map<string, string>();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
}

describe('rotating Home Screen backgrounds', () => {
  it('registers the six supplied all-year WebP scenes with stable IDs and useful crop positions', () => {
    expect(HOME_SCENES.map(({ id }) => id)).toEqual([
      'road-at-dawn', 'evening-inn', 'railway-stop', 'camp-beside-the-road', 'river-crossing', 'town-at-dusk',
    ]);
    expect(new Set(HOME_SCENES.map(({ file }) => file)).size).toBe(6);
    expect(HOME_SCENES.every(({ file, focalPosition, tags }) => file.endsWith('.webp') && focalPosition && tags?.includes('ALL_YEAR'))).toBe(true);
    for (const { file } of HOME_SCENES) {
      const assetPath = resolve('public/home-scenes', file);
      expect(existsSync(assetPath), file).toBe(true);
      expect(statSync(assetPath).size, file).toBeLessThan(120_000);
    }
  });

  it('chooses a valid background for a fresh visit and persists only its last ID', () => {
    const device = storage();
    const selected = chooseHomeScene(device, () => 0.99);
    expect(HOME_SCENES).toContainEqual(selected);
    expect(device.getItem(HOME_SCENE_LAST_KEY)).toBe(selected.id);
  });

  it('avoids the previous background on the next Home visit and then updates history', () => {
    const device = storage();
    device.setItem(HOME_SCENE_LAST_KEY, HOME_SCENES[2].id);
    const next = chooseHomeScene(device, () => 0);
    expect(next.id).toBe(HOME_SCENES[0].id);
    expect(next.id).not.toBe(HOME_SCENES[2].id);
    const following = chooseHomeScene(device, () => 0.99);
    expect(following.id).not.toBe(next.id);
    expect(device.getItem(HOME_SCENE_LAST_KEY)).toBe(following.id);
  });

  it('keeps the chosen scene stable through renders and rotates only on a new Home visit', () => {
    const device = storage();
    let draws = 0;
    const rotation = createHomeSceneRotation(device, HOME_SCENE_LAST_KEY, () => { draws += 1; return draws === 1 ? 0 : 0.99; });
    const initial = rotation.current;
    expect([rotation.current, rotation.current, rotation.current]).toEqual([initial, initial, initial]);
    expect(draws).toBe(1);
    const next = rotation.enterHome();
    expect(next.id).not.toBe(initial.id);
    expect(rotation.current).toEqual(next);
    expect(draws).toBe(2);
  });

  it('handles missing, legacy, and unknown background history without failing', () => {
    const device = storage();
    device.setItem('lgws.home-scene.v1', 'moonlit-road');
    expect(chooseHomeScene(device, () => 0.4).id).toBe(HOME_SCENES[2].id);
    device.setItem(HOME_SCENE_LAST_KEY, 'removed-background');
    expect(chooseHomeScene(device, () => 0.8).id).toBe(HOME_SCENES[4].id);
  });

  it('keeps previews and QA rotation separate from the player background history', () => {
    const device = storage();
    const qaRotation = createHomeSceneRotation(device, QA_HOME_SCENE_LAST_KEY, () => 0);
    const preview = qaRotation.preview(HOME_SCENES[4].id)!;
    expect(preview.id).toBe(HOME_SCENES[4].id);
    expect(device.getItem(QA_HOME_SCENE_LAST_KEY)).toBe(preview.id);
    expect(device.getItem(HOME_SCENE_LAST_KEY)).toBeNull();
    expect(homeSceneIndex(preview.id)).toBe(4);
    expect(qaRotation.preview('invalid')).toBeUndefined();
  });

  it('still chooses an in-memory scene when local storage is unavailable', () => {
    const unavailable: HomeSceneStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(chooseHomeScene(unavailable, () => 0.2)).toEqual(HOME_SCENES[1]);
  });
});
