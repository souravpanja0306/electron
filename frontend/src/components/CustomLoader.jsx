import React from 'react'

const CustomLoader = () => {
    const loadingTexts = [
        "Hang tight, we’re getting things ready.",
        "Just a moment… setting everything up.",
        "Almost there, loading data.",
        "Please wait while we prepare everything.",
        "Hang tight, we’re loading everything."
    ];
    const randomText = loadingTexts[Math.floor(Math.random() * loadingTexts.length)];

    return (
        <div>
            <div className="min-h-[calc(100vh-20px)] flex flex-col items-center justify-center w-full py-10">
                <div className="h-8 w-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
                <span className="mt-3 text-sm text-slate-500 dark:text-slate-400">{randomText}</span>
            </div>
        </div>
    );
}

export default CustomLoader