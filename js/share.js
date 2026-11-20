// Общие утилиты для версии без Firebase.
// Весь ответ живёт прямо в ссылке, поэтому сервер и хранилище не нужны.

const VERSION = 1;

function encodePayload(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodePayload(raw) {
  const b64 = String(raw).replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

// Данные лежат в #хэше, а не в ?запросе: хэш не уходит на сервер и не попадает в логи хостинга.
function readHashParam(name) {
  return new URLSearchParams(location.hash.replace(/^#/, "")).get(name);
}

function buildUrl(page, name, payload) {
  const url = new URL(page, location.href);
  url.hash = `${name}=${payload}`;
  return url.href;
}

function formatDate(value) {
  if (!value) return "дата не указана";
  const parts = String(value).split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !n)) return String(value);
  const [year, month, day] = parts;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
}

function answerKey(answer) {
  return [answer.t, answer.name, answer.date, answer.time, answer.note].join("");
}

function answerToText(answer, link) {
  const lines = [];
  if (answer.t) lines.push(answer.t);
  lines.push(`${answer.name} выбирает: ${formatDate(answer.date)}, ${answer.time}`);
  if (answer.note) lines.push(`Пожелание: ${answer.note}`);
  if (link) lines.push(`Мой ответ: ${link}`);
  return lines.join("\n");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export { VERSION, encodePayload, decodePayload, readHashParam, buildUrl, formatDate, answerKey, answerToText, copyText };
