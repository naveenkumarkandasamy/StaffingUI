import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ConstantsService } from "../services/constants.service";
import { Model, Efficiency } from '../Models/app.types';
import { HttpClientService } from '../services/http-client.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormBuilder, FormArray, FormGroup, NgForm } from '@angular/forms';
@Component({
  selector: 'autorun',
  templateUrl: './autorun.component.html',
  styleUrls: ['./autorun.component.css']
})

export class AutorunComponent implements OnInit {

  jobId;
  resetFlag = 1;
  validateFlag = 0;
  expressionFormGroup: FormGroup;
  clinicianData: any;
  cliniciansDataFromDb: any = [];
  cliniciansEfficiencyDataFromDb: any = [];
  expressionDataFromDb: any = [];
  mostPriorClinician: any;
  reset: boolean = false;
  clinicianModel: Model[] = this.constantsService.model;

  constructor(private fb: FormBuilder, private constantsService: ConstantsService, private httpClientService: HttpClientService,
    private toastr: ToastrService, private _Activatedroute: ActivatedRoute) { }

  ngOnInit(): void {

    this._Activatedroute.paramMap.subscribe(params => {
      this.jobId = params.get('id');
    });
    if (this.jobId != null) {
      this.httpClientService.getJobDetailsByid(this.jobId).subscribe(data => {
        this.editData = data;
        this.createCliniciansData(this.editData.clinicians);
        this.createEfficiencyData(this.editData.clinicians);
        this.expressionDataFromDb = this.editData.clinicians;
        this.createExpressionsData(this.editData.clinicians);
        this.createJobDetails(this.editData, this.resetFlag);
      });
    }
    else {
      this.createJobDetails(this.editData, this.resetFlag);
    }
  }

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  inputFile: File;
  responseBody: any = { "message": "" };
  requestBody: any;
  jobDetails: any;

