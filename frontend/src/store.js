// src/store.js
let globalStore = {
    token: null,
};

export const setGlobalToken = (token) => {
    globalStore.token = token;
};

export const getGlobalToken = () => {
    return globalStore.token;
};
