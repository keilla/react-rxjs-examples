import React from 'react';
import { interval, empty } from 'rxjs';
import { finalize, takeUntil, tap, mapTo, switchMap } from 'rxjs/operators';
import { TimerProps } from './timerProps';
import './Timer.scss';
import { TimeService } from '../../services/';

interface TimerState {
  minutes: number;
  seconds: number
}

export class Timer extends React.Component<TimerProps, TimerState> {

  constructor(
    props: TimerProps,
    private timeService: TimeService,
    private readonly interval$ = interval(1000)
  ) {
    super(props);
    this.state = { minutes: 0, seconds: 0 };
    this.timeService = new TimeService(this.initialMinutesToSeconds);
  }

  componentDidMount() {
    this.setState({
      minutes: this.timeService.minutes,
      seconds: this.timeService.seconds,
    });

    const { isRunning$, reset$ } = this.props;

    reset$.pipe(mapTo(false));

    isRunning$.pipe(
      switchMap(isRunning => isRunning ? this.start$ : empty())
    ).subscribe();
  }

  private get start$() {
    return this.timer$.pipe(
      tap(() => this.setState({ seconds: this.timeService.seconds, minutes: this.timeService.minutes }))
    );
  }

  get timer$() {
    return this.interval$.pipe(
      takeUntil(this.end$),
      tap(() => this.timeService.addSeconds(-1))
    );
  }

  get end$() {
    return interval(this.timeService.remainingInMiliseconds + 1000).pipe(
      finalize(() => this.stop())
    );
  }

  stop() {
    if (this.timeService.remainingInMiliseconds === 0) {
      this.props.timeout();
    }
  }

  get initialMinutesToSeconds() {
    return this.props.initialMinutes * 60;
  }

  private padStart(value: number) {
    const stringValue = value.toString();
    return stringValue.padStart(2, '0')
  }

  render() {
    const { minutes, seconds } = this.state;

    return (
      <div className='timer-panel'>
        <div className='timer-unit'>
          <label className='name'>minutes</label>
          <span className='unit'>{this.padStart(minutes)}</span>
        </div>
        <div className='separator'>:</div>
        <div className='timer-unit'>
          <label className='name'>seconds</label>
          <span className='unit'>{this.padStart(seconds)}</span>
        </div>
      </div>
    );
  };
}