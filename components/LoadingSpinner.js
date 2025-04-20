const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <span className="ml-3 text-lg text-gray-700">Loading...</span>
        </div>
    );
};

export default LoadingSpinner; 