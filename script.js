
document.addEventListener("DOMContentLoaded", () => {
  const core = window.XannUP;

  if (!core) {
    console.error("XannUP Core не загружен!");
    return;
  }

  const balanceValue = document.getElementById("balanceValue");
  const currencyButtons = document.querySelectorAll(".currency-button");

  // BALANCE

  function updateBalance() {
    if (balanceValue) {
      balanceValue.textContent = core.getPoints().toLocaleString("ru-RU");
    }
  }

  // DISPLAY MODE

  function updateCurrency() {
    const currency = core.getCurrency();

    currencyButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.currency === currency
      );
    });
  }

  currencyButtons.forEach(button => {
    button.addEventListener("click", () => {
      const currency = button.dataset.currency;

      core.setCurrency(currency);
      updateCurrency();
      updateBalance();
    });
  });

  // DEMO POINTS

  const topUpButton = document.getElementById("topUpButton");

  if (topUpButton) {
    topUpButton.addEventListener("click", () => {
      alert(
        "Демонстрационный кошелёк XannUP.\n\n" +
        "Реальные пополнения недоступны."
      );
    });
  }

  // WALLET

  const walletButton = document.getElementById("walletButton");

  if (walletButton) {
    walletButton.addEventListener("click", () => {
      window.location.href = "wallet/wallet.html";
    });
  }

  // PROFILE

  const profileButton = document.getElementById("profileButton");

  if (profileButton) {
    profileButton.addEventListener("click", () => {
      window.location.href = "profile/profile.html";
    });
  }

  // NAVIGATION

  const gamesNav = document.getElementById("gamesNav");
  const casesNav = document.getElementById("casesNav");

  if (gamesNav) {
    gamesNav.addEventListener("click", event => {
      event.preventDefault();

      document.querySelector(".games-section")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (casesNav) {
    casesNav.addEventListener("click", event => {
      event.preventDefault();

      document.querySelector(".cases-section")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // LIVE UPDATES

  window.addEventListener("xannup:update", () => {
    updateBalance();
    updateCurrency();
  });

  updateBalance();
  updateCurrency();

  console.log("XannUP Main loaded!");
});
