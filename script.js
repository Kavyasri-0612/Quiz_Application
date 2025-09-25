let questions = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 15;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const resultBox = document.getElementById("result-box");
const scoreText = document.getElementById("score-text");
const quizBox = document.getElementById("quiz-box");
const startBox = document.getElementById("start-box");
const progressEl = document.getElementById("progress");
const timerEl = document.getElementById("timer");


async function fetchQuestions(categoryId) {
  const res = await fetch(
    `https://opentdb.com/api.php?amount=5&category=${categoryId}&type=multiple`
  );
  const data = await res.json();
  questions = data.results.map((q) => {
    const options = [...q.incorrect_answers];
    const answerIndex = Math.floor(Math.random() * (options.length + 1));
    options.splice(answerIndex, 0, q.correct_answer);
    return {
      question: decodeHTML(q.question),
      options: options.map((opt) => decodeHTML(opt)),
      answer: answerIndex,
    };
  });
}


function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

async function startQuiz(categoryId) {
  startBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  currentQuestion = 0;
  score = 0;
  questionEl.textContent = "Loading questions...";
  optionsEl.innerHTML = "";
  nextBtn.style.display = "none";

  await fetchQuestions(categoryId);
  loadQuestion();
}

function loadQuestion() {
  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  progressEl.textContent = `Question ${currentQuestion + 1} of ${
    questions.length
  }`;
  resetTimer();

  q.options.forEach((opt, i) => {
    const li = document.createElement("li");
    li.textContent = opt;
    li.onclick = () => checkAnswer(li, i);
    optionsEl.appendChild(li);
  });

  nextBtn.style.display = "none";
  startTimer();
}

function checkAnswer(selectedLi, index) {
  clearInterval(timer);
  const correctIndex = questions[currentQuestion].answer;
  const allOptions = document.querySelectorAll(".options-list li");

  if (index === correctIndex) {
    selectedLi.classList.add("correct");
    score++;
  } else {
    selectedLi.classList.add("wrong");
    allOptions[correctIndex].classList.add("correct");
  }

  allOptions.forEach((opt) => (opt.onclick = null));
  nextBtn.style.display = "block";
}

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
};

function showResult() {
  clearInterval(timer);
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");
  scoreText.textContent = `You scored ${score} out of ${questions.length}`;
}

function restartQuiz() {
  resultBox.classList.add("hidden");
  startBox.classList.remove("hidden");
}

function startTimer() {
  timeLeft = 15;
  timerEl.textContent = `Time: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      autoSelectCorrect();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 15;
  timerEl.textContent = `Time: ${timeLeft}s`;
}

function autoSelectCorrect() {
  const allOptions = document.querySelectorAll(".options-list li");
  const correctIndex = questions[currentQuestion].answer;
  allOptions[correctIndex].classList.add("correct");
  allOptions.forEach((opt) => (opt.onclick = null));
  nextBtn.style.display = "block";
}
