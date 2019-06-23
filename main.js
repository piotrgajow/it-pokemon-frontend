let quizId;

const API = 'http://it-pokemon.webappcraft.com:8090';

const CLASS_INVISIBLE = 'hidden';
const CLASS_CORRECT = 'bg-success';
const CLASS_WRONG = 'bg-danger';

const MAIN_ELEMENT = document.getElementsByTagName('main')[0];
const NAME_ELEMENT = document.getElementById('name');
const RESULT_ELEMENT = document.getElementById('result');
const LINK_ELEMENT = document.getElementById('link');
const DESCRIPTION_ELEMENT = document.getElementById('description');
const SCORE_ELEMENT = document.getElementById('score');
const ANSWER_ELEMENTS = [document.getElementById('btn-answer-0'), document.getElementById('btn-answer-1')];
const NEXT_QUESTION_ELEMENT = document.getElementById('next-question');
const MODAL_SCORE_ELEMENT = document.getElementById('modal-score');

let score = 0;

const STATE_NO_QUIZ = 0;
const STATE_QUESTION = 1;
const STATE_RESULT = 2;
const POKEMON = 0;
const IT = 1;
let state = STATE_NO_QUIZ;

function url(endpoint) {
    return `${API}${endpoint}`;
}

function nextQuestion() {
    if (state === STATE_NO_QUIZ) {
        startNewQuiz();
    } else {
        loadQuestion();
    }
}

async function startNewQuiz() {
    if (state !== STATE_NO_QUIZ) {
        return;
    }
    const response = await fetch(url('/quiz'), { method: 'POST' });
    const result = await response.json();
    quizId = result.id;
    onQuizStarted();
    await loadQuestion();
}

async function loadQuestion() {
    if (state === STATE_QUESTION ) {
        return;
    }
    const response = await fetch(url(`/quiz/${quizId}/question`));
    const result = await response.json();
    if (response.status === 200) {
        if (result.done) {
            onQuizEnd();
        } else {
            onNextQuestion(result.name);
        }
    } else {
        alert(result.error);
    }
}

function answerPokemon() {
    answer(POKEMON);
}

function answerIT() {
    answer(IT);
}

async function answer(choice) {
    if (state !== STATE_QUESTION) {
        return;
    }
    const request = { answer: choice };
    const options = {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
            'Content-Type': 'application/json',
        }
    };
    const response = await fetch(url(`/quiz/${quizId}/answer`), options);
    const result = await response.json();
    if (response.status === 200) {
        onAnswerResult(result);
    } else {
        alert(result.error);
    }
    await getScore();
}

async function getScore() {
    const response = await fetch(url(`/quiz/${quizId}/score`));
    const result = await response.json();
    if (response.status === 200) {
        updateScore(result.score);
    } else {
        alert(result.error);
    }
}

function onQuizStarted() {
    updateScore(0);
    MAIN_ELEMENT.classList.remove(CLASS_INVISIBLE);
}

function onNextQuestion(name) {
    state = STATE_QUESTION;
    NAME_ELEMENT.innerText = name;
    RESULT_ELEMENT.innerText = '';
    LINK_ELEMENT.innerText = '';
    DESCRIPTION_ELEMENT.innerText = '';
    ANSWER_ELEMENTS.forEach((it) => it.classList.remove(CLASS_INVISIBLE));
    MAIN_ELEMENT.classList.remove(CLASS_CORRECT, CLASS_WRONG);
    NEXT_QUESTION_ELEMENT.classList.add(CLASS_INVISIBLE);
}

function onAnswerResult(result) {
    state = STATE_RESULT;
    ANSWER_ELEMENTS.forEach((btn) => btn.classList.add(CLASS_INVISIBLE));
    if (result.correct) {
        MAIN_ELEMENT.classList.add(CLASS_CORRECT);
        RESULT_ELEMENT.innerText = 'You are correct!';
    } else {
        MAIN_ELEMENT.classList.add(CLASS_WRONG);
        RESULT_ELEMENT.innerText = 'You are wrong!';
    }

    LINK_ELEMENT.innerText = result.details.name;
    LINK_ELEMENT.href = result.details.url;

    if (result.details.type === 0) {
        DESCRIPTION_ELEMENT.innerText = ' is a Pokemon name!';
    } else {
        DESCRIPTION_ELEMENT.innerText = ' is IT related name!';
    }

    NEXT_QUESTION_ELEMENT.classList.remove(CLASS_INVISIBLE);
}

function onQuizEnd() {
    state = STATE_NO_QUIZ;
    MAIN_ELEMENT.classList.add(CLASS_INVISIBLE);
    MODAL_SCORE_ELEMENT.innerText = score;
    if (score >= 7) {
        MODAL_SCORE_ELEMENT.classList = 'text-success';
    } else if (score <= 3) {
        MODAL_SCORE_ELEMENT.classList = 'text-danger';
    } else {
        MODAL_SCORE_ELEMENT.classList ='text-warning';
    }

    $('#quizEndedModal').modal({});
}

function updateScore(newScore) {
    score = newScore;
    SCORE_ELEMENT.innerText = score;
}

window.addEventListener('keyup', (event) => {
    console.log(event);
    switch (event.key) {
        case "ArrowLeft":
            answer(POKEMON);
            break;
        case "ArrowRight":
            answer(IT);
            break;
        case " ":
            nextQuestion();
            break;
    }
});
