import { decodePayload, readHashParam, formatDate, answerKey, copyText } from "./share.js";

const STORAGE_KEY = "our-little-date-inbox-v1";
const list = document.getElementById("responses");
const feedback = document.getElementById("feedback");
const clearButton = document.getElementById("clear-button");
const copyAllButton = document.getElementById("copy-all-button");

function loadSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSaved(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    feedback.textContent = "Браузер запретил сохранять ответы локально, но этот ответ всё равно виден в ссылке.";
  }
}

function readIncoming() {
  const raw = readHashParam("r");
  if (!raw) return null;
  try {
    const data = decodePayload(raw);
    return data && data.name && data.date && data.time ? data : null;
  } catch {
    return null;
  }
}

const incoming = readIncoming();
let saved = loadSaved();

if (incoming && !saved.some((item) => answerKey(item) === answerKey(incoming))) {
  saved.push(incoming);
  saveSaved(saved);
}

function sorted() {
  return [...saved].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}

function render() {
  const items = sorted();
  list.textContent = "";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = incoming
      ? "Ответ показан выше, но список был очищен."
      : "Открой ссылку с ответом, которую тебе прислал человек, — и ответ появится здесь ♡";
    list.append(empty);
    clearButton.classList.add("hidden");
    copyAllButton.classList.add("hidden");
    return;
  }
  clearButton.classList.toggle("hidden", items.length < 2);
  copyAllButton.classList.toggle("hidden", items.length < 2);

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "response-card";
    const name = document.createElement("h3");
    name.textContent = item.name;
    const when = document.createElement("p");
    when.className = "response-date";
    when.textContent = `${formatDate(item.date)} · ${item.time}`;
    card.append(name, when);
    if (item.t) {
      const from = document.createElement("p");
      from.textContent = `Приглашение: ${item.t}`;
      card.append(from);
    }
    if (item.note) {
      const note = document.createElement("p");
      note.textContent = `Пожелание: ${item.note}`;
      card.append(note);
    }
    list.append(card);
  });
}

clearButton.addEventListener("click", () => {
  saved = incoming ? [incoming] : [];
  saveSaved(saved);
  feedback.textContent = "Список очищен, остался только ответ из этой ссылки.";
  render();
});

copyAllButton.addEventListener("click", async () => {
  const plain = sorted()
    .map((item) => `${item.name} — ${formatDate(item.date)}, ${item.time}${item.note ? ` (пожелание: ${item.note})` : ""}`)
    .join("\n");
  const copied = await copyText(plain);
  copyAllButton.textContent = copied ? "Скопировано ♡" : "Скопируй список вручную";
});

if (!incoming && !saved.length) {
  feedback.textContent = "Здесь пока пусто. Это нормально: ответы добавляются из ссылок, которые тебе присылают.";
}

render();
