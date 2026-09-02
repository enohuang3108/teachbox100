// 上一頁／下一頁（traverse）在 Chrome 會閃一下：原生的捲動還原比 React 換頁早 ~30ms，
// 舊頁面會先被拉到目標頁的捲動位置，next-view-transitions 接著把這張「錯位的舊畫面」
// 截圖下來跟新頁交叉淡出，看起來像剛離開的內頁又跳出來一次。
// Next App Router 不接管 scrollRestoration，所以這裡自己接：自己記每個 history entry
// 的位置，等新頁面 commit 之後再交給呼叫端還原，截圖到的舊畫面就不會跳。
//
// 靠 navigate 事件辨識：它比 popstate 與 commit 都早，帶得到 navigationType 與目的地。

type NavigateEventLike = {
  navigationType: string;
  destination: { key?: string; sameDocument?: boolean };
};

type NavigationApi = {
  currentEntry?: { key?: string } | null;
  addEventListener: (t: "navigate", fn: (e: NavigateEventLike) => void) => void;
  removeEventListener: (
    t: "navigate",
    fn: (e: NavigateEventLike) => void,
  ) => void;
};

// 只寫這裡真的會用到的部分，測試才好餵假的進來
export type BackNavigationHost = {
  navigation?: NavigationApi | null;
  history: { scrollRestoration: ScrollRestoration };
  scrollY: number;
  /** <html>，用來掛 data-restored 給 CSS 判斷 */
  root: { toggleAttribute: (name: string, force: boolean) => boolean };
};

export type BackNavigationController = {
  // 這趟 traverse 要還原的捲動位置；取過就清掉，push/replace 一律是 null
  takePendingScroll: () => number | null;
  dispose: () => void;
};

export const installBackNavigationFix = (
  host: BackNavigationHost,
): BackNavigationController | null => {
  const nav = host.navigation;
  // 沒有 Navigation API 就沒有這個時序問題（Firefox），整段不啟用
  if (!nav) return null;

  const scrollPositions = new Map<string, number>();
  const originalRestoration = host.history.scrollRestoration;
  let pendingScroll: number | null = null;

  // scrollRestoration 是「每個 history entry 各自一份」的，設的是當下這一頁。
  // 所以不能等 traverse 發生時才設——那時候設到的是正要離開的那一頁，目的地
  // 還是 auto，Chrome 照樣會提早把舊畫面捲走。裝好就設，之後 push 出來的新
  // entry 會繼承這個值。
  //
  // 代價：從站外按上一頁回來（跨文件、且沒進 bfcache）時瀏覽器不會還原捲動，
  // 而我們的紀錄也隨著 document 一起沒了，會停在最上面。要補的話得把位置寫進
  // sessionStorage，用 navigation.activation 判斷是不是 traverse 進來的。
  host.history.scrollRestoration = "manual";

  const onNavigate = (e: NavigateEventLike) => {
    // navigate 比 commit 早，currentEntry 還是「正要離開」的那一頁
    const from = nav.currentEntry?.key;
    if (from) scrollPositions.set(from, host.scrollY);

    // 上一頁／下一頁不重播進場動畫：卡片本來就已經在畫面上，回來時從眼前一張張
    // 淡入會像壞掉。這個事件比新頁面掛載早，旗標設好了 CSS 才來得及套用。
    // 只有 push 才把旗標拿掉：traverse 之後 Next 自己會補一次 replace，
    // 拿它當清除時機會在卡片掛載前就把旗標清掉，等於沒設。
    const traverse = e.navigationType === "traverse";
    if (traverse || e.navigationType === "push") {
      host.root.toggleAttribute("data-restored", traverse);
    }

    // 跨文件的 traverse 沒什麼好還原的：紀錄跟 document 一起沒了
    if (!traverse || !e.destination.sameDocument) return;

    const to = e.destination.key;
    pendingScroll = (to && scrollPositions.get(to)) || 0;
  };

  nav.addEventListener("navigate", onNavigate);

  return {
    takePendingScroll: () => {
      const value = pendingScroll;
      pendingScroll = null;
      return value;
    },
    dispose: () => {
      nav.removeEventListener("navigate", onNavigate);
      host.history.scrollRestoration = originalRestoration;
      host.root.toggleAttribute("data-restored", false);
    },
  };
};
