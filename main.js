let quizId;

const API = 'http://localhost:8080';
const NAME_ELEMENT = document.getElementById('name');
const RESULT_ELEMENT = document.getElementById('result');
const LINK_ELEMENT = document.getElementById('link');
const DESCRIPTION_ELEMENT = document.getElementById('description');
const SCORE_ELEMENT = document.getElementById('score');

function url(endpoint) {
    return `${API}${endpoint}`;
}

async function startNewQuiz() {
    const response = await fetch(url('/quiz'), { method: 'POST' });
    const result = await response.json();
    quizId = result.id;
    await loadQuestion();
}

async function loadQuestion() {
    const response = await fetch(url(`/quiz/${quizId}/question`));
    const result = await response.json();
    if (response.status === 200) {
        NAME_ELEMENT.innerText = result.name;
        RESULT_ELEMENT.innerText = '';
        LINK_ELEMENT.innerText = '';
        DESCRIPTION_ELEMENT.innerText = '';
    } else {
        alert(result.error);
    }
}

async function answer(choice) {
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
        showResult(result);
    } else {
        alert(result.error);
    }
    await getScore();
}

function showResult(result) {
    if (result.correct) {
        RESULT_ELEMENT.innerText = 'You are correct!';
    } else {
        RESULT_ELEMENT.innerText = 'You are wrong!';
    }

    LINK_ELEMENT.innerText = result.details.name;
    LINK_ELEMENT.href = result.details.url;

    if (result.details.type === 0) {
        DESCRIPTION_ELEMENT.innerText = ' is a Pokemon name!';
    } else {
        DESCRIPTION_ELEMENT.innerText = ' is IT related name!';
    }
}

async function getScore() {
    const response = await fetch(url(`/quiz/${quizId}/score`));
    const result = await response.json();
    if (response.status === 200) {
        SCORE_ELEMENT.innerText = result.score;
    } else {
        alert(result.error);
    }
}
