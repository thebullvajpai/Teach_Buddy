/* =====================================================================
 * Level 2 · Sentence rearrangement
 * The question data (level2/data/rearrange.json) is untouched — only the
 * interaction changed: words can be taken back out, the comparison now
 * ignores punctuation/case, and there is a reveal + streak counter.
 * ===================================================================== */
(function () {
  "use strict";

  var questions = [];
  var order = [];
  var step = 0;
  var streak = 0;
  var picked = [];   // { word, chip } in the order the learner tapped them

  var wordsBox = document.getElementById("wordsBox");
  var answerBox = document.getElementById("answerBox");
  var result = document.getElementById("result");
  var counter = document.getElementById("counter");
  var streakEl = document.getElementById("streak");
  var bar = document.getElementById("bar");

  /** Compare ignoring case, punctuation and extra spacing. */
  function normalize(text) {
    return String(text)
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  fetch("data/rearrange.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      questions = data.questions || [];
      if (!questions.length) throw new Error("no questions");
      order = shuffle(questions.map(function (_, i) { return i; }));
      loadQuestion();
    })
    .catch(function (err) {
      console.error(err);
      counter.textContent = "Unavailable";
      result.className = "tb-feedback-bad";
      result.textContent = "Couldn't load the exercises. Please refresh the page.";
    });

  function current() {
    return questions[order[step]];
  }

  function renderAnswer() {
    answerBox.innerHTML = "";

    if (!picked.length) {
      answerBox.innerHTML = '<span class="text-slate-400">Your sentence will appear here…</span>';
      return;
    }

    picked.forEach(function (entry, i) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tb-word";
      chip.textContent = entry.word;
      chip.title = "Remove this word";
      chip.addEventListener("click", function () {
        entry.chip.classList.remove("is-used");
        picked.splice(i, 1);
        renderAnswer();
        clearResult();
      });
      answerBox.appendChild(chip);
    });
  }

  function clearResult() {
    result.className = "";
    result.textContent = "";
  }

  function loadQuestion() {
    picked = [];
    clearResult();

    counter.textContent = "Sentence " + (step + 1) + " of " + order.length;
    streakEl.textContent = "Streak " + streak;
    bar.style.width = (step / order.length) * 100 + "%";

    wordsBox.innerHTML = "";

    shuffle(current().words).forEach(function (word) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tb-word";
      chip.textContent = word;
      chip.addEventListener("click", function () {
        if (chip.classList.contains("is-used")) return;
        chip.classList.add("is-used");
        picked.push({ word: word, chip: chip });
        renderAnswer();
        clearResult();
      });
      wordsBox.appendChild(chip);
    });

    renderAnswer();
  }

  function checkAnswer() {
    if (!picked.length) {
      result.className = "tb-feedback-bad";
      result.textContent = "Select words to build a sentence.";
      return;
    }

    var user = normalize(picked.map(function (p) { return p.word; }).join(" "));
    var correct = normalize(current().correct);

    if (user === correct) {
      streak++;
      streakEl.textContent = "Streak " + streak;
      result.className = "tb-feedback-ok";
      result.textContent = "Correct: " + current().correct;
      if (streak > 0 && streak % 5 === 0) window.TB.confetti(70);
    } else {
      streak = 0;
      streakEl.textContent = "Streak 0";
      result.className = "tb-feedback-bad";
      result.textContent = "Incorrect word order. Please try again.";
    }
  }

  function reveal() {
    result.className = "tb-feedback-ok";
    result.textContent = current().correct;
    streak = 0;
    streakEl.textContent = "Streak 0";
  }

  function clearPicks() {
    picked.forEach(function (p) { p.chip.classList.remove("is-used"); });
    picked = [];
    renderAnswer();
    clearResult();
  }

  function nextQuestion() {
    step++;
    if (step >= order.length) {
      step = 0;
      order = shuffle(order);
      window.TB.confetti(110);
    }
    loadQuestion();
  }

  document.getElementById("checkBtn").addEventListener("click", checkAnswer);
  document.getElementById("clearBtn").addEventListener("click", clearPicks);
  document.getElementById("revealBtn").addEventListener("click", reveal);
  document.getElementById("nextBtn").addEventListener("click", nextQuestion);

  document.addEventListener("keydown", function (e) {
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === "Enter") checkAnswer();
    if (e.key === "Backspace" && picked.length) {
      e.preventDefault();
      var last = picked.pop();
      last.chip.classList.remove("is-used");
      renderAnswer();
      clearResult();
    }
  });
})();
