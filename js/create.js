import { VERSION, encodePayload, buildUrl, copyText } from "./share.js";

const form = document.getElementById("create-form");
const result = document.getElementById("result");
const guestLink = document.getElementById("guest-link");
const feedback = document.getElementById("feedback");
const copyButton = document.getElementById("copy-button");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  feedback.textContent = "";

  const title = document.getElementById("title").value.trim();
  const message = document.getElementById("message").value.trim();
  if (!title) {
    feedback.textContent = "Напиши название приглашения ♡";
    return;
  }

  guestLink.value = buildUrl("index.html", "i", encodePayload({ v: VERSION, t: title, m: message }));
  copyButton.textContent = "Скопировать ссылку";
  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "center" });
});

copyButton.addEventListener("click", async () => {
  if (!guestLink.value) {
    feedback.textContent = "Сначала создай ссылку ♡";
    return;
  }
  guestLink.select();
  const copied = await copyText(guestLink.value);
  if (!copied) document.execCommand("copy");
  copyButton.textContent = "Скопировано ♡";
});
