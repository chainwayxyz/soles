class LogData {
  private data: string[] = [];

  private maxLines: number = 1000;

  public setData(data: string[]) {
    this.data = data;
  }

  // make deep copy of this object
  public clone(): LogData {
    const logData = new LogData();
    logData.setData(this.data.slice());
    return logData;
  }

  // add reverse
  public addLine(line: string) {
    this.data.unshift(line);
    if (this.data.length > this.maxLines) {
      this.data.pop();
    }
  }

  public getLines(): string[] {
    return this.data;
  }
}

export default LogData;
