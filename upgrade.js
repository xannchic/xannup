
const catalog = {
  cs2: [
    {id:"c1",name:"USP-S | Ночной узор",icon:"🔫",type:"Пистолеты",rarity:"common",rarityName:"Обычный"},
    {id:"c2",name:"Glock | Синий след",icon:"🔫",type:"Пистолеты",rarity:"blue",rarityName:"Редкий"},
    {id:"c3",name:"AK-47 | Синий контур",icon:"⚔️",type:"Винтовки",rarity:"blue",rarityName:"Редкий"},
    {id:"c4",name:"M4A1-S | Ледяной ветер",icon:"⚔️",type:"Винтовки",rarity:"purple",rarityName:"Эпический"},
    {id:"c5",name:"AWP | Полярная ночь",icon:"🎯",type:"Снайперские",rarity:"pink",rarityName:"Особый"},
    {id:"c6",name:"Нож | Сапфировый",icon:"🔪",type:"Ножи",rarity:"gold",rarityName:"Легендарный"},
    {id:"c7",name:"Нож | Северное сияние",icon:"🔪",type:"Ножи",rarity:"gold",rarityName:"Легендарный"},
    {id:"c8",name:"Перчатки | Арктика",icon:"🧤",type:"Перчатки",rarity:"pink",rarityName:"Особый"}
  ],
  gifts: [
    {id:"g1",name:"Мишка",icon:"🧸",type:"Подарки",rarity:"common",rarityName:"Обычный"},
    {id:"g2",name:"Ракета",icon:"🚀",type:"Подарки",rarity:"blue",rarityName:"Редкий"},
    {id:"g3",name:"Кристалл",icon:"💎",type:"Коллекционные",rarity:"purple",rarityName:"Эпический"},
    {id:"g4",name:"Лунный кот",icon:"🐈",type:"Коллекционные",rarity:"pink",rarityName:"Особый"},
    {id:"g5",name:"Золотая корона",icon:"👑",type:"Коллекционные",rarity:"gold",rarityName:"Легендарный"},
    {id:"g6",name:"Звёздный кубок",icon:"🏆",type:"Коллекционные",rarity:"gold",rarityName:"Легендарный"},
    {id:"g7",name:"Сияющее сердце",icon:"💠",type:"Подарки",rarity:"purple",rarityName:"Эпический"},
    {id:"g8",name:"Космический шар",icon:"🌌",type:"NFT-каталог",rarity:"pink",rarityName:"Особый"}
  ]
};

const STORAGE_KEY = "xannup_upgrade_inventory_v2";
const initialInventory = {
  cs2: ["c1","c2","c3"],
  gifts: ["g1","g2","g3"]
};

let category = "cs2";
let mode = "source";
let filter = "Все";
let source = null;
let target = null;
let spinning = false;
let inventory = loadInventory();

function loadInventory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.cs2) && Array.isArray(saved.gifts)) {
      return saved;
    }
  } catch (e) {
    console.warn("Коллекция не загружена", e);
  }
  return {
    cs2: [...initialInventory.cs2],
    gifts: [...initialInventory.gifts]
  };
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

function findItem(id) {
  return [...catalog.cs2, ...catalog.gifts].find(item => item.id === id);
}

function currentItems() {
  return catalog[category];
}

function updateHeader() {
  document.querySelectorAll(".category").forEach(button => {
    button.classList.toggle("active", button.dataset.category === category);
  });

  document.getElementById("wheelCategory").textContent =
    category === "cs2" ? "CS2" : "ПОДАРКИ";

  document.getElementById("inventoryTotal").textContent =
    inventory.cs2.length + inventory.gifts.length;
}

