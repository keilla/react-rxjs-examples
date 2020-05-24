import React from 'react';
import { Timer } from './timer';
import './PomodoroTimer.scss';
import { PomodoroTimerProps } from './pomodoroTimerProps';
import { Subject } from 'rxjs';
import { Player } from './player/Player';

interface PomodoroTimerState {
  description: 'Session' | 'Break';
  time: number;
}

export class PomodoroTimer extends React.Component<PomodoroTimerProps, PomodoroTimerState> {

  constructor(props: PomodoroTimerProps,
    private isRunning$: Subject<boolean>) {
    super(props);
    this.state = {
      description: 'Session',
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
    const description = this.runningSession ? 'Break' : 'Session';

    const { sessionLength, breakLength } = this.props;
    const time = this.runningSession ? breakLength : sessionLength;

    this.setState({ description, time });
    this.isRunning$.next(false);
  }

  get runningSession() {
    return this.state.description === 'Session';
  }

  get btnVisible() {
    return 'button';
  }

  get btnHidden() {
    return 'button -hidden';
  }

  render() {
    return (
      <div className='pomodoro-timer'>
        <h2 className='title'>Pomodoro {this.state.description}</h2>
        <div className='timer'>
          <Timer
            initialMinutes={this.state.time}
            timeout={this.handleTimeout}
            isRunning$={this.isRunning$.asObservable()}
          />
        </div>
        <Player
          isPlaying$={this.isRunning$.asObservable()}
          onPlay={this.start}
          onPause={this.pause}
        />
      </div>
    );
  }
}
