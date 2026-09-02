import { describe, expect, it } from "vitest";
import {
  installBackNavigationFix,
  type BackNavigationHost,
} from "./back-navigation";

type NavigateHandler = (e: {
  navigationType: string;
  destination: { key?: string; sameDocument?: boolean };
}) => void;

const createHost = () => {
  const handlers = new Set<NavigateHandler>();
  const attributes = new Set<string>();

  // scrollRestoration 存在「當下這個 history entry」上，不是整個 document 一份。
  // 假的 host 要照這個規則跑，才擋得住「等 traverse 才設 manual」那種寫法——
  // 那樣設到的是正要離開的那一頁，目的地還是 auto。
  const restorations = new Map<string, ScrollRestoration>([["home", "auto"]]);
  let current = "home";

  const host: BackNavigationHost & {
    navigation: {
      currentEntry: { key?: string } | null;
      addEventListener: (t: "navigate", fn: NavigateHandler) => void;
      removeEventListener: (t: "navigate", fn: NavigateHandler) => void;
    } | null;
    scrollY: number;
  } = {
    navigation: {
      currentEntry: { key: "home" },
      addEventListener: (_t, fn) => {
        handlers.add(fn);
      },
      removeEventListener: (_t, fn) => {
        handlers.delete(fn);
      },
    },
    history: {
      get scrollRestoration() {
        return restorations.get(current) ?? "auto";
      },
      set scrollRestoration(value: ScrollRestoration) {
        restorations.set(current, value);
      },
    },
    scrollY: 0,
    root: {
      toggleAttribute: (name: string, force: boolean) => {
        if (force) attributes.add(name);
        else attributes.delete(name);
        return force;
      },
    },
  };

  return {
    host,
    listenerCount: () => handlers.size,
    hasAttribute: (name: string) => attributes.has(name),
    // 先發事件、再 commit，跟瀏覽器一樣：navigate 的 listener 跑完之後才換 entry
    navigate: (
      navigationType: string,
      destinationKey?: string,
      sameDocument = true,
    ) => {
      for (const fn of handlers) {
        fn({
          navigationType,
          destination: { key: destinationKey, sameDocument },
        });
      }
      if (!destinationKey || !sameDocument) return;
      if (navigationType === "push") {
        // 新 entry 繼承當下的 scrollRestoration
        restorations.set(destinationKey, restorations.get(current) ?? "auto");
      }
      if (navigationType !== "replace") {
        current = destinationKey;
        host.navigation!.currentEntry = { key: destinationKey };
      }
    },
  };
};

