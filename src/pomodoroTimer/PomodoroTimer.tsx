import React from 'react';
import { Timer } from './timer';
import './PomodoroTimer.scss';
import { PomodoroTimerProps } from './pomodoroTimerProps';
import { Subject } from 'rxjs';

interface PomodoroTimerState {
  description: 'session' | 'break';
}

export class PomodoroTimer extends React.Component<PomodoroTimerProps, PomodoroTimerState> {

  constructor(
    props: PomodoroTimerProps,
    private isRunning$: Subject<boolean>,
    private reset$: Subject<void>,
  ) {
    super(props);
    this.state = {
      description: 'session'
    }

    this.isRunning$ = new Subject();
    this.reset$ = new Subject();

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.clear = this.clear.bind(this);
    this.handleTimeout = this.handleTimeout.bind(this);
  }

  private start() {
    this.isRunning$.next(true);
  }

  private stop() {
    this.isRunning$.next(false);
  }
  
  private clear() {
    this.reset$.next();
  }

  private handleTimeout() {
    this.toggleSession();
  }

  private toggleSession() {
    const description = this.runningSession ? 'break' : 'session';
    this.setState({ description, });
  }

  get runningSession() {
    return this.state.description === 'session';
  }

  get time() {
    const { sessionLength, breakLength } = this.props;
    return this.runningSession ? sessionLength : breakLength;
  }

  render() {
    return (
      <div className='pomodoro-timer'>
        <h2 className='title'>Pomodoro Timer</h2>
        <Timer
          initialMinutes={this.time}
          timeout={this.handleTimeout}
          isRunning$={this.isRunning$.asObservable()}
          reset$={this.reset$.asObservable()}
        />
        <p className='description'>{this.state.description}</p>
        <div className='timer-controls'>
          <button className='button' onClick={this.start}>start</button>
          <button className='button' onClick={this.stop}>stop</button>
          <button className='button' onClick={this.clear}>clear</button>
        </div>
      </div>
    );
  }
}
