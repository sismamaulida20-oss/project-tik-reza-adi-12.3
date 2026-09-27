/* =========================================
   GUITARTUNE AT-TIJAARAH
========================================= */


/* ================= NAVIGATION ================= */

function openPage(pageId) {

    document.querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    document.querySelectorAll(".nav-btn")
        .forEach(btn => {

            btn.classList.remove("active");

            if (btn.dataset.page === pageId) {
                btn.classList.add("active");
            }

        });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================= BOTTOM NAV ================= */

document.querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            openPage(button.dataset.page);

        });

    });


/* ================= DARK MODE ================= */

const themeBtn =
    document.getElementById("themeBtn");

const darkToggle =
    document.getElementById("darkToggle");


function setTheme(isDark) {

    if (isDark) {

        document.body.classList.remove("light");

        themeBtn.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

    } else {

        document.body.classList.add("light");

        themeBtn.innerHTML =
            '<i class="fa-solid fa-moon"></i>';

    }

    darkToggle.checked = isDark;

    localStorage.setItem(
        "guitarTheme",
        isDark ? "dark" : "light"
    );
}


themeBtn.addEventListener("click", () => {

    const isDark =
        !document.body.classList.contains("light");

    setTheme(!isDark);

});


darkToggle.addEventListener("change", () => {

    setTheme(darkToggle.checked);

});


const savedTheme =
    localStorage.getItem("guitarTheme");

if (savedTheme === "light") {
    setTheme(false);
} else {
    setTheme(true);
}


/* ================= DAILY TIPS ================= */

const tips = [

    "Latihan 10 menit setiap hari lebih baik daripada latihan lama tetapi jarang.",

    "Pastikan gitar selalu dituning sebelum mulai bermain.",

    "Latih perpindahan chord secara perlahan.",

    "Jangan menekan senar terlalu kuat.",

    "Cobalah berlatih menggunakan metronom.",

    "Pastikan setiap nada terdengar bersih.",

    "Jaga gitar agar tetap bersih dan terawat.",

    "Latihan rutin akan membuat jari semakin terbiasa."
];


const motivations = [

    "Jangan takut salah. Setiap petikan adalah bagian dari proses belajar.",

    "Sedikit kemajuan setiap hari tetaplah kemajuan.",

    "Nikmati prosesnya, satu chord demi satu chord.",

    "Terus bermain. Kemampuan datang dari latihan.",

    "Tidak harus sempurna. Yang penting terus berkembang.",

    "Hari ini latihan, besok semakin mahir."
];


const tipIndex =
    new Date().getDate() % tips.length;

const motivationIndex =
    new Date().getDate() % motivations.length;


document.getElementById("dailyTip").textContent =
    tips[tipIndex];

document.getElementById("dailyMotivation").textContent =
    motivations[motivationIndex];


/* ================= TUNER DATA ================= */

const tuningData = {

    standard: [
        { note: "E", freq: 82.41 },
        { note: "A", freq: 110.00 },
        { note: "D", freq: 146.83 },
        { note: "G", freq: 196.00 },
        { note: "B", freq: 246.94 },
        { note: "E", freq: 329.63 }
    ],

    dropd: [
        { note: "D", freq: 73.42 },
        { note: "A", freq: 110.00 },
        { note: "D", freq: 146.83 },
        { note: "G", freq: 196.00 },
        { note: "B", freq: 246.94 },
        { note: "E", freq: 329.63 }
    ],

    half: [
        { note: "Eb", freq: 77.78 },
        { note: "Ab", freq: 103.83 },
        { note: "Db", freq: 138.59 },
        { note: "Gb", freq: 185.00 },
        { note: "Bb", freq: 233.08 },
        { note: "Eb", freq: 311.13 }
    ],

    openg: [
        { note: "D", freq: 73.42 },
        { note: "G", freq: 98.00 },
        { note: "D", freq: 146.83 },
        { note: "G", freq: 196.00 },
        { note: "B", freq: 246.94 },
        { note: "D", freq: 293.66 }
    ],

    opend: [
        { note: "D", freq: 73.42 },
        { note: "A", freq: 110.00 },
        { note: "D", freq: 146.83 },
        { note: "F#", freq: 185.00 },
        { note: "A", freq: 220.00 },
        { note: "D", freq: 293.66 }
    ]

};


let currentTuning = "standard";

let selectedString = 0;

let tunerRunning = false;

let audioContext = null;

let analyser = null;

let microphone = null;

let animationId = null;


/* ================= STRING BUTTONS ================= */

const stringButtons =
    document.querySelectorAll(".string");


