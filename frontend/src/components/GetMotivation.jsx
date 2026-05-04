const GetMotivation = (priority) => {
  const messages = {
    high: [
      "Push hard—this matters 🚀",
      "You’re built for this challenge 💪"
    ],
    medium: [
      "Stay consistent, you're doing great 👍",
      "Progress is progress ✨"
    ],
    low: [
      "Take it easy, keep going 😊",
      "Small steps still count 🌱"
    ]
  };

  const pool = messages[priority] || messages.low;
  return pool[Math.floor(Math.random() * pool.length)];
};

export default GetMotivation;