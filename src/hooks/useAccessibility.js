import { useState, useEffect, useCallback } from 'react';
const STORAGE_KEY = 'js-accessibility-settings';
const DEFAULT_SETTINGS = {
    fontSize: 100,
    contrast: false,
    grayscale: false,
    highlightLinks: false,
    reducedMotion: false,
    increasedSpacing: false,
    focusMode: false,
};
export function useAccessibility() {
    const [settings, setSettings] = useState(() => {
        if (typeof window === 'undefined')
            return DEFAULT_SETTINGS;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored
                ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
                : DEFAULT_SETTINGS;
        }
        catch {
            return DEFAULT_SETTINGS;
        }
    });
    const applySettings = useCallback((newSettings) => {
        const root = document.documentElement;
        root.style.fontSize = `${newSettings.fontSize}%`;
        if (newSettings.contrast) {
            root.classList.add('contrast-mode');
        }
        else {
            root.classList.remove('contrast-mode');
        }
        if (newSettings.grayscale) {
            root.classList.add('grayscale-mode');
        }
        else {
            root.classList.remove('grayscale-mode');
        }
        if (newSettings.highlightLinks) {
            root.classList.add('highlight-links');
        }
        else {
            root.classList.remove('highlight-links');
        }
        if (newSettings.reducedMotion) {
            root.classList.add('reduced-motion');
        }
        else {
            root.classList.remove('reduced-motion');
        }
    }, []);
    useEffect(() => {
        applySettings(settings);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }
        catch {
            // ignore storage errors
        }
    }, [settings, applySettings]);
    const updateSetting = useCallback((key, value) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: value };
            applySettings(next);
            return next;
        });
    }, [applySettings]);
    const increaseFontSize = useCallback(() => {
        setSettings((prev) => {
            const next = { ...prev, fontSize: Math.min(prev.fontSize + 10, 150) };
            applySettings(next);
            return next;
        });
    }, [applySettings]);
    const decreaseFontSize = useCallback(() => {
        setSettings((prev) => {
            const next = { ...prev, fontSize: Math.max(prev.fontSize - 10, 80) };
            applySettings(next);
            return next;
        });
    }, [applySettings]);
    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        applySettings(DEFAULT_SETTINGS);
    }, [applySettings]);
    return {
        settings,
        updateSetting,
        increaseFontSize,
        decreaseFontSize,
        resetSettings,
    };
}
