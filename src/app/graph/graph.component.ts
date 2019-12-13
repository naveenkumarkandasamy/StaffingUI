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
  daysOfWeek: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  days: number[] = [0, 1, 2, 3, 4, 5, 6];
  transposedData: TransposedRow[];
  filteredTransposedData: TransposedRow[];
  transposedColumnDef: Array<any>
  clinicianNames: Array<String>;
  requestBody: any = {
  }
  summaryHourlyDetail: HourlyDetail;
  goBack() {
    this._location.back();
  }

  filterDetails(filterVal: any) {
    if (filterVal == -1) {
      this.filteredShiftList = this.shiftList;
      this.filteredHourlyData = this.hourlyDetailData;
      this.createColumnData(0);
      this.filteredTransposedData = this.transposedData;
      this.createGraph(this.hourlyDetailData);
      return;
    }
    this.filteredHourlyData = this.hourlyDetailData.slice(filterVal * 24, (parseInt(filterVal) + 1) * 24);
    this.createColumnData(filterVal * 24);
    this.filteredShiftList = this.shiftList.filter(a => a.day == this.daysOfWeek[filterVal])
    this.filteredTransposedData = [];

    this.transposedData.forEach(transposedRow => {
      let newRow = this.filterList(filterVal * 24, (parseInt(filterVal) + 1) * 24, transposedRow);
      newRow["header"] = transposedRow["header"];
      this.filteredTransposedData.push(newRow);

    })
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
    let shift = new Shifts();
    shift.startTime = startTime % 24;
    shift.endTime = (startTime + shiftLength) % 24;
    shift.day = this.daysOfWeek[Math.floor(startTime / 24)];
    shift.shiftLength = shiftLength;
    return shift;
  }

  calculateWaitLoss(currentHourlyData: HourlyDetail, prevHourlyData: HourlyDetail) {
    if (prevHourlyData.wait == 0 && prevHourlyData.differnceBetweenCapacityAndWorkload < 0) {
      if (currentHourlyData.differnceBetweenCapacityAndWorkload > 0)
        currentHourlyData.wait = Math.min(0, currentHourlyData.differnceBetweenCapacityAndWorkload + prevHourlyData.differnceBetweenCapacityAndWorkload);
      else
        currentHourlyData.wait = prevHourlyData.differnceBetweenCapacityAndWorkload
      currentHourlyData.loss = 0;
    }
    else if (prevHourlyData.wait < 0 && currentHourlyData.differnceBetweenCapacityAndWorkload < 0) {
      currentHourlyData.loss = prevHourlyData.wait;
      currentHourlyData.wait = prevHourlyData.differnceBetweenCapacityAndWorkload;
    }
    else if (prevHourlyData.wait < 0) {
      let sum = prevHourlyData.wait + prevHourlyData.differnceBetweenCapacityAndWorkload;
      if (Math.abs(sum) < currentHourlyData.differnceBetweenCapacityAndWorkload) {
        currentHourlyData.wait = 0;
        currentHourlyData.loss = 0;
      }
      else {
        currentHourlyData.loss = Math.min(0, currentHourlyData.differnceBetweenCapacityAndWorkload - Math.abs(prevHourlyData.wait));
        currentHourlyData.wait = Math.max(prevHourlyData.differnceBetweenCapacityAndWorkload, currentHourlyData.differnceBetweenCapacityAndWorkload + sum - currentHourlyData.loss);
      }
    }
    else {
      currentHourlyData.wait = 0;
      currentHourlyData.loss = 0;
    }

    if (currentHourlyData.wait > 0) currentHourlyData.wait = 0;

    currentHourlyData.wait = Math.round(currentHourlyData.wait * 100) / 100;
    currentHourlyData.loss = Math.round(currentHourlyData.loss * 100) / 100;
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
      if (index == 0) {
        detail.wait = 0;
        detail.loss = 0;
      }
      if (index == 1) {
        detail.wait = Math.abs(this.hourlyDetailData[0].differnceBetweenCapacityAndWorkload) + detail.differnceBetweenCapacityAndWorkload;
        detail.loss = 0;
      }
      if (index > 1) {
        this.calculateWaitLoss(detail, this.hourlyDetailData[index - 1])
      }
      if (detail.wait > 0) detail.wait = 0;
    })
    this.filteredHourlyData = this.hourlyDetailData;
    this.map = new Map();
    this.shiftSlots.forEach((shiftSlot, index) => {
      for (let key of Object.keys(shiftSlot)) {
        let shift = new Shifts();
        if (shiftSlot[key][this.clinicianNames[0] + "Start"] > 0) {
          if (this.map.has(index + "to" + key)) {
            shift = this.map.get(index + "to" + key);
            shift.physicians += shiftSlot[key][this.clinicianNames[0] + "Start"];
          }
          else {
            shift = this.createNewShift(index, parseInt(key));
            shift.physicians = shiftSlot[key][this.clinicianNames[0] + "Start"];
          }
          this.map.set(index + "to" + key, shift)
        }
        if (shiftSlot[key][this.clinicianNames[1] + "Start"] > 0) {
          if (this.map.has(index + "to" + key)) {
            shift = this.map.get(index + "to" + key);
            shift.apps += shiftSlot[key][this.clinicianNames[1] + "Start"];
          }
          else {
            shift = this.createNewShift(index, parseInt(key))
            shift.apps = shiftSlot[key][this.clinicianNames[1] + "Start"];
          }
          this.map.set(index + "to" + key, shift)
        }
        if (shiftSlot[key][this.clinicianNames[2] + "Start"] > 0) {
          if (this.map.has(index + "to" + key)) {
            shift = this.map.get(index + "to" + key);
            shift.scribes += shiftSlot[key][this.clinicianNames[2] + "Start"];
            ;
          }
          else {
            shift = this.createNewShift(index, parseInt(key))
            shift.scribes = shiftSlot[key][this.clinicianNames[2] + "Start"];

          }
          this.map.set(index + "to" + key, shift)
        }

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
        width: 300
      }
    ];

    this.transposedColumnDef.push(...this.filteredHourlyData.map(translation => {
      return {
        headerName: (translation.hour - startIndex) + "",
        field: (translation.hour - startIndex).toString(),
        width: 75
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
    { headerName: 'Two Hour Wait ', field: 'wait' },
    { headerName: 'Patient Lost ', field: 'loss' },
  ];


  changeHeaders() {
    this.coverageColumnDef[1].headerName = this.requestBody.clinician[0].name + " Coverage";
    this.coverageColumnDef[2].headerName = this.requestBody.clinician[1].name + " Coverage";
    this.coverageColumnDef[3].headerName = this.requestBody.clinician[2].name + " Coverage";

    this.shiftColumnDef[4].headerName = this.requestBody.clinician[0].name + " count";
    this.shiftColumnDef[5].headerName = this.requestBody.clinician[1].name + " count";
    this.shiftColumnDef[6].headerName = this.requestBody.clinician[2].name + " count";

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
    this.createGraph(this.hourlyDetailData);
  }

  getCliniciansName() {
    this.clinicianNames = this.requestBody.clinician.map(c => c.name);
  }

  ngOnInit() {
    this.dataService.apiData$.subscribe(apiData => this.apiData = apiData)
    this.dataService.currentMessage.subscribe(message => this.message = message);
    this.requestBody = this.dataService.getRequestBody();
    if (this.apiData != null && this.requestBody != null) {
      this.getCliniciansName();
      this.changeHeaders();
      this.initialize(this.apiData);
      this.getSummary();
    }
    // Highcharts.chart('container', this.options);    
  }

  getSummary() {
    this.summaryHourlyDetail = new HourlyDetail;
    Object.keys(this.filteredHourlyData[0]).forEach(key => {
      this.summaryHourlyDetail[key] = this.filteredHourlyData.reduce(function (prev, cur) {
        return prev + cur[key];
      }, 0)
    })
      Object.keys(this.summaryHourlyDetail).forEach(key=> {
        this.summaryHourlyDetail[key] = Math.abs(this.round( this.summaryHourlyDetail[key]))
      })
  }


}



