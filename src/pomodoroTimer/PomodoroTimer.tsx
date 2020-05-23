import React from 'react';
import { Timer } from './timer';
import './PomodoroTimer.scss';
import { PomodoroTimerProps } from './pomodoroTimerProps';
import { Subject } from 'rxjs';

interface PomodoroTimerState {
  description: 'session' | 'break';
  time: number
}

export class PomodoroTimer extends React.Component<PomodoroTimerProps, PomodoroTimerState> {

  constructor(props: PomodoroTimerProps, private isRunning$: Subject<boolean>) {
    super(props);
    this.state = {
      description: 'session',
      time: 0
    }

    this.isRunning$ = new Subject();

    this.start = this.start.bind(this);
    this.pause = this.pause.bind(this);
    this.handleTimeout = this.handleTimeout.bind(this);
  }

  componentDidMount() {
    this.setState({ time: this.props.sessionLength });
  }

  private start() {
    this.isRunning$.next(true);
  }

  private pause() {
    this.isRunning$.next(false);
  }


  private handleTimeout() {
    const description = this.runningSession ? 'break' : 'session';

    const { sessionLength, breakLength } = this.props;
    const time = this.runningSession ? breakLength : sessionLength;

    this.setState({ description, time });
  }

  get runningSession() {
    return this.state.description === 'session';
  }

  render() {
    return (
      <div className='pomodoro-timer'>
        <h2 className='title'>Pomodoro Timer</h2>
        <Timer
          initialMinutes={this.state.time}
          timeout={this.handleTimeout}
          isRunning$={this.isRunning$.asObservable()}
        />
        <p className='description'>{this.state.description}</p>
        <div className='timer-controls'>
          <button className='button' onClick={this.start}>start</button>
          <button className='button' onClick={this.pause}>pause</button>
        </div>
      </div>
    );
  }
}
