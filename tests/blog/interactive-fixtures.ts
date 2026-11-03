/** Poll, quiz and survey blocks shared by the widget tests. */
export const options = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];
export const poll = { id: "poll-1", type: "Poll", props: { question: "Ship it?", options } };
export const quiz = { id: "quiz-1", type: "Quiz", props: { question: "Who approves?", options, answer: "yes", explanation: "A person approves the first run." } };
export const survey = {
  id: "survey-1",
  type: "Survey",
  props: {
    title: "Tell us",
    questions: [
      { id: "role", prompt: "Role?", kind: "single", required: true, options: [{ id: "eng", label: "Engineering" }, { id: "ops", label: "Ops" }] },
      { id: "topics", prompt: "Topics?", kind: "multi", options: [{ id: "a", label: "A" }, { id: "b", label: "B" }] },
      { id: "wish", prompt: "Anything else?", kind: "text" },
    ],
  },
};
