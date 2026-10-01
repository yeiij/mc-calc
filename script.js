const defaults = {
  coinUsd: 0.07,
  coinAdena: 25000,
  millionUsd: 2.61,
  targetMillions: 1
};

const ids = Object.keys(defaults);
const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

const out = {
  status: document.getElementById("status"),
  coinsNeeded: document.getElementById("coinsNeeded"),
  coinsCost: document.getElementById("coinsCost"),
  adenaAmount: document.getElementById("adenaAmount"),
  adenaCost: document.getElementById("adenaCost"),
  winner: document.getElementById("winner"),
  savings: document.getElementById("savings"),
  coinCostPerMillion: document.getElementById("coinCostPerMillion"),
  differencePerMillion: document.getElementById("differencePerMillion"),
  breakEvenCoinUsd: document.getElementById("breakEvenCoinUsd"),
  breakEvenMillionUsd: document.getElementById("breakEvenMillionUsd")
};

const money = value =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value);

const number = (value, max = 2) =>
  new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: max
  }).format(value);

function readValues() {
  return Object.fromEntries(
    ids.map(id => [id, Number.parseFloat(els[id].value)])
  );
}

function clearClasses() {
  out.winner.classList.remove("good", "bad");
  out.savings.classList.remove("good", "bad");
}

function calculate() {
  const { coinUsd, coinAdena, millionUsd, targetMillions } = readValues();

  clearClasses();
  out.status.textContent = "";

  const values = [coinUsd, coinAdena, millionUsd, targetMillions];
  if (values.some(v => !Number.isFinite(v) || v <= 0)) {
    out.status.textContent = "Todos los valores deben ser mayores que 0.";
    return;
  }

  const targetAdena = targetMillions * 1_000_000;
  const coinsNeeded = targetAdena / coinAdena;
  const costViaCoins = coinsNeeded * coinUsd;
  const costViaAdena = targetMillions * millionUsd;

  const coinCostPerMillion = (1_000_000 / coinAdena) * coinUsd;
  const differencePerMillion = coinCostPerMillion - millionUsd;

  const breakEvenCoinUsd = millionUsd * (coinAdena / 1_000_000);
  const breakEvenMillionUsd = coinCostPerMillion;

  const diff = Math.abs(costViaCoins - costViaAdena);
  const cheaperBase = Math.max(costViaCoins, costViaAdena);
  const savingsPct = cheaperBase > 0 ? (diff / cheaperBase) * 100 : 0;

  out.coinsNeeded.textContent = `${number(coinsNeeded, 2)} Coins`;
  out.coinsCost.textContent = `Coste total: ${money(costViaCoins)}`;

  out.adenaAmount.textContent = `${number(targetMillions, 2)}M Adena`;
  out.adenaCost.textContent = `Coste total: ${money(costViaAdena)}`;

  if (Math.abs(costViaCoins - costViaAdena) < 0.000001) {
    out.winner.textContent = "Empate";
    out.savings.textContent = "Ambas opciones cuestan lo mismo.";
  } else if (costViaCoins < costViaAdena) {
    out.winner.textContent = "Comprar Coins";
    out.winner.classList.add("good");
    out.savings.textContent = `Ahorras ${money(diff)} (${number(savingsPct, 2)}%).`;
    out.savings.classList.add("good");
  } else {
    out.winner.textContent = "Comprar Adena";
    out.winner.classList.add("good");
    out.savings.textContent = `Ahorras ${money(diff)} (${number(savingsPct, 2)}%).`;
    out.savings.classList.add("good");
  }

  out.coinCostPerMillion.textContent = money(coinCostPerMillion);
  out.differencePerMillion.textContent =
    `${differencePerMillion >= 0 ? "+" : "−"}${money(Math.abs(differencePerMillion))}`;
  out.breakEvenCoinUsd.textContent = money(breakEvenCoinUsd);
  out.breakEvenMillionUsd.textContent = money(breakEvenMillionUsd);
}

ids.forEach(id => els[id].addEventListener("input", calculate));

document.getElementById("resetBtn").addEventListener("click", () => {
  Object.entries(defaults).forEach(([id, value]) => {
    els[id].value = value;
  });
  calculate();
});

calculate();
