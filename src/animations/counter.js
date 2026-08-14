import { useEffect, useState } from 'react';
export function useCounter(target, duration = 2000, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start)
            return;
        let startTime = null;
        const step = (timestamp) => {
            if (startTime === null)
                startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1)
                requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count.toLocaleString('pt-BR');
}
