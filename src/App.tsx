import React from 'react';
import './App.scss';
import { PomodoroTimer } from './pomodoroTimer';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { Slideshow } from './Slideshow/Slideshow';
import { SwipeRefresh } from './SwipeRefresh/SwipeRefresh';
import { getText } from './SwipeRefresh/swipeRefreshService';

function App() {
  return (
    <main>
      <header className="app-header">
        <h1>RxJS Examples</h1>
      </header>
      <BrowserRouter>
        <Switch>
          <Route path="/pomodoro">
            <section className="app-section">
              <PomodoroTimer sessionLength={25} breakLength={5}/>
            </section>
          </Route>
          <Route path="/slideshow">
            <Slideshow
              transitionTime={500}
              backgroundItems={['#D91136', '#F249A6', '#0FC9F2', '#66A638', '#F2C230']}
              initialIndex={1}
            />
          </Route>
          <Route path="/swipe">
            <SwipeRefresh {...getText()} />
          </Route>
        </Switch>
      </BrowserRouter>
    </main>
  );
}

export default App;
