import { create } from "zustand";
import { useScoreboardStore } from "./store";

/**
 * 連線搶答：老師的計分板當主機，學生用手機掃 QR 進來按鈴。
 *
 * 沒有自己的伺服器，所以走 trystero 的 WebRTC 房間 —— 配對訊息借用公開的
 * nostr relay，真正的搶答封包是裝置對裝置直連。同一間教室的 wifi 底下，
 * 延遲就是區網延遲；配對那一下仍需要對外網路。
 */

export interface Buzzer {
  /** trystero 的 peer id，只在這一次連線有效 */
  id: string;
  /** 學生裝置上固定不變的 id；重連要靠它認回同一格 */
  uid: string;
  name: string;
  // trystero 的 payload 必須是純 JSON，多這行才過得了它的型別
  [k: string]: string;
}

export interface BuzzStore {
  /** 四碼房間代號；null = 沒開房 */
  code: string | null;
  /** 開放搶答中；老師按「開始搶答」才放行，避免上一題的手殘按到下一題 */
  open: boolean;
  players: Buzzer[];
  /** 學生端：現在有沒有連到老師。斷線時手機上要看得出來 */
  connected: boolean;
  /** 按鈴順序，先到先排 */
  order: Buzzer[];
}

export const useBuzzStore = create<BuzzStore>(() => ({
  code: null,
  open: false,
  players: [],
  order: [],
  connected: false,
}));

const set = useBuzzStore.setState;
const get = useBuzzStore.getState;

// 去掉容易看錯的 0/O/1/I，老師要口述代號時才不會念錯
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () =>
  Array.from(
    { length: 4 },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
  ).join("");

/**
 * 房號記在 localStorage：老師不小心重整、或投影到一半換頁回來，
 * 黑板上寫的房號還是那一個，全班不用重掃。要換人上課再按「重新建立房間」。
 */
const CODE_KEY = "scoreboard-buzz-code";
const savedCode = () => {
  const c = localStorage.getItem(CODE_KEY);
  return c && /^[A-Z2-9]{4}$/.test(c) ? c : null;
};
const rememberCode = (code: string) => localStorage.setItem(CODE_KEY, code);

/**
 * 學生的身分 id。名字不能當身分：教室裡兩個小明、或兩個都沒填名字
 * （都變「同學」），用名字認人會把前一個人擠掉，他按鈴老師就看不到。
 *
 * 一台裝置一份（localStorage）：關掉分頁再重掃還是認回同一格，分數留得住。
 * 同一台裝置開兩個分頁的情形由 claimDevice() 擋掉，不會兩個分頁共用這個 id。
 */
const UID_KEY = "buzz-uid";
const myUid = () => {
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) localStorage.setItem(UID_KEY, (uid = crypto.randomUUID()));
  return uid;
};

/**
 * 一台裝置只能有一個分頁在搶答：兩個分頁共用同一個身分 id，同時連著會互相
 * 擠掉 peer id，被擠掉的那個按鈴老師端不會顯示。
 *
 * 用 Web Locks 擋：拿到鎖的分頁一直握著不放，分頁關掉或瀏覽器當掉時由瀏覽器
 * 自動釋放，不需要心跳，也不會留下解不開的狀態。拿不到就是別的分頁已經進去了。
 */
export function claimDevice(): Promise<boolean> {
  if (!navigator.locks) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    navigator.locks
      .request("buzz-device", { ifAvailable: true }, (lock) => {
        resolve(!!lock);
        // 拿到就握到分頁關掉為止；沒拿到就直接放掉，讓 request 收工
        return lock ? new Promise<never>(() => {}) : undefined;
      })
      // 鎖不到（權限、非安全來源）就不擋：寧可多一格，也別讓學生進不來
      .catch(() => resolve(true));
  });
}

const APP_ID = "teachbox100-scoreboard";
const roomId = (code: string) => `${APP_ID}-${code}`;

/** 房間 + 三個 action 的 sender，主機與學生共用同一份形狀 */
type Room = {
  leave: () => void;
  sendJoin: (name: string) => void;
  sendBuzz: () => void;
};

