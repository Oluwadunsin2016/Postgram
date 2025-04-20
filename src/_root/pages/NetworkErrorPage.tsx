import { useNavigate } from 'react-router-dom';

export default function NetworkErrorPage() {
  const navigate = useNavigate();
  
  const handleRetry = () => {
    navigate(0); // Reloads the current page
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="rounded-xl shadow-2xl p-8 max-w-xl w-full text-center">
        <div className="flex justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-rose-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-2">Connection Lost</h1>
        <h2 className="text-xl font-semibold mb-4">Network Error</h2>
        <p className="mb-6">
          We can't connect to the server. Please check your internet connection and try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetry}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
          >
            Retry Connection
          </button>
          <button
            onClick={() => navigate('/')}
            className="border border-gray-300 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg transition duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}