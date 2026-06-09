
let quizData = [];
let selectedQuestions = [];

let current = 0;
let score = 0;
let results = [];

// 🔊 音
const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");
const fanfareSound = new Audio("fanfare.mp3");

// =======================
// 開始
// =======================

const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", loadQuizFile);

async function loadQuizFile() {

    startBtn.disabled = true;
    startBtn.textContent = "読み込み中...";

    try {

        const response = await fetch("quiz.xlsx");
        const arrayBuffer = await response.arrayBuffer();

        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        quizData = [];

        for(let i = 1; i < rows.length; i++) {

            if(!rows[i][0]) continue;

            quizData.push({
                question: rows[i][0],
                choices: [rows[i][1], rows[i][2], rows[i][3], rows[i][4]],
                answer: Number(rows[i][5]),
                
            });
        }

        startQuiz();

    } catch(error) {

        alert("quiz.xlsx の読み込みに失敗しました");

        startBtn.disabled = false;
        startBtn.textContent = "クイズ開始";
    }
}

// =======================
// クイズ開始
// =======================

function startQuiz() {

    selectedQuestions =
        [...quizData].sort(() => Math.random() - 0.5).slice(0, 5);

    current = 0;
    score = 0;
    results = [];

    startBtn.style.display = "none";

    document.getElementById("quizArea").style.display = "block";
    document.getElementById("resultArea").style.display = "none";
    document.getElementById("resultMeta").style.display = "none";

    showQuestion();
}

// =======================
// 問題表示
// =======================

function showQuestion() {

    const q = selectedQuestions[current];

    document.getElementById("progress").textContent =
        `第${current + 1}問 / 5問`;

    document.getElementById("question").textContent = q.question;

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";

    q.choices.forEach((choice, index) => {

        const btn = document.createElement("button");
        btn.textContent = choice;

        btn.onclick = () => answer(index + 1);

        choicesDiv.appendChild(btn);
    });
}

// =======================
// 回答
// =======================

function answer(selected) {

    const q = selectedQuestions[current];

    const correct = selected === q.answer;

    playEffect(correct);

    // 🔊 音
    if(correct){
        correctSound.currentTime = 0;
        correctSound.play();
        score++;
    }else{
        wrongSound.currentTime = 0;
        wrongSound.play();
    }

    results.push({
        question: q.question,
        yourAnswer: q.choices[selected - 1],
        correctAnswer: q.choices[q.answer - 1],
        correct: correct,
        explanation: q.explanation
    });

    setTimeout(() => {

        current++;

        if(current < selectedQuestions.length){
            showQuestion();
        }else{
            showResult();
        }

    }, 800);
}

// =======================
// エフェクト
// =======================

function playEffect(correct){

    const effect = document.getElementById("effect");

    if(correct){
        document.body.classList.add("correct");
        effect.textContent = "○";
        effect.style.color = "green";
    }else{
        document.body.classList.add("wrong");
        effect.textContent = "×";
        effect.style.color = "red";
    }

    effect.animate(
        [
            { opacity:0, transform:"translate(-50%,-50%) scale(0.5)" },
            { opacity:1, transform:"translate(-50%,-50%) scale(1.3)" },
            { opacity:0, transform:"translate(-50%,-50%) scale(2)" }
        ],
        { duration:800 }
    );

    setTimeout(() => {
        document.body.classList.remove("correct", "wrong");
    }, 500);
}

// =======================
// 日時
// =======================

function getDateTime() {

    const now = new Date();

    return now.getFullYear() + "/" +
        (now.getMonth() + 1) + "/" +
        now.getDate() + " " +
        now.getHours() + ":" +
        String(now.getMinutes()).padStart(2, "0");
}

// =======================
// 結果
// =======================

function showResult() {

    const percent =
        Math.round(score / selectedQuestions.length * 100);

    let rank = "";

    if(percent === 100) rank = "S";
    else if(percent >= 80) rank = "A";
    else if(percent >= 60) rank = "B";
    else if(percent >= 40) rank = "C";
    else rank = "D";

    // 🎊 80%以上
    if(percent >= 80){
        fanfareSound.currentTime = 0;
        fanfareSound.play();

        confetti({
            particleCount: 200,
            spread: 120
        });
    }

    // =======================
    // 詳細リスト（折りたたみ用）
    // =======================

    let detail = "";

    results.forEach((r, i) => {

        detail += `
        <details style="margin:10px 0; padding:10px; border:1px solid #ccc; border-radius:10px;">
            <summary style="cursor:pointer;">
                Q${i + 1}：${r.correct ? "○" : "×"}
            </summary>

            <div style="margin-top:8px;">
                <p><b>問題：</b>${r.question}</p>
                <p><b>あなた：</b>${r.yourAnswer}</p>
                <p><b>正解：</b>${r.correctAnswer}</p>
                            </div>
        </details>
        `;
    });

    document.getElementById("quizArea").style.display = "none";

    const resultArea = document.getElementById("resultArea");
    const meta = document.getElementById("resultMeta");

    meta.style.display = "block";
    resultArea.style.display = "block";

    // 初期設定
    setTimeout(() => {

        document.getElementById("datetime").textContent =
            "作成日時: " + getDateTime();

    }, 0);

    resultArea.innerHTML = `
        <h2>🎉 クイズ終了！</h2>

        <h3>正答率 ${percent}%</h3>
        <h3>ランク ${rank}</h3>

        <button onclick="takeScreenshot()">
            📸 スクショして友達に自慢！
        </button>

        ${detail}

        <button onclick="location.reload()">
            もう一度挑戦
        </button>
    `;
}

// =======================
// スクショ
// =======================

function takeScreenshot() {

    const name = document.getElementById("nickname").value || "名無し";

    const target = document.getElementById("resultArea");

    const nameTag = document.createElement("h3");
    nameTag.textContent = "プレイヤー: " + name;

    target.prepend(nameTag);

    html2canvas(target).then(canvas => {

        const link = document.createElement("a");
        link.download = `${name}_quiz_result.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        nameTag.remove();
    });
}
