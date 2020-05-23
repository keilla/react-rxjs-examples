export class TimeService {
  constructor(private timeInSeconds: number) {}

  get minutes() {
    return Math.floor(this.timeInSeconds / 60);
  }

  get seconds() {
    return this.timeInSeconds % 60;
  }

  addMinutes(value: number) {
    this.timeInSeconds += value * 60;
  }

  addSeconds(value: number) {
    this.timeInSeconds += value;
  }
}
