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
  public customerData: any;
  public operator: any;
  copyData = [];
  refArray = [];
  selectedData = [];
  selected = false;
  index: number;
  selectedRef = [];
  refBoolean = false;
  refArray1 = [];
  selectedRef1 = [];
  refBoolean1 = false;

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
  op1 = ""; op2 = ""; op3 = "";
  upperUtilization = "";
  from = 1;
  to = 6;
  hourwait = "";
  text1 = ""; text2 = ""; text3 = "";
  string1 = ""; string2 = ""; string3 = "";
  model: Model[] = this.constantsService.model;
  expression1 = "1";
  expression2 = "1 * physician";
  expression3 = "1 * physician,1 * app";

  requestBody: any = {
    "shiftLength": [12, 8, 10, 4],
    "lowerLimitFactor": 0.85, // *** ADD UPPER LIMIT
    "upperLimitFactor": 1.10,
    "hourwait": 2,
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
    this.customerData = [
      'physician',
      'app',
      'scribe'
    ]
    this.operator = ['*']
    this.copyData = this.customerData.slice(0);
  }
  onSelect(value) {
    if (value == 'physician') {
      this.model[0].expressions = [];
      console.log('physician', this.model[0].expressions);
    }
    if (value == 'app') {
      this.model[1].expressions = [];
      console.log('apps', this.model[1].expressions);
    }
    if (value == 'scribe') {
      this.model[2].expressions = [];
      console.log('scribe', this.model[2].expressions);
    }
    var idx = this.copyData.indexOf(value);
    this.copyData.splice(idx, 1);
    console.log(this.copyData)
    this.selectedData.push(value);
    this.selected = true;
  }

  onChange(value) {

    this.refArray = this.copyData.slice(0);
    var idx = this.refArray.indexOf(value);
    this.refArray.splice(idx, 1);
    this.selectedRef = this.selectedData.slice(0);
    this.selectedRef.push(value);
    this.string1 = value;

  }
  onOK1() {
    if (this.string1 == 'physician') {
      this.model[0].expressions = [this.text1 + " " + this.op1 + " " + this.selectedData[0]];
      console.log('physician', this.model[0].expressions);
    }
    if (this.string1 == 'app') {
      this.model[1].expressions = [this.text1 + " " + this.op1 + " " + this.selectedData[0]];
      console.log('apps', this.model[1].expressions);
    }
    if (this.string1 == 'scribe') {
      this.model[2].expressions = [this.text1 + " " + this.op1 + " " + this.selectedData[0]];
      console.log('scribe', this.model[2].expressions);
    }
    this.refBoolean = true;
  }
  onChange1(value) {
    this.string2 = value;
    console.log(value);
    this.refArray1 = this.selectedRef.slice(0);
    console.log(this.refArray1);
    var idx = this.refArray1.indexOf(value);
    this.refArray1.splice(idx, 1);
    console.log(this.refArray1);

  }
  onadd() {
    this.refBoolean1 = true;
  }
  onChange2(value) {
    this.string3 = value;
  }

  onOK2() {
    if (this.refArray[0] == 'physician') {
      this.model[0].expressions = [this.text2 + " " + this.op2 + " " + this.string2];
      console.log('physician', this.model[0].expressions);
    }
    if (this.refArray[0] == 'app') {
      this.model[1].expressions = [this.text2 + " " + this.op2 + " " + this.string2];
      console.log('apps', this.model[1].expressions);
    }
    if (this.refArray[0] == 'scribe') {
      this.model[2].expressions = [this.text2 + " " + this.op2 + " " + this.string2];
      console.log('scribe', this.model[2].expressions);
    }
  }
  onOK3() {
    if (this.refArray[0] == 'physician') {
      this.model[0].expressions.push(this.text3 + " " + this.op3 + " " + this.refArray1[0]);
      console.log('physician', this.model[0].expressions);
    }
    if (this.refArray[0] == 'app') {
      this.model[1].expressions.push(this.text3 + " " + this.op3 + " " + this.refArray1[0]);
      console.log('apps', this.model[1].expressions);
    }
    if (this.refArray[0] == 'scribe') {
      this.model[2].expressions.push(this.text3 + " " + this.op3 + " " + this.refArray1[0]);
      console.log('scribe', this.model[2].expressions);
    }
  }

  onop1(value) {
    this.op1 = value;
  }
  onop2(value) {
    this.op2 = value;
  }
  onop3(value) {
    this.op3 = value;
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
    this.requestBody.shiftLength = this.shiftLength != "" ? this.shiftLength.split(',') : this.requestBody.shiftLength;
    this.requestBody.lowerLimitFactor = this.upperUtilization != "" ? this.upperUtilization : this.requestBody.lowerLimitFactor;
    this.requestBody.upperLimitFactor = this.utilization != "" ? this.utilization : this.requestBody.upperLimitFactor;
    this.requestBody.from =  this.from;
    this.requestBody.to = this.to;
    this.requestBody.hourwait = this.hourwait != "" ? this.hourwait : this.requestBody.hourwait;
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
