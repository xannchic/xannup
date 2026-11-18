
document.addEventListener("DOMContentLoaded", () => {
  const core = window.XannUP;

  if (!core) {
    console.error("XannUP Core не найден");
    return;
  }

  const VIP_LEVELS = [
    { name: "Новичок", rate: 0.15, progress: 0 },
    { name: "Bronze", rate: 0.3, progress: 50000 },
    { name: "Silver", rate: 0.5, progress: 100000 },
    { name: "Gold", rate: 0.75, progress: 500000 },
    { name: "Platinum", rate: 1, progress: 1500000 },
    { name: "Diamond", rate: 1.25, progress: 5000000 },
    { name: "Elite", rate: 1.5, progress: 10000000 }
  ];

  const $ = id => document.getElementById(id);

  const formatNumber = number =>
    new Intl.NumberFormat("ru-RU").format(
      Math.max(0, Number(number) || 0)
    );

  function getProfile() {
    return core.getProfile() || {};
  }

  function getProgress() {
    const profile = getProfile();
    return Math.max(0, Number(profile.experience) || 0);
  }

  function getCurrentLevel(progress) {
    let current = VIP_LEVELS[0];

    for (const level of VIP_LEVELS) {
      if (progress >= level.progress) {
        current = level;
      }
    }

    return current;
  }

  function updateBalance() {
    const balance = $("balance");

    if (balance) {
      balance.textContent = formatNumber(core.getPoints());
    }
  }

  function updateVIP() {
    const progress = getProgress();
    const current = getCurrentLevel(progress);

    if ($("vipLevel")) {
      $("vipLevel").textContent = current.name.toUpperCase();
    }

    if ($("vipRate")) {
      $("vipRate").textContent =
        current.rate.toString().replace(".", ",") + "%";
    }

    if ($("vipDescription")) {
      const nextIndex = VIP_LEVELS.indexOf(current) + 1;

      if (nextIndex < VIP_LEVELS.length) {
        const next = VIP_LEVELS[nextIndex];
        $("vipDescription").textContent =
          "Следующий уровень: " + next.name;
      } else {
        $("vipDescription").textContent =
          "Максимальный VIP-уровень";
      }
    }

    document.querySelectorAll(".level-card").forEach((card, index) => {
      const level = VIP_LEVELS[index];

      if (!level) return;

      card.classList.toggle(
        "unlocked",
        progress >= level.progress
      );

      card.classList.toggle(
        "current",
        level.name === current.name
      );
    });
  }

  // Индивидуальный демонстрационный код для текущего браузера.
  // Для настоящих аккаунтов и общих списков приглашённых
  // понадобится серверная регистрация.
  function getReferralCode() {
    const storageKey = "xannup_referral_code_v1";
    let code = localStorage.getItem(storageKey);

    if (!code) {
      const randomPart = Math.random()
        .toString(36)
        .slice(2, 9)
        .toUpperCase();

      code = "XU" + randomPart;
      localStorage.setItem(storageKey, code);
    }

    return code;
  }

  function getReferralLink() {
    const code = getReferralCode();
    const base = new URL("../index.html", window.location.href);

    base.searchParams.set("ref", code);

    return base.href;
  }

  function updateReferral() {
    const link = getReferralLink();

    if ($("refLink")) {
      $("refLink").textContent = link;
    }

    // Пока серверная база не подключена,
    // не показываем вымышленных приглашённых.
    const referrals = [];

    if ($("refCount")) {
      $("refCount").textContent = referrals.length;
    }

    if ($("refPoints")) {
      $("refPoints").textContent = "0";
    }

    if ($("refUsers")) {
      $("refUsers").innerHTML =
        '<p class="muted">Приглашённые появятся после подключения общей регистрации.</p>';
    }
  }

  function setupCopyButton() {
    const button = $("copyRef");

    if (!button) return;

    button.addEventListener("click", async () => {
      const link = getReferralLink();

      try {
        await navigator.clipboard.writeText(link);

        if ($("copyMessage")) {
          $("copyMessage").textContent =
            "Ссылка скопирована!";
        }
      } catch (error) {
        if ($("copyMessage")) {
          $("copyMessage").textContent =
            "Не удалось скопировать. Выдели ссылку вручную.";
        }
      }
    });
  }

  function updateBonusHistory() {
    const historyContainer = $("bonusHistory");

    if (!historyContainer) return;

    const history = core.getHistory() || [];

    const bonusEntries = history.filter(item => {
      const text = String(
        item.description || item.reason || item.type || ""
      ).toLowerCase();

      return (
        text.includes("бонус") ||
        text.includes("кешбэк") ||
        text.includes("кэшбэк") ||
        text.includes("рейкбек") ||
        text.includes("реферал")
      );
    }).slice(0, 10);

    if (bonusEntries.length === 0) {
      historyContainer.innerHTML =
        '<p class="muted">Начислений пока нет.</p>';
      return;
    }

    historyContainer.innerHTML = "";

    bonusEntries.forEach(item => {
      const row = document.createElement("div");
      row.className = "history-row";

      const title = document.createElement("span");
      title.textContent =
        item.description || item.reason || item.type || "Бонус";

      const amount = document.createElement("b");
      amount.textContent =
        "+" + formatNumber(item.amount || item.points || 0) + " очков";

      row.append(title, amount);
      historyContainer.appendChild(row);
    });
  }

  function updateAll() {
    updateBalance();
    updateVIP();
    updateReferral();
    updateBonusHistory();
  }

  setupCopyButton();
  updateAll();

  window.addEventListener("xannup:update", updateAll);
});
