"use client";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";


import React, { useEffect, useRef, useState } from "react";

const TypingSpeed: React.FC = () => {
    const rounter = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [quote, setQuote] = useState<string>('');
    const [userInput, setUserInput] = useState<string>('');

    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [wpm, setWpm] = useState<number>(0);
    const [startTime, setStartTime] = useState<number | null>(null);



    
}