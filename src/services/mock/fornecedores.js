const STORAGE_KEY = 'jst_suppliers';
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
export function mockSubmitSupplier(data) {
    const supplier = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    const existing = getFromStorage();
    existing.push(supplier);
    saveToStorage(existing);
    return supplier;
}
export function mockGetSuppliers() {
    return getFromStorage();
}
export function mockGetSupplierById(id) {
    return getFromStorage().find((s) => s.id === id);
}
export function mockUpdateSupplierStatus(id, status) {
    const suppliers = getFromStorage();
    const index = suppliers.findIndex((s) => s.id === id);
    if (index === -1)
        return null;
    suppliers[index] = { ...suppliers[index], status };
    saveToStorage(suppliers);
    return suppliers[index];
}
export function mockDeleteSupplier(id) {
    const suppliers = getFromStorage();
    const filtered = suppliers.filter((s) => s.id !== id);
    if (filtered.length === suppliers.length)
        return false;
    saveToStorage(filtered);
    return true;
}
