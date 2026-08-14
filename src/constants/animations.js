import {} from 'framer-motion';
export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};
export const fadeInDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};
export const fadeInLeft = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};
export const fadeInRight = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
};
export const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};
export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};
export const itemFadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};
export const hoverScale = {
    scale: 1.05,
    transition: { duration: 0.2 },
};
export const tapScale = {
    scale: 0.98,
    transition: { duration: 0.1 },
};
export const EASING = {
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.34, 1.56, 0.64, 1],
    standard: [0.2, 0, 0, 1],
};
export const DURATION = {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slowest: 0.8,
};
