import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ConstantsService } from "../services/constants.service";
import { Model } from '../Models/app.types';
import { HttpClientService } from '../services/http-client.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'autorun',
  templateUrl: './autorun.component.html',
  styleUrls: ['./autorun.component.css']
})

export class AutorunComponent implements OnInit {

  jobId;
  resetFlag=1;
  validateFlag=0;

  constructor(private constantsService: ConstantsService, private httpClientService: HttpClientService,
    private toastr: ToastrService, private _Activatedroute: ActivatedRoute) { }

  ngOnInit(): void {
    this._Activatedroute.paramMap.subscribe(params => {
      this.jobId = params.get('id');
    });
    if (this.jobId != null) {
      this.httpClientService.getJobDetailsByid(this.jobId).subscribe(data => {
        this.editData = data;
        this.createJobDetails(this.editData,this.resetFlag);
        console.log(this.editData);
      });
    }
    else {
      this.createJobDetails(this.editData,this.resetFlag);
    }
  }

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  inputFile: File; 

  model1: Model[] = this.constantsService.model;
  model: Model[] = JSON.parse(JSON.stringify(this.model1));

  responseBody: any = { "message": "" };

  requestBody: any;

  jobDetails: any;

  editData: any = {
    "name": "",
    "shiftLengthPreferences": "8, 6, 4",
    "lowerUtilizationFactor": 0.85,
    "upperUtilizationFactor": 1.10,
    "clinicians": null,
    "cronExpression": "",

    "inputFormat": "",
    "inputFtpDetails": {
      "fileUrl": "",
      "username": "",
      "password": "",
    },
    "inputFileDetails": {
      "fileExtension": "",
      "dataFile": null,
    },
    "outputFormat": "",
    "outputFtpDetails": {
      "fileUrl": "",
      "username": "",
      "password": ""
    },
    "outputEmailId": "",
    "status": "",
  };

  createRequestBody($event) {
    this.requestBody = $event;
    if(this.jobId!=null){
      this.requestBody['id']= this.jobId;
    }
  }

  getflag($event) {
    this.validateFlag = $event;
  }

  getFile($event){
    this.inputFile = $event;
  }

  createJobDetails(editData,resetFlag) {

    this.jobDetails = {
      "jobName": "",
      "shiftLength": "8, 6, 4",
      "lowerUtilization": 0.85,
      "upperUtilization": 1.10,
      "model": "",
      "cronExpression": "",
      "inputFormat": "",
      "inputFtpUrl": "",
      "inputFtpUsername": "",
      "inputFtpPassword": "",
      "inputFile": null,
      "outputFormat": "",
      "outputFtpUrl": "",
      "outputFtpUsername": "",
      "outputFtpPassword": "",
      "emailId": "",
      "jobStatus": "",
      "expression1": "",
      "expression2": "",
      "expression3": "",
      "columnDefs": ""
    }

    this.jobDetails.jobName = (this.jobId==null || resetFlag==0)? "" : editData.name;
    this.jobDetails.shiftLength = (this.jobId==null || resetFlag==0)? ["8", "6", "4"] :editData.shiftLengthPreferences;
    this.jobDetails.lowerUtilization = (this.jobId==null || resetFlag==0)? 0.85 :editData.lowerUtilizationFactor;
    this.jobDetails.upperUtilization = (this.jobId==null || resetFlag==0)? 1.10 :editData.upperUtilizationFactor;
    this.jobDetails.model = this.model1;

    this.jobDetails.inputFormat = (this.jobId==null || resetFlag==0)? -1 :editData.inputFormat;
    if (this.editData.inputFtpDetails != null) {
      this.jobDetails.inputFtpUrl = (this.jobId==null || resetFlag==0)? null :editData.inputFtpDetails.fileUrl;
      this.jobDetails.inputFtpUsername = (this.jobId==null || resetFlag==0)? null :editData.inputFtpDetails.username;
      this.jobDetails.inputFtpPassword = (this.jobId==null || resetFlag==0)? null :editData.inputFtpDetails.password;
    }
  
    this.jobDetails.outputFormat = (this.jobId==null || resetFlag==0)? -1 :editData.outputFormat;
    if (this.editData.outputFtpDetails != null) {
      this.jobDetails.outputFtpUrl = (this.jobId==null || resetFlag==0)? null :editData.outputFtpDetails.fileUrl;
      this.jobDetails.outputFtpUsername = (this.jobId==null || resetFlag==0)? null :editData.outputFtpDetails.username;
      this.jobDetails.outputFtpPassword = (this.jobId==null || resetFlag==0)? null :editData.outputFtpDetails.password;
    }
    
    this.jobDetails.cronExpression = (this.jobId==null || resetFlag==0)? null :editData.cronExpression;
    this.jobDetails.emailId = (this.jobId==null || resetFlag==0)? "" :editData.outputEmailId;
    this.jobDetails.jobStatus = (this.jobId==null || resetFlag==0)? "SCHEDULED" :editData.status;
    this.jobDetails.expression1 = "1";
    this.jobDetails.expression2 = "1 * physician";
    this.jobDetails.expression3 = "1 * physician, 2 * app";

    this.jobDetails.columnDefs = [
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
  }

  onReset() {
    this.resetFlag=0;
    this.createJobDetails(this.editData,this.resetFlag);
  }

  onSubmit() {
    if(this.validateFlag ==0){
    console.log(this.requestBody);
    this.requestBody.status = "SCHEDULED";
    this.createAndPostJob();
    }
    else{
      this.toastr.error("Please Enter Valid Field Values");
    }
  }

  onSaveDraft() {
    this.requestBody.status = "DRAFT";
    this.createAndPostJob();
  }

  createAndPostJob() {
    if (this.requestBody.status == "SCHEDULED" && this.requestBody.inputFormat == -1) {
      this.toastr.error("Please select a valid input format");
    }
    else if (this.requestBody.status == "SCHEDULED" && this.requestBody.outputFormat == -1) {
      this.toastr.error("Please select a valid output format");
    }
    else {
      if(this.requestBody.inputFormat==-1){
        this.requestBody.inputFormat = 'NULL';
      }
      if(this.requestBody.outputFormat==-1){
        this.requestBody.outputFormat = 'NULL';
      }
      console.log(this.requestBody);
      const formData = new FormData();
      formData.append('file', this.inputFile);
      formData.append('input', JSON.stringify(this.requestBody));
      this.httpClientService.saveJobDetails(formData).subscribe(data => {
        this.responseBody = data;
        this.toastr.success(this.responseBody.message); // ***
      }, error => {
        this.toastr.error(error.message);
      });
    }
  }
}
