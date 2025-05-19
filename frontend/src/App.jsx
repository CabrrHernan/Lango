import React from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import WordInfoPanel from './components/WordInfoPanel'
import Footer from './components/Footer';




function App() {
  return (
    <div className="flex">
      <Header/>
      <ChatWindow/>
      <WordInfoPanel/>
      <Footer/>

    </div>
    
    
  );
}

export default App;