stringButtons.forEach(button => {

    button.addEventListener("click", () => {

        stringButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        selectedString =
            Number(button.dataset.index);

        updateTunerDisplay();

    });

});


/* ================= TUNING SELECT ================= */

document
    .getElementById("tuningSelect")
    .addEventListener("change", event => {

        currentTuning =
            event.target.value;

        updateStringButtons();

        updateTunerDisplay();

    });


function updateStringButtons() {

    const strings =
        tuningData[currentTuning];

    stringButtons.forEach((button, index) => {

        button.querySelector("strong")
            .textContent =
            strings[index].note;

    });

}


function updateTunerDisplay() {

    const strings =
        tuningData[currentTuning];

    const selected =
        strings[selectedString];

    document.querySelector(".selected-label")
        .textContent =
        "SENAR " + (6 - selectedString);

    document.querySelector(".note")
        .textContent =
        selected.note;

    document.getElementById("frequency")
        .textContent =
        selected.freq.toFixed(2) + " Hz";

}


/* ================= MICROPHONE TUNER ================= */

const tunerBtn =
    document.getElementById("tunerBtn");


tunerBtn.addEventListener("click", async () => {

    if (!tunerRunning) {

        await startTuner();

    } else {

        stopTuner();

    }

});


async function startTuner() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        analyser =
            audioContext.createAnalyser();

        analyser.fftSize = 4096;

        microphone =
            audioContext.createMediaStreamSource(stream);

        microphone.connect(analyser);

        tunerRunning = true;

        tunerBtn.innerHTML =
            '<i class="fa-solid fa-stop"></i> HENTIKAN TUNER';

        document.getElementById("tunerStatus")
            .textContent =
            "MENDENGARKAN...";

        detectPitch();

    } catch (error) {

        alert(
            "Mikrofon tidak dapat digunakan. " +
            "Pastikan izin mikrofon diberikan."
        );

    }

}


function stopTuner() {

    tunerRunning = false;

    if (animationId) {

        cancelAnimationFrame(animationId);

    }

    if (audioContext) {

        audioContext.close();

        audioContext = null;

    }

    tunerBtn.innerHTML =
        '<i class="fa-solid fa-microphone"></i> MULAI TUNER';

    document.getElementById("tunerStatus")
        .textContent =
        "TUNER DIHENTIKAN";

}


/* ================= PITCH DETECTION ================= */

function detectPitch() {

    if (!tunerRunning) {
        return;
    }

    const buffer =
        new Float32Array(analyser.fftSize);

    analyser.getFloatTimeDomainData(buffer);

    const frequency =
        autoCorrelate(
            buffer,
            audioContext.sampleRate
        );

    if (frequency !== -1) {

        processFrequency(frequency);

    }

    animationId =
        requestAnimationFrame(detectPitch);

}


function autoCorrelate(buffer, sampleRate) {

    let size = buffer.length;

    let rms = 0;

    for (let i = 0; i < size; i++) {

        rms += buffer[i] * buffer[i];

    }

    rms = Math.sqrt(rms / size);

    if (rms < 0.01) {

        return -1;

    }

    let bestOffset = -1;

    let bestCorrelation = 0;

    const minFreq = 50;

    const maxFreq = 500;

    const minOffset =
        Math.floor(sampleRate / maxFreq);

    const maxOffset =
        Math.floor(sampleRate / minFreq);

    for (
        let offset = minOffset;
        offset < maxOffset;
        offset++
    ) {

        let correlation = 0;

        for (
            let i = 0;
            i < size - offset;
            i++
        ) {

            correlation +=
                buffer[i] *
                buffer[i + offset];

        }

        correlation /=
            size - offset;

        if (correlation > bestCorrelation) {

            bestCorrelation =
                correlation;

            bestOffset =
                offset;

        }

    }

    if (bestOffset === -1) {
        return -1;
    }

    return sampleRate / bestOffset;

}


/* ================= TUNER PROCESS ================= */

function processFrequency(frequency) {

    const target =
        tuningData[currentTuning][selectedString];

    const cents =
        1200 *
        Math.log2(
            frequency / target.freq
        );

    const clamped =
        Math.max(
            -50,
            Math.min(50, cents)
        );

    const position =
        50 + clamped;

    document.getElementById("needle")
        .style.left =
        position + "%";

    document.getElementById("cents")
        .textContent =
        (cents >= 0 ? "+" : "") +
        cents.toFixed(1) +
        " cents";

    document.getElementById("frequency")
        .textContent =
        frequency.toFixed(2) +
        " Hz";

    const status =
        document.getElementById("tunerStatus");

    if (Math.abs(cents) < 5) {

        status.textContent =
            "✓ PAS";

        status.style.color =
            "#32d583";

    } else if (cents < 0) {

        status.textContent =
            "♭ NADA TERLALU RENDAH";

        status.style.color =
            "#42a5f5";

    } else {

        status.textContent =
            "♯ NADA TERLALU TINGGI";

        status.style.color =
            "#ff7043";

    }

}


