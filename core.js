
(function () {
    "use strict";

    const STORAGE_KEY = "xannup_data_v3";

    function createDefaultData() {
        return {
            wallet: {
                points: 0
            },

            profile: {
                id: "XU-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
                username: "Игрок",
                avatar: "",
                level: 1,
                experience: 0,
                turnover: 0,
                gamesPlayed: 0,
                registrationDate: new Date().toISOString()
            },

            inventory: [],
            history: [],
            statistics: {
                gamesPlayed: 0,
                totalActivity: 0,
                itemsReceived: 0
            },

            achievements: [],
            settings: {}
        };
    }

    function getData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                const data = createDefaultData();
                save(data);
                return data;
            }

            const data = JSON.parse(saved);

            if (!data.wallet) data.wallet = { points: 0 };
            if (!data.profile) data.profile = {};
            if (!Array.isArray(data.inventory)) data.inventory = [];
            if (!Array.isArray(data.history)) data.history = [];
            if (!data.statistics) data.statistics = {};
            if (!Array.isArray(data.achievements)) data.achievements = [];
            if (!data.settings) data.settings = {};

            data.profile.turnover = Number(data.profile.turnover || 0);
            data.wallet.points = Number(data.wallet.points || 0);

            return data;
        } catch (error) {
            console.error("Ошибка чтения XannUP:", error);
            return createDefaultData();
        }
    }

    function save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            window.dispatchEvent(
                new CustomEvent("xannup:update")
            );

            return true;
        } catch (error) {
            console.error("Ошибка сохранения XannUP:", error);
            return false;
        }
    }

    function getPoints() {
        return Number(getData().wallet.points || 0);
    }

    function getWallet() {
        return getData().wallet;
    }

    function addPoints(amount, reason = "Бесплатное начисление") {
        amount = Number(amount);

        if (!Number.isFinite(amount) || amount <= 0) return false;

        const data = getData();

        data.wallet.points += amount;

        data.history.unshift({
            id: crypto.randomUUID(),
            type: "points_added",
            amount,
            reason,
            date: new Date().toISOString()
        });

        return save(data);
    }

    function spendPoints(amount, reason = "Демонстрационная покупка") {
        amount = Number(amount);

        if (!Number.isFinite(amount) || amount <= 0) return false;

        const data = getData();

        if (data.wallet.points < amount) return false;

        data.wallet.points -= amount;

        data.history.unshift({
            id: crypto.randomUUID(),
            type: "points_spent",
            amount,
            reason,
            date: new Date().toISOString()
        });

        return save(data);
    }

    function getProfile() {
        return getData().profile;
    }

    function updateProfile(changes) {
        const data = getData();

        data.profile = {
            ...data.profile,
            ...changes
        };

        return save(data);
    }

    function addExperience(amount) {
        amount = Number(amount);

        if (!Number.isFinite(amount) || amount <= 0) return false;

        const data = getData();

        data.profile.experience =
            Number(data.profile.experience || 0) + amount;

        while (
            data.profile.experience >=
            Number(data.profile.level || 1) * 100
        ) {
            const required = Number(data.profile.level || 1) * 100;

            data.profile.experience -= required;
            data.profile.level = Number(data.profile.level || 1) + 1;
        }

        return save(data);
    }

    // Счётчик бесплатной активности.
    // Не связан с денежными ставками или проигрышами.
    function addTurnover(amount) {
        amount = Number(amount);

        if (!Number.isFinite(amount) || amount <= 0) return false;

        const data = getData();

        data.profile.turnover =
            Number(data.profile.turnover || 0) + amount;

        data.statistics.totalActivity =
            Number(data.statistics.totalActivity || 0) + amount;

        return save(data);
    }

    function getTurnover() {
        return Number(getData().profile.turnover || 0);
    }

    function getInventory(type) {
        const inventory = getData().inventory;

        if (!type) return inventory;

        return inventory.filter(item => item.type === type);
    }

    function addItem(item) {
        if (!item || !item.name) return false;

        const data = getData();

        const newItem = {
            id: crypto.randomUUID(),
            name: item.name,
            type: item.type || "telegram",
            rarity: item.rarity || "common",
            image: item.image || "",
            source: item.source || "XannUP",
            obtainedAt: new Date().toISOString()
        };

        data.inventory.push(newItem);

        data.statistics.itemsReceived =
            Number(data.statistics.itemsReceived || 0) + 1;

        data.history.unshift({
            id: crypto.randomUUID(),
            type: "item_received",
            itemName: newItem.name,
            date: new Date().toISOString()
        });

        save(data);

        return newItem;
    }

    function removeItem(itemId) {
        const data = getData();

        const index = data.inventory.findIndex(
            item => item.id === itemId
        );

        if (index === -1) return false;

        data.inventory.splice(index, 1);

        return save(data);
    }

    function hasItem(itemId) {
        return getData().inventory.some(
            item => item.id === itemId
        );
    }

    function findItem(itemId) {
        return getData().inventory.find(
            item => item.id === itemId
        ) || null;
    }

    function addHistory(entry) {
        const data = getData();

        data.history.unshift({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            ...entry
        });

        if (data.history.length > 500) {
            data.history.length = 500;
        }

        return save(data);
    }

    function getHistory() {
        return getData().history;
    }

    function recordGame(gameName, result = {}) {
        const data = getData();

        data.statistics.gamesPlayed =
            Number(data.statistics.gamesPlayed || 0) + 1;

        data.profile.gamesPlayed =
            Number(data.profile.gamesPlayed || 0) + 1;

        data.history.unshift({
            id: crypto.randomUUID(),
            type: "game",
            game: gameName,
            result,
            date: new Date().toISOString()
        });

        return save(data);
    }

    function incrementStatistic(name, amount = 1) {
        amount = Number(amount);

        if (!Number.isFinite(amount)) return false;

        const data = getData();

        data.statistics[name] =
            Number(data.statistics[name] || 0) + amount;

        return save(data);
    }

    function getStatistics() {
        return getData().statistics;
    }

    function getSetting(name) {
        return getData().settings[name];
    }

    function setSetting(name, value) {
        const data = getData();

        data.settings[name] = value;

        return save(data);
    }

    function unlockAchievement(id) {
        const data = getData();

        if (data.achievements.includes(id)) return false;

        data.achievements.push(id);

        return save(data);
    }

    function getAchievements() {
        return getData().achievements;
    }

    function randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function reset() {
        const data = createDefaultData();
        return save(data);
    }

    window.XannUP = {
        getData,
        save,

        getPoints,
        getWallet,
        addPoints,
        spendPoints,

        getProfile,
        updateProfile,
        addExperience,

        addTurnover,
        getTurnover,

        getInventory,
        addItem,
        removeItem,
        hasItem,
        findItem,

        addHistory,
        getHistory,

        recordGame,
        incrementStatistic,
        getStatistics,

        getSetting,
        setSetting,

        unlockAchievement,
        getAchievements,

        randomInt,
        reset
    };

})();
