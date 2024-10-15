// thoughtRecordInstance.tsx
const cbtThoughtRecordInstance = {
  settings: [
    {
      text: "Situation",
      type: "none",
      required: true,
      description: "What actually happened? Where? When? How? Who was there?",
    },
    {
      text: "Automatic Thought(s)",
      type: "none",
      required: true,
      description: "What thoughts went through your mind? How deeply do you believe these thoughts on a scale of 1-10?",
    },
    {
      text: "Emotions & Mood",
      type: "slider",
      required: true,
      description:
        "What emotion(s) were you feeling at the time? How intensely were you feeling these emotions on a scale of 1-10?",
      options: [{ value: "Happy" }, { value: "Sad" }, { value: "Angry" }],
    },
    {
      text: "Evidence to Support This Thought",
      type: "none",
      required: true,
      description: "What has happened to you to lead you to believe this thought is true?",
    },
    {
      text: "Evidence Against the Thought Being True",
      type: "none",
      required: true,
      description: "What has happened that supports the thought not being true?",
    },
    {
      text: "Alternative Thought and Current Mood",
      type: "slider",
      required: true,
      description: "What is another way to think of this situation? Rate the intensity of your mood now from 1-10.",
      options: [{ value: "Happy" }, { value: "Sad" }, { value: "Angry" }],
    },
  ],
}

export default cbtThoughtRecordInstance