/* ================= REFERENCE TONES ================= */

const referenceButtons =
    document.getElementById(
        "referenceButtons"
    );


function createReferenceButtons() {

    referenceButtons.innerHTML = "";

    tuningData.standard.forEach(
        (string, index) => {

            const button =
                document.createElement("button");

            button.textContent =
                "🔊 " + string.note;

            button.addEventListener(
                "click",
                () => playTone(
                    string.freq
                )
            );

            referenceButtons.appendChild(
                button
            );

        }
    );

}


function playTone(frequency) {

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    const context =
        new AudioContext();

    const oscillator =
        context.createOscillator();

    const gain =
        context.createGain();

    oscillator.type =
        "sine";

    oscillator.frequency.value =
        frequency;

    gain.gain.value =
        0.15;

    oscillator.connect(gain);

    gain.connect(
        context.destination
    );

    oscillator.start();

    oscillator.stop(
        context.currentTime + 1.5
    );

}


createReferenceButtons();


/* ================= CHORDS ================= */

const chords = [

    {
        name: "C",
        text: "C Major • Chord dasar"
    },

    {
        name: "D",
        text: "D Major • Chord dasar"
    },

    {
        name: "E",
        text: "E Major • Chord dasar"
    },

    {
        name: "F",
        text: "F Major • Barre chord"
    },

    {
        name: "G",
        text: "G Major • Chord populer"
    },

    {
        name: "A",
        text: "A Major • Chord dasar"
    },

    {
        name: "Am",
        text: "A Minor"
    },

    {
        name: "Dm",
        text: "D Minor"
    },

    {
        name: "Em",
        text: "E Minor"
    },

    {
        name: "B7",
        text: "B Seven"
    }

];


const chordList =
    document.getElementById("chordList");


chords.forEach(chord => {

    const div =
        document.createElement("div");

    div.className =
        "chord";

    div.innerHTML = `

        <div class="chord-name">
            ${chord.name}
        </div>

        <div>
            <strong>
                ${chord.text}
            </strong>

            <p>
                Klik untuk melihat detail chord.
            </p>
        </div>

    `;

    div.addEventListener("click", () => {

        alert(
            "Chord " +
            chord.name +
            "\\n\\n" +
            chord.text +
            "\\n\\n" +
            "Diagram chord dapat ditambahkan di halaman detail."
        );

    });

    chordList.appendChild(div);

});


/* ================= LESSON ================= */

const lessons = [

    [
        "1. Mengenal bagian gitar",
        "Kenali body, neck, fret, bridge dan headstock."
    ],

    [
        "2. Mengenal nama senar",
        "Pelajari urutan E A D G B E."
    ],

    [
        "3. Cara memegang gitar",
        "Posisi gitar yang nyaman membantu permainan."
    ],

    [
        "4. Cara memetik",
        "Mulai dengan petikan sederhana."
    ],

    [
        "5. Chord dasar",
        "Mulai dari C, G, D, A dan E."
    ],

    [
        "6. Perpindahan chord",
        "Latih perpindahan secara perlahan."
    ],

    [
        "7. Strumming",
        "Pelajari pola genjrengan dasar."
    ],

    [
        "8. Latihan lagu",
        "Gabungkan chord yang sudah dipelajari."
    ]

];


const lessonList =
    document.getElementById("lessonList");


lessons.forEach(lesson => {

    const div =
        document.createElement("div");

    div.className =
        "lesson";

    div.innerHTML = `

        <strong>
            ${lesson[0]}
        </strong>

        <p>
            ${lesson[1]}
        </p>

    `;

    div.addEventListener(
        "click",
        () => {

            alert(
                lesson[0] +
                "\\n\\n" +
                lesson[1]
            );

        }
    );

    lessonList.appendChild(div);

});


/* ================= TIPS ================= */

const tipsList =
    document.getElementById("tipsList");


tips.forEach((tip, index) => {

    const div =
        document.createElement("div");

    div.className =
        "card";

    div.innerHTML = `

        <div class="card-title">
            💡 Tips ${index + 1}
        </div>

        <p>
            ${tip}
        </p>

    `;

    tipsList.appendChild(div);

});


/* ================= INITIALIZE ================= */

updateStringButtons();

updateTunerDisplay();