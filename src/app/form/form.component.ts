import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { response, Model } from "../Models/app.types"
import { ViewChild, ElementRef } from '@angular/core';
import { DataService } from "../services/data.service"
import { ConstantsService } from "../services/constants.service";
import { HttpClientService } from "../services/http-client.service";
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

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
  shiftLength: string = this.constantsService.shiftLength;
  inputTypes: Array<string> = ["Provide Online", "File Upload"];
  inputFormat: string = "Provide Online";
  fileToUpload: File = null;
  utilization = "";
  model: Model[] = this.constantsService.model;

  expression1 = "1";
  expression2 = "1 * physician";
  expression3 = "1 * physician, 2 * app";

  requestBody: any = {
    "shiftLength": [12, 8, 10, 4],
    "lowerLimitFactor": 0.85, // *** ADD UPPER LIMIT
    "clinician": this.model,
    "dayWorkload": this.data,
  }




  columnDefs = [
    { headerName: 'Role', field: 'name', editable: true },
    {
      headerName: 'Capacity Per Hr', valueGetter: function (params) {
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
      headerName: 'Cost',
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


  constructor(private router: Router, private http: HttpClient,
    private dataService: DataService, private toastr: ToastrService, private constantsService: ConstantsService, private httpClientService: HttpClientService) { }

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
    this.requestBody.shiftLength = this.shiftLength != "" ? this.shiftLength.split(',') : this.requestBody.shiftLength;
    this.requestBody.lowerLimitFactor = this.utilization != "" ? this.utilization : this.requestBody.lowerLimitFactor;
    if (this.inputFormat == "File Upload") {
      this.apiRequestwithFileData();
    }
    else {
      this.apiRequestwithTableData();
    }
  }


  private apiRequestwithFileData() {
    const formData = new FormData();
    formData.append('workloadExcel', this.fileToUpload);
    formData.append('inputData', JSON.stringify(this.requestBody));
    this.dataService.setRequestBody(this.requestBody)
    this.httpClientService.getGraphDetailsUsingFileData(formData).pipe(first()).subscribe(data => {
      this.dataService.setData(data);
      this.router.navigateByUrl('/graph');
    }, error => {
      this.toastr.error(error.message);
    });
  }


  private apiRequestwithTableData() {
    this.dataService.setRequestBody(this.requestBody)
    this.httpClientService.getGraphDetailsUsingTableData(this.requestBody).pipe(first()).subscribe(data => {
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

  generateExpressions() {
    for (let i = 0; i < this.model.length; i++) {
      this.model[i].expressions = [];
      for (let j = 0; j < i; j++) {
        this.model[i].expressions.push("1 * " + this.model[j].name);
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
