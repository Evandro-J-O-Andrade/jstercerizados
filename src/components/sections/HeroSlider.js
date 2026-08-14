import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { staggerContainer } from '@/animations/fade';
export function HeroSlider({ slides, autoPlay = true, interval = 5000, }) {
    const [current, setCurrent] = useState(0);
    const { scrollY } = useScroll();
    const parallaxY = useTransform(scrollY, [0, 800], [0, -60]);
    const parallaxOpacity = useTransform(scrollY, [0, 500], [1, 0.3]);
    const heroScale = useTransform(scrollY, [0, 600], [1, 1.05]);
    useEffect(() => {
        if (!autoPlay)
            return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, interval);
        return () => clearInterval(timer);
    }, [autoPlay, interval, slides.length]);
    const slide = slides[current];
    return (_jsxs("section", { className: "relative flex min-h-screen items-center overflow-hidden", children: [_jsxs(motion.div, { style: { y: parallaxY, opacity: parallaxOpacity, scale: heroScale }, className: "absolute inset-0", children: [_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0, scale: 1.05 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 }, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }, className: "absolute inset-0", children: _jsx(SafeImage, { src: slide.image, fallbackSrc: slide.fallback, alt: slide.alt, className: "h-full w-full object-cover object-center", loading: "eager", width: 1920, height: 1080 }) }, slide.id) }), _jsx("div", { className: "absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_50%_0%,hsla(215,35%,10%,0.4),transparent_40%)]" }), _jsx("div", { className: "from-background/95 via-background/80 to-background/40 absolute inset-0 bg-gradient-to-r" }), _jsx("div", { className: "from-background via-background/60 to-background/30 absolute inset-0 bg-gradient-to-t" }), _jsx("div", { className: "from-background/80 to-background/60 absolute inset-0 bg-gradient-to-b via-transparent" })] }), _jsx("div", { className: "relative mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-12 px-4 py-32 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-0", children: _jsx(AnimatePresence, { children: _jsxs(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: staggerContainer(0.15), children: [slide.badge && slide.badge, _jsx(motion.h1, { className: "text-foreground text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl", variants: {
                                    initial: { opacity: 0, y: 30 },
                                    animate: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.8, delay: 0.3 },
                                    },
                                    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
                                }, children: slide.title }), slide.subtitle && (_jsx(motion.p, { className: "text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed", variants: {
                                    initial: { opacity: 0, y: 30 },
                                    animate: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.8, delay: 0.5 },
                                    },
                                    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
                                }, children: slide.subtitle })), slide.cta && (_jsx(motion.div, { className: "mt-8 flex flex-wrap gap-4", variants: {
                                    initial: { opacity: 0, y: 30 },
                                    animate: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.8, delay: 0.6 },
                                    },
                                    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
                                }, children: slide.cta }))] }, slide.id) }) }), _jsx("div", { className: "absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2", children: slides.map((_, index) => (_jsxs("button", { onClick: () => setCurrent(index), className: "relative h-2 w-10 cursor-pointer rounded-full bg-white/10 transition-all duration-300 hover:bg-white/20", "aria-label": `Ir para slide ${index + 1}`, children: [_jsx("div", { className: `absolute inset-0.5 rounded-full transition-all duration-300 ${current === index ? 'bg-primary w-2' : 'w-0.5 bg-white/40'}` }), current === index && (_jsx(motion.div, { className: "bg-primary absolute inset-0.5 rounded-full", initial: { width: '2px' }, animate: { width: '32px' }, transition: { duration: 0.5, ease: 'easeOut' } }))] }, index))) })] }));
}