let room: Room | null = null;
let unbroadcast: (() => void) | null = null;
/** 學生端自己填的名字；連上老師的那一刻要拿它報到 */
let myName = "";
/** 自己的 peer id；學生端拿來算「我是第幾個按的」 */
let mySelfId = "";
export const getSelfId = () => mySelfId;

/**
 * 正常斷線（老師關連線、學生關分頁、手機息屏）在對方瀏覽器裡會讓 data channel
 * 收到 `RTCError: User-Initiated Abort, reason=Close called`，trystero 一律當成
 * peer error 用 console.error 印出來。功能上沒事，只是每斷一次就紅一行。
 * 這裡只濾掉這一種訊息，其他 trystero 的錯照印。
 */
let filtered = false;
function hushCloseNoise() {
  if (filtered) return;
  filtered = true;
  const original = console.error;
  console.error = (...args: unknown[]) =>
    /User-Initiated Abort|Close called/.test(args.map(String).join(" "))
      ? undefined
      : original(...args);
}

/**
 * 首次掃 QR 後才下載 signaling 模組，會把下載時間疊到 WebRTC 配對上。
 * 進學生頁時預載，真正加入時共用同一個 promise，不會多抓一次。
 */
let signalingModule: Promise<typeof import("trystero/nostr")> | null = null;
const loadSignaling = () =>
  (signalingModule ??= import("trystero/nostr"));
export const warmSignaling = () => void loadSignaling();

/** 立即送一次；部分瀏覽器的 data channel 剛打開時再補一次，避免漏掉狀態。 */
export const STATE_RETRY_MS = 150;
export function synchronizeNewPeer(
  send: () => void,
  schedule: (task: () => void, delay: number) => unknown = (task, delay) =>
    window.setTimeout(task, delay),
) {
  send();
  schedule(send, STATE_RETRY_MS);
}

// trystero 只在瀏覽器跑得動（WebRTC），動態載入避免進到 SSR 與首屏 bundle
async function connect(code: string, host: boolean) {
  hushCloseNoise();
  const { joinRoom, selfId } = await loadSignaling();
  mySelfId = selfId;
  const r = joinRoom({ appId: APP_ID }, roomId(code));

  const state = r.makeAction<{ open: boolean; order: Buzzer[] }>("state", {
    // 學生端才聽：老師把開放狀態與按鈴順序整包推過來
    onMessage: host ? undefined : (s) => set({ open: s.open, order: s.order }),
  });

  const join = r.makeAction<JoinPayload>("join", {
    onMessage: host
      ? (payload, { peerId }) =>
          set((s) => ({ players: addPlayer(s.players, peerId, payload) }))
      : undefined,
  });

  const buzz = r.makeAction<null>("buzz", {
    onMessage: host
      ? (_, { peerId }) => {
          const next = nextOrder(get(), peerId);
          if (!next) return;
          set({ order: next });
          onBuzzHandlers.forEach((fn) => fn(next.length));
        }
      : undefined,
  });

  if (host) {
    const broadcast = () => {
      const { open, order } = get();
      state.send({ open, order });
    };
    // state 變動就同步給全班；新 peer 先立刻拿當前狀態，再短暫補送一次。
    unbroadcast = useBuzzStore.subscribe(broadcast);
    r.onPeerJoin = () => synchronizeNewPeer(broadcast);
    // 刻意不處理 onPeerLeave：手機息屏、切 App 都會斷線，格子不能因此消失。
    // 學生重連時用名字認回同一格（見 addPlayer），分數才留得住。
  } else {
    // 剛 joinRoom 的當下還沒有任何 peer，這時候送出去的報到是丟進虛空。
    // 等老師那端真的連上再送一次（斷線重連也走這條）。
    // 斷線（息屏、切 App、換網路）之後 trystero 會自己重新配對，
    // 這裡只負責在重新連上時補送一次報到，並把狀態反映到畫面上。
    const sync = () => set({ connected: Object.keys(r.getPeers()).length > 0 });
    r.onPeerJoin = () => {
      sync();
      if (myName) join.send({ uid: myUid(), name: myName });
    };
    r.onPeerLeave = sync;
  }

  room = {
    leave: () => void r.leave(),
    sendJoin: (name) => {
      myName = name;
      // 老師若已經在線就立刻到，還沒連上就等 onPeerJoin 補送
      if (Object.keys(r.getPeers()).length)
        void join.send({ uid: myUid(), name });
    },
    sendBuzz: () => void buzz.send(null),
  };
  return room;
}

