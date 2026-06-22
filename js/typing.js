const difficulties = {
    easy: "The quick brown fox jumps over the lazy dog.",
    medium: "Typing games improve your typing speed and accuracy in a fun and engaging way.",
    hard: "While programming in JavaScript, handling asynchronous behavior using promises and callbacks can be tricky."
};

let currentText = "";
let currentLevel = "";
let mistakeCount = 0;
let startTime = null;
let typedText = "";   // the full keystroke pattern, including mistakes & backspaces
let lastValue = "";   // what was in the input field on the previous keystroke

const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const startBtn = document.getElementById("startBtn");
const textDisplay = document.getElementById("text-display");
const inputField = document.getElementById("typing-input");
const wpmBox = document.getElementById("wpm");
const accuracyBox = document.getElementById("accuracy");
const mistakesBox = document.getElementById("mistakes");
const saveBtn = document.getElementById("saveBtn");
const logoutBtn = document.getElementById("typingLogoutBtn");
const resultsBox = document.getElementById("results");
const resultSummary = document.getElementById("result-summary");
const typedOutput = document.getElementById("typed-output");
const remarksBox = document.getElementById("remarks");

function checkLogin() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
        alert("Please log in first to access the Typing module.");
        window.location.href = "../tempelate/Login.html";
        return false;
    }

    return true;
}

function updateStats(wpm, accuracy, mistakes) {
    wpmBox.textContent = `WPM: ${Number.isNaN(wpm) ? 0 : wpm}`;
    accuracyBox.textContent = `Accuracy: ${Number.isNaN(accuracy) ? 100 : accuracy}%`;
    mistakesBox.textContent = `Mistakes: ${mistakes}`;
}

if (!checkLogin()) {
    throw new Error("Typing module requires login.");
}

function logout() {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    alert("You have been logged out.");
    window.location.href = "../tempelate/Login.html";
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}

function resetSession() {
    mistakeCount = 0;
    startTime = null;
    typedText = "";
    lastValue = "";
    inputField.value = "";
    if (resultsBox) {
        resultsBox.classList.add("hidden");
    }
    updateStats(0, 100, 0);
}

// Count how many characters typed so far are in the correct position,
// comparing alphabets regardless of upper/lower case.
function countCorrect(value) {
    let correct = 0;
    for (let i = 0; i < value.length && i < currentText.length; i++) {
        if (value[i].toLowerCase() === currentText[i].toLowerCase()) {
            correct++;
        }
    }
    return correct;
}

// Block copying / cutting the paragraph that has to be typed so it can't be
// pasted into the input field.
["copy", "cut", "contextmenu", "dragstart"].forEach((evt) => {
    textDisplay.addEventListener(evt, (e) => e.preventDefault());
});

// Block pasting / dropping text into the input field so the answer can't be
// pasted in.
["paste", "drop"].forEach((evt) => {
    inputField.addEventListener(evt, (e) => e.preventDefault());
});

difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
        difficultyButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        currentLevel = button.dataset.level;
        currentText = difficulties[currentLevel];
        textDisplay.textContent = currentText;
        startBtn.disabled = false;
        inputField.disabled = true;
        resetSession();
    });
});

startBtn.addEventListener("click", () => {
    if (!currentText) {
        return;
    }
    resetSession();
    inputField.disabled = false;
    inputField.focus();
    startTime = new Date();
});

inputField.addEventListener("input", () => {
    const value = inputField.value;

    if (!startTime || !currentText) {
        lastValue = value;
        return;
    }

    // Don't let the user type past the end of the paragraph.
    if (value.length > currentText.length) {
        inputField.value = value.slice(0, currentText.length);
        return;
    }

    if (value.length > lastValue.length) {
        // A character was added. Record it in the typed pattern, and if it is
        // wrong for its position, count it as a mistake (the user will have to
        // backspace and correct it).
        const addedChar = value[value.length - 1];
        const expectedChar = currentText[value.length - 1];
        typedText += addedChar;

        if (expectedChar === undefined || addedChar.toLowerCase() !== expectedChar.toLowerCase()) {
            mistakeCount++;
        }
    } else if (value.length < lastValue.length) {
        // The user pressed backspace to correct a mistake. Show that in the
        // pattern with a "<" marker so the correction is visible.
        typedText += "<";
    }

    lastValue = value;

    const correct = countCorrect(value);
    const elapsedMinutes = (new Date() - startTime) / 60000;
    const wpm = elapsedMinutes > 0 ? Math.round((correct / 5) / elapsedMinutes) : 0;
    const accuracy = Math.max(0, Math.round((correct / (correct + mistakeCount)) * 100));

    updateStats(wpm, accuracy, mistakeCount);

    // Finished only when the whole paragraph is typed correctly.
    if (value.length === currentText.length && correct === currentText.length) {
        inputField.disabled = true;
        const seconds = Math.max(1, Math.round((new Date() - startTime) / 1000));
        const finalWpm = Math.round((correct / 5) / (seconds / 60));
        showResults(finalWpm, accuracy, mistakeCount, seconds);
    }
});

