const STORAGE_KEY = 'jst_budgets';
function getFromStorage() {
    if (typeof window === 'undefined')
        return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
}
function saveToStorage(data) {
    if (typeof window === 'undefined')
        return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
export function mockSubmitBudget(data) {
    const budget = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    const existing = getFromStorage();
    existing.push(budget);
    saveToStorage(existing);
    return budget;
}
export function mockGetBudgets() {
    return getFromStorage();
}
export function mockGetBudgetById(id) {
    return getFromStorage().find((b) => b.id === id);
}
export function mockUpdateBudgetStatus(id, status) {
    const budgets = getFromStorage();
    const index = budgets.findIndex((b) => b.id === id);
    if (index === -1)
        return null;
    budgets[index] = { ...budgets[index], status };
    saveToStorage(budgets);
    return budgets[index];
}
export function mockDeleteBudget(id) {
    const budgets = getFromStorage();
    const filtered = budgets.filter((b) => b.id !== id);
    if (filtered.length === budgets.length)
        return false;
    saveToStorage(filtered);
    return true;
}
