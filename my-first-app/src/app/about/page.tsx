export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">About This App</h1>
        <p className="text-gray-600 mb-4">
          This is your first Next.js application! You're learning:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>File-based routing</li>
          <li>Client and server components</li>
          <li>React state management</li>
          <li>Tailwind CSS styling</li>
        </ul>
        <a 
          href="/" 
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
} 