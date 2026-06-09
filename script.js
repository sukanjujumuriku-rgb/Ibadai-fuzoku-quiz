let quizData = [];
let selectedQuestions = [];

let current = 0;
let score = 0;
let results = [];

// ⏱ 時間管理
let startTime = 0;
let endTime = 0;

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
                answer: Number(rows[i][5])
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

    startTime = Date.now(); // ⏱追加

    selectedQuestions =
        [...quizData].sort(() => Math.random() - 0.5).slice(0, 5);

    current = 0;
    score = 0;
    results = [];

    startBtn.style.display = "none";

    document.getElementById("quizArea").style.display = "block";
    document.getElementById("resultArea").style.display = "none";

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
        correct: correct
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

    effect.textContent = correct ? "○" : "×";
    effect.style.color = correct ? "green" : "red";

    document.body.classList.add(correct ? "correct" : "wrong");

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
        String(now.getHours()).padStart(2,"0") + ":" +
        String(now.getMinutes()).padStart(2,"0");
}

// =======================
// 結果
// =======================
function showResult() {

    endTime = Date.now();

    const percent =
        Math.round(score / selectedQuestions.length * 100);

    let rank = "";

    if(percent === 100) rank = "S";
    else if(percent >= 80) rank = "A";
    else if(percent >= 60) rank = "B";
    else if(percent >= 40) rank = "C";
    else rank = "D";

const resultArea = document.getElementById("resultArea");


    // =======================
    // 詳細（見やすく強化）
    // =======================

    let detail = "";

    results.forEach((r, i) => {

        detail += `
        <details style="
            margin:12px 0;
            padding:12px;
            border:1px solid #ddd;
            border-radius:10px;
            background:#fafafa;
        ">
            <summary style="
                cursor:pointer;
                font-weight:bold;
            ">
                Q${i + 1}：${r.correct ? "🟢 正解" : "🔴 不正解"}
            </summary>

            <div style="margin-top:10px; line-height:1.6;">

                <p><b>問題：</b>${r.question}</p>

                <p><b>あなたの回答：</b>${r.yourAnswer}</p>

                <p><b>正解：</b>${r.correctAnswer}</p>

                <p>
                    <b>判定：</b>
                    <span style="color:${r.correct ? 'green' : 'red'}; font-weight:bold;">
                        ${r.correct ? "正解" : "不正解"}
                    </span>
                </p>

            </div>
        </details>
        `;
    });

    // =======================
    // 表示
    // =======================

    document.getElementById("quizArea").style.display = "none";

    const resultArea = document.getElementById("resultArea");

    resultArea.style.display = "block";

    resultArea.innerHTML = `
        <div style="
            background:linear-gradient(135deg,#4facfe,#00f2fe);
            color:white;
            padding:20px;
            border-radius:12px;
            margin-bottom:15px;
            text-align:center;
        ">
            <h2>🎉 クイズ終了！</h2>
            <h3>正答率：${percent}%</h3>
            <h3>ランク：${rank}</h3>
            <h3>解答時間：${min}分${sec}秒</h3>
        </div>

        ${detail}

        <button onclick="location.reload()" style="
            margin-top:15px;
            padding:12px;
            width:100%;
            font-size:16px;
            border:none;
            border-radius:10px;
            background:#2563eb;
            color:white;
            cursor:pointer;
        ">
            もう一度挑戦
        </button>
    `;
}
