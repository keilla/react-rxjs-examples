import React from 'react';
import { Timer } from './timer';
import './PomodoroTimer.scss';
import { PomodoroTimerProps } from './pomodoroTimerProps';

interface PomodoroTimerState {
  description: 'session' | 'break';
}

export class PomodoroTimer extends React.Component<PomodoroTimerProps, PomodoroTimerState> {

  constructor(props: PomodoroTimerProps) {
    super(props);
    this.state = {
      description: 'session'
    }
  }

  render() {
    return (
      <div className='pomodoro-timer'>
        <h2 className='title'>Pomodoro Timer</h2>
        <Timer initialMinutes={this.props.sessionLenght} />
        <p className='description'>{this.state.description}</p>
        <div className='timer-controls'>
          <button className='button'>start</button>
          <button className='button'>stop</button>
          <button className='button'>clear</button>
        </div>
      </div>
    );
  }
}
