const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor("#080d19");
    tg.setBackgroundColor("#080d19");

    const user = tg.initDataUnsafe?.user;

    if (user) {
        document.getElementById("username").textContent =
            user.first_name || "Пользователь";

        document.getElementById("userId").textContent =
            "Telegram ID: " + user.id;
    }
}

let currentPage = "home";
let previousPage = "home";

function openPage(page) {
    const target = document.getElementById(page);

    if (!target) return;

    previousPage = currentPage;
    currentPage = page;

    document.querySelectorAll(".page").forEach(element => {
        element.classList.remove("active");
    });

    target.classList.add("active");

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("active");
    });

    if (["home", "games", "vip", "profile"].includes(page)) {
        const index = {
            home: 0,
            games: 1,
            vip: 2,
            profile: 3
        }[page];

        document.querySelectorAll(".nav-button")[index]
            .classList.add("active");
    }

    window.scrollTo(0, 0);
}

function goBack() {
    openPage(previousPage);
}

const rules = {
    mines: {
        title: "Правила — Мины",
        text: "Здесь будут размещены правила игрового режима, описание поля и условий раунда."
    },

    upgrade: {
        title: "Правила — Апгрейд",
        text: "Здесь будут описаны коллекции предметов, характеристики и условия демонстрации улучшения."
    },

    blackjack: {
        title: "Правила — Блэкджек",
        text: "Здесь будут описаны правила карточной игры и порядок игрового раунда."
    },

    storm: {
        title: "Правила — Шторм",
        text: "Здесь будут описаны правила режима, ход раунда и значение отображаемых показателей."
    }
};

function showRules(game) {
    const data = rules[game];

    if (!data) return;

    document.getElementById("rulesTitle").textContent =
        data.title;

    document.getElementById("rulesText").textContent =
        data.text;

    document.getElementById("rulesModal").classList.add("show");
}

function closeRules() {
    document.getElementById("rulesModal").classList.remove("show");
}

document.getElementById("rulesModal").addEventListener(
    "click",
    function(event) {
        if (event.target === this) {
            closeRules();
        }
    }
);