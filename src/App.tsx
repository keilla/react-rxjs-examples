import React from 'react';
import './App.scss';
import { PomodoroTimer } from './pomodoroTimer';

function App() {
  return (
    <main>
      <header className="app-header">
        <h1>RxJS Examples</h1>
      </header>
      <section className='app-section'>
        <h2 className='title'>Component</h2>
        <PomodoroTimer sessionLenght={25} breakLenght={5}/>
      </section>
    </main>
  );
}

export default App;
