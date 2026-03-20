document.addEventListener("DOMContentLoaded", () => {
  const transactions = [
    { merchant: "Swiggy", category: "Food", amount: 780 },
    { merchant: "Uber", category: "Transport", amount: 340 },
    { merchant: "Zepto", category: "Essentials", amount: 1450 },
    { merchant: "Netflix", category: "Entertainment", amount: 649 },
    { merchant: "SIP", category: "Savings", amount: 8000 },
  ];

  const invoices = [];

  const refs = {
    summaryBtn: document.getElementById("generateSummary"),
    summaryText: document.getElementById("summaryText"),
    insightList: document.getElementById("insightList"),
    chatInput: document.getElementById("chatInput"),
    chatLog: document.getElementById("chatLog"),
    sendChat: document.getElementById("sendChat"),
    scanStatus: document.getElementById("scanStatus"),
    scanBtn: document.getElementById("scanBtn"),
    importBtn: document.getElementById("importBtn"),
    netWorth: document.getElementById("netWorth"),
    monthlySpend: document.getElementById("monthlySpend"),
    savingsOpp: document.getElementById("savingsOpp"),
    txnCount: document.getElementById("txnCount"),
    txnList: document.getElementById("txnList"),
    txnStatus: document.getElementById("txnStatus"),
    addTxn: document.getElementById("addTxn"),
    txnMerchant: document.getElementById("txnMerchant"),
    txnAmount: document.getElementById("txnAmount"),
    txnCategory: document.getElementById("txnCategory"),
    biometricBtn: document.getElementById("biometricBtn"),
    notifyBtn: document.getElementById("notifyBtn"),
    authStatus: document.getElementById("authStatus"),
    logoutBtn: document.getElementById("logoutBtn"),
    addInvoice: document.getElementById("addInvoice"),
    invoiceVendor: document.getElementById("invoiceVendor"),
    invoiceBase: document.getElementById("invoiceBase"),
    gstRate: document.getElementById("gstRate"),
    gstSummary: document.getElementById("gstSummary"),
    invoiceList: document.getElementById("invoiceList"),
  };

  function categoryTotals() {
    return transactions.reduce((acc, txn) => {
      acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      return acc;
    }, {});
  }

  function monthlySeries() {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    return Array.from({ length: 12 }, (_, i) => Math.max(1000, Math.round(total * (0.6 + i * 0.045))));
  }

  function drawExpenseChart() {
    const series = monthlySeries();
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

    const min = Math.min(...series) - 500;
    const max = Math.max(...series) + 500;
    const stepX = w / (series.length - 1);

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#33d4ff";
    series.forEach((value, i) => {
      const x = i * stepX;
      const y = h - ((value - min) / (max - min)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function drawCategoryChart() {
    const totals = categoryTotals();
    const canvas = document.getElementById("categoryChart");
    const ctx = canvas.getContext("2d");
    const entries = Object.entries(totals);
    const total = entries.reduce((a, [, v]) => a + v, 0) || 1;
    const colors = ["#33d4ff", "#7d74ff", "#49e5a9", "#ff9b54", "#ff6387", "#9aa8ca"];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let start = -Math.PI / 2;
    entries.forEach(([name, value], i) => {
      const angle = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(175, 130);
      ctx.fillStyle = colors[i % colors.length];
      ctx.arc(175, 130, 100, start, start + angle);
      ctx.fill();
      start += angle;

      ctx.fillStyle = "#d7e4ff";
      ctx.font = "12px Inter";
      ctx.fillText(`${name} ${Math.round((value / total) * 100)}%`, 12, 20 + i * 20);
    });
  }

  function updateMetrics() {
    const spend = transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const gstPaid = invoices.reduce((sum, i) => sum + i.gstAmount, 0);
    const savings = (categoryTotals().Savings || 0) + Math.round(spend * 0.05);
    const netWorth = 1248900 - spend - gstPaid + savings;

    refs.monthlySpend.textContent = `₹${spend.toLocaleString()}`;
    refs.savingsOpp.textContent = `₹${(savings + Math.round(gstPaid * 0.2)).toLocaleString()}`;
    refs.netWorth.textContent = `₹${netWorth.toLocaleString()}`;
    refs.txnCount.textContent = String(transactions.length);
  }

  function renderTransactions() {
    refs.txnList.innerHTML = transactions
      .slice()
      .reverse()
      .map(
        (txn) =>
          `<div class="txn-item"><span>${txn.merchant} <small>(${txn.category})</small></span><strong>₹${txn.amount.toLocaleString()}</strong></div>`,
      )
      .join("");
  }

  function renderInvoices() {
    refs.invoiceList.innerHTML = invoices
      .slice()
      .reverse()
      .map(
        (inv) =>
          `<div class="txn-item"><span>${inv.vendor} <span class="gst-pill">GST ${inv.rate}%</span></span><strong>₹${inv.total.toFixed(
            2,
          )}</strong></div>`,
      )
      .join("");

    const gstTotal = invoices.reduce((sum, i) => sum + i.gstAmount, 0);
    refs.gstSummary.textContent =
      invoices.length > 0
        ? `Invoices: ${invoices.length} • Total GST: ₹${gstTotal.toFixed(2)} • Grand total: ₹${invoices
            .reduce((s, i) => s + i.total, 0)
            .toFixed(2)}`
        : "No invoice added yet.";
  }

  function generateAiSummary() {
    const spend = transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const byCat = categoryTotals();
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    const gstTotal = invoices.reduce((sum, i) => sum + i.gstAmount, 0);

    refs.summaryText.textContent = `You logged ${transactions.length} transactions totaling ₹${spend.toLocaleString()}. Top category: ${
      top?.[0] || "N/A"
    }. GST tracked: ₹${gstTotal.toFixed(2)}.`;

    const suggestions = [
      `Trim ${top?.[0] || "non-essential"} by 10% to save roughly ₹${Math.round((top?.[1] || 0) * 0.1).toLocaleString()}.`,
      "Route repeat invoices to one payment day for better cashflow control.",
      "Use open models only: Llama 3.1 + Mistral + Tesseract OCR (no Anthropic).",
    ];

    refs.insightList.innerHTML = suggestions.map((s) => `<li>${s}</li>`).join("");
  }

  function aiReply(userText) {
    const input = userText.toLowerCase();
    if (input.includes("budget")) return "Use 50/30/20 and cap wants at 30% of income.";
    if (input.includes("save")) return "Best savings now: reduce Food + Entertainment by 8-12%.";
    if (input.includes("gst")) return "GST center tracks 5/12/18/28% invoices and cumulative tax outflow.";
    if (input.includes("model")) return "Use free models only: Llama 3.1, Mistral, Qwen, Phi, Tesseract OCR.";
    return "Ask about budget, savings, GST, category analysis, or monthly trend.";
  }

  function appendMessage(message, klass) {
    const div = document.createElement("div");
    div.className = `msg ${klass}`;
    div.textContent = message;
    refs.chatLog.appendChild(div);
    refs.chatLog.scrollTop = refs.chatLog.scrollHeight;
  }

  refs.sendChat.addEventListener("click", () => {
    const text = refs.chatInput.value.trim();
    if (!text) return;
    appendMessage(text, "user");
    refs.chatInput.value = "";
    setTimeout(() => appendMessage(aiReply(text), "ai"), 200);
  });

  refs.chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") refs.sendChat.click();
  });

  refs.logoutBtn.addEventListener("click", () => {
    appendMessage("You have been logged out from this demo session.", "ai");
    refs.authStatus.textContent = "Logged out (demo).";
  });

  refs.biometricBtn.addEventListener("click", async () => {
    if (!window.PublicKeyCredential) {
      refs.authStatus.textContent = "Biometric/WebAuthn not supported on this device/browser.";
      return;
    }

    refs.authStatus.textContent = "Biometric capability detected. Ready for secure WebAuthn integration.";
  });

  refs.notifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      refs.authStatus.textContent = "Notifications are not supported in this browser.";
      return;
    }

    const permission = await Notification.requestPermission();
    refs.authStatus.textContent = `Notification permission: ${permission}.`;

    if (permission === "granted") {
      new Notification("PulseFi", { body: "Phone notifications enabled for bills and spending alerts." });
    }
  });

  refs.summaryBtn.addEventListener("click", generateAiSummary);

  refs.scanBtn.addEventListener("click", () => {
    const hasFile = document.getElementById("billInput").files.length;
    refs.scanStatus.textContent = hasFile
      ? "Bill scanned (demo): merchant/date/amount/GST candidate extracted."
      : "Please select a bill image or PDF first.";
  });

  refs.importBtn.addEventListener("click", async () => {
    const input = document.getElementById("paytmInput");
    if (!input.files.length) {
      refs.scanStatus.textContent = "Please select a Paytm CSV or JSON file first.";
      return;
    }

    const file = input.files[0];
    const text = await file.text();
    let imported = 0;

    if (file.name.endsWith(".json")) {
      try {
        const rows = JSON.parse(text);
        rows.slice(0, 20).forEach((r) => {
          const amount = Number(r.amount || r.Amount || 0);
          if (!amount) return;
          transactions.push({
            merchant: r.merchant || r.note || "Paytm",
            category: r.category || "Other",
            amount: Math.abs(Math.round(amount)),
          });
          imported += 1;
        });
      } catch {
        refs.scanStatus.textContent = "Invalid JSON format.";
        return;
      }
    } else {
      const lines = text.split(/\r?\n/).filter(Boolean);
      lines.slice(1, 21).forEach((line) => {
        const cols = line.split(",");
        const amount = Number(cols[2]);
        if (!Number.isFinite(amount)) return;
        transactions.push({ merchant: cols[0] || "Paytm", category: cols[1] || "Other", amount: Math.abs(Math.round(amount)) });
        imported += 1;
      });
    }

    refs.scanStatus.textContent = `Imported ${imported} Paytm transactions.`;
    refreshAll();
  });

  refs.addTxn.addEventListener("click", () => {
    const merchant = refs.txnMerchant.value.trim();
    const amount = Math.round(Number(refs.txnAmount.value));
    const category = refs.txnCategory.value;

    if (!merchant || !Number.isFinite(amount) || amount <= 0) {
      refs.txnStatus.textContent = "Enter valid merchant and amount.";
      return;
    }

    transactions.push({ merchant, amount, category });
    refs.txnMerchant.value = "";
    refs.txnAmount.value = "";
    refs.txnStatus.textContent = `${merchant} added successfully.`;
    refreshAll();
  });

  refs.addInvoice.addEventListener("click", () => {
    const vendor = refs.invoiceVendor.value.trim();
    const base = Number(refs.invoiceBase.value);
    const rate = Number(refs.gstRate.value);

    if (!vendor || !Number.isFinite(base) || base <= 0) {
      refs.gstSummary.textContent = "Enter a valid vendor and invoice amount.";
      return;
    }

    const gstAmount = (base * rate) / 100;
    const total = base + gstAmount;
    invoices.push({ vendor, base, rate, gstAmount, total });
    refs.invoiceVendor.value = "";
    refs.invoiceBase.value = "";
    refreshAll();
  });

  function refreshAll() {
    updateMetrics();
    renderTransactions();
    renderInvoices();
    drawExpenseChart();
    drawCategoryChart();
    generateAiSummary();
  }

  window.addEventListener("resize", () => {
    drawExpenseChart();
    drawCategoryChart();
  });

  refreshAll();
});
