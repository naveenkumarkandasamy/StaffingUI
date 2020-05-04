export class HourlyDetail {
  hour?: number;
  capacityWorkLoad?: number;
  expectedWorkLoad?: number;
  numberOfPhysicians?: number;
  numberOfAPPs?: number;
  numberOfScribes?: number;
  numberOfShiftBeginning?: number;
  numberOfShiftEnding?: number;
  costPerHour?: number;
  totalCoverage?: number;
  percentPhysician?: number;
  expectedPatientsPerProvider?: number;
  coveredPatientsPerProvider?: number;
  differnceBetweenCapacityAndWorkload?: number;
  wait?: number;
  loss?: number;
}

export interface Detail {
  physicianStart?: number;
  physicianEnd?: number;
  appStart?: number;
  appEnd?: number;
  scribeStart?: number;
  scribeEnd?: number;
}

export class TransposedRow {
  header: string;
  [index: string]: string;
}
export class response {
  hourlyDetail: HourlyDetail[];
  clinicianHourCount: Map<number, Detail>[];
}
export interface Shifts {
  shiftLength?: number;
  startTime?: number;
  endTime?: number;
  physicians?: number;
  apps?: number;
  scribes?: number;
  day?: string;
}

export class Model {
  capacity: Array<number>;
  cost: number;
  name: String;
  expressions: Array<String>
}
export class Efficiency {
  name: String;
  firstHour: number;
  midHour: number;
  lastHour: number;
}