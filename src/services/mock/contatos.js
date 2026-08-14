const STORAGE_KEY = 'jst_contacts';
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
export function mockSubmitContact(data) {
    const contact = {
        ...data,
    };
    const existing = getFromStorage();
    existing.push(contact);
    saveToStorage(existing);
    return contact;
}
export function mockGetContacts() {
    return getFromStorage();
}
