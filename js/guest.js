import { VERSION, encodePayload, decodePayload, readHashParam, buildUrl, formatDate, answerToText, copyText } from "./share.js";

const form = document.getElementById("response-form");
const feedback = document.getElementById("feedback");
const dateInput = document.getElementById("date");
const result = document.getElementById("result");
const ownerLink = document.getElementById("owner-link");
const copyButton = document.getElementById("copy-button");
const copyTextButton = document.getElementById("copy-text-button");
const shareButton = document.getElementById("share-button");
const preview = document.getElementById("answer-preview");

const localToday = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
dateInput.min = localToday;

function readInvitation() {
  const raw = readHashParam("i");
  if (!raw) return null;
  try {
    const data = decodePayload(raw);
    return data && data.t ? data : null;
  } catch {
    return null;
  }
}

const invitation = readInvitation();

if (!invitation) {
  form.classList.add("hidden");
  feedback.textContent = "Похоже, ссылка повреждена. Попроси прислать приглашение ещё раз ♡";
} else {
  document.querySelector(".hero h1").textContent = invitation.t;
  document.querySelector(".intro").textContent = invitation.m || "Выбери дату и время, которые тебе подходят ♡";
}

let answer = null;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  feedback.textContent = "";

  const name = document.getElementById("guest-name").value.trim();
  const date = dateInput.value;
  const time = document.getElementById("time").value;
  const note = document.getElementById("note").value.trim();

  if (!name) { feedback.textContent = "Напиши, как тебя подписать ♡"; return; }
  if (!date || !time) { feedback.textContent = "Выбери дату и время встречи ♡"; return; }
  if (date < localToday) { feedback.textContent = "Выбери сегодняшнюю или будущую дату ♡"; return; }

  answer = { v: VERSION, t: invitation ? invitation.t : "", name, date, time, note };
  ownerLink.value = buildUrl("owner.html", "r", encodePayload(answer));

  renderPreview();
  form.classList.add("hidden");
  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Карточка собирается через textContent, чтобы любой текст остался текстом, а не разметкой.
function renderPreview() {
  preview.textContent = "";
  const title = document.createElement("h3");
  title.textContent = answer.name;
  const when = document.createElement("p");
  when.className = "response-date";
  when.textContent = `${formatDate(answer.date)} · ${answer.time}`;
  preview.append(title, when);
  if (answer.note) {
    const note = document.createElement("p");
    note.textContent = `Пожелание: ${answer.note}`;
    preview.append(note);
  }
}

copyButton.addEventListener("click", async () => {
  if (!answer) return;
  ownerLink.select();
  const copied = await copyText(ownerLink.value);
  if (!copied) document.execCommand("copy");
  copyButton.textContent = "Скопировано ♡";
});

copyTextButton.addEventListener("click", async () => {
  if (!answer) return;
  const plain = answerToText(answer, ownerLink.value);
  const copied = await copyText(plain);
  if (!copied) {
    feedback.textContent = "Скопируй текст ответа вручную и отправь сообщением ♡";
    return;
  }
  copyTextButton.textContent = "Текст скопирован ♡";
});

if (navigator.share) {
  shareButton.classList.remove("hidden");
  shareButton.addEventListener("click", async () => {
    if (!answer) return;
    try {
      await navigator.share({ title: answer.t || "OUR LITTLE DATE", text: answerToText(answer, ownerLink.value) });
    } catch {
      // Человек закрыл окно шеринга — ничего страшного, ссылки остаются под кнопками.
    }
  });
}
