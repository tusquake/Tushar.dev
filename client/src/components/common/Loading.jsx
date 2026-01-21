const Loading = ({ size = 'md', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'h-6 w-6 border-2',
        md: 'h-10 w-10 border-3',
        lg: 'h-16 w-16 border-4',
    };

    const spinner = (
        <div
            className={`animate-spin rounded-full border-primary-500 border-t-transparent ${sizeClasses[size]}`}
        ></div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-950/80 backdrop-blur-sm z-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
};

export default Loading;
