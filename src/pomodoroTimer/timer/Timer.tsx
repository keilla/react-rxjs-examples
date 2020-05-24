import React from 'react';
import { interval, empty, Subject, Observable } from 'rxjs';
import { finalize, takeUntil, tap, switchMap } from 'rxjs/operators';
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
    private readonly interval$ = interval(1000),
    private unSub$: Subject<void>
  ) {
    super(props);
    this.state = { minutes: 0, seconds: 0 };
    this.unSub$ = new Subject();
  }

  componentDidMount() {
    this.props.isRunning$.pipe(
      takeUntil(this.unSub$),
      switchMap(isRunning => isRunning ? this.start$ : empty())
    ).subscribe();
  }

  componentDidUpdate(prevProps: TimerProps) {
    if (this.props.initialMinutes !== prevProps.initialMinutes) {
      const initialTimeToSeconds = this.props.initialMinutes * 60;
      this.timeService = new TimeService(initialTimeToSeconds);

      this.setState({
        minutes: this.timeService.minutes,
        seconds: this.timeService.seconds,
      });
    }
  }

  get start$(): Observable<number> {
    return this.timer$.pipe(
      tap(() => this.setState({ seconds: this.timeService.seconds, minutes: this.timeService.minutes }))
    );
  }

  get timer$(): Observable<number> {
    return this.interval$.pipe(
      takeUntil(this.end$),
      tap(() => this.timeService.addSeconds(-1))
    );
  }

  get end$(): Observable<number> {
    return interval(this.timeService.remainingInMiliseconds + 1000).pipe(
      finalize(() => this.stop())
    );
  }

  private stop(): void {
    if (this.timeService.remainingInMiliseconds === 0) {
      this.props.timeout();
    }
  }

  private padStart(value: number): string {
    const stringValue = value.toString();
    return stringValue.padStart(2, '0')
  }

  componentWillUnmount() {
    this.unSub$.next();
    this.unSub$.complete();
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