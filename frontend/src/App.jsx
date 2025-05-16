import React from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <ChatWindow />
      <Footer />
    </div>
  );
}

export default App;

