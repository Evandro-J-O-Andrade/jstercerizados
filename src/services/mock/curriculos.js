const STORAGE_KEY = 'jst_candidates';
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
export function mockSubmitCandidate(data) {
    const candidate = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    const existing = getFromStorage();
    existing.push(candidate);
    saveToStorage(existing);
    return candidate;
}
export function mockGetCandidates() {
    return getFromStorage();
}
export function mockGetCandidateById(id) {
    return getFromStorage().find((c) => c.id === id);
}
export function mockUpdateCandidateStatus(id, status) {
    const candidates = getFromStorage();
    const index = candidates.findIndex((c) => c.id === id);
    if (index === -1)
        return null;
    candidates[index] = { ...candidates[index], status };
    saveToStorage(candidates);
    return candidates[index];
}
export function mockDeleteCandidate(id) {
    const candidates = getFromStorage();
    const filtered = candidates.filter((c) => c.id !== id);
    if (filtered.length === candidates.length)
        return false;
    saveToStorage(filtered);
    return true;
}
