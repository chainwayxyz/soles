class LogData {
  private data: string[] = [];

  private maxLines: number = 1000;

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
