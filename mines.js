
document.addEventListener("DOMContentLoaded", () => {
    const core = window.XannUP;

    if (!core) {
        console.error("XannUP Core не загружен");
        return;
    }

    const $ = id => document.getElementById(id);

    const grid = $("minesGrid");
    const gridSize = $("gridSize");
    const mineCount = $("mineCount");
    const result = $("minesResult");

    let cells = [];
    let opened = 0;
    let active = false;
    let finished = false;
    let games = 0;
    let totalOpened = 0;

    function updateBalance() {
        $("minesBalance").textContent =
            core.getPoints().toLocaleString("ru-RU");

        $("minesXP").textContent =
            core.getProfile().experience || 0;

        const stats = core.getStatistics();

        $("minesGames").textContent =
            stats.minesGames || 0;

        $("minesOpened").textContent =
            stats.minesOpened || 0;

        $("minesAchievements").textContent =
            core.getAchievements().filter(id =>
                id.startsWith("mines_")
            ).length;
    }

    function showResult(message, type = "") {
        result.textContent = message;
        result.className = "mines-result";

        if (type) result.classList.add(type);
    }

    function updateMineOptions() {
        const size = Number(gridSize.value);
        const total = size * size;

        const previous = Number(mineCount.value);
        mineCount.innerHTML = "";

        const maxMines = total - 1;

        for (let i = 1; i <= maxMines; i++) {
            const option = document.createElement("option");

            option.value = i;
            option.textContent = `${i} ${i === 1 ? "мина" : "мин"}`;

            mineCount.appendChild(option);
        }

        mineCount.value = Math.min(previous, maxMines);
    }

    function createBoard() {
        const size = Number(gridSize.value);
        const total = size * size;

        grid.innerHTML = "";
        grid.style.gridTemplateColumns =
            `repeat(${size}, minmax(0, 1fr))`;

        cells = [];
        opened = 0;
        active = false;
        finished = false;

        for (let i = 0; i < total; i++) {
            const cell = document.createElement("button");

            cell.type = "button";
            cell.className = "mines-cell";
            cell.setAttribute("aria-label", `Клетка ${i + 1}`);
            cell.disabled = true;

            grid.appendChild(cell);
            cells.push({
                element: cell,
                mine: false,
                opened: false
            });
        }

        updateBalance();
    }

    function startGame() {
        if (active) return;

        const size = Number(gridSize.value);
        const total = size * size;
        const mines = Number(mineCount.value);

        if (mines < 1 || mines >= total) {
            showResult("Проверь количество мин.", "danger");
            return;
        }

        cells.forEach(cell => {
            cell.mine = false;
            cell.opened = false;
            cell.element.textContent = "";
            cell.element.className = "mines-cell";
            cell.element.disabled = false;
        });

        let placed = 0;

        while (placed < mines) {
            const index = Math.floor(Math.random() * total);

            if (!cells[index].mine) {
                cells[index].mine = true;
                placed++;
            }
        }

        opened = 0;
        active = true;
        finished = false;

        $("startGame").disabled = true;

        showResult("Игра началась. Открывай клетки!");
    }

    function finishGame(message, type) {
        if (finished) return;

        finished = true;
        active = false;

        cells.forEach(cell => {
            cell.element.disabled = true;
        });

        $("startGame").disabled = false;

        core.recordGame("Мины", {
            opened,
            outcome: type === "success" ? "completed" : "ended"
        });

        core.incrementStatistic("minesGames", 1);
        core.incrementStatistic("minesOpened", opened);

        // Оборот здесь не начисляется за проигрыши или ставки.
        // Учёт бесплатной активности будет подключён отдельно.

        if (opened >= 5) {
            core.unlockAchievement("mines_first_five");
        }

        if (type === "success") {
            core.unlockAchievement("mines_completed");
        }

        core.addExperience(5);

        showResult(message, type);
        updateBalance();
    }

    function openCell(index) {
        if (!active || finished) return;

        const cell = cells[index];

        if (!cell || cell.opened) return;

        cell.opened = true;
        cell.element.disabled = true;
        opened++;

        if (cell.mine) {
            cell.element.textContent = "✕";
            cell.element.classList.add("mine");

            finishGame("Раунд завершён. Попробуй ещё раз!", "danger");
            return;
        }

        cell.element.textContent = "✓";
        cell.element.classList.add("opened");

        if (opened === cells.length - Number(mineCount.value)) {
            finishGame(
                "Отлично! Все безопасные клетки открыты!",
                "success"
            );
        }
    }

    function resetGame() {
        active = false;
        finished = false;

        $("startGame").disabled = false;

        createBoard();

        showResult("Выбери параметры и начни новую игру.");
    }

    function setPreset(preset) {
        const presets = {
            easy: { size: 3, mines: 1 },
            medium: { size: 5, mines: 5 },
            hard: { size: 10, mines: 20 }
        };

        const settings = presets[preset];

        if (!settings) return;

        gridSize.value = settings.size;

        updateMineOptions();

        mineCount.value = settings.mines;

        document.querySelectorAll("[data-preset]").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.preset === preset
            );
        });

        resetGame();
    }

    $("startGame").addEventListener("click", startGame);
    $("resetGame").addEventListener("click", resetGame);

    gridSize.addEventListener("change", () => {
        updateMineOptions();
        resetGame();
    });

    mineCount.addEventListener("change", resetGame);

    grid.addEventListener("click", event => {
        const button = event.target.closest(".mines-cell");

        if (!button) return;

        const index = cells.findIndex(
            cell => cell.element === button
        );

        if (index !== -1) openCell(index);
    });

    document.querySelectorAll("[data-preset]").forEach(button => {
        button.addEventListener("click", () => {
            setPreset(button.dataset.preset);
        });
    });

    window.addEventListener("xannup:update", updateBalance);

    updateMineOptions();
    createBoard();
    updateBalance();
});
