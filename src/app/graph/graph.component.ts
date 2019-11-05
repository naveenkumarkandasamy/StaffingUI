import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ColDef } from 'ag-grid-community';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

interface HourlyDetail {
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

interface Detail{
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
class response{
  hourlyDetail: HourlyDetail[];
  clinicianHourCount : Map<number, Detail> [];
}
class Shifts {
  shiftLength: number =0;
  startTime: number =0;
  endTime: number =0;
  physicians: number =0;
  apps: number =0;
  scribes: number =0;
  day:string;
}

class Model{
  patientsPerHour: number;
  capacity: Array<number>;
  cost: number;
  name: String;
 expressions: Array<String>
}

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  Arr = Array;
  hourlyDetailData: HourlyDetail[];
  filteredHourlyData: HourlyDetail[];
  map = new Map();
  shiftList: Shifts[];
  filteredShiftList: Shifts[];
  shiftSlots: object[];
  dataSource: any[];
  daysOfWeek : string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  days: number[] = [0, 1, 2, 3, 4, 5, 6];
  transposedData: TransposedRow[];
  filteredTransposedData : TransposedRow[];
  transposedColumnDef: Array<any>

  model: Model[] = [
    {
      "patientsPerHour": 1.2,
      "capacity": [1.0, 0.83, 0.67],
      "cost": 200,
      "name": "physician",
      "expressions": []
    },
    {
      "patientsPerHour": 0.6,
      "capacity": [0.6, 0.5, 0.4],
      "cost": 65,
      "name": "app",
      "expressions": ["2 * m"]
    },
    {
      "patientsPerHour": 0.37,
      "capacity": [0.15, 0.12, 0.1],
      "cost": 20,
      "name": "scribe",
      "expressions": ["1 * m", "1 * n"]
    }]

  columnDefs = [
    { headerName: 'Role', field: 'name' },
    {
      headerName: 'Patients Per Hr', valueGetter: function (params) {
        return params.data.patientsPerHour;
      },
      valueSetter: function (params) {
        if (params.data.patientsPerHour !== params.newValue) {
          params.data.patientsPerHour = params.newValue;
          return true;
        } else {
          return false;
        }
      }
    },
    {
      headerName: 'Price',
      valueGetter: function (params) {
        return params.data.cost;
      },
      valueSetter: function (params) {
        if (params.data.cost !== params.newValue) {
          params.data.cost = params.newValue;
          return true;
        } else {
          return false;
        }
      },
    }
  ];

  defaultColDef = {
    editable: true,
    resizable: true
  }

  clear(){
    this.filteredShiftList = [];
    
    this.hourlyDetailData =[];
  }

  filterDetails(filterVal: any) {
    if(filterVal == -1){
      this.filteredShiftList = this.shiftList;
      this.filteredTransposedData = this.transposedData;
      console.log(this.transposedData);
      this.createGraph(this.hourlyDetailData);
      

      return; 
    }
    this.filteredHourlyData = this.hourlyDetailData.slice(filterVal * 24, (parseInt(filterVal) + 1) * 24);
    this.createColumnData(filterVal*24);
    this.filteredShiftList = this.shiftList.filter(a=>a.day == this.daysOfWeek[filterVal])
    this.filteredTransposedData=[];
   
    this.transposedData.forEach(transposedRow=>{
      let newRow = this.filterList(filterVal*24,  (parseInt(filterVal) + 1) * 24, transposedRow);
      newRow["header"]=transposedRow["header"];
      this.filteredTransposedData.push(newRow);

    })
    console.log(this.filteredTransposedData);
   
    this.createGraph(this.filteredHourlyData);
    ;
  }


  filterList(startIndex:number, endIndex:number, dataArray: Object){
    let newArray = new TransposedRow;
    for(let i=startIndex;i<endIndex;i++){
      newArray[i-startIndex]=dataArray[i];
    }
    return newArray;
  }
  submitted = false;

