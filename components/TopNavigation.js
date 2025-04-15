export default function TopNavigation() {
  return (
    <div className="bg-gray-200 flex justify-between items-center px-4 py-1 text-xs">
      <div className="flex items-center">
        <a href="tel:1-888-673-7987" className="text-gray-700 mr-4">1-888-673-7987</a>
        <span className="text-gray-700">CHAT WITH US</span>
      </div>
      <div className="flex items-center">
        <button className="flex items-center text-gray-700 mr-4">
          <span>ENGLISH</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button className="text-gray-700 uppercase">Create Account or Login</button>
      </div>
    </div>
  );
}