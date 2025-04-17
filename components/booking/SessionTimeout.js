const SessionTimeout = ({ countdown, onResponse }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Are you still on the booking page?</h2>
        <p className="mb-4">Your session will expire in {countdown} seconds.</p>
        <div className="flex justify-between">
          <button
            onClick={() => onResponse(true)}
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
          >
            Stay on page
          </button>
          <button
            onClick={() => onResponse(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Leave page
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout; 