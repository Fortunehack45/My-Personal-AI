
'use client';

import { useState, useEffect } from 'react';

// WPM = Words Per Minute
// CPS = Characters Per Second
// C = Characters
// S = Seconds
// (W/M) * (C/W) * (M/S) = C/S
// Average characters per word is estimated to be 5 (including space)

const WPM_TO_CPS = (wpm: number) => (wpm * 5) / 60;

export const useTypingEffect = (text: string, wordsPerMinute = 250) => {
    const [displayedText, setDisplayedText] = useState('');
    // Cap WPM to a reasonable number to prevent performance issues
    const cappedWpm = Math.min(wordsPerMinute, 1000); 
    const cps = WPM_TO_CPS(cappedWpm);
    const interval = 1000 / cps;

    useEffect(() => {
        if (!text) return;

        // If text is short, just display it
        if (text.length < 20) {
            setDisplayedText(text);
            return;
        }

        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText(prev => prev + text.charAt(i));
            i++;
            if (i >= text.length) {
                clearInterval(timer);
            }
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [text, interval]);

    // Append a cursor to the end of the text while typing
    const isTyping = displayedText.length < text.length;
    return isTyping ? displayedText + '▋' : displayedText;
};
