import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { response,  Model } from "../Models/app.types"
import { ViewChild, ElementRef } from '@angular/core';
import { DataService } from "../services/data.service"
import { ConstantsService } from "../services/constants.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'mainForm',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class MainFormComponent implements OnInit {


  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  message: string;
  apiData: response;
  transposedColumnDef: Array<any>
  data: any = this.constantsService.data;
  shiftLength: string = "";
  inputTypes: Array<string> = [ "Provide Online", "File Upload"];
  inputFormat: string = "Provide Online";
  fileToUpload: File = null;
  utilization = "";
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
      "expressions": []
    },
    {
      "patientsPerHour": 0.37,
      "capacity": [0.15, 0.12, 0.1],
      "cost": 20,
      "name": "scribe",
      "expressions": []
    }]

  requestBody: any = {
    "shiftLength": [12, 8, 10, 4],
    "lowerLimitFactor": 0.85,
    "clinician": this.model,
    "dayWorkload": this.data,
  }




  columnDefs = [
    { headerName: 'Role', field: 'name', editable: true },
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


  constructor(private router: Router, private http: HttpClient, private dataService: DataService, private toastr: ToastrService, private constantsService: ConstantsService) { }

  ngOnInit() {
    this.dataService.apiData$.subscribe(apiData => this.apiData = apiData);
    this.createColumnData();
  }


  formatChanged(value) {
    this.inputFormat = value;
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    var ext = this.fileToUpload.name.split(".").pop();
    if (ext != "xlsx") {
      this.toastr.error('file format not supported , upload only xlsx files');
      this.fileInput.nativeElement.value = null;
      this.fileToUpload = undefined;
    }
  }
  onSubmit() {
    this.calculateCapacity();
    this.generateExpressions();
    const apiLink = '/Staffing/api/shiftPlan';

    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: httpHeaders
    };
    this.requestBody.shiftLength = this.shiftLength != "" ? this.shiftLength.split(',') : this.requestBody.shiftLength;
    this.requestBody.lowerLimitFactor = this.utilization != "" ? this.utilization : this.requestBody.lowerLimitFactor;
    if (this.inputFormat == "File") {
      this.apiRequestwithFileData();
    }
    else {
      this.apiRequestwithTableData(apiLink, options);
    }
  }


  private apiRequestwithFileData() {
    const apiLink = '/Staffing/api/shiftPlanFileUpload';
    const formData = new FormData();
    formData.append('workloadExcel', this.fileToUpload);
    formData.append('inputData', JSON.stringify(this.requestBody));
    this.dataService.setRequestBody(this.requestBody)
    this.http.post<response>(apiLink, formData)
      .toPromise()
      .then(data => {
        this.dataService.setData(data);
        this.router.navigateByUrl('/graph');
      }, error => {
        this.toastr.error(error.message);
      });
  }


  private apiRequestwithTableData(apiLink: string, options: { headers: HttpHeaders; }) {
    this.dataService.setRequestBody(this.requestBody)
    this.http.post<response>(apiLink, this.requestBody, options)
      .toPromise()
      .then(data => {
        this.dataService.setData(data);
        this.router.navigateByUrl('/graph');
      }, error => {
        this.toastr.error(error.message);

      });
  }

  calculateCapacity() {
    for (let i = 1; i < this.model.length; i++) {
      this.model[i].capacity[0] = this.model[i].patientsPerHour / this.model[0].patientsPerHour;
      this.model[i].capacity[1] = this.model[i].capacity[0] * this.model[0].capacity[1];
      this.model[i].capacity[2] = this.model[i].capacity[0] * this.model[0].capacity[2];
    }
  }

  generateExpressions(){
    for(let i=0;i<this.model.length;i++){
      for(let j=0;j<i;j++){
        this.model[i].expressions.push("1 * "+this.model[j].name);
      }
    }
  }

  navigateToGraph() {
    this.router.navigateByUrl('/graph');
  }


  createColumnData() {
    this.transposedColumnDef = [
      {
        headerName: 'Day',
        field: 'name',
        cellStyle: { 'font-size': 'large' },
        pinned: 'left',
        width: 300, 
        editable: false
      }
    ];

    for (let i = 0; i < 24; i++) {
      this.transposedColumnDef.push({
        headerName: i + "",
        valueGetter: function (params) {
          return params.data.expectedPatientsPerHour[i];
        },
        valueSetter: function (params) {
          params.data.expectedPatientsPerHour[i] = params.newValue;
        },
        width: 60
      })
    }
  }
}
