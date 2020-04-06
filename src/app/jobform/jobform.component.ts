import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { Model } from '../Models/app.types';
import { CronGeneratorComponent } from '../cron-generator/cron-generator.component';
import { MatDialog } from '@angular/material';
import { AuthenticationService } from '../services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-jobform',
  templateUrl: './jobform.component.html',
  styleUrls: ['./jobform.component.css']
})
export class JobformComponent implements OnInit {

  constructor(private constantsService: ConstantsService, public dialog: MatDialog, private authService: AuthenticationService, private toastr: ToastrService) { }

  ngOnInit() {
  }

  @Output() requestBodyToSend = new EventEmitter();
  @Output() validateFlagToSend = new EventEmitter();
  @Output() fileToSend = new EventEmitter();

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  @Input()
  formVal: any = {
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
  };

  inputFile: File;

  inputTypes: Array<string> = ["FTP_URL", "DATA_FILE"];
  outputTypes: Array<string> = ["FTP_URL", "EMAIL"];


  model1: Model[] = this.constantsService.model;
  model: Model[] = JSON.parse(JSON.stringify(this.model1));
  columnDefs: any

  defaultColDef = {
    editable: true,
    resizable: true
  }

  responseBody: any = { "message": "" };
  requestBody: any;
  flagForValidation = 0;
  checkFlag=0;

  //FORM VALIDATION
  jobName = new FormControl('', [Validators.required]);
  shiftLength = new FormControl('', [Validators.pattern('^[1-9][0-9]?(,[1-9][0-9]?)*$')])
  lowerUtilization = new FormControl('', [Validators.min(0.5), Validators.max(1.1)]);
  upperUtilization = new FormControl('', [Validators.min(0.8), Validators.max(1.5)]);
  exp1 = new FormControl('', [Validators.required]);
  exp2 = new FormControl('', [Validators.required]);
  exp3 = new FormControl('', [Validators.required]);
  inputVFile = new FormControl('', [Validators.required]);
  inputFtpUrl = new FormControl('', [Validators.required]);
  inputFtpUsername = new FormControl('', [Validators.required]);
  inputFtpPassword = new FormControl('', [Validators.required]);
  outputFtpUrl = new FormControl('', [Validators.required]);
  outputFtpUsername = new FormControl('', [Validators.required]);
  outputFtpPassword = new FormControl('', [Validators.required]);
  outputEmail = new FormControl('', [Validators.required, Validators.email]);
  cronExp = new FormControl('', [Validators.required]);

  // Form Validation
  getFlagStatus() {
    this.checkFlag=0;
    if (this.jobName.hasError('required') || this.shiftLength.hasError('pattern') || 
      this.lowerUtilization.hasError('min') || this.lowerUtilization.hasError('max') || 
      this.upperUtilization.hasError('min') || this.upperUtilization.hasError('max') || 
      this.exp1.hasError('required') || this.exp3.hasError('required') || 
      this.exp2.hasError('required') || this.cronExp.hasError('required')) {
      this.flagForValidation = 1;
      this.checkFlag=1;
    }
    if (this.formVal.inputFormat == 'FTP_URL' && (this.inputFtpUrl.hasError('required') ||
      this.inputFtpUsername.hasError('required') || this.inputFtpPassword.hasError('required'))) {
      this.flagForValidation = 1;
      this.checkFlag=1;
    }
    else if (this.formVal.inputFormat == 'DATA_FILE' && this.inputVFile.hasError('required')) {
      this.flagForValidation = 1;
      this.checkFlag=1;
    }
    if (this.formVal.outputFormat == 'FTP_URL' && (this.outputFtpUrl.hasError('required') ||
      this.outputFtpUsername.hasError('required') || this.outputFtpPassword.hasError('required'))) {
      this.flagForValidation = 1;
      this.checkFlag=1;
    }
    else if (this.formVal.outputFormat == 'EMAIL' && (this.outputEmail.hasError('email') || 
    this.outputEmail.hasError('required'))) {
      this.flagForValidation = 1
      this.checkFlag=1;
    }
    if(this.checkFlag==0){
      this.flagForValidation=0;
    }
  }

  sendresponse() {
    this.getFlagStatus();
    this.createRequestBody();
    this.requestBodyToSend.emit(this.requestBody);
    this.validateFlagToSend.emit(this.flagForValidation);
  }

  sendFile() {
    this.sendresponse();
    this.fileToSend.emit(this.inputFile);
  }

  createRequestBody() {
    this.requestBody = {
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
    }

    if (typeof (this.formVal.shiftLength) != "object") {
      this.formVal.shiftLength = this.formVal.shiftLength.split(",");
    }
    this.requestBody.shiftLengthPreferences = this.formVal.shiftLength != "" ? this.formVal.shiftLength : this.requestBody.shiftLength;
    this.requestBody.lowerUtilizationFactor = this.formVal.lowerUtilization;
    this.requestBody.upperUtilizationFactor = this.formVal.upperUtilization;
    this.requestBody.name = this.formVal.jobName;
    this.requestBody.clinicians = this.model;
    this.requestBody.cronExpression = this.formVal.cronExpression;
    this.requestBody.userId = this.authService.currentLoggedInUser;

    this.requestBody.inputFormat = this.formVal.inputFormat;
    if (this.formVal.inputFormat == "FTP_URL") {
      this.requestBody.inputFtpDetails.fileUrl = this.formVal.inputFtpUrl;
      this.requestBody.inputFtpDetails.username = this.formVal.inputFtpUsername;
      this.requestBody.inputFtpDetails.password = this.formVal.inputFtpPassword;
      this.requestBody.inputFileDetails = null;
    }
    else if (this.formVal.inputFormat == "DATA_FILE") {
      this.requestBody.inputFtpDetails = null;
      this.requestBody.inputFileDetails.fileExtension = 'xlsx';  //*** */
    }
    else{
      this.requestBody.inputFileDetails = null;
      this.requestBody.inputFtpDetails = null;
    }
    
    this.requestBody.outputFormat = this.formVal.outputFormat;
    if (this.formVal.outputFormat == "FTP_URL") {
      this.requestBody.outputFtpDetails.fileUrl = this.formVal.outputFtpUrl;
      this.requestBody.outputFtpDetails.username = this.formVal.outputFtpUsername;
      this.requestBody.outputFtpDetails.password = this.formVal.outputFtpPassword;
    }
    else {
      this.requestBody.outputFtpDetails = null;
      this.requestBody.outputEmailId = this.formVal.emailId;
    }
    this.requestBody.status = this.formVal.jobStatus;
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
    this.formVal.inputFormat = value;
  }

  outputformatChanged(value) {
    this.formVal.outputFormat = value;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CronGeneratorComponent, {
      width: '',
      data: { cronResult: this.formVal.cronExpression }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.formVal.cronExpression = result;
      this.sendresponse();
    });
  }
}

export interface DialogData {
  cronResult: string;
}