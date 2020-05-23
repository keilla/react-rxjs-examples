import React from 'react';
import { interval, empty } from 'rxjs';
import { finalize, takeUntil, tap, mapTo, switchMap, scan } from 'rxjs/operators';
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
    private readonly intervalInMiliseconds = 1000
  ) {
    super(props);
    this.state = { minutes: 0, seconds: 0 };
    this.timeService = new TimeService(this.initialMinutesToSeconds);
  }

  componentDidMount() {
    this.setState({
      minutes: this.timeService.minutes,
      seconds: this.timeService.seconds
    });

    const { isRunning$, reset$ } = this.props;
  
    reset$.pipe(mapTo(false));

    isRunning$.pipe(
      switchMap(isRunning => {
        console.log('isRunning', isRunning);
        return isRunning ? this.start$ : empty()
      })
    ).subscribe((x) => console.log('x', x));
  }

  private get start$() {
    return this.timer$.pipe(
      tap(() => this.setState({ seconds: this.timeService.seconds, minutes: this.timeService.minutes }))
    );
  }

  get timer$() {
    const end$ = interval(this.initialMinutesToMiliseconds + this.intervalInMiliseconds);

    return this.remanaingTime$.pipe(
      takeUntil(end$),
      tap(() => this.timeService.addSeconds(-1)),
      finalize(() => this.props.timeout())
    );
  }

  get remanaingTime$() {
    return interval(this.intervalInMiliseconds);
  }

  get elapsedTime$() {
    return this.remanaingTime$.pipe(scan((acc, curr) => acc + curr, 0))
    .subscribe(val => console.log('val', val));
  }

  get initialMinutesToSeconds() {
    return this.props.initialMinutes * 60;
  }

  get initialMinutesToMiliseconds() {
    return this.initialMinutesToSeconds * 1000;
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