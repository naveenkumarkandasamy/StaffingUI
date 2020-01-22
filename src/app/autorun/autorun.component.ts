import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ConstantsService } from "../services/constants.service";
import { Model } from '../Models/app.types';
import { HttpClientService } from '../services/http-client.service';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'autorun',
  templateUrl: './autorun.component.html',
  styleUrls: ['./autorun.component.css']
})

export class AutorunComponent implements OnInit {

  constructor(private constantsService: ConstantsService, private httpClientService: HttpClientService,
    private toastr: ToastrService, private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.initialize()
  }


  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  inputFtpUrl: string;
  inputFtpUsername: string;
  inputFtpPassword: string;
  outputFtpUrl: string;
  outputFtpUsername: string;
  outputFtpPassword: string;

  inputFile: File;
  jobStatus: string;

  jobName: string;
  shiftLength: string;
  lowerUtilization: number;
  upperUtilization: number;
  cronExpression: string;
  emailId: string;

  inputTypes: Array<string> = ["FTP_URL", "DATA_FILE"];
  inputFormat: string
  outputTypes: Array<string> = ["FTP_URL", "EMAIL"];
  outputFormat: string

  model1: Model[] = this.constantsService.model;
  model: Model[] = JSON.parse(JSON.stringify(this.model1));
  columnDefs: any

  defaultColDef = {
    editable: true,
    resizable: true
  }

  requestBody: any = {
    "name": "",
    "shiftLengthPreferences": "8, 6, 4",
    "lowerUtilizationFactor": 0.85,
    "upperUtilizationFactor": 1.10,
    "clinicians": null,
    "chronExpression": "",

    "inputFormat": "",
    "inputFtpDetails": {
      "fileUrl": "",
      "username": "",
      "password": "",
    },
    "inputFileDetails": {
      "inputFile": null,
    },
    "outputFormat": "",
    "outputFtpDetails": {
      "fileUrl": "",
      "username": "",
      "password": ""
    },
    "outputEmailId": "",
    "status": "",
  }

  createRequestBody() {
    this.requestBody.shiftLengthPreferences = this.shiftLength != "" ? this.shiftLength.split(',') : this.requestBody.shiftLength;
    this.requestBody.lowerUtilizationFactor = this.lowerUtilization;
    this.requestBody.upperUtilizationFactor = this.upperUtilization;
    this.requestBody.name = this.jobName;
    this.requestBody.clinicians = this.model;
    this.requestBody.chronExpression = this.cronExpression;
    this.requestBody.userId = this.authService.currentLoggedInUser;

    if (this.inputFormat == "FTP_URL") {
      this.requestBody.inputFormat = this.inputFormat;
      this.requestBody.inputFtpDetails.fileUrl = this.inputFtpUrl;
      this.requestBody.inputFtpDetails.username = this.inputFtpUsername;
      this.requestBody.inputFtpDetails.password = this.inputFtpPassword;
    }
    else {
      this.requestBody.inputFormat = "DATA_FILE"
      this.requestBody.inputFtpDetails = null;
    }
    if (this.outputFormat == "FTP_URL") {
      this.requestBody.outputFormat = this.outputFormat;
      this.requestBody.outputFtpDetails.fileUrl = this.outputFtpUrl;
      this.requestBody.outputFtpDetails.username = this.outputFtpUsername;
      this.requestBody.outputFtpDetails.password = this.outputFtpPassword;
    }
    else {
      this.requestBody.outputEmailId = this.emailId;
    }
    this.requestBody.status = this.jobStatus;   
  }


  initialize() {
    this.jobName = "";
    this.shiftLength = "8, 6, 4";
    this.lowerUtilization = 0.85;
    this.upperUtilization = 1.10;
    this.model = this.model1;
    this.inputFormat = "";
    this.inputFtpUrl = null;
    this.inputFtpUsername = null;
    this.inputFtpPassword = null;
    this.inputFile = null;
    this.outputFormat = "";
    this.outputFtpUrl = null;
    this.outputFtpUsername = null;
    this.outputFtpPassword = null;
    this.cronExpression = null;
    this.emailId = "";
    this.jobStatus = "SCHEDULED";

    this.columnDefs = [
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
  }

  showToaster(text){
    if(this.jobStatus == "SCHEDULED"){
      this.toastr.success("Successfully scheduled '"+ text +"'");
    }
    else{
      this.toastr.success("Successfully saved '"+ text +"' as draft")
    }
  }

  onReset() {
    this.initialize();
  }

  onSubmit() {
    this.createAndPostJob();
  }

  onSaveDraft(){
    this.jobStatus = "DRAFT";
    this.createAndPostJob();
  }

  createAndPostJob(){
    this.createRequestBody();


    const formData = new FormData();
    formData.append('file', this.inputFile);
    formData.append('input', JSON.stringify(this.requestBody));

    this.httpClientService.saveJobDetails(formData).subscribe(data => { this.toastr.success(data.toString()) }, error => {
      this.toastr.error(error.message);
    });
  }

  handleFileInput(files: FileList) {
    this.inputFile = files.item(0);
    var ext = this.inputFile.name.split(".").pop();
    if (ext != "xlsx") {
      this.toastr.error('file format not supported , upload only xlsx files');
      this.fileInput.nativeElement.value = null;
      this.inputFile = undefined;
    }
  }

  inputformatChanged(value) {
    this.inputFormat = value;
  }

  outputformatChanged(value) {
    this.outputFormat = value;
  }
}
