

export interface HourlyDetail {
    hour?: number;
    capacityWorkLoad?: number;
    expectedWorkLoad?: number;
    numberOfPhysicians?: number;
    numberOfAPPs?: number;
    numberOfScribes?: number;
    numberOfShiftBeginning?: number;
    numberOfShiftEnding?: number;
    totalCoverage?:number;
    percentPhysician ? :number ;
    expectedPatientsPerProvider?:number;
    coveredPatientsPerProvider?:number;
  }
  
  export interface Detail{
    physicianStart?:number;
    physicianEnd?:number;
    appStart?:number;
    appEnd?:number;
    scribeStart?:number;
    scribeEnd?:number;
  }
  
  
  export class TransposedRow {
    header: string;
    [index: string]: string;
  }
  export class response{
    hourlyDetail: HourlyDetail[];
    clinicianHourCount : Map<number, Detail> [];
  }
  export class Shifts {
    shiftLength: number =0;
    startTime: number =0;
    endTime: number =0;
    physicians: number =0;
    apps: number =0;
    scribes: number =0;
    day:string;
  }
  
  export class Model{
    patientsPerHour: number;
    capacity: Array<number>;
    cost: number;
    name: String;
   expressions: Array<String>
  }
  