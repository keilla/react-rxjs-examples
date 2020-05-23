import React from 'react';
import { interval } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';
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
    this.start();
  }

  get timer$() {
    const interval$ = interval(this.intervalInMiliseconds);
    const end$ = interval(this.initialMinutesToMiliseconds + this.intervalInMiliseconds);

    return interval$.pipe(
      takeUntil(end$),
      tap(() => this.timeService.addSeconds(-1)),
      finalize(() => console.log('Time is Up'))
    );
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

  private start() {
    this.timer$.pipe(
      tap(() => this.setState({ seconds: this.timeService.seconds, minutes: this.timeService.minutes }))
    ).subscribe();
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