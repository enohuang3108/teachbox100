import type { Question } from "./types";

/** 出題提示與載入提醒共用；超長答案仍可使用。 */
export const ANSWER_LENGTH_LIMIT = 10;

export function answerLengthWarnings(questions: Question[]) {
  return questions.flatMap((question, index) => {
    const answers = question.type === "choice"
      ? (question.options ?? []).map((text, i) => ({ label: `選項${"ABCD"[i]}`, text }))
      : [{ label: "答案", text: question.answer }];
    return answers.flatMap(({ label, text }) => {
      const length = Array.from(text).length;
      return length > ANSWER_LENGTH_LIMIT
        ? [{ questionNumber: index + 1, label, text, length }]
        : [];
    });
  });
}