  createNewShift(startTime:number, shiftLength:number){
    let shift = new Shifts();
    shift.startTime = startTime%24;
    shift.endTime = (startTime+shiftLength)%24;
    shift.day = this.daysOfWeek[Math.floor(startTime/24)];
    shift.shiftLength = shiftLength;
    return shift;
  }
  processData() {
    this.hourlyDetailData.forEach(detail=>{
      detail.expectedWorkLoad = detail.expectedWorkLoad*this.model[0].patientsPerHour;
      detail.capacityWorkLoad = detail.capacityWorkLoad*this.model[0].patientsPerHour;
      detail.totalCoverage = detail.numberOfAPPs+detail.numberOfPhysicians+detail.numberOfScribes;
      detail.capacityWorkLoad = Math.round(detail.capacityWorkLoad *100)/100;
      detail.expectedWorkLoad = Math.round(detail.expectedWorkLoad*100)/100;
      detail.percentPhysician = Math.round(detail.numberOfPhysicians/detail.totalCoverage *100)/100;
      detail.expectedPatientsPerProvider = Math.round( detail.expectedWorkLoad/detail.totalCoverage*100)/100;
      detail.coveredPatientsPerProvider = Math.round(detail.capacityWorkLoad/detail.totalCoverage*100)/100;
    })
    this.filteredHourlyData = this.hourlyDetailData;
    this.map = new Map();
    this.shiftSlots.forEach((shiftSlot, index) => {
      for (let key of Object.keys(shiftSlot)) {
         let shift = new Shifts();
        if (shiftSlot[key].physicianStart > 0) {
          if (this.map.has(index + "to" + key)) {
            shift = this.map.get(index + "to" + key);
            shift.physicians += shiftSlot[key].physicianStart;
          }
          else {
             shift = this.createNewShift(index, parseInt(key));
            shift.physicians = shiftSlot[key].physicianStart;
          }
          this.map.set(index + "to" + key, shift)
        }
        if (shiftSlot[key].appStart > 0) {
          if (this.map.has(index + "to" + key)) {
            shift = this.map.get(index + "to" + key);
            shift.apps += shiftSlot[key].appStart;
          }
          else {
            shift =  this.createNewShift(index, parseInt(key))
            shift.apps = shiftSlot[key].appStart;
          }
          this.map.set(index + "to" + key, shift)
        }
        if (shiftSlot[key].scribeStart > 0) {
          if (this.map.has(index + "to" + key)) {
             shift = this.map.get(index + "to" + key);
            shift.scribes += shiftSlot[key].scribeStart;
            ;
          }
          else {
             shift =  this.createNewShift(index, parseInt(key))
            shift.scribes = shiftSlot[key].scribeStart;
            
          }
          this.map.set(index + "to" + key, shift)
        }
       
      }

    })
    this.createColumnData(0);
    this.transposeData();
    //console.log(this.transposedData, this.transposedColumnDef);
    return Array.from(this.map.values());
  }

  createColumnData(startIndex:number){
    this.transposedColumnDef = [
      {
        headerName: '',
        field: 'header',
        cellStyle: { 'font-size': 'large' },
        pinned: 'left',
        width : 300
      }
    ];
  
    this.transposedColumnDef.push(...this.filteredHourlyData.map(translation => {
      return {
        headerName: (translation.hour-startIndex)+"",
        field: (translation.hour-startIndex).toString(),
       width : 75
      };
     }));
  }
  transposeData(){
      // use map, spread, and push to populate the rest of the columns
    this.transposedData = this.coverageColumnDef
      .filter((_, index) => index > 0) // we don't show first column - it's the header
      .map(data => {
        const lowerLang = data.headerName.toLowerCase();
        // add a special column for the header name
        const columnValues = {
          header: data.headerName,
        };
        // use forEach to populate the row from the root data
        this.hourlyDetailData.forEach(translation => {
          columnValues[translation.hour] = translation[data.field];
        });
        return columnValues;
      });
  }
  
