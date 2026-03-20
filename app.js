const monthlySeries = [42000, 45000, 47000, 51200, 50100, 62480, 59300, 57400, 55700, 54100, 53200, 51600];
const categories = {
  Essentials: 38,
  Savings: 22,
  Food: 15,
  Transport: 10,
  Entertainment: 9,
  Other: 6,
};

const summaryBtn = document.getElementById("generateSummary");
const summaryText = document.getElementById("summaryText");
const insightList = document.getElementById("insightList");
const chatInput = document.getElementById("chatInput");
const chatLog = document.getElementById("chatLog");
const sendChat = document.getElementById("sendChat");
const scanStatus = document.getElementById("scanStatus");
const scanBtn = document.getElementById("scanBtn");
const importBtn = document.getElementById("importBtn");

function drawExpenseChart() {
  const canvas = document.getElementById("expenseChart");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#203c6f";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 6; i += 1) {
    const y = (h / 6) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const min = Math.min(...monthlySeries) - 2000;
  const max = Math.max(...monthlySeries) + 2000;
  const stepX = w / (monthlySeries.length - 1);

  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#33d4ff";
  monthlySeries.forEach((value, i) => {
    const x = i * stepX;
    const y = h - ((value - min) / (max - min)) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function drawCategoryChart() {
  const canvas = document.getElementById("categoryChart");
  const ctx = canvas.getContext("2d");
  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  const colors = ["#33d4ff", "#7d74ff", "#49e5a9", "#ff9b54", "#ff6387", "#9aa8ca"];

  let start = -Math.PI / 2;
  Object.entries(categories).forEach(([name, value], i) => {
    const angle = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(175, 130);
    ctx.fillStyle = colors[i % colors.length];
    ctx.arc(175, 130, 100, start, start + angle);
    ctx.fill();
    start += angle;

    ctx.fillStyle = "#d7e4ff";
    ctx.font = "12px Inter";
    ctx.fillText(`${name} ${value}%`, 12, 20 + i * 20);
  });
}

function generateAiSummary() {
  const averageSpend = Math.round(monthlySeries.reduce((a, b) => a + b, 0) / monthlySeries.length);
  const currentSpend = monthlySeries[monthlySeries.length - 1];
  const diff = averageSpend - currentSpend;

  summaryText.textContent =
    `Local AI summary: Spending trend is cooling. Current month is ₹${currentSpend.toLocaleString()} vs yearly avg ₹${averageSpend.toLocaleString()}. ` +
    `Projected savings if trend continues: ₹${Math.max(diff, 0).toLocaleString()} over next month.`;

  const suggestions = [
    "Pause 2 low-use subscriptions to save ~₹1,800/month.",
    "Dining spikes happen on weekends. Set a ₹2,500 weekend cap.",
    "Move ₹6,000 to emergency fund on salary day automation.",
    "Your utility bills are stable; negotiate internet plan for extra savings.",
  ];

  insightList.innerHTML = suggestions.map((s) => `<li>${s}</li>`).join("");
}

function aiReply(userText) {
  const input = userText.toLowerCase();
  if (input.includes("budget")) {
    return "Try the 50/30/20 split. For your profile: ₹31k needs, ₹18k wants, ₹13k savings.";
  }
  if (input.includes("save") || input.includes("savings")) {
    return "Largest savings pockets: subscriptions, food delivery, and ride surge windows.";
  }
  if (input.includes("risk") || input.includes("credit")) {
    return "Risk is low. Credit utilization under 30% and positive month-on-month net worth.";
  }
  return "I can summarize transactions, detect anomalies, and suggest ways to cut spend. Ask me anything specific.";
}

function appendMessage(message, klass) {
  const div = document.createElement("div");
  div.className = `msg ${klass}`;
  div.textContent = message;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

sendChat.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (!text) return;
  appendMessage(text, "user");
  chatInput.value = "";
  setTimeout(() => appendMessage(aiReply(text), "ai"), 250);
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChat.click();
});

summaryBtn.addEventListener("click", generateAiSummary);

scanBtn.addEventListener("click", () => {
  const hasFile = document.getElementById("billInput").files.length;
  scanStatus.textContent = hasFile
    ? "Bill scanned with OCR (demo). Extracted merchant, date, and amount for AI categorization."
    : "Please select a bill image or PDF first.";
});

importBtn.addEventListener("click", () => {
  const hasFile = document.getElementById("paytmInput").files.length;
  scanStatus.textContent = hasFile
    ? "Paytm file imported (demo). Transactions merged into expense tracker."
    : "Please select a Paytm export file first.";
});

drawExpenseChart();
drawCategoryChart();
generateAiSummary();