function showResults(wpm, accuracy, mistakes, seconds) {
    if (!resultsBox) {
        return;
    }

    resultSummary.innerHTML = `
        <div class="result-item"><span>WPM</span><strong>${wpm}</strong></div>
        <div class="result-item"><span>Time</span><strong>${seconds}s</strong></div>
        <div class="result-item"><span>Accuracy</span><strong>${accuracy}%</strong></div>
        <div class="result-item"><span>Mistakes</span><strong>${mistakes}</strong></div>
    `;

    typedOutput.textContent = typedText;

    const feedback = buildFeedback(currentLevel, wpm, accuracy, seconds, currentText.length);
    remarksBox.innerHTML = `
        <p class="remark">${feedback.remark}</p>
        <h4>Suggestions to improve</h4>
        <ul>${feedback.suggestions.map((s) => `<li>${s}</li>`).join("")}</ul>
    `;

    resultsBox.classList.remove("hidden");
    resultsBox.scrollIntoView({ behavior: "smooth" });
}

function buildFeedback(level, wpm, accuracy, seconds, length) {
    // Per-difficulty target WPM and a "good" completion time derived from the
    // paragraph length (assuming ~5 characters per word).
    const targets = {
        easy: { goodWpm: 35, greatWpm: 50 },
        medium: { goodWpm: 30, greatWpm: 45 },
        hard: { goodWpm: 25, greatWpm: 40 }
    };
    const target = targets[level] || targets.medium;
    const words = length / 5;
    const goodSeconds = Math.round((words / target.goodWpm) * 60);

    const suggestions = [];
    let speedNote;
    let accuracyNote;

    // Speed remark based on WPM and completion time vs. the difficulty target.
    if (wpm >= target.greatWpm) {
        speedNote = `Excellent speed of ${wpm} WPM on the ${level} paragraph`;
    } else if (wpm >= target.goodWpm) {
        speedNote = `Good speed of ${wpm} WPM on the ${level} paragraph`;
    } else {
        speedNote = `Your speed of ${wpm} WPM on the ${level} paragraph has room to grow`;
        suggestions.push("Practice daily for 10–15 minutes to build muscle memory.");
        suggestions.push("Keep your eyes on the paragraph, not the keyboard, to type faster.");
    }

    if (seconds > goodSeconds * 1.5) {
        suggestions.push(`You finished in ${seconds}s; aim for around ${goodSeconds}s next time.`);
    }

    // Accuracy remark.
    if (accuracy >= 98) {
        accuracyNote = `near-perfect accuracy (${accuracy}%)`;
    } else if (accuracy >= 90) {
        accuracyNote = `solid accuracy (${accuracy}%)`;
    } else {
        accuracyNote = `accuracy of ${accuracy}% that needs attention`;
        suggestions.push("Slow down slightly and focus on hitting the right key the first time.");
        suggestions.push("Use all ten fingers and the correct home-row position.");
    }

    if (suggestions.length === 0) {
        suggestions.push("Great job! Try a harder paragraph to keep challenging yourself.");
    }

    return {
        remark: `${speedNote} with ${accuracyNote}.`,
        suggestions
    };
}

// Empty base = same origin: the page and the API are served from one place.
const API_BASE = "";

saveBtn.addEventListener("click", async () => {
    if (sessionStorage.getItem("isLoggedIn") !== "true") {
        alert("You must be logged in to save your data.");
        return;
    }

    const username = sessionStorage.getItem("userEmail") || sessionStorage.getItem("userName");
    const wpm = parseInt(wpmBox.textContent.split(":")[1], 10) || 0;
    const accuracy = parseInt(accuracyBox.textContent.split(":")[1], 10) || 0;
    const mistakes = parseInt(mistakesBox.textContent.split(":")[1], 10) || 0;

    try {
        const response = await fetch(`${API_BASE}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                wpm,
                accuracy,
                mistakes,
                difficulty: currentLevel || "unknown"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Could not save your stats.");
            return;
        }

        alert("Stats saved successfully!");
    } catch (err) {
        alert("Could not reach the server. Please make sure the app started correctly.");
    }
});