  calculateCapacity(){
    for(let i=1;i<this.model.length;i++){
      this.model[i].capacity[0] = this.model[i].patientsPerHour/this.model[0].patientsPerHour;
      this.model[i].capacity[1] = this.model[i].capacity[0] * this.model[0].capacity[1];
      this.model[i].capacity[2] = this.model[i].capacity[0] * this.model[0].capacity[2];
    }
  }
  onSubmit() {
    this.submitted = true;
    const apiLink = 'http://localhost:8080/Staffing/api/shiftPlan';
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    this.calculateCapacity();
    this.http.post<response>(apiLink, this.model, options)
      .toPromise()
      .then(data => {
        this.hourlyDetailData = data.hourlyDetail;
        this.shiftSlots = data.clinicianHourCount;
        this.shiftList = this.processData();
        this.filteredShiftList = this.shiftList;
        this.filteredTransposedData = this.transposedData;
        this.createGraph(this.hourlyDetailData);
      },
        error => {
          console.log('Something went wrong.');
        })
  }


  public options: any = {
    chart: {
      type: 'column',
      height: 400
    },
    title: {
      text: 'Efficiency Optimization by Branch'
    },
    credits: {
      enabled: false
    },
    legend: { shadow: false },
    tooltip: {
      formatter: function () {
        return
        '  workload: ' + this.y.toFixed(2);
      }
    },
    plotOptions: {
      column: {
        grouping: false,
        shadow: false,
        borderWidth: 0
      }
    },
    // xAxis: {
    //   categories: ['Seattle HQ', 'San Francisco', 'Tokyo']
    // },
    yAxis: [
      {
        min: 0,
        title: {
          text: 'Employees'
        }
      }
    ],
    series: [
      {
        name: 'Employees',
        color: 'rgba(165,170,217,1)',
        data: [150, 73, 40, 50],
        pointPadding: 0.3,
        pointPlacement: -0.2
      },
      {
        name: 'Employees Optimized',
        color: 'rgba(126,86,134,.9)',
        data: [140, 90, 70, 60],
        pointPadding: 0.4,
        pointPlacement: -0.2
      }
    ]
  }





  constructor(private http: HttpClient) { }

  private createGraph(data: HourlyDetail[]) {
    let expectedWorkLoadArray = data.map(hour => hour.expectedWorkLoad); //.slice(0,24);
    let capacityWorkLoadArray = data.map(hour => hour.capacityWorkLoad); //.slice(0,24);
    this.dataSource = data; //.slice(0,24);
    this.options.series = [
      {
        name: 'Expected Workload',
        color: 'rgba(0,0,217,1)',
        data: expectedWorkLoadArray,
        pointPadding: 0.3,
        pointPlacement: -0.2
      },
      {
        name: 'Covered Workload',
        color: 'rgba(255,165,0,1)',
        data: capacityWorkLoadArray,
        pointPadding: 0.4,
        pointPlacement: -0.2
      }
    ];
    Highcharts.chart('container', this.options);
  }






  shiftColumnDef = [
    { headerName: 'Day', field: 'day' },
    { headerName: 'Start Time', field: 'startTime' },
    { headerName: 'End Time', field: 'endTime' },
    { headerName: 'Shift Duration', field: 'shiftLength' },
    { headerName: 'Physician Count', field: 'physicians' },
    { headerName: 'APP count', field: 'apps' },
    { headerName: 'Scribe count', field: 'scribes' },
  ];


  coverageColumnDef = [
    { headerName: 'Hour', field: 'hour' },
    { headerName: 'Physician Coverage', field: 'numberOfPhysicians' },
    { headerName: 'APP Coverage', field: 'numberOfAPPs' },
    { headerName: 'Scribe Coverage', field: 'numberOfScribes' },
    { headerName: 'Total Coverage', field: 'totalCoverage' },
    { headerName: 'Percent Physician ', field: 'percentPhysician' },
    { headerName: 'Expected Patient Arriving', field: 'expectedWorkLoad' },
    { headerName: 'Covered Patient Arriving', field: 'capacityWorkLoad' },
    { headerName: 'Expected Patient Per Provider', field: 'expectedPatientsPerProvider' },
    { headerName: 'Covered Patient Per Provider', field: 'coveredPatientsPerProvider' },
    
        
  ];


  
  
  ngOnInit() {
    // Highcharts.chart('container', this.options);    
  }

}



