  export function hoursToSeconds(hours: string) {
    const [hh, mm, ss] = hours.split(":").map(Number);
    return hh * 3600 + mm * 60 + (ss ? ss : 0);
  }