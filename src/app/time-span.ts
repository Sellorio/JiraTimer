export class TimeSpan {
  isNegative: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;

  constructor(isNegative: boolean, days: number, hours: number, minutes: number, seconds: number) {
    this.isNegative = isNegative;
    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;

    if (hours > 23) {
      throw new Error('Invalid time. Hours cannot be greater than 23.');
    }

    if (minutes > 59) {
      throw new Error('Invalid time. Minutes cannot be greater than 59.');
    }

    if (seconds > 59) {
      throw new Error('Invalid time. Seconds cannot be greater than 59.');
    }
  }

  public toTime(): number {
    const magnitude = this.seconds * 1000 + this.minutes * 60000 + this.hours * 3600000 + this.days * 86400000;
    return this.isNegative ? -1 * magnitude : magnitude;
  }

  public toDate(origin?: Date) {
    origin = new Date(origin);
    origin.setHours(0);
    origin.setMinutes(0);
    origin.setSeconds(0);
    origin.setMilliseconds(0);

    const result = new Date(origin.getTime() + this.toTime());

    return result;
  }

  public addTo(date: Date) {
    return new Date(date.getTime() + this.toTime());
  }

  public toString(): string {
    let result = '';

    if (this.isNegative) {
      result += '-';
    }

    if (this.days !== 0) {
      result += this.days.toString() + '.';
    }

    result += this.hours < 10 ? '0' + this.hours.toString() : this.hours.toString();
    result += ':';
    result += this.minutes < 10 ? '0' + this.minutes.toString() : this.minutes.toString();
    result += ':';
    result += this.seconds < 10 ? '0' + this.seconds.toString() : this.seconds.toString();

    return result;
  }

  public static fromTime(time: number): TimeSpan {
    const isNegative = time < 0;
    let magnitude = Math.abs(time);

    const days = Math.floor(magnitude / 86400000);
    magnitude = magnitude % 86400000;
    const hours = Math.floor(magnitude / 3600000);
    magnitude = magnitude % 3600000;
    const minutes = Math.floor(magnitude / 60000);
    const seconds = Math.floor((magnitude % 60000) / 1000);
    const result = new TimeSpan(isNegative, days, hours, minutes, seconds);

    return result;
  }

  public static parse(timeSpan: string): TimeSpan {
    const match = /^(?:(\-)|)(?:([0-9]+)\.|)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})$/.exec(timeSpan);

    if (match === null) {
        throw new Error('Invalid time format. Please pass in as hours:minutes:seconds.');
    }

    const isNegative = match[1] ? true : false;
    const days = match[2] ? parseInt(match[2], 10) : 0;
    const hours = parseInt(match[3], 10);
    const minutes = parseInt(match[4], 10);
    const seconds = parseInt(match[5], 10);

    return new TimeSpan(isNegative, days, hours, minutes, seconds);
  }

  public static fromDate(date: Date): TimeSpan {
    return new TimeSpan(false, 0, date.getHours(), date.getMinutes(), date.getSeconds());
  }
}
