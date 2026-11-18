
document.addEventListener("DOMContentLoaded", () => {
  const core = window.XannUP;

  if (!core) {
    console.error("XannUP Core не загружен");
    return;
  }

  const balance = document.getElementById("headerBalance");

  function updateBalance() {
    if (balance) {
      balance.textContent =
        core.getPoints().toLocaleString("ru-RU");
    }
  }

  updateBalance();

  window.addEventListener("xannup:update", updateBalance);

  console.log("XannUP Cases: раздел пока закрыт");
});
