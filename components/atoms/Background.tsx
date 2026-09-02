/**
 * 全站底層：暖白紙 + 淡格線。
 * fixed 而非 absolute — 長頁面捲到下半部時背景才不會斷掉。
 */
export function Background() {
  return (
    <div aria-hidden className="fixed inset-0 -z-20 bg-paper">
      <div className="absolute inset-0 bg-[size:32px_32px] bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)]" />
    </div>
  );
}