function updateSelection() {
  document.getElementById("sourceIcon").textContent = source ? source.icon : "?";
  document.getElementById("sourceName").textContent = source ? source.name : "Выбрать";
  document.getElementById("targetIcon").textContent = target ? target.icon : "?";
  document.getElementById("targetName").textContent = target ? target.name : "Выбрать";

  document.getElementById("upgradeButton").disabled =
    !source || !target || spinning;

  document.getElementById("message").textContent =
    source && target
      ? "Выбраны оба предмета. Можно запускать демонстрацию."
      : "Выбери свой предмет и желаемый предмет.";

  document.querySelectorAll(".mode").forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

function renderFilters() {
  const filters = ["Все", ...new Set(currentItems().map(item => item.type))];
  const root = document.getElementById("filters");

  if (!filters.includes(filter)) filter = "Все";
  root.innerHTML = "";

  filters.forEach(name => {
    const button = document.createElement("button");
    button.className = "filter" + (name === filter ? " active" : "");
    button.textContent = name;
    button.addEventListener("click", () => {
      filter = name;
      renderFilters();
      renderCatalog();
    });
    root.appendChild(button);
  });
}

function renderCatalog() {
  const root = document.getElementById("itemsGrid");
  const items = currentItems().filter(item =>
    filter === "Все" || item.type === filter
  );

  document.getElementById("itemCount").textContent =
    items.length + " предметов";

  root.innerHTML = "";

  if (!items.length) {
    root.innerHTML = '<div class="empty">Предметы не найдены.</div>';
    return;
  }

  items.forEach(item => {
    const button = document.createElement("button");
    button.className = `item-card rarity-${item.rarity}`;

    const isSelected =
      mode === "source"
        ? source?.id === item.id
        : target?.id === item.id;

    if (isSelected) button.classList.add("selected");

    button.innerHTML = `
      <span class="item-icon">${item.icon}</span>
      <strong>${item.name}</strong>
      <small>${item.rarityName} · ${item.type}</small>
    `;

    button.addEventListener("click", () => chooseItem(item));
    root.appendChild(button);
  });
}

function chooseItem(item) {
  if (spinning) return;

  if (mode === "source") {
    if (!inventory[category].includes(item.id)) {
      inventory[category].push(item.id);
      saveInventory();
    }
    source = item;
  } else {
    if (source?.id === item.id) {
      document.getElementById("message").textContent =
        "Выбери другой предмет в качестве цели.";
      return;
    }
    target = item;
  }

  document.getElementById("resultText").textContent = "Ожидает запуска";
  updateSelection();
  renderCatalog();
  renderInventory();
}

function renderInventory() {
  const root = document.getElementById("inventoryGrid");
  const items = inventory[category].map(findItem).filter(Boolean);

  document.getElementById("myItemCount").textContent =
    items.length + " предметов";

  root.innerHTML = "";

  if (!items.length) {
    root.innerHTML = '<div class="empty">Коллекция пока пуста.</div>';
    return;
  }

  items.forEach(item => {
    const button = document.createElement("button");
    button.className = `inventory-card rarity-${item.rarity}`;
    button.innerHTML = `
      <span class="item-icon">${item.icon}</span>
      <span>
        <strong>${item.name}</strong>
        <small>${item.rarityName}</small>
      </span>
    `;

    button.addEventListener("click", () => {
      mode = "source";
      source = item;
      updateSelection();
      renderCatalog();
    });

    root.appendChild(button);
  });
}

function makeWheelCard(item) {
  const card = document.createElement("div");
  card.className = `wheel-card rarity-${item.rarity}`;
  card.innerHTML = `
    <span class="item-icon">${item.icon}</span>
    <small>${item.name}</small>
  `;
  return card;
}

function spinWheel() {
  if (spinning || !source || !target) return;

  if (source.id === target.id) {
    document.getElementById("message").textContent =
      "Выбери разные предметы.";
    return;
  }

  spinning = true;
  updateSelection();

  const wheel = document.getElementById("wheel");
  const track = document.getElementById("wheelTrack");
  const windowBox = wheel.querySelector(".wheel-window");
  const button = document.getElementById("upgradeButton");

  track.innerHTML = "";

  const winningIndex = 24;
  const items = currentItems();

  for (let i = 0; i < 32; i++) {
    const item = i === winningIndex
      ? target
      : items[(i * 5 + 1) % items.length];

    track.appendChild(makeWheelCard(item));
  }

  track.style.transition = "none";
  track.style.transform = "translateX(0)";
  wheel.classList.add("spinning");
  button.querySelector("span:first-child").textContent = "КОЛЕСО КРУТИТСЯ...";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const card = track.children[winningIndex];
      const center = windowBox.getBoundingClientRect().left +
        windowBox.clientWidth / 2;
      const cardCenter = card.getBoundingClientRect().left +
        card.getBoundingClientRect().width / 2;

      const distance = cardCenter - center;

      track.style.transition = "transform 4.5s cubic-bezier(.08,.75,.12,1)";
      track.style.transform = `translateX(${-distance}px)`;
    });
  });

  window.setTimeout(() => {
    spinning = false;
    wheel.classList.remove("spinning");

    if (!inventory[category].includes(target.id)) {
      inventory[category].push(target.id);
      saveInventory();
    }

    document.getElementById("resultText").textContent =
      target.icon + " " + target.name;

    document.getElementById("message").textContent =
      "Демонстрация завершена. Предмет добавлен в виртуальную коллекцию.";

    button.querySelector("span:first-child").textContent =
      "ЗАПУСТИТЬ ЕЩЁ РАЗ";

    renderInventory();
    updateHeader();
    updateSelection();
  }, 4700);
}

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    if (spinning) return;

    category = button.dataset.category;
    source = null;
    target = null;
    filter = "Все";

    updateHeader();
    updateSelection();
    renderFilters();
    renderCatalog();
    renderInventory();

    document.getElementById("resultText").textContent =
      "Ожидает запуска";
  });
});

document.querySelectorAll(".mode").forEach(button => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    updateSelection();
    renderCatalog();
  });
});

document.getElementById("sourceSelect").addEventListener("click", () => {
  mode = "source";
  updateSelection();
  renderCatalog();
  document.getElementById("itemsGrid").scrollIntoView({behavior:"smooth"});
});

document.getElementById("targetSelect").addEventListener("click", () => {
  mode = "target";
  updateSelection();
  renderCatalog();
  document.getElementById("itemsGrid").scrollIntoView({behavior:"smooth"});
});

document.getElementById("upgradeButton").addEventListener("click", spinWheel);

updateHeader();
updateSelection();
renderFilters();
renderCatalog();
renderInventory();
