let quizData = [];
let selectedQuestions = [];

let current = 0;
let score = 0;
let results = [];
let answered = false;

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
    shuffle([...quizData]).slice(0, 5);
    current = 0;
    score = 0;
    results = [];
    answered = false;

    startBtn.style.display = "none";

    document.getElementById("quizArea").style.display = "block";
    document.getElementById("resultArea").style.display = "none";

    showQuestion();
}

// =======================
// 問題表示
// =======================

function showQuestion() {

    answered = false;
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

const quizArea =
document.getElementById("quizArea");

quizArea.classList.remove("page-turn");

void quizArea.offsetWidth;

quizArea.classList.add("page-turn");
}

// =======================
// 回答
// =======================

function answer(selected) {

    if(answered) return;

    answered = true;

    document
        .querySelectorAll("#choices button")
        .forEach(btn => btn.disabled = true);

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

    if(current >= selectedQuestions.length - 1){
        showResult();
        return;
    }

    current++;
    showQuestion();

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

function flashEffect(){

    const flash =
    document.getElementById("flash");

    flash.classList.remove("flash");

    void flash.offsetWidth;

    flash.classList.add("flash");
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

    endTime = Date.now(); // ⏱追加

    const percent =
        Math.round(score / selectedQuestions.length * 100);

    let rank = "";

    if(percent === 100) rank = "S";
    else if(percent >= 80) rank = "A";
    else if(percent >= 60) rank = "B";
    else if(percent >= 40) rank = "C";
    else rank = "D";

let title = "";

switch(rank){

    case "S":
        title = "👑 附中マスター";
        break;

    case "A":
        title = "🥇 附中博士";
        break;

    case "B":
        title = "🥈 附中通";
        break;

    case "C":
        title = "🥉 挑戦者";
        break;

    default:
        title = "🌱 見習い";
}
    

    // ⏱ 解答時間
    const totalSec = (endTime - startTime) / 1000;
    const min = Math.floor(totalSec / 60);
    const sec =
        (totalSec % 60).toFixed(2);
    
    if(percent >= 80){
        fanfareSound.currentTime = 0;
        fanfareSound.play();

        confetti({
            particleCount: 200,
            spread: 120
        });
    }

    if(percent === 100){

    flashEffect();

    fanfareSound.currentTime = 0;
    fanfareSound.play();

    const duration = 3000;
    const end = Date.now() + duration;
        
    (function frame() {

        confetti({
            particleCount: 6,
            spread: 160,
            startVelocity: 35,
            origin: {
                x: Math.random(),
                y: Math.random() * 0.6
            }
        });

        if(Date.now() < end){
            requestAnimationFrame(frame);
        }

    })();
}
    let detail = "";

    results.forEach((r, i) => {

        detail += `
        <details>
            <summary>Q${i + 1}：${r.correct ? "🟢" : "❌"}</summary>
            <p><b>問題：</b>${r.question}</p>
            <p><b>あなたの回答：</b>${r.yourAnswer}</p>
            <p><b>答えの選択肢：</b>${r.correctAnswer}</p>
        </details>
        `;
    });

    document.getElementById("quizArea").style.display = "none";

    const resultArea = document.getElementById("resultArea");

    resultArea.style.display = "block";

    resultArea.innerHTML = `
        <h2>🎉 クイズ終了！</h2>

        <h3>正答率 ${percent}%</h3>
        <h1 id="rankDisplay">D</h1>
        <h2 id="titleDisplay">${title}</h2>
        <h3>解答時間 ${min}分${sec}秒</h3>

        ${detail}

        <button onclick="location.reload()">
            もう一度挑戦
        </button>
    `;


setTimeout(() => {

    const rankDisplay =
    document.getElementById("rankDisplay");

    const ranks =
    ["D","C","B","A","S"];

    let i = 0;

    const goal =
    ranks.indexOf(rank);

    const timer =
    setInterval(() => {

        rankDisplay.textContent =
        ranks[i];

        rankDisplay.classList.remove("rank-pop");

        void rankDisplay.offsetWidth;

        rankDisplay.classList.add("rank-pop");

        i++;

        if(i > goal){

            clearInterval(timer);

            if(rank === "S"){

                flashEffect();

                setTimeout(() => {

                    const end =
                    Date.now() + 2500;

                    (function frame(){

                        confetti({
                            particleCount:8,
                            spread:180,
                            startVelocity:40,
                            origin:{
                                x:Math.random(),
                                y:Math.random()*0.6
                            }
                        });

                        if(Date.now() < end){
                            requestAnimationFrame(frame);
                        }

                    })();

                },300);
            }
        }

    },700);

},200);
}

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}
