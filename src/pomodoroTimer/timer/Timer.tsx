import React from 'react';
import { TimerProps } from './timerProps';
import './Timer.scss';

interface TimerState {
  minutes: number;
  seconds: number;
} 

export class Timer extends React.Component<TimerProps, TimerState> {

  constructor(props: TimerProps) {
    super(props);
    this.state = {
      minutes: 0,
      seconds: 0
    };
  }

  componentDidMount() {
    this.setState({minutes: this.props.initialMinutes});
  }

  padStart(value: number) {
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