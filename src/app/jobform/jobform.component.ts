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

  @Output() messagetosend = new EventEmitter();
  @Output() flagtosend = new EventEmitter();
  @Output() filetosend = new EventEmitter();

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  @Input()
  formval: any = {
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
  flag = 0;
  flag1=0;

  //FORM VALIDATION
  jobname = new FormControl('', [Validators.required]);
  shiftlength = new FormControl('', [Validators.pattern('^[1-9][0-9]?(,[1-9][0-9]?)*$')])
  lowerutilization = new FormControl('', [Validators.min(0.5), Validators.max(1.1)]);
  upperutilization = new FormControl('', [Validators.min(0.8), Validators.max(1.5)]);
  exp1 = new FormControl('', [Validators.required]);
  exp2 = new FormControl('', [Validators.required]);
  exp3 = new FormControl('', [Validators.required]);
  inputfile = new FormControl('', [Validators.required]);
  inputftpUrl = new FormControl('', [Validators.required]);
  inputftpUsername = new FormControl('', [Validators.required]);
  inputftpPassword = new FormControl('', [Validators.required]);
  outputftpUrl = new FormControl('', [Validators.required]);
  outputftpUsername = new FormControl('', [Validators.required]);
  outputftpPassword = new FormControl('', [Validators.required]);
  outputemail = new FormControl('', [Validators.required, Validators.email]);
  cronexp = new FormControl('', [Validators.required]);

  getFlagStatus() {
    this.flag1=0;
    if (this.jobname.hasError('required') || this.shiftlength.hasError('pattern') || 
      this.lowerutilization.hasError('min') ||
      this.lowerutilization.hasError('max') || this.upperutilization.hasError('min') ||
      this.upperutilization.hasError('max') || this.exp1.hasError('required') ||
      this.exp3.hasError('required') || this.exp2.hasError('required') ||
      this.outputemail.hasError('required') || this.cronexp.hasError('required')) {
      this.flag = 1;
      this.flag1=1;
    }
    if (this.formval.inputFormat == 'FTP_URL' && (this.inputftpUrl.hasError('required') ||
      this.inputftpUsername.hasError('required') || this.inputftpPassword.hasError('required'))) {
      this.flag = 1;
      this.flag1=1;
    }
    else if (this.formval.inputFormat == 'DATA_FILE' && this.inputfile.hasError('required')) {
      this.flag = 1;
      this.flag1=1;
    }
    if (this.formval.outputFormat == 'FTP_URL' && (this.outputftpUrl.hasError('required') ||
      this.outputftpUsername.hasError('required') || this.outputftpPassword.hasError('required'))) {
      this.flag = 1;
      this.flag1=1;
    }
    else if (this.formval.outputFormat == 'EMAIL' && this.outputemail.hasError('email')) {
      this.flag = 1
      this.flag1=1;
    }
    if(this.flag1==0){
      this.flag=0;
    }
  }

  sendresponse() {
    this.getFlagStatus();
    this.createRequestBody();
    this.messagetosend.emit(this.requestBody);
    this.flagtosend.emit(this.flag);
  }

  sendFile() {
    this.sendresponse();
    this.filetosend.emit(this.inputFile);
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

    if (typeof (this.formval.shiftLength) != "object") {
      this.formval.shiftLength = this.formval.shiftLength.split(",");
    }
    this.requestBody.shiftLengthPreferences = this.formval.shiftLength != "" ? this.formval.shiftLength : this.requestBody.shiftLength;
    this.requestBody.lowerUtilizationFactor = this.formval.lowerUtilization;
    this.requestBody.upperUtilizationFactor = this.formval.upperUtilization;
    this.requestBody.name = this.formval.jobName;
    this.requestBody.clinicians = this.model;
    this.requestBody.cronExpression = this.formval.cronExpression;
    this.requestBody.userId = this.authService.currentLoggedInUser;

    this.requestBody.inputFormat = this.formval.inputFormat;
    if (this.formval.inputFormat == "FTP_URL") {
      this.requestBody.inputFtpDetails.fileUrl = this.formval.inputFtpUrl;
      this.requestBody.inputFtpDetails.username = this.formval.inputFtpUsername;
      this.requestBody.inputFtpDetails.password = this.formval.inputFtpPassword;
      this.requestBody.inputFileDetails = this.formval.inputFile;
    }
    else {
      this.requestBody.inputFtpDetails = null;
      this.requestBody.inputFileDetails.fileExtension = 'xlsx';  //*** */
    }
    this.requestBody.outputFormat = this.formval.outputFormat;
    if (this.formval.outputFormat == "FTP_URL") {
      this.requestBody.outputFtpDetails.fileUrl = this.formval.outputFtpUrl;
      this.requestBody.outputFtpDetails.username = this.formval.outputFtpUsername;
      this.requestBody.outputFtpDetails.password = this.formval.outputFtpPassword;
    }
    else {
      this.requestBody.outputFtpDetails = null;
      this.requestBody.outputEmailId = this.formval.emailId;
    }
    this.requestBody.status = this.formval.jobStatus;
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
    this.formval.inputFormat = value;
  }

  outputformatChanged(value) {
    this.formval.outputFormat = value;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CronGeneratorComponent, {
      width: '',
      data: { cronResult: this.formval.cronExpression }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.formval.cronExpression = result;
      console.log(this.formval.cronExpression);
    });
  }
}

export interface DialogData {
  cronResult: string;
}