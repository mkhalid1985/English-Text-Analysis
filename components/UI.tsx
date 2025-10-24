import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

interface ProgressBarProps {
    value: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    return (
        <div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confidence Level</span>
            <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mt-1">
                <div 
                    className="bg-sky-600 h-4 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${clampedValue}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white mix-blend-lighten">
                        {Math.round(clampedValue)}%
                    </span>
                </div>
            </div>
        </div>
    );
};
