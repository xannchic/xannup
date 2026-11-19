
"use strict";

/* ==================================
   XANNUP — ОСНОВНОЙ СКРИПТ
================================== */

document.addEventListener("DOMContentLoaded", () => {

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const tg = window.Telegram?.WebApp;

  const state = {
    page: "games",
    currency: "RUB",
    balanceStars: 0,
    exchangeRate: 1.10,
    user: null,
    liveEvents: []
  };

  /* ==================================
     TELEGRAM
  ================================== */

  function initTelegram() {
    if (!tg) return;

    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;

    if (!user) return;

    state.user = user;

    const fullName = [
      user.first_name,
      user.last_name
    ].filter(Boolean).join(" ");

    const username = user.username
      ? "@" + user.username
      : "Telegram";

    const avatar = user.photo_url || "";

    $("#profileName").textContent = fullName || "Игрок XannUP";
    $("#profileUsername").textContent = username;

    if (avatar) {
      $("#telegramAvatar").src = avatar;
      $("#profileAvatar").src = avatar;
    }

    $("#profileButton").setAttribute(
      "aria-label",
      "Профиль " + (fullName || username)
    );
  }

  /* ==================================
     НАВИГАЦИЯ
  ================================== */

  function showPage(pageName) {
    const page = document.querySelector(
      `[data-page="${pageName}"]`
    );

    if (!page) return;

    state.page = pageName;

    $$(".page").forEach((element) => {
      const active = element.dataset.page === pageName;

      element.hidden = !active;
      element.classList.toggle("active", active);
    });

    $$(".nav-item").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.nav === pageName
      );
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  $$("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      showPage(button.dataset.nav);
    });
  });

  $$("[data-back-to-games]").forEach((button) => {
    button.addEventListener("click", () => {
      showPage("games");
    });
  });

  $("#openLiveButton").addEventListener("click", () => {
    showPage("live");
  });

  $("#profileButton").addEventListener("click", () => {
    showPage("profile");
  });

  /* ==================================
     ДЕМО-БАЛАНС
     1 STAR = 1.10 RUB
  ================================== */

  function formatNumber(value) {
    return Number(value).toFixed(2)
      .replace(/\.00$/, "");
  }

  function getBalanceText() {
    if (state.currency === "STARS") {
      return formatNumber(state.balanceStars) + " ⭐";
    }

    return formatNumber(
      state.balanceStars * state.exchangeRate
    ) + " ₽";
  }

  function updateBalance() {
    const text = getBalanceText();

    $("#balanceValue").textContent = text;
    $("#walletBalance").textContent = text;
  }

  function toggleCurrency() {
    state.currency =
      state.currency === "RUB" ? "STARS" : "RUB";

    updateBalance();

    const button = $("#currencyToggle");

    button.textContent =
      state.currency === "RUB"
        ? "Показать в ⭐"
        : "Показать в ₽";
  }

  $("#balanceButton").addEventListener("click", () => {
    showPage("wallet");
  });

  $("#openWalletButton").addEventListener("click", () => {
    showPage("wallet");
  });

  $("#currencyToggle").addEventListener(
    "click",
    toggleCurrency
  );

  /* ==================================
     ДЕМО-КНОПКИ КОШЕЛЬКА
  ================================== */

  $("#demoTopUpButton").addEventListener("click", () => {
    showNotice(
      "Демо-режим",
      "Пополнение пока не подключено. Реальные платежи не выполняются."
    );
  });

  $("#withdrawButton").addEventListener("click", () => {
    showNotice(
      "Вывод",
      "Раздел пока пустой. Функция вывода не подключена."
    );
  });

  /* ==================================
     УВЕДОМЛЕНИЯ
  ================================== */

  function showNotice(title, message) {
    if (tg?.showPopup) {
      tg.showPopup({
        title,
        message,
        buttons: [
          {
            type: "ok",
            text: "Понятно"
          }
        ]
      });

      return;
    }

    alert(title + "\n\n" + message);
  }

  /* ==================================
     ИГРЫ
  ================================== */

  const gameNames = {
    cow: "Коровка",
    mines: "Мины",
    blackjack: "Blackjack",
    upgrader: "Upgrader"
  };

  $$("[data-game]").forEach((button) => {
    button.addEventListener("click", () => {
      const game = button.dataset.game;
      const name = gameNames[game];

      if (!name) return;

      showNotice(
        name,
        "Игровая страница будет подключена следующим этапом."
      );
    });
  });

  /* ==================================
     LIVE — ЛЕНТА СОБЫТИЙ
  ================================== */

  function renderLive() {
    const feed = $("#liveFeed");

    if (!state.liveEvents.length) {
      feed.innerHTML = `
        <div class="empty-state">
          <span class="empty-state-icon">⚡</span>
          <h2>Лента событий</h2>
          <p>Здесь будут появляться события из игр.</p>
        </div>
      `;

      return;
    }

    feed.innerHTML = state.liveEvents.map((event) => `
      <article class="live-event">
        <div class="live-event-avatar">
          ${escapeHTML(event.avatar)}
        </div>
        <div class="live-event-info">
          <strong>${escapeHTML(event.name)}</strong>
          <span>${escapeHTML(event.description)}</span>
        </div>
        <span class="live-event-game">
          ${escapeHTML(event.game)}
        </span>
      </article>
    `).join("");
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[char];
    });
  }

  /*
    События будут поступать сюда после подключения сервера.
    Пока лента не показывает выдуманную активность.
  */

  renderLive();

  /* ==================================
     ЗАПУСК
  ================================== */

  initTelegram();
  updateBalance();
  showPage("games");

});
