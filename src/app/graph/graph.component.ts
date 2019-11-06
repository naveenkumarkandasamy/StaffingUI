import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ColDef } from 'ag-grid-community';
import {HourlyDetail, Detail, TransposedRow, response, Shifts, Model} from "../Models/app.types"
import { DataService } from "../services/data.service"
import {Location} from '@angular/common';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');


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

  apiData:response;
  message:string;
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

  
  goBack() {
    console.log("'goBack")
    this._location.back();
  }

  filterDetails(filterVal: any) {
    if(filterVal == -1){
     
      this.filteredShiftList = this.shiftList;
      
     
     this.filteredHourlyData = this.hourlyDetailData;
     this.createColumnData(0);
     this.filteredTransposedData = this.transposedData;
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
      detail.totalCoverage = detail.numberOfAPPs+detail.numberOfPhysicians+detail.numberOfScribes;
      detail.capacityWorkLoad = Math.round(detail.capacityWorkLoad *100)/100;
      detail.expectedWorkLoad = Math.round(detail.expectedWorkLoad*100)/100;
      detail.percentPhysician = Math.round(detail.numberOfPhysicians/detail.totalCoverage *100)/100;
      detail.expectedPatientsPerProvider = Math.round( detail.expectedWorkLoad/detail.totalCoverage*100)/100;
      detail.coveredPatientsPerProvider = Math.round(detail.capacityWorkLoad/detail.totalCoverage*100)/100;
      detail.differnceBetweenCapacityAndWorkload = Math.round((detail.capacityWorkLoad-detail.expectedWorkLoad)*100)/100;
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
          text: 'Patient Arriving'
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





  constructor(private http: HttpClient, private dataService: DataService, private _location: Location) { }

  private createGraph(data: HourlyDetail[]) {
    let expectedWorkLoadArray = data.map(hour => hour.expectedWorkLoad); //.slice(0,24);
    let capacityWorkLoadArray = data.map(hour => hour.capacityWorkLoad); //.slice(0,24);
    this.dataSource = data; //.slice(0,24);
    this.options.series = [
      {
        name: 'Workload',
        color: 'rgba(0,0,217,1)',
        data: expectedWorkLoadArray,
        pointPadding: 0.3,
        pointPlacement: -0.2
      },
      {
        name: 'Capacity',
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
    { headerName: 'Difference ', field: 'differnceBetweenCapacityAndWorkload' },
    { headerName: 'Expected Patient Per Provider', field: 'expectedPatientsPerProvider' },
    { headerName: 'Covered Patient Per Provider', field: 'coveredPatientsPerProvider' },
    { headerName: 'Cost ', field: 'costPerHour' },
        
  ];

  initialize(data){
    this.hourlyDetailData = data.hourlyDetail;
    this.shiftSlots = data.clinicianHourCount;
    this.shiftList = this.processData();
    this.filteredShiftList = this.shiftList;
    this.filteredTransposedData = this.transposedData;
    this.createGraph(this.hourlyDetailData);
  }

  
  
  ngOnInit() {
    this.dataService.apiData$.subscribe(apiData => this.apiData = apiData)
    this.dataService.currentMessage.subscribe(message => this.message = message);
    if(this.apiData!=null){
      this.initialize(this.apiData)

    }
    // Highcharts.chart('container', this.options);    
  }

}



