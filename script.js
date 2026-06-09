let quizData = [];
let selectedQuestions = [];

let current = 0;
let score = 0;
let results = [];

const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", loadExcel);

function loadExcel() {

    const file =
        document.getElementById("excelFile").files[0];

    if (!file) {
        alert("Excelファイルを選択してください");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        const data =
            new Uint8Array(e.target.result);

        const workbook =
            XLSX.read(data, { type: "array" });

        const sheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const rows =
            XLSX.utils.sheet_to_json(sheet, {
                header: 1
            });

        quizData = [];

        for(let i = 1; i < rows.length; i++) {

            if(!rows[i][0]) continue;

            quizData.push({
                question: rows[i][0],

                choices: [
                    rows[i][1],
                    rows[i][2],
                    rows[i][3],
                    rows[i][4]
                ],

                answer: Number(rows[i][5])
            });
        }

        startQuiz();
    };

    reader.readAsArrayBuffer(file);
}

function startQuiz() {

    if(quizData.length < 5){
        alert("問題数が5問未満です");
        return;
    }

    selectedQuestions =
        [...quizData]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    current = 0;
    score = 0;
    results = [];

    document.getElementById("quizArea").style.display =
        "block";

    document.getElementById("resultArea").style.display =
        "none";

    showQuestion();
}

function showQuestion() {

    const q =
        selectedQuestions[current];

    document.getElementById("progress").textContent =
        `第${current + 1}問 / ${selectedQuestions.length}問`;

    document.getElementById("question").textContent =
        q.question;

    const choicesDiv =
        document.getElementById("choices");

    choicesDiv.innerHTML = "";

    q.choices.forEach((choice, index) => {

        const btn =
            document.createElement("button");

        btn.textContent = choice;

        btn.onclick = () =>
            answer(index + 1);

        choicesDiv.appendChild(btn);
    });
}

function answer(selected) {

    const correct =
        selected ===
        selectedQuestions[current].answer;

    playEffect(correct);

    if(correct){
        score++;
        results.push("○");
    }else{
        results.push("×");
    }

    setTimeout(() => {

        current++;

        if(current < selectedQuestions.length){
            showQuestion();
        }else{
            showResult();
        }

    }, 800);
}

function playEffect(correct){

    const effect =
        document.getElementById("effect");

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
            {
                opacity:0,
                transform:
                "translate(-50%,-50%) scale(0.5)"
            },
            {
                opacity:1,
                transform:
                "translate(-50%,-50%) scale(1.3)"
            },
            {
                opacity:0,
                transform:
                "translate(-50%,-50%) scale(2)"
            }
        ],
        {
            duration:800
        }
    );

    setTimeout(() => {

        document.body.classList.remove("correct");
        document.body.classList.remove("wrong");

    }, 500);
}

function showResult() {

    const percent =
        Math.round(
            score /
            selectedQuestions.length *
            100
        );

    let rank = "";

    if(percent === 100){
        rank = "S";
    }
    else if(percent >= 80){
        rank = "A";
    }
    else if(percent >= 60){
        rank = "B";
    }
    else if(percent >= 40){
        rank = "C";
    }
    else{
        rank = "D";
    }

    if(percent >= 80){

        confetti({
            particleCount: 150,
            spread: 100
        });

    }

    let detail = "";

    results.forEach((r, i) => {

        detail += `
        <p>
            ${i + 1}問目 ${r}
        </p>
        `;
    });

    document.getElementById("quizArea").style.display =
        "none";

    const resultArea =
        document.getElementById("resultArea");

    resultArea.style.display = "block";

    resultArea.innerHTML = `
        <h2>クイズ終了！</h2>

        <h3>正答率 ${percent}%</h3>

        <h3>ランク ${rank}</h3>

        ${detail}

        <button onclick="location.reload()">
            もう一度挑戦
        </button>
    `;
}
