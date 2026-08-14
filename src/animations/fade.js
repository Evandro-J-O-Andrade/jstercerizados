import {} from 'framer-motion';
export const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};
export const fadeInLeft = {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
};
export const fadeInRight = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};
export const scaleIn = {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};
export const floating = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};
export const staggerContainer = (delay = 0.1) => ({
    initial: {},
    animate: {
        transition: {
            staggerChildren: delay,
            delayChildren: 0.1,
        },
    },
});
export const staggerItem = (direction = 'up') => {
    const base = direction === 'left'
        ? { x: -30 }
        : direction === 'right'
            ? { x: 30 }
            : { y: 20 };
    return {
        initial: { opacity: 0, ...base },
        animate: { opacity: 1, x: 0, y: 0 },
    };
};
