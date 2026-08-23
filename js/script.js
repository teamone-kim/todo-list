import { supabase } from "./supabaseClient.js";
import { setOnAuthChange } from "./auth.js";

const boardError = document.getElementById("board-error");

let cards = [];
let currentUserId = null;

function showBoardError(message) {
  boardError.textContent = message;
}

async function loadCards() {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    showBoardError(error.message);
    return;
  }
  showBoardError("");
  cards = data;
  render();
}

async function addCard(status, text) {
  const { data, error } = await supabase
    .from("cards")
    .insert({ text, status, user_id: currentUserId })
    .select()
    .single();
  if (error) {
    showBoardError(error.message);
    return;
  }
  showBoardError("");
  cards.push(data);
  render();
}

async function removeCard(id) {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) {
    showBoardError(error.message);
    return;
  }
  showBoardError("");
  cards = cards.filter((card) => card.id !== id);
  render();
}

async function moveCard(id, status) {
  const card = cards.find((c) => c.id === id);
  if (!card || card.status === status) return;
  const { data, error } = await supabase
    .from("cards")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    showBoardError(error.message);
    return;
  }
  showBoardError("");
  card.status = data.status;
  render();
}

function createCardElement(card) {
  const el = document.createElement("div");
  el.className = "card";
  el.draggable = true;
  el.dataset.id = card.id;

  const text = document.createElement("span");
  text.className = "card-text";
  text.textContent = card.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "card-delete";
  deleteBtn.type = "button";
  deleteBtn.setAttribute("aria-label", "삭제");
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", () => removeCard(card.id));

  el.append(text, deleteBtn);

  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
    el.classList.add("dragging");
  });

  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
  });

  return el;
}

function render() {
  document.querySelectorAll(".card-list").forEach((list) => {
    const status = list.dataset.status;
    list.innerHTML = "";
    cards
      .filter((card) => card.status === status)
      .forEach((card) => list.appendChild(createCardElement(card)));
  });
}

function setupAddForms() {
  document.querySelectorAll(".add-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector(".add-input");
      const text = input.value.trim();
      if (!text) return;
      addCard(form.dataset.status, text);
      input.value = "";
      input.focus();
    });
  });
}

function setupDropZones() {
  document.querySelectorAll(".column").forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("drag-over");
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.classList.remove("drag-over");
      const id = e.dataTransfer.getData("text/plain");
      moveCard(id, column.dataset.status);
    });
  });
}

setupAddForms();
setupDropZones();

setOnAuthChange((user) => {
  if (user) {
    currentUserId = user.id;
    loadCards();
  } else {
    currentUserId = null;
    cards = [];
    render();
  }
});
