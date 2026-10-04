import { BRAND } from "@/lib/design-tokens";
import * as THREE from "three";

/** 扭蛋飛到中央、被點了之後的開蛋動畫：下殼不動，只掀上蓋，裡面那張折起來的紙籤跳出來 */
export const OPEN_MS = 900;

/** 飛到中央的扭蛋往前傾的角度：看得到接縫那圈 */
export const TILT = 0.35;
/** 折起來的紙籤：寬、高、厚（以扭蛋半徑為單位），立起來後高度拉到紙面高 */
const PACK_W = 0.4;
const PACK_H = 0.55;
const PACK_D = 0.07;
/** 紙籤中心在扭蛋中心上方幾個半徑（螢幕上量） */
const RISE = 0.95;

/**
 * 紙籤跳出殼後停的位置與攤開後的大小。3D 的折紙與 DOM 的紙面都照這份擺，
 * 交棒那一格才對得上。單位都是 px，y 從舞台頂端往下量。
 */
export function slipLayout(width: number, height: number) {
  const size = Math.min(width, height) * 0.22;
  const paperH = Math.min(300, Math.max(200, size * 1.6));
  return {
    size,
    /** 折起來時的寬度：攤開就從這個寬度往左右長 */
    pack: PACK_W * size,
    top: height / 2 - RISE * size - paperH / 2,
    width: Math.min(544, width - 48),
    height: paperH,
    /** 3D 折紙立起來後的高度，以扭蛋半徑為單位 */
    len: paperH / size,
  };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, from: number, to: number) =>
  clamp01((t - from) / (to - from));
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const easeOutBack = (p: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};

/** 殼的 children 依序是上殼、下殼、接縫 */
function parts(ball: THREE.Group) {
  const [top, bottom] = ball.children as THREE.Mesh[];
  return { top, bottom };
}

const INK = new THREE.Color(BRAND.ink);
const SHELL_IN = 0.93;

/**
 * 給半邊殼加厚度：一層往內縮的內壁（只畫背面，從裡面看得到）＋切口那圈唇緣。
 * 沒有這兩層，打開的殼像一張紙。up：殼口朝下的上殼是 true
 */
function thicken(mesh: THREE.Mesh, up: boolean) {
  if (mesh.userData.thick) return;
  mesh.userData.thick = true;
  const color = (mesh.material as THREE.MeshStandardMaterial).color;
  const geo = mesh.geometry as THREE.SphereGeometry;
  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(
      SHELL_IN,
      48,
      24,
      0,
      Math.PI * 2,
      geo.parameters.thetaStart,
      geo.parameters.thetaLength,
    ),
    new THREE.MeshStandardMaterial({
      color: color.clone().lerp(INK, 0.12),
      roughness: 0.6,
      side: THREE.BackSide,
    }),
  );
  const lip = new THREE.Mesh(
    new THREE.RingGeometry(SHELL_IN, 1, 96),
    new THREE.MeshStandardMaterial({
      color: color.clone().lerp(INK, 0.04),
      roughness: 0.4,
      side: THREE.DoubleSide,
    }),
  );
  lip.rotation.x = up ? Math.PI / 2 : -Math.PI / 2;
  for (const m of [inner, lip]) {
    m.userData.ownMaterial = true;
    mesh.add(m);
  }
}

/** 兩半都加厚；殼一分開，關著時那圈墨色接縫就收掉，露出殼的切口 */
function openShell(ball: THREE.Group, apart: boolean) {
  const { top, bottom } = parts(ball);
  thicken(top, true);
  thicken(bottom, false);
  ball.children[2].visible = !apart;
}

/** 殼裡那張折起來的紙籤：窄長的一疊，正面看得到兩道折痕 */
function slip(ball: THREE.Group) {
  const found = ball.getObjectByName("slip") as THREE.Group | undefined;
  if (found) return found;
  const group = new THREE.Group();
  group.name = "slip";
  const paper = new THREE.Mesh(
    new THREE.BoxGeometry(PACK_W, PACK_H, PACK_D),
    new THREE.MeshStandardMaterial({ color: BRAND.paper, roughness: 0.9 }),
  );
  paper.userData.ownMaterial = true;
  group.add(paper);
  const crease = new THREE.MeshStandardMaterial({
    color: new THREE.Color(BRAND.paper).lerp(INK, 0.12),
    roughness: 0.9,
  });
  for (const x of [-PACK_W / 6, PACK_W / 6]) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, PACK_H, 0.002),
      x < 0 ? crease : crease.clone(),
    );
    line.position.set(x, 0, PACK_D / 2 + 0.001);
    line.userData.ownMaterial = true;
    group.add(line);
  }
  group.rotation.z = Math.PI / 2 + 0.25;
  group.position.y = -0.3;
  ball.add(group);
  return group;
}

/**
 * 紙籤從殼裡跳出來：往上彈、翻一圈、立正面向鏡頭、拉高到紙面的高度。
 * 停下來的那一格交給 DOM 的紙面往左右攤開。
 */
function jump(ball: THREE.Group, p: number, len: number) {
  const s = slip(ball);
  const e = easeOut(p);
  // 扭蛋往前傾 TILT，紙籤要轉回來抵掉，立起來才是正的
  s.position.y = -0.3 + e * (RISE / Math.cos(TILT) + 0.3);
  s.rotation.set(-TILT * e, e * Math.PI * 2, (Math.PI / 2 + 0.25) * (1 - e));
  s.scale.set(1, 1 + (len / PACK_H - 1) * easeInOut(seg(p, 0.3, 1)), 1);
}

/** 掀蓋：上蓋被裡面頂得喀喀跳兩下 → 繞後緣的鉸鍊往後掀開、彈一下 → 紙籤跳出來 */
function lid(ball: THREE.Group, t: number, len: number) {
  const { top } = parts(ball);
  slip(ball);

  const rattle = seg(t, 0, 300);
  const knock =
    Math.abs(Math.sin(rattle * Math.PI * 2)) * (rattle < 1 ? 0.06 : 0);

  // 鉸鍊在後緣 (0,0,-1)：繞 x 往後轉，鉸鍊點不動
  const theta = easeOutBack(seg(t, 300, 640)) * 1.85;
  top.rotation.x = -theta;
  top.position.set(0, Math.sin(theta) + knock, Math.cos(theta) - 1);
  openShell(ball, theta > 0.15);
  jump(ball, seg(t, 520, 900), len);
}

/** len：紙籤立起來後的高度，以扭蛋半徑為單位（slipLayout().len） */
export function playOpen(ball: THREE.Group, t: number, len: number) {
  lid(ball, t, len);
  // DOM 的紙面接手之後就藏起來；多留兩格，交棒那一瞬間不會兩個都沒有
  const s = ball.getObjectByName("slip");
  if (s) s.visible = t < OPEN_MS + 50;
}
