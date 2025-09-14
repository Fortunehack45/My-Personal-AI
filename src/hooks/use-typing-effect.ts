
'use client';

import { useState, useEffect } from 'react';

// WPM = Words Per Minute
// CPS = Characters Per Second
// C = Characters
// S = Seconds
// (W/M) * (C/W) * (M/S) = C/S
// Average characters per word is estimated to be 5 (including space)

const WPM_TO_CPS = (wpm: number) => (wpm * 5) / 60;

const getWpmForText = (text: string): number => {
    const length = text.length;
    if (length < 100) return 25000;
    if (length < 300) return 20000;
    if (length < 800) return 10000;
    if (length < 1500) return 5000;
    return 3000;
};


export const useTypingEffect = (text: string, isLastMessage: boolean) => {
    const [displayedText, setDisplayedText] = useState('');
    const wpm = getWpmForText(text);
    const cps = WPM_TO_CPS(wpm);
    const interval = 1000 / cps;

    useEffect(() => {
        if (!text) return;

        // If the message is not the last one, or is short, display it immediately.
        if (!isLastMessage || text.length < 20 || wpm >= 10000) {
            setDisplayedText(text);
            return;
        }

        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            // Use substring to avoid skipping characters on re-renders
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(timer);
            }
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [text, interval, isLastMessage, wpm]);

    // Append a cursor to the end of the text while typing
    const isTyping = displayedText.length < text.length;
    return isTyping ? displayedText + '▋' : displayedText;
};
