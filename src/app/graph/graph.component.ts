import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';
import { HourlyDetail, Detail, TransposedRow, response, Shifts, Model } from "../Models/app.types"
import { DataService } from "../services/data.service"
import { Location } from '@angular/common';


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

  apiData: response;
  message: string;
  Arr = Array;
  hourlyDetailData: HourlyDetail[];
  filteredHourlyData: HourlyDetail[];
  map = new Map();
  shiftList: Shifts[];
  filteredShiftList: Shifts[];
  shiftSlots: object[];
  dataSource: any[];
  daysOfWeek: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"]
  orderOfDays: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Sat,Sunday"];
  days: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
  transposedData: TransposedRow[];
  filteredTransposedData: TransposedRow[];
  transposedColumnDef: Array<any>
  clinicianNames: Array<string>;
  requestBody: any = {}
  summaryHourlyDetail: HourlyDetail;
  private coverageSummaryGridApi;
  private shiftSummaryGridApi;


  goBack() {
    this._location.back();
  }

  filterDetails(filterVal: any) {
    let choiceOfDays =filterVal;
    if (choiceOfDays == -1) {
      this.filteredShiftList = this.shiftList;
      this.filteredHourlyData = this.hourlyDetailData;
      this.createColumnData(0);
      this.filteredTransposedData = this.transposedData;
      this.getSummary();
      this.createGraph(this.hourlyDetailData);
      return;
    }
    else if(choiceOfDays == 7){
      filterVal =5;
      this.filteredHourlyData = this.hourlyDetailData.slice(filterVal * 24, (parseInt(filterVal) + 1) * 48);
      this.createColumnData(120);
      this.filteredTransposedData = [];
      this.transposedData.forEach(transposedRow => {
      let newRow = this.filterList(filterVal * 24, (parseInt(filterVal) + 1) * 48, transposedRow);
      newRow["header"] = transposedRow["header"];
      this.filteredTransposedData.push(newRow);
      })
     this.filteredShiftList =[];
     for(filterVal = 5; filterVal <= 6; filterVal++){
      for(let itr in this.shiftList){
       if(this.shiftList[itr].day == this.daysOfWeek[filterVal]){
          this.filteredShiftList.push(this.shiftList[itr])
       }}
     }
    }
    else
    {
    this.filteredHourlyData = this.hourlyDetailData.slice(filterVal * 24, (parseInt(filterVal) + 1) * 24);
    this.createColumnData(filterVal * 24);
    this.filteredShiftList = this.shiftList.filter(a => a.day == this.daysOfWeek[filterVal])
    this.filteredTransposedData = [];
    this.transposedData.forEach(transposedRow => {
      let newRow = this.filterList(filterVal * 24, (parseInt(filterVal) + 1) * 24, transposedRow);
      newRow["header"] = transposedRow["header"];
      this.filteredTransposedData.push(newRow);
    })
    }
    this.getSummary();
    this.createGraph(this.filteredHourlyData);
  }


  filterList(startIndex: number, endIndex: number, dataArray: Object) {
    let newArray = new TransposedRow;
    for (let i = startIndex; i < endIndex; i++) {
      newArray[i - startIndex] = dataArray[i];
    }
    return newArray;
  }

  createNewShift(startTime: number, shiftLength: number) {
    let shift: Shifts = {};
    shift.startTime = startTime % 24;
    shift.endTime = (startTime + shiftLength) % 24;
    shift.day = this.daysOfWeek[Math.floor(startTime / 24)];
    shift.shiftLength = shiftLength;
    return shift;
  }
  processData() {
    this.hourlyDetailData.forEach((detail, index) => {
      detail.totalCoverage = detail.numberOfAPPs + detail.numberOfPhysicians + detail.numberOfScribes;
      detail.capacityWorkLoad = Math.round(detail.capacityWorkLoad * 100) / 100;
      detail.expectedWorkLoad = Math.round(detail.expectedWorkLoad * 100) / 100;
      detail.percentPhysician = Math.round(detail.numberOfPhysicians / detail.totalCoverage * 100) / 100;
      detail.expectedPatientsPerProvider = Math.round(detail.expectedWorkLoad / detail.totalCoverage * 100) / 100;
      detail.coveredPatientsPerProvider = Math.round(detail.capacityWorkLoad / detail.totalCoverage * 100) / 100;
      detail.differnceBetweenCapacityAndWorkload = Math.round((detail.capacityWorkLoad - detail.expectedWorkLoad) * 100) / 100;
      detail.wait = Math.round(detail.wait * 100) / 100;
      detail.loss = Math.round(detail.loss * 100) / 100;
      
    })


    this.filteredHourlyData = this.hourlyDetailData;
    this.map = new Map();
    this.shiftSlots.forEach((shiftSlot, index) => {
      for (let key of Object.keys(shiftSlot)) {
        let shift: Shifts = {};
        this.clinicianNames.forEach(name => {
          if (shiftSlot[key][name + "Start"] > 0) {
            if (this.map.has(index + "to" + key)) {
              shift = this.map.get(index + "to" + key);
              if (shift[name] != undefined)
                shift[name] += shiftSlot[key][name + "Start"];
              else
                shift[name] = shiftSlot[key][name + "Start"];
            }
            else {
              shift = this.createNewShift(index, parseInt(key));
              shift[name] = shiftSlot[key][name + "Start"];
            }
            this.map.set(index + "to" + key, shift)
          }
        })

      }

    })

    this.createColumnData(0);
    this.transposeData();
    return Array.from(this.map.values());
  }

  createColumnData(startIndex: number) {
    this.transposedColumnDef = [
      {
        headerName: '',
        field: 'header',
        cellStyle: { 'font-size': 'large' },
        pinned: 'left',
        width: 300,
        lockPosition: true
      }
    ];

    this.transposedColumnDef.push(...this.filteredHourlyData.map(translation => {
      return {
        headerName: (translation.hour - startIndex) + "",
        field: (translation.hour - startIndex).toString(),
        width: 75,
        lockPosition: true
      };
    }));
  }
  transposeData() {
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
      text: 'Workload and Capacity Pattern'
    },
    credits: {
      enabled: false
    },
    legend: { shadow: false },
    tooltip: {
      formatter: function () {
        var s = '<b>Hour ' + this.x + '</b>';

        this.points.forEach(element => {
          s += '<br/> ' + element.series.name + ': ' + element.y;
        });

        s += '<br>Excess Capacity: ' + Math.round((this.points[1].y - this.points[0].y) * 100) / 100;

        return s;
      },
      shared: true
    },

    plotOptions: {
      column: {
        grouping: false,
        shadow: false,
        borderWidth: 0
      }
    },
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
        name: 'Workload',
        color: 'rgba(165,170,217,1)',
        data: [150, 73, 40, 50],
        pointPadding: 0.3,
        pointPlacement: -0.2
      },
      {
        name: 'Capacity',
        color: 'rgba(126,86,134,.9)',
        data: [140, 90, 70, 60],
        pointPadding: 0.4,
        pointPlacement: -0.2
      }
    ]
  }

  constructor(private http: HttpClient, private dataService: DataService, private _location: Location) {
  }

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
    { headerName: 'Day', field: 'day',lockPosition: true },
    { headerName: 'Start Time', field: 'startTime',lockPosition: true },
    { headerName: 'End Time', field: 'endTime',lockPosition: true },
    { headerName: 'Shift Duration', field: 'shiftLength',lockPosition: true },
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
    { headerName: 'Hour Wait ', field: 'wait' },
    { headerName: 'Patient Lost ', field: 'loss' },
  ];


  changeHeaders() {

    this.clinicianNames.forEach((name, index) => {
      this.shiftColumnDef.push({ headerName: name + " count", field: name , lockPosition: true})
    })
    this.coverageColumnDef[1].headerName = this.requestBody.clinician[0].name + " Coverage";
    this.coverageColumnDef[2].headerName = this.requestBody.clinician[1].name + " Coverage";
    this.coverageColumnDef[3].headerName = this.requestBody.clinician[2].name + " Coverage";

  }

  round(number) {
    return Math.round(number * 100) / 100;
  }
  initialize(data) {
    this.hourlyDetailData = data.hourlyDetail;
    this.shiftSlots = data.clinicianHourCount;
    this.shiftList = this.processData();
    this.filteredShiftList = this.shiftList;
    this.filteredTransposedData = this.transposedData;
  }

  getCliniciansName() {
    this.clinicianNames = this.requestBody.clinician.map(c => c.name);
  }

  public onCoverageSummaryGridReady(params) {
    this.coverageSummaryGridApi = params.api;
  }

  coverageSummaryGridExport() {
    this.coverageSummaryGridApi.exportDataAsCsv();
  }


  public onShiftSummaryGridReady(params) {
    this.shiftSummaryGridApi = params.api;
  }

  shiftSummaryGridExport() {
    this.shiftSummaryGridApi.exportDataAsCsv();
  }


  ngOnInit() {
    this.dataService.apiData$.subscribe(apiData => this.apiData = apiData)
    // this.dataService.currentMessage.subscribe(message => this.message = message);
    this.requestBody = this.dataService.getRequestBody();
    if (this.apiData != null && this.requestBody != null) {
      this.getCliniciansName();
      this.changeHeaders();
      this.initialize(this.apiData);
      this.getSummary();
      this.createGraph(this.hourlyDetailData);
    }
    // window.scrollTo(0, 0);
  }

  getSummary() {
    this.summaryHourlyDetail = new HourlyDetail;
    Object.keys(this.filteredHourlyData[0]).forEach(key => {
      this.summaryHourlyDetail[key] = this.filteredHourlyData.reduce(function (prev, cur) {
        return prev + cur[key];
      }, 0)
    })
    Object.keys(this.summaryHourlyDetail).forEach(key => {
      this.summaryHourlyDetail[key] = Math.abs(this.round(this.summaryHourlyDetail[key]))
    })
  }
}



