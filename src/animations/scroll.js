import { useInView } from 'framer-motion';
import { useRef } from 'react';
export function useScrollAnimation(options) {
    const ref = useRef(null);
    const isInView = useInView(ref, options);
    return { ref, isInView };
}
export const revealUp = {
    hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
    },
};
export const revealLeft = {
    hidden: { opacity: 0, x: -40, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
    },
};
export const revealRight = {
    hidden: { opacity: 0, x: 40, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
    },
};
export const revealScale = {
    hidden: { opacity: 0, scale: 0.9, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
    },
};
export const staggerReveal = (delay = 0.1) => ({
    hidden: {},
    visible: {
        transition: {
            staggerChildren: delay,
            delayChildren: 0.1,
        },
    },
});
