"use strict";

const PICK_COUNT = 7;
const MAX_NUMBER = 37;
const SMALL_MAX = 18;
const byId = (id) => document.getElementById(id);
const formatNumber = (number) => String(number).padStart(2, "0");
const selected = new Set();
const history = window.LOTO7_HISTORY?.draws ?? [];
const buttons = [];

function compareDraws(selection, draws) {
  return draws.map(({ draw, date, main, bonus }) => ({
    draw,
    date,
    mainMatches: main.filter((number) => selection.has(number)).length,
    bonusMatches: bonus.filter((number) => selection.has(number)).length,
  }));
}

function renderResult() {
  const result = byId("result");
  if (!history.length) {
    result.textContent = "抽選履歴を読み込めませんでした。";
    return;
  }
  if (selected.size < PICK_COUNT) {
    result.textContent = "数字を7個選ぶと照合結果が表示されます。";
    return;
  }

  const matches = compareDraws(selected, history).filter(({ mainMatches }) => mainMatches === PICK_COUNT);
  if (!matches.length) {
    result.textContent = "収録済みの抽選履歴に、本数字7個の完全一致はありません。";
    return;
  }

  const summary = document.createElement("p");
  summary.textContent = `${matches.length}件一致しました。`;
  const list = document.createElement("ul");
  for (const { draw, date } of matches) {
    const item = document.createElement("li");
    const time = document.createElement("time");
    time.dateTime = date;
    time.textContent = date;
    item.append(`第${draw}回（抽選日 `, time, "）");
    list.append(item);
  }
  result.replaceChildren(summary, list);
}

function render() {
  const numbers = [...selected].sort((a, b) => a - b);
  const count = numbers.length;
  const odd = numbers.filter((number) => number % 2 === 1).length;
  const small = numbers.filter((number) => number <= SMALL_MAX).length;
  byId("count").textContent = `${count} / ${PICK_COUNT}`;
  byId("parity").textContent = `${odd} / ${count - odd}`;
  byId("size").textContent = `${small} / ${count - small}`;
  byId("sum").textContent = numbers.reduce((total, number) => total + number, 0);
  byId("reset").disabled = count === 0;

  buttons.forEach((button, index) => {
    const pressed = selected.has(index + 1);
    button.setAttribute("aria-pressed", String(pressed));
    button.setAttribute("aria-disabled", String(count === PICK_COUNT && !pressed));
  });
  byId("selected").replaceChildren(...Array.from({ length: PICK_COUNT }, (_, index) => {
    const item = document.createElement("li");
    if (index < count) {
      item.textContent = formatNumber(numbers[index]);
    } else {
      item.textContent = "–";
      item.className = "empty";
      item.setAttribute("aria-hidden", "true");
    }
    return item;
  }));
  renderResult();
}

for (let number = 1; number <= MAX_NUMBER; number += 1) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "number";
  button.textContent = formatNumber(number);
  button.addEventListener("click", () => {
    if (selected.has(number)) selected.delete(number);
    else if (selected.size < PICK_COUNT) selected.add(number);
    else return;
    render();
  });
  buttons.push(button);
  byId("numbers").append(button);
}

byId("reset").addEventListener("click", () => {
  selected.clear();
  render();
  buttons[0].focus();
});

if (history.length) {
  const first = history[0];
  const last = history.at(-1);
  byId("history-status").textContent = `収録履歴 第${first.draw}回〜第${last.draw}回（最終抽選日 ${last.date}）`;
}
render();
