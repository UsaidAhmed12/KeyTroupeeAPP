const keyboardMap = {
    a: "C4",
    w: "CSharp4",
    s: "D4",
    e: "DSharp4",
    d: "E4",
    f: "F4",
    t: "FSharp4",
    g: "G4",
    y: "GSharp4",
    h: "A4",
    u: "ASharp4",
    j: "B4",
    k: "C5",
    o: "CSharp5",
    l: "D5",
    p: "DSharp5",
    ";": "E5",
    "'": "F5",
    "1": "FSharp5",
    "2": "GSharp5",
    "3": "ASharp5",
    z: "G5",
    x: "A5",
    c: "B5",
    v: "C6",
    "5": "CSharp6",
    b: "D6",
    "6": "DSharp6",
    n: "E6",
    m: "F6",
    "8": "FSharp6",
    ",": "G6",
    "9": "GSharp6",
    ".": "A6",
    "0": "ASharp6",
    "/": "B6"
};

const noteLabels = Object.entries(keyboardMap).reduce((labels, [key, note]) => {
    labels[note] = key.toUpperCase();
    return labels;
}, {});

let audioContext;
const pressedKeys = new Set();

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}

function getNoteFrequency(note) {
    const normalizedNote = note.replace("Sharp", "#");
    const [, name, octaveText] = normalizedNote.match(/^([A-G]#?)(\d)$/);
    const semitoneIndexes = {
        C: 0,
        "C#": 1,
        D: 2,
        "D#": 3,
        E: 4,
        F: 5,
        "F#": 6,
        G: 7,
        "G#": 8,
        A: 9,
        "A#": 10,
        B: 11
    };
    const midiNumber = (Number(octaveText) + 1) * 12 + semitoneIndexes[name];

    return 440 * (2 ** ((midiNumber - 69) / 12));
}

function playNote(note) {
    const context = getAudioContext();
    const now = context.currentTime;
    const frequency = getNoteFrequency(note);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(0.8, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.78);

    highlightKey(note);
}

function highlightKey(note) {
    const pianoKey = document.getElementById(note);

    if (!pianoKey) {
        return;
    }

    pianoKey.classList.add("playing");
    window.setTimeout(() => pianoKey.classList.remove("playing"), 170);
}

function setupKeyboardLabels() {
    document.querySelectorAll(".white-key, .black-key").forEach((pianoKey) => {
        const label = noteLabels[pianoKey.id];

        if (label) {
            pianoKey.dataset.key = label;
        }
    });
}

document.querySelectorAll(".white-key, .black-key").forEach((pianoKey) => {
    pianoKey.addEventListener("click", () => {
        playNote(pianoKey.id);
    });
});

window.addEventListener("keydown", (event) => {
    const keyboardKey = event.key.toLowerCase();
    const note = keyboardMap[keyboardKey];

    if (!note || pressedKeys.has(keyboardKey)) {
        return;
    }

    pressedKeys.add(keyboardKey);
    playNote(note);
});

window.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.key.toLowerCase());
});

setupKeyboardLabels();
