import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HERO_ASSETS } from '@/content/assets';
const ENTER_MS = 3500;
const HOLD_MS = 5000;
const EXIT_MS = 2000;
const easing = [0.25, 0.4, 0.25, 1];
export function CinematicShowcase({ onFinish }) {
    const shouldReduceMotion = useReducedMotion();
    const [phase, setPhase] = useState('entering');
    const timers = useRef([]);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(max-width: 767px)').matches;
        }
        return false;
    });
    const finish = useCallback(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        onFinish();
    }, [onFinish]);
    useEffect(() => {
        const img = new Image();
        img.src = HERO_ASSETS.cardheros;
        img.onload = () => setImageLoaded(true);
    }, []);
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = original;
        };
    }, []);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const checkMobile = () => setIsMobile(mq.matches);
        checkMobile();
        mq.addEventListener('change', checkMobile);
        return () => mq.removeEventListener('change', checkMobile);
    }, []);
    useEffect(() => {
        if (shouldReduceMotion) {
            const t = setTimeout(finish, 500);
            return () => clearTimeout(t);
        }
        const t1 = setTimeout(() => setPhase('entering'), 100);
        const t2 = setTimeout(() => setPhase('holding'), ENTER_MS + 100);
        const t3 = setTimeout(() => setPhase('closing'), ENTER_MS + HOLD_MS + 100);
        const t4 = setTimeout(finish, ENTER_MS + HOLD_MS + EXIT_MS + 100);
        timers.current = [t1, t2, t3, t4];
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [shouldReduceMotion, finish]);
    const handleSkip = useCallback(() => {
        timers.current.forEach(clearTimeout);
        setPhase('closing');
        setTimeout(finish, EXIT_MS);
    }, [finish]);
    const imageVariants = shouldReduceMotion
        ? {
            entering: { opacity: 1, transition: { duration: 0.1 } },
            holding: { opacity: 1 },
            closing: { opacity: 0, transition: { duration: 0.1 } },
        }
        : isMobile
            ? {
                entering: {
                    opacity: 1,
                    scale: [1.01, 0.99, 1],
                    y: ['2%', '0%', '-1%', '0%'],
                    transition: {
                        duration: ENTER_MS / 1000,
                        ease: easing,
                        times: [0, 0.5, 1],
                    },
                },
                holding: {
                    opacity: 1,
                    scale: [1, 1.002, 1],
                    y: [0, 0.2, 0],
                    transition: {
                        duration: HOLD_MS / 1000,
                        ease: 'easeInOut',
                        times: [0, 0.5, 1],
                        repeat: Infinity,
                        repeatType: 'mirror',
                    },
                },
                closing: {
                    opacity: 0,
                    scale: 1.01,
                    transition: {
                        duration: EXIT_MS / 1000,
                        ease: easing,
                    },
                },
            }
            : {
                entering: {
                    opacity: 1,
                    scale: [1.02, 0.98, 1.01, 1],
                    y: ['3%', '0%', '-1%', '0%'],
                    rotate: [0.5, -0.3, 0.15, 0],
                    transition: {
                        duration: ENTER_MS / 1000,
                        ease: easing,
                        times: [0, 0.4, 0.75, 1],
                    },
                },
                holding: {
                    opacity: 1,
                    scale: [1, 1.003, 1, 1.003, 1],
                    y: [0, 0.4, 0, -0.4, 0],
                    transition: {
                        duration: HOLD_MS / 1000,
                        ease: 'easeInOut',
                        times: [0, 0.2, 0.4, 0.6, 1],
                        repeat: Infinity,
                        repeatType: 'mirror',
                    },
                },
                closing: {
                    opacity: 0,
                    scale: 1.02,
                    transition: {
                        duration: EXIT_MS / 1000,
                        ease: easing,
                    },
                },
            };
    const textVariantsMobile = shouldReduceMotion
        ? {
            entering: { opacity: 1, y: 0, transition: { duration: 0.1 } },
            holding: { opacity: 1, y: 0 },
            closing: { opacity: 0, y: 0, transition: { duration: 0.1 } },
        }
        : {
            entering: {
                opacity: 0,
                y: -20,
                transition: { duration: 0.8, ease: easing, delay: 1.5 },
            },
            holding: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: easing },
            },
            closing: {
                opacity: 0,
                y: -10,
                transition: { duration: 0.6, ease: easing },
            },
        };
    const textVariantsDesktop = shouldReduceMotion
        ? {
            entering: { opacity: 1, x: 0, transition: { duration: 0.1 } },
            holding: { opacity: 1, x: 0 },
            closing: { opacity: 0, x: 0, transition: { duration: 0.1 } },
        }
        : {
            entering: {
                opacity: 0,
                x: '-100vw',
                transition: { duration: 0.8, ease: easing, delay: 1.5 },
            },
            holding: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, ease: easing },
            },
            closing: {
                opacity: 0,
                x: '-20px',
                transition: { duration: 0.6, ease: easing },
            },
        };
    const subtitleVariantsMobile = shouldReduceMotion
        ? {
            entering: { opacity: 1, y: 0, transition: { duration: 0.1 } },
            holding: { opacity: 1, y: 0 },
            closing: { opacity: 0, y: 0, transition: { duration: 0.1 } },
        }
        : {
            entering: {
                opacity: 0,
                y: 20,
                transition: { duration: 0.8, ease: easing, delay: 2.5 },
            },
            holding: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: easing },
            },
            closing: {
                opacity: 0,
                y: 10,
                transition: { duration: 0.6, ease: easing },
            },
        };
    const subtitleVariantsDesktop = shouldReduceMotion
        ? {
            entering: { opacity: 1, x: 0, transition: { duration: 0.1 } },
            holding: { opacity: 1, x: 0 },
            closing: { opacity: 0, x: 0, transition: { duration: 0.1 } },
        }
        : {
            entering: {
                opacity: 0,
                x: '100vw',
                transition: { duration: 0.8, ease: easing, delay: 2.5 },
            },
            holding: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, ease: easing },
            },
            closing: {
                opacity: 0,
                x: '20px',
                transition: { duration: 0.6, ease: easing },
            },
        };
    const currentVariant = shouldReduceMotion ? phase : phase;
    return (_jsxs(motion.div, { className: "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black", initial: "entering", animate: currentVariant, exit: { opacity: 0, transition: { duration: 0.6, ease: easing } }, children: [_jsx(motion.div, { variants: isMobile ? textVariantsMobile : textVariantsDesktop, className: "absolute top-[12px] right-0 left-0 z-10 text-center md:top-8", children: _jsx("h1", { className: "text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl", children: "J&S Empregos" }) }), _jsxs(motion.div, { variants: imageVariants, className: "absolute inset-0 flex items-center justify-center", children: [!imageLoaded && (_jsx("div", { className: "bg-surface-alt absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "bg-muted h-16 w-16 animate-pulse rounded-full" }) })), _jsx("img", { src: HERO_ASSETS.cardheros, alt: "J&S Empregos LTDA", loading: "eager", decoding: "sync", onLoad: () => setImageLoaded(true), className: "h-full w-full object-contain", style: { objectPosition: 'center 30%' } })] }), _jsx(motion.div, { variants: isMobile ? subtitleVariantsMobile : subtitleVariantsDesktop, className: "absolute right-20 bottom-16 left-4 z-10 text-center md:right-0 md:bottom-24 md:left-0", children: _jsx("p", { className: "text-lg text-white/90 drop-shadow-md sm:text-xl md:text-2xl", children: "Gest\u00E3o em Recursos Humanos" }) }), _jsx("button", { type: "button", onClick: handleSkip, className: "absolute right-6 bottom-6 z-20 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition-colors hover:text-white md:right-8 md:bottom-8", style: {
                    bottom: 'max(env(safe-area-inset-bottom, 0px) + 1.5rem, 1.5rem)',
                }, children: "Pular" }), _jsx("span", { className: "sr-only", children: "Abertura cinematogr\u00E1fica J&S Empregos LTDA" })] }));
}
