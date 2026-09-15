export type BoxDrawPhase = "ready" | "selected" | "revealed" | "empty";

/** The public state boundary for selecting, opening, returning, and keeping a ball. */
export class BoxDraw {
  remainingIds: number[];
  selectedId: number | null = null;
  phase: BoxDrawPhase;

  constructor(count: number) {
    this.remainingIds = Array.from({ length: count }, (_, id) => id);
    this.phase = count ? "ready" : "empty";
  }

  select(id: number) {
    if (this.phase !== "ready" || !this.remainingIds.includes(id)) return false;
    this.remainingIds = this.remainingIds.filter((remainingId) => remainingId !== id);
    this.selectedId = id;
    this.phase = "selected";
    return true;
  }

  cancel() {
    if (this.phase !== "selected" || this.selectedId === null) return null;
    return this.putSelectedBack();
  }

  open() {
    if (this.phase !== "selected" || this.selectedId === null) return null;
    this.phase = "revealed";
    return this.selectedId;
  }

  confirm() {
    if (this.phase !== "revealed" || this.selectedId === null) return null;
    const id = this.selectedId;
    this.selectedId = null;
    this.phase = this.remainingIds.length ? "ready" : "empty";
    return id;
  }

  restore(id: number) {
    if (!this.remainingIds.includes(id)) {
      this.remainingIds = [...this.remainingIds, id].sort((a, b) => a - b);
    }
    if (this.selectedId === id) this.selectedId = null;
    this.phase = "ready";
  }

  private putSelectedBack() {
    const id = this.selectedId!;
    this.restore(id);
    return id;
  }
}