describe("installBackNavigationFix", () => {
  it("沒有 Navigation API 就不啟用，也不動 scrollRestoration", () => {
    const { host } = createHost();
    host.navigation = null;

    expect(installBackNavigationFix(host)).toBeNull();
    expect(host.history.scrollRestoration).toBe("auto");
  });

  it("裝上去就接管 scrollRestoration，dispose 再還原", () => {
    const { host, listenerCount } = createHost();
    // 目的地 entry 的 scrollRestoration 是各自一份的，等 traverse 才設就來不及
    const controller = installBackNavigationFix(host);
    expect(host.history.scrollRestoration).toBe("manual");
    expect(listenerCount()).toBe(1);

    controller?.dispose();
    expect(host.history.scrollRestoration).toBe("auto");
    expect(listenerCount()).toBe(0);
  });

  it("Link 點擊（push）沒有要還原的位置", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    navigate("push", "equivalent");

    expect(controller?.takePendingScroll()).toBeNull();
  });

  it("回上一頁時還原離開該頁時的捲動位置", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    // 首頁捲到 712 之後點進內頁
    host.scrollY = 712;
    navigate("push", "equivalent");
    host.navigation!.currentEntry = { key: "equivalent" };

    // 內頁捲到 500 之後按上一頁
    host.scrollY = 500;
    navigate("traverse", "home");

    expect(controller?.takePendingScroll()).toBe(712);
    // 取過就清掉，pathname 再變不會誤捲
    expect(controller?.takePendingScroll()).toBeNull();
  });

  it("下一頁（forward）同樣會還原到當時的位置", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    host.scrollY = 100;
    navigate("push", "equivalent");
    host.navigation!.currentEntry = { key: "equivalent" };
    host.scrollY = 500;
    navigate("traverse", "home");
    controller?.takePendingScroll();

    // 回到首頁後再按下一頁，內頁要回到 500
    host.navigation!.currentEntry = { key: "home" };
    navigate("traverse", "equivalent");

    expect(controller?.takePendingScroll()).toBe(500);
  });

  it("沒記錄過的目的地捲到最上面", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    host.scrollY = 300;
    navigate("traverse", "never-visited");

    expect(controller?.takePendingScroll()).toBe(0);
  });

  it("跨文件的上一頁交還給瀏覽器原生還原", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    host.scrollY = 712;
    navigate("push", "equivalent");
    host.navigation!.currentEntry = { key: "equivalent" };
    navigate("traverse", "home", false);

    expect(controller?.takePendingScroll()).toBeNull();
  });
  it("Link 取代（replace）也沒有要還原的位置", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    host.scrollY = 300;
    navigate("replace", "home");

    expect(controller?.takePendingScroll()).toBeNull();
  });

  it("目的地沒有 entry key 時捲到最上面", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    host.scrollY = 300;
    navigate("traverse", undefined);

    expect(controller?.takePendingScroll()).toBe(0);
  });

  it("沒有 currentEntry 也不會爆，只是記不到位置", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    host.navigation!.currentEntry = null;
    host.scrollY = 712;
    navigate("push", "equivalent");
    navigate("traverse", "home");

    expect(controller?.takePendingScroll()).toBe(0);
  });

  it("同一頁的紀錄用最後一次離開時的位置", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    // 首頁捲到 200 進內頁 → 上一頁回來 → 再捲到 650 進內頁
    host.scrollY = 200;
    navigate("push", "equivalent");
    host.navigation!.currentEntry = { key: "equivalent" };
    navigate("traverse", "home");
    expect(controller?.takePendingScroll()).toBe(200);

    host.navigation!.currentEntry = { key: "home" };
    host.scrollY = 650;
    navigate("push", "equivalent");
    host.navigation!.currentEntry = { key: "equivalent" };
    navigate("traverse", "home");

    expect(controller?.takePendingScroll()).toBe(650);
  });

  it("多層歷史各自記各自的位置", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    // 首頁(700) → 分類頁(300) → 教材頁
    host.scrollY = 700;
    navigate("push", "coin");
    host.navigation!.currentEntry = { key: "coin" };
    host.scrollY = 300;
    navigate("push", "equivalent");
    host.navigation!.currentEntry = { key: "equivalent" };

    // 連按兩次上一頁
    navigate("traverse", "coin");
    expect(controller?.takePendingScroll()).toBe(300);

    host.navigation!.currentEntry = { key: "coin" };
    navigate("traverse", "home");
    expect(controller?.takePendingScroll()).toBe(700);
  });

  it("dispose 之後的導覽不再產生要還原的位置", () => {
    const { host, navigate } = createHost();
    const controller = installBackNavigationFix(host);

    host.scrollY = 712;
    navigate("push", "equivalent");
    host.navigation!.currentEntry = { key: "equivalent" };
    controller?.dispose();
    // dispose 只還原得了「當下站的那一頁」，這是 per-entry 的必然
    expect(host.history.scrollRestoration).toBe("auto");

    navigate("traverse", "home");
    expect(controller?.takePendingScroll()).toBeNull();
  });

  it("原本就是 manual 的話，dispose 要還原成 manual", () => {
    const { host } = createHost();
    host.history.scrollRestoration = "manual";
    const controller = installBackNavigationFix(host);

    controller?.dispose();
    expect(host.history.scrollRestoration).toBe("manual");
  });
  it("上一頁時掛 data-restored，讓卡片不重播進場動畫", () => {
    const { host, navigate, hasAttribute } = createHost();
    const controller = installBackNavigationFix(host);

    navigate("push", "equivalent");
    expect(hasAttribute("data-restored")).toBe(false);

    navigate("traverse", "home");
    expect(hasAttribute("data-restored")).toBe(true);

    // Next 在 traverse 之後自己會補一次 replace，不能被它清掉
    navigate("replace", "home");
    expect(hasAttribute("data-restored")).toBe(true);

    // 下一次 Link 點擊才放行進場動畫
    navigate("push", "equivalent");
    expect(hasAttribute("data-restored")).toBe(false);

    navigate("traverse", "home");
    controller?.dispose();
    expect(hasAttribute("data-restored")).toBe(false);
  });
  it("scrollRestoration 要跟著走到目的地那一頁（每個 entry 各自一份）", () => {
    const { host, navigate } = createHost();
    installBackNavigationFix(host);

    // push 出來的新 entry 繼承 manual
    navigate("push", "equivalent");
    expect(host.history.scrollRestoration).toBe("manual");

    // 回上一頁之後，站的是首頁那個 entry——它也必須是 manual，
    // 否則 Chrome 會用 auto 把還沒換掉的舊畫面提早捲走
    navigate("traverse", "home");
    expect(host.history.scrollRestoration).toBe("manual");

    navigate("traverse", "equivalent");
    expect(host.history.scrollRestoration).toBe("manual");
  });
});