  createCliniciansData(data: any) {
    for (let i = 0; i < this.clinicianModel.length; i++) {
      for (let index = 0; index < data.length; index++) {
        if (this.clinicianModel[i].name == data[index].name) {
          this.cliniciansDataFromDb.push({ 'name': data[index].name, 'cost': data[index].cost, 'minCount': data[index].minCount, 'maxCount': data[index].maxCount });
        }
      }
    }
  }
  createEfficiencyData(data: any) {
    for (let i = 0; i < this.clinicianModel.length; i++) {
      for (let index = 0; index < data.length; index++) {
        if (this.clinicianModel[i].name == data[index].name) {
          this.cliniciansEfficiencyDataFromDb.push({ 'name': data[index].name, 'firstHour': data[index].capacity[0], 'midHour': data[index].capacity[1], 'lastHour': data[index].capacity[2] });
        }
      }
    }
  }
  createExpressionsData(data: any) {
    for (let index1 = 0; index1 < data.length; index1++) {
      if (data[index1].expressions.length == 1) {
        this.mostPriorClinician = data[index1].name;
      }
    }
  }
  editData: any = {
    "name": "",
    "shiftLengthPreferences": "8, 6, 4",
    "lowerUtilizationFactor": 0.85,
    "upperUtilizationFactor": 1.10,
    "notAllocatedStartTime": 1,
    "notAllocatedEndTime": 6,
    "patientHourWait": 2,
    "preferredOption": "utilization",
    "clinicians": null,
    "cronExpression": "",
    "model": "",
    "expressionModel": "",
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

  initialization() {
    return this.fb.group({
      cliniciansDropDown: this.fb.control(''),
      numberOfClinician: this.fb.control(''),
      operatorChosen: this.fb.control(''),
      selectedClinicianDropDown: this.fb.control(''),
      trackingId: this.generateUniqueId()
    });
  }
  generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  createRequestBody($event) {
    this.requestBody = $event;
  }

  getflag($event) {
    this.validateFlag = $event;
  }

  getFile($event) {
    this.inputFile = $event;
  }

  createJobDetails(editData, resetFlag) {

    this.jobDetails = {
      "jobName": "",
      "shiftLength": "8, 6, 4",
      "lowerUtilization": 0.85,
      "upperUtilization": 1.10,
      "notAllocatedStartTime": 1,
      "notAllocatedEndTime": 6,
      "patientHourWait": 2,
      "preferredOption": "utilization",
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
      "columnDefs": "",
      "priorClinicianDropDown": false,
      "selected": false,
      "clinicianData": "",
      "clinicianRemaining": "",
      "alreadySelectedClinician": "",
      "operator": "",
      "isRequiredToDelete": "",
      "expressionRowData": "",
    }
    if (editData.inputFormat == 'NULL') {
      editData.inputFormat = -1;
    }
    if (editData.outputFormat == 'NULL') {
      editData.outputFormat = -1;

    }
    this.jobDetails.jobName = (this.jobId == null || resetFlag == 0) ? "" : editData.name;
    this.jobDetails.shiftLength = (this.jobId == null || resetFlag == 0) ? ["8", "6", "4"] : editData.shiftLengthPreferences;
    this.jobDetails.lowerUtilization = (this.jobId == null || resetFlag == 0) ? 0.85 : editData.lowerUtilizationFactor;
    this.jobDetails.upperUtilization = (this.jobId == null || resetFlag == 0) ? 1.10 : editData.upperUtilizationFactor;
    this.jobDetails.notAllocatedStartTime = (this.jobId == null || resetFlag == 0) ? 1 : editData.notAllocatedStartTime;
    this.jobDetails.notAllocatedEndTime = (this.jobId == null || resetFlag == 0) ? 6 : editData.notAllocatedEndTime;
    this.jobDetails.patientHourWait = (this.jobId == null || resetFlag == 0) ? 2 : editData.patientHourWait;
    this.jobDetails.preferredOption = (this.jobId == null || resetFlag == 0) ? "noPatientLoss" : editData.preferredOption;
    this.jobDetails.model = (this.jobId == null || resetFlag == 0 || this.reset == true) ? JSON.parse(JSON.stringify(this.constantsService.model)) : this.cliniciansDataFromDb;
    this.jobDetails.efficiencyModel = (this.jobId == null || resetFlag == 0 || this.reset == true) ? JSON.parse(JSON.stringify(this.constantsService.efficiencyModel)) : this.cliniciansEfficiencyDataFromDb;

    if (this.jobDetails.preferredOption == "noPatientLoss") {
      this.jobDetails.isChecked = false;
    }
    else {
      this.jobDetails.isChecked = true;
    }
    if (this.jobId == null || resetFlag == 0 || this.reset == true) {
      this.jobDetails.isRequiredToDelete = false;
      this.jobDetails.selected = false;
      this.jobDetails.priorClinicianDropDown = false;
      this.jobDetails.selectedPriorClinician = "";
    }
    else {
      this.jobDetails.isRequiredToDelete = true;
      this.jobDetails.selected = true;
      this.jobDetails.priorClinicianDropDown = true;
      this.jobDetails.selectedPriorClinician = this.mostPriorClinician;

    }
    this.jobDetails.expressionFormGroup = this.fb.group({
      expressionForm: this.fb.array([
      ])
    });
    this.jobDetails.clinicianData = ['physician', 'app', 'scribe'];
    this.jobDetails.clinicianRemaining = [['physician', 'app', 'scribe']];
    this.jobDetails.alreadySelectedClinician = [[]];
    this.jobDetails.operator = ['*'];
    this.jobDetails.disableToReadData = [[]];
    this.jobDetails.isRequiredToAddExpForm = [];

    this.jobDetails.inputFormat = (this.jobId == null || resetFlag == 0) ? -1 : editData.inputFormat;
    if (this.editData.inputFtpDetails != null) {
      this.jobDetails.inputFtpUrl = (this.jobId == null || resetFlag == 0) ? null : editData.inputFtpDetails.fileUrl;
      this.jobDetails.inputFtpUsername = (this.jobId == null || resetFlag == 0) ? null : editData.inputFtpDetails.username;
      this.jobDetails.inputFtpPassword = (this.jobId == null || resetFlag == 0) ? null : editData.inputFtpDetails.password;
    }

    this.jobDetails.outputFormat = (this.jobId == null || resetFlag == 0) ? -1 : editData.outputFormat;
    if (this.editData.outputFtpDetails != null) {
      this.jobDetails.outputFtpUrl = (this.jobId == null || resetFlag == 0) ? null : editData.outputFtpDetails.fileUrl;
      this.jobDetails.outputFtpUsername = (this.jobId == null || resetFlag == 0) ? null : editData.outputFtpDetails.username;
      this.jobDetails.outputFtpPassword = (this.jobId == null || resetFlag == 0) ? null : editData.outputFtpDetails.password;
    }

    this.jobDetails.cronExpression = (this.jobId == null || resetFlag == 0) ? null : editData.cronExpression;
    this.jobDetails.emailId = (this.jobId == null || resetFlag == 0) ? "" : editData.outputEmailId;
    this.jobDetails.jobStatus = (this.jobId == null || resetFlag == 0) ? "SCHEDULED" : editData.status;

    this.jobDetails.columnDefs = [
      { headerName: 'name', field: 'name', editable: true, lockPosition: true },
      {
        headerName: 'cost', lockPosition: true,
        valueGetter: function (params) {
          return params.data.cost;
        },
        valueSetter: function (params) {
          if (params.data.cost !== params.newValue && !(/[a-zA-Z*&^%$#@!]+/.test(params.newValue)) && params.newValue !== '') {
            params.data.cost = params.newValue;
            return true;
          } else {
            return false;
          }
        },
      }
    ];
    this.jobDetails.efficiencyColumnDefs = [
      { headerName: 'name', field: 'name', editable: true },
      {
        headerName: 'firstHour', valueGetter: function (params) {
          return params.data.firstHour;
        },
        valueSetter: function (params) {
          if (params.data.firstHour !== params.newValue && !(/[a-zA-Z*&^%$#@!]+/.test(params.newValue)) && params.newValue !== '') {
            params.data.firstHour = params.newValue;
            return true;
          } else {
            return false;
          }
        }
      },
      {
        headerName: 'midHour',
        valueGetter: function (params) {
          return params.data.midHour;
        },
        valueSetter: function (params) {
          if (params.data.midHour !== params.newValue && !(/[a-zA-Z*&^%$#@!]+/.test(params.newValue)) && params.newValue !== '') {
            params.data.midHour = params.newValue;
            return true;
          } else {
            return false;
          }
        },
      },
      {
        headerName: 'lastHour',
        valueGetter: function (params) {
          return params.data.lastHour;
        },
        valueSetter: function (params) {
          if (params.data.lastHour !== params.newValue && !(/[a-zA-Z*&^%$#@!]+/.test(params.newValue)) && params.newValue !== '') {
            params.data.lastHour = params.newValue;
            return true;
          } else {
            return false;
          }
        },
      }
    ];

  }
  onReset() {
    this.resetFlag = 0;
    this.reset = true;
    this.createJobDetails(this.editData, this.resetFlag);
  }
  removeDuplicate(array) {
    return array.filter((a, b) => array.indexOf(a) === b);
  }
  onSubmit() {
    if (this.validateFlag == 0) {
      this.requestBody.status = "SCHEDULED";
      if (this.editData.status && this.requestBody.status == this.editData.status) {
        this.requestBody['id'] = this.jobId;
        this.jobId = null;
      }
      this.createAndPostJob();
    }
    else {
      this.toastr.error("Please Enter Valid Field Values");
    }
  }

  onSaveDraft() {
    this.requestBody.status = "DRAFT";
    if (this.editData.status && this.requestBody.status == this.editData.status) {
      this.requestBody['id'] = this.jobId;
      this.jobId = null;
    }
    this.createAndPostJob();
  }

  createAndPostJob() {
    if (this.requestBody.status == "SCHEDULED" && this.requestBody.inputFormat == -1) {
      this.toastr.error("Please select a valid input format");
    }
    else if (this.requestBody.status == "SCHEDULED" && this.requestBody.outputFormat == -1) {
      this.toastr.error("Please select a valid output format");
    }
    else if (this.requestBody.clinicians[0].maxCount < this.requestBody.clinicians[0].minCount ||
      this.requestBody.clinicians[1].maxCount < this.requestBody.clinicians[1].minCount ||
      this.requestBody.clinicians[2].maxCount < this.requestBody.clinicians[2].minCount) {
      this.toastr.error("minCount should be less than maxCount");
    }

    else {
      if (this.requestBody.inputFormat == -1) {
        this.requestBody.inputFormat = 'NULL';
      }
      if (this.requestBody.outputFormat == -1) {
        this.requestBody.outputFormat = 'NULL';
      }
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
