import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {HourlyDetail, Detail, TransposedRow, response, Shifts, Model} from "../Models/app.types"
import { DataService } from "../services/data.service"

@Component({
  selector: 'tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent implements OnInit {

  message:string;
  apiData:response;
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


  constructor(private router: Router, private http: HttpClient,private dataService: DataService ) { }

  ngOnInit() {
    this.dataService.apiData$.subscribe(apiData => this.apiData = apiData)
  }

  printHi(){
   // console.log(selection.value);
  }


  onSubmit() {
    this.calculateCapacity();
    const apiLink = 'http://localhost:8080/Staffing/api/shiftPlan';
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
   // this.calculateCapacity();
    this.http.post<response>(apiLink, this.model, options)
      .toPromise()
      .then(data => {
        this.dataService.setData(data);
       // this.hourlyDetailData = data.hourlyDetail;
       // this.shiftSlots = data.clinicianHourCount;
        //this.shiftList = this.processData();
       // this.filteredShiftList = this.shiftList;
       // this.filteredTransposedData = this.transposedData;
        //this.createGraph(this.hourlyDetailData);
        this.router.navigateByUrl('/graph');
      },
        error => {
          console.log('Something went wrong.');
        })
  }


  calculateCapacity(){
    for(let i=1;i<this.model.length;i++){
      this.model[i].capacity[0] = this.model[i].patientsPerHour/this.model[0].patientsPerHour;
      this.model[i].capacity[1] = this.model[i].capacity[0] * this.model[0].capacity[1];
      this.model[i].capacity[2] = this.model[i].capacity[0] * this.model[0].capacity[2];
    }
  }

  navigateToGraph() {
    this.router.navigateByUrl('/graph');
 }
}
