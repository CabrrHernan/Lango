import React from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import Footer from './components/Footer';




function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 text-center px-4">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
        Welcome to Lango
      </h1>
      <p className="text-lg text-gray-600 mb-6 max-w-xl">
        Learn languages the smart way — powered by AI. Start your journey today.
      </p>
      <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition">
        Get Started
      </button>
      <div className="bg-green-500 text-white p-4 text-xl">
  Tailwind is working!
</div>

    <div className="bg-red-500 text-white p-4 text-xl">
  If this box is red, Tailwind is working.
</div>

    </div>
    
    
  );
}

export default App;