/** 報到訊息：uid 認人，name 只是顯示用 */
export interface JoinPayload {
  uid: string;
  name: string;
  [k: string]: string;
}

/**
 * 報到：同一個 uid 視為同一個人重新連線（息屏、切 App、重整），只更新 peer id
 * 與名字，保住他在名單裡的順位——順位就是計分板上的格子，換位置分數會跟著跑掉。
 * 不用名字認人：同名的兩個學生會互相擠掉，被擠掉的那個按鈴老師端不會顯示。
 */
export function addPlayer(
  players: Buzzer[],
  peerId: string,
  raw: JoinPayload,
): Buzzer[] {
  const name = String(raw.name).trim().slice(0, 12) || "同學";
  const uid = String(raw.uid);
  return players.some((p) => p.uid === uid)
    ? players.map((p) => (p.uid === uid ? { ...p, id: peerId, name } : p))
    : [...players, { id: peerId, uid, name }];
}

/**
 * 收到按鈴時算出新的順序；不該計入就回 null。
 * 沒開放搶答、沒報到過、同一個人按第二次，這三種都不計。
 */
export function nextOrder(
  { open, order, players }: Pick<BuzzStore, "open" | "order" | "players">,
  peerId: string,
): Buzzer[] | null {
  const who = players.find((p) => p.id === peerId);
  if (!open || !who || order.some((b) => b.id === peerId)) return null;
  return [...order, who];
}

/** 主機端每次有人按鈴時的回呼（拿來播音效），回傳值是這是第幾個按的 */
const onBuzzHandlers = new Set<(rank: number) => void>();
export const onBuzz = (fn: (rank: number) => void) => {
  onBuzzHandlers.add(fn);
  return () => {
    onBuzzHandlers.delete(fn);
  };
};

/**
 * 連線模式下，計分板的格子直接等於連進來的人：加入就多一格，名字就是格名。
 * setNames 是照順位對齊的，順位不動分數就不會跑掉。
 */
let unsync: (() => void) | null = null;
const syncTeams = () =>
  useBuzzStore.subscribe((s, prev) => {
    if (s.players === prev.players || s.players.length === 0) return;
    useScoreboardStore.getState().setNames(s.players.map((p) => p.name));
  });

/** 老師端：開房。回傳四碼代號 */
export async function openRoom() {
  if (get().code) return get().code!;
  const code = savedCode() ?? makeCode();
  rememberCode(code);
  // QR 出現前老師端已經加入 signaling room；學生掃得很快也不會先連到空房。
  await connect(code, true);
  set({ code, open: false, players: [], order: [], connected: true });
  // 開房就清空格子：接下來幾組由誰連進來決定
  useScoreboardStore.setState({ teams: [] });
  unsync = syncTeams();
  return code;
}

/** 換一個房號：舊房號作廢，還連著的學生要重掃。用在換班上課 */
export async function renewCode() {
  const wasOpen = get().code !== null;
  closeRoom();
  rememberCode(makeCode());
  if (wasOpen) await openRoom();
}

export function closeRoom() {
  unsync?.();
  unbroadcast?.();
  unsync = unbroadcast = null;
  room?.leave();
  room = null;
  set({ code: null, open: false, players: [], order: [], connected: false });
}

/** 開放／關閉搶答。開放時順便清掉上一題的順序 */
export const setOpen = (open: boolean) =>
  set(open ? { open, order: [] } : { open });

export const clearOrder = () => set({ order: [] });

/** 學生端：加入房間並報到 */
export async function joinAsPlayer(code: string, name: string) {
  const r = room ?? (await connect(code, false));
  set({ code });
  r.sendJoin(name);
}

export const sendBuzz = () => room?.sendBuzz();

/** 學生端用：我按到第幾個？沒按是 0 */
export const myRank = (order: Buzzer[]) =>
  order.findIndex((b) => b.id === mySelfId) + 1;
