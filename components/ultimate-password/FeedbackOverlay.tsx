"use client";

export type AnswerFeedback = {
  kind: "correct" | "wrong";
  title: string;
  detail: string;
  animated: boolean;
  duration: number;
};

/**
 * 答題回饋：一條斜貼的紙膠帶從左拉開，答對綠、答錯紅。
 * 答錯不搖 —— 答錯停得比答對久就夠了，不需要再用動作責備。
 */
export function FeedbackOverlay({ feedback }: { feedback: AnswerFeedback }) {
  const { kind, title, detail } = feedback;

  return (
    <div
      className="password-fb absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-3xl bg-paper/85"
      data-kind={kind}
      data-animated={feedback.animated || undefined}
      style={{ animationDuration: `${feedback.duration}ms` }}
    >
      <output
        aria-label={`${title}${title.endsWith("！") ? "" : "，"}${detail}`}
        className="password-tape flex w-full flex-col items-center gap-2 bg-(--fb) px-6 py-8 text-paper shadow-[0_8px_0_rgb(0_0_0/0.12)]"
      >
        <span className="flex items-center gap-4 text-[clamp(3rem,8vw,5.5rem)] font-black leading-tight">
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="size-[0.8em] overflow-visible"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
          >
            {kind === "correct" ? (
              <circle
                className="password-fb-stroke"
                cx="50"
                cy="50"
                r="38"
                pathLength={1}
                transform="rotate(-90 50 50)"
              />
            ) : (
              <>
                <path className="password-fb-stroke" d="M18 18 82 82" pathLength={1} />
                <path className="password-fb-stroke" d="M82 18 18 82" pathLength={1} />
              </>
            )}
          </svg>
          {title}
        </span>
        <span className="text-[clamp(1.5rem,4vw,2.75rem)] font-bold leading-snug">
          {detail}
        </span>
      </output>
    </div>
  );
}
