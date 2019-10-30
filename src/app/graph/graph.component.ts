import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

interface HourlyDetail {
  hour?: string;
  capacityWorkLoad?: number;
  expectedWorkLoad?: number;
  numberOfPhysicians?: number;
  numberOfShiftBeginning?: number;
  numberOfShiftEnding?: number;
}

class Hero {

  constructor(
    public id?: number,
    public roleDescription?: string,
    public patientsCoveredPerHr?: string,
    public cost?: number
  ) { }

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

  hourlyDetailData : HourlyDetail[];
  displayedColumns: string[] = ['No Of Physicians', 'expected Pts/Hr', 'capacity Pts/Hr'];
  dataSource: any[];
  days: number[] = [0,1,2,3,4,5,6];
  model: object[] = [
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
      "expressions": ["1 * m"]
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
      return params.data.cost ;
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

  
  filterDetails(filterVal: any) {
      
      let data = this.hourlyDetailData.slice(filterVal*24 , (parseInt(filterVal)+1)*24)
        this.createGraph( data );
    ;
}
  gridOptions = {
    defaultColDef: {
      editable: true,
      resizable: true
    },
    columnDefs: this.columnDefs,
    onGridReady: function (params) {
      params.api.sizeColumnsToFit();
    },
    onRowEditingStarted: function (event) {
      console.log('never called - not doing row editing');
    },
    onRowEditingStopped: function (event) {
      console.log('never called - not doing row editing');
    },

  };

  submitted = false;

  onSubmit() {
    this.submitted = true;
    console.log(this.model)
    const apiLink = 'http://localhost:8080/Staffing/api/shiftPlan';
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    this.http.post<HourlyDetail[]>(apiLink, this.model, options)
      .toPromise()
      .then(data => {
        this.hourlyDetailData = data;
        this.createGraph(data);
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
        name: 'Expected Workloap',
        color: 'rgba(0,0,217,1)',
        data: expectedWorkLoadArray,
        pointPadding: 0.3,
        pointPlacement: -0.2
      },
      {
        name: 'Serving Capacity',
        color: 'rgba(255,165,0,1)',
        data: capacityWorkLoadArray,
        pointPadding: 0.4,
        pointPlacement: -0.2
      }
    ];
    Highcharts.chart('container', this.options);
  }

  ngOnInit() {
    // Highcharts.chart('container', this.options);    
  }

  getApiResponse(url) {
    return this.http.get(url, {})
      .toPromise().then(res => {
        return res;
      });
  }
}



