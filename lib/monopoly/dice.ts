import { Quaternion, Vector3 } from "three";

// glTF / Three.js coordinates (Blender exports Z-up as Y-up).
export const DIE_NORMALS = [
  new Vector3(0, 1, 0), new Vector3(1, 0, 0), new Vector3(0, 0, -1),
  new Vector3(0, 0, 1), new Vector3(-1, 0, 0), new Vector3(0, -1, 0),
];
export function readTopFace(rotation: Quaternion): number {
  return DIE_NORMALS.reduce((best, normal, index) =>
    normal.clone().applyQuaternion(rotation).y > DIE_NORMALS[best].clone().applyQuaternion(rotation).y ? index : best, 0) + 1;
}

/** Orient the numbered mesh before launch; the baked cube trajectory stays unchanged. */
export function orientDie(value: number, landing: Quaternion): Quaternion {
  if (!Number.isInteger(value) || value < 1 || value > 6) throw new RangeError("Invalid die value");
  return new Quaternion().setFromUnitVectors(DIE_NORMALS[value - 1], DIE_NORMALS[readTopFace(landing) - 1]);
}

/** Sample a baked rigid-body pose, clamping browser frame times to the clip. */
export function sampleDie(track: number[][], frame: number) {
  const time = Math.max(0, Math.min(frame, track.length - 1));
  const index = Math.floor(time);
  const a = track[index], b = track[Math.min(index + 1, track.length - 1)];
  return {
    position: new Vector3().fromArray(a).lerp(new Vector3().fromArray(b), time - index),
    rotation: new Quaternion().fromArray(a, 3).slerp(new Quaternion().fromArray(b, 3), time - index),
  };
}
