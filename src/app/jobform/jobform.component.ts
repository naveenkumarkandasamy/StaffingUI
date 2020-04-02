import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { Model, Efficiency } from '../Models/app.types';
import { CronGeneratorComponent } from '../cron-generator/cron-generator.component';
import { MatDialog } from '@angular/material';
import { AuthenticationService } from '../services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-jobform',
  templateUrl: './jobform.component.html',
  styleUrls: ['./jobform.component.css']
})
export class JobformComponent implements OnInit, OnChanges {

  selected1: any[] = [];
  selected2: any[] = [];
  selected3: any[] = [];
  selected4: any[] = [];
  check: boolean = false;
  initiallySelected: String;
  addMoreRequired = [];
  checking: boolean = false;
  expression: String;

  constructor(private fb: FormBuilder, private constantsService: ConstantsService, public dialog: MatDialog, private authService: AuthenticationService, private toastr: ToastrService) {
  }
  ngOnInit() {
    this.itr = 1;
  }
  @Input() data: any;
  @Input() reset: any;
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
    "notAllocatedStartTime": 1,
    "notAllocatedEndTime": 6,
    "patientHourWait": 2,
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
    "columnDefs1": "",
    "efficiencyModel": "",
    "firstDropDown": false,
    "selected": false,
    "clinicianData": "",
    "clinicianRemaining": "",
    "alreadySelectedClinician": "",
    "operator": "",
    "expressionRowData": "",
  };

  inputFile: File;
  num: any; exp: any = [];
  inputTypes: Array<string> = ["FTP_URL", "DATA_FILE"];
  outputTypes: Array<string> = ["FTP_URL", "EMAIL"];
  itr: any;
  model1: Model[] = this.constantsService.model;
  efficiencyModel: Efficiency[] = this.constantsService.efficiencyModel;
  model: Model[] = JSON.parse(JSON.stringify(this.model1));
  columnDefs: any
  powerPlantTypes: any;
  defaultColDef = {
    editable: true,
    resizable: true
  }
  temp: any = [[]];
  responseBody: any = { "message": "" };
  requestBody: any;
  flagForValidation = 0;
  checkFlag = 0;
  toAddExp: boolean;

  //FORM VALIDATION
  jobName = new FormControl('', [Validators.required]);
  shiftLength = new FormControl('', [Validators.pattern('^[1-9][0-9]?(,[1-9][0-9]?)*$')])
  lowerUtilization = new FormControl('', [Validators.min(0.5), Validators.max(1.1)]);
  upperUtilization = new FormControl('', [Validators.min(0.8), Validators.max(1.5)]);
  notAllocatedStartTime = new FormControl('', [Validators.min(0), Validators.max(23)]);
  notAllocatedEndTime = new FormControl('', [Validators.min(0), Validators.max(23)]);
  patientHourWait = new FormControl('', [Validators.min(0), Validators.max(23)]);
  inputVFile = new FormControl('', [Validators.required]);
  inputFtpUrl = new FormControl('', [Validators.required]);
  inputFtpUsername = new FormControl('', [Validators.required]);
  inputFtpPassword = new FormControl('', [Validators.required]);
  outputFtpUrl = new FormControl('', [Validators.required]);
  outputFtpUsername = new FormControl('', [Validators.required]);
  outputFtpPassword = new FormControl('', [Validators.required]);
  outputEmail = new FormControl('', [Validators.required, Validators.email]);
  cronExp = new FormControl('', [Validators.required]);

  ngOnChanges() {
    this.check = false;
    if (this.reset != true) {

      this.exp = [];
      for (let index1 = 0; index1 < this.data.length; index1++) {
        for (let j = 0; j < this.data.length; j++) {
          if (index1 == this.data[j].expressions[0]) {
            if (this.data[j].expressions.length == 1) {
              this.exp.push(this.data[j].name);
            }
            for (let index2 = 1; index2 < this.data[j].expressions.length; index2++) {
              this.exp.push(this.data[j].name + "," + this.data[j].expressions[index2]);
            }
          }
        }
      }
      for (let index1 = 0; index1 < this.data.length; index1++) {
        for (let i = 0; i < this.model1.length; i++) {
          if (this.model1[i].name == this.data[index1].name) {
            this.model1[i].expressions = this.data[index1].expressions;
          }
        }
      }
      this.itr = this.model1.length - 1;
      for (let i = 1; i < this.exp.length; i++) {
        this.check = true;
        this.formVal.clinicianRemaining[i - 1] = ['physician', 'app', 'scribe'];
        this.formVal.alreadySelectedClinician[i - 1] = [];
        var splittedData = this.exp[i].split(",");
        this.exp[i] = [];
        this.exp[i].push(splittedData[0]);
        this.exp[i].push(splittedData[1]);
        var splitted = splittedData[1].split(" ");

        if (this.exp[i][0] == this.exp[i - 1][0]) {
          this.formVal.clinicianRemaining[i - 1] = [];
          this.formVal.clinicianRemaining[i - 1].push(this.exp[i - 1][0]);
        }
        else {
          for (let j = i - 1; j >= 1; j--) {
            var index1 = this.formVal.clinicianRemaining[i - 1].indexOf(this.exp[j][0]);
            this.formVal.clinicianRemaining[i - 1].splice(index1, 1);
          }
          var index1 = this.formVal.clinicianRemaining[i - 1].indexOf(this.formVal.selectedExp);
          this.formVal.clinicianRemaining[i - 1].splice(index1, 1);
        }

        if (this.exp[i][0] == this.exp[i - 1][0] && i >= 2) {
          this.formVal.alreadySelectedClinician[i - 1] = this.formVal.alreadySelectedClinician[i - 2].slice();
          var splitted1 = this.exp[i - 1][1].split(" ");
          var index1 = this.formVal.alreadySelectedClinician[i - 1].indexOf(splitted1[2]);
          this.formVal.alreadySelectedClinician[i - 1].splice(index1, 1);
        }
        else {
          for (let j = i - 1; j >= 1; j--) {

            this.formVal.alreadySelectedClinician[i - 1].push(this.exp[j][0]);
          }
          this.formVal.alreadySelectedClinician[i - 1].push(this.formVal.selectedExp);
        }
        this.formVal.alreadySelectedClinician[i - 1] = this.removeDuplicate(this.formVal.alreadySelectedClinician[i - 1]);
        const control = this.formVal.expressionFormGroup.controls.expressionForm as FormArray;
        control.push(this.initialization());
        this.selected1.push({ cliniciansDropDown: splittedData[0] });
        this.selected2.push({ numberOfClinician: splitted[0] });
        this.selected3.push({ operatorChosen: splitted[1] });
        this.selected4.push({ selectedClinicianDropDown: splitted[2] });

        this.formVal.expressionFormGroup.value.expressionForm[i - 1].cliniciansDropDown = splittedData[0];
        this.formVal.expressionFormGroup.value.expressionForm[i - 1].numberOfClinician = splitted[0];
        this.formVal.expressionFormGroup.value.expressionForm[i - 1].operatorChosen = splitted[1];
        this.formVal.expressionFormGroup.value.expressionForm[i - 1].selectedClinicianDropDown = splitted[2];
      }
    }
  }
  getFlagStatus() {
    this.checkFlag = 0;
    if (this.jobName.hasError('required') || this.shiftLength.hasError('pattern') ||
      this.lowerUtilization.hasError('min') || this.lowerUtilization.hasError('max') ||
      this.upperUtilization.hasError('min') || this.upperUtilization.hasError('max') ||
      this.outputEmail.hasError('required') ||
      this.cronExp.hasError('required')) {
      this.flagForValidation = 1;
      this.checkFlag = 1;
    }
    if (this.formVal.inputFormat == 'FTP_URL' && (this.inputFtpUrl.hasError('required') ||
      this.inputFtpUsername.hasError('required') || this.inputFtpPassword.hasError('required'))) {
      this.flagForValidation = 1;
      this.checkFlag = 1;
    }
    else if (this.formVal.inputFormat == 'DATA_FILE' && this.inputVFile.hasError('required')) {
      this.flagForValidation = 1;
      this.checkFlag = 1;
    }
    if (this.formVal.outputFormat == 'FTP_URL' && (this.outputFtpUrl.hasError('required') ||
      this.outputFtpUsername.hasError('required') || this.outputFtpPassword.hasError('required'))) {
      this.flagForValidation = 1;
      this.checkFlag = 1;
    }
    else if (this.formVal.outputFormat == 'EMAIL' && this.outputEmail.hasError('email')) {
      this.flagForValidation = 1
      this.checkFlag = 1;
    }
    if (this.checkFlag == 0) {
      this.flagForValidation = 0;
    }

  }
  trackByForm(index: number, data: any) {
    return data.trackingId;
  }

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

  afterSelectedPriorClinician(value) {
    this.formVal.clinicianRemaining[0] = this.formVal.clinicianData.slice(0);
    var index1 = this.formVal.clinicianRemaining[0].indexOf(value);
    this.formVal.clinicianRemaining[0].splice(index1, 1);
    this.formVal.alreadySelectedClinician[0] = [];
    this.formVal.alreadySelectedClinician[0].push(value);
    this.formVal.selected = true;
    this.formVal.firstDropDown = true;
    this.itr = 0;
    this.num = this.formVal.clinicianData.length;
    this.num = this.num * (this.num + 1) / 2;
    for (let i = 0; i < this.num; i++) {
      this.formVal.isRequiredToAddExpForm[i] = true;
      this.addMoreRequired[i] = false;
    }
    for (let i = 0; i < this.model1.length; i++) {
      this.model1[i].expressions = [];
    }
    for (let i = 0; i < this.model1.length; i++) {
      if (this.model1[i].name == value) {
        this.model1[i].expressions.push(this.itr);
      }
    }
    for (let i = 0; i < this.selected1.length; i++) {
      this.selected1[i].cliniciansDropDown = '';
      this.selected2[i].numberOfClinician = '';
      this.selected3[i].operatorChosen = '';
      this.selected4[i].selectedClinicianDropDown = '';
    }
    this.formVal.isRequiredToDelete = true;
    if (this.formVal.expressionFormGroup.controls.expressionForm.length - 1 == -1) {
      const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
      control.push(this.initialization());
      this.selected1.push({ cliniciansDropDown: '' });
      this.selected2.push({ numberOfClinician: '' });
      this.selected3.push({ operatorChosen: '' });
      this.selected4.push({ selectedClinicianDropDown: '' });
      this.selected1[0].cliniciansDropDown = '';
      this.selected2[0].numberOfClinician = '';
      this.selected3[0].operatorChosen = '';
      this.selected4[0].selectedClinicianDropDown = '';
    }
  }
  readingData2(index) {
    this.formVal.isRead[index] = false;
  }
  readingData(index) {

    let clinician = this.formVal.expressionFormGroup.value.expressionForm[index].cliniciansDropDown;
    let selectedClinician = this.formVal.expressionFormGroup.value.expressionForm[index].selectedClinicianDropDown;
    if (clinician !== '' && this.formVal.expressionFormGroup.value.expressionForm[index].numberOfClinician !== '' && this.formVal.expressionFormGroup.value.expressionForm[index].operatorChosen !== '' && selectedClinician !== '') {
      for (let i = 0; i < this.model1.length; i++) {
        if (this.model1[i].name == clinician) {
          if (this.model1[i].expressions.length == 0) {
            this.itr++;
            this.model1[i].expressions.push(this.itr);

          }
          this.model1[i].expressions.push(this.formVal.expressionFormGroup.value.expressionForm[index].numberOfClinician + " " + this.formVal.expressionFormGroup.value.expressionForm[index].operatorChosen + " " + selectedClinician);
        }
      }
      this.formVal.isRead[index] = true;
      this.formVal.isRead[index + 1] = false;

      this.settingValueForNextForm(index);
      if (this.formVal.alreadySelectedClinician[index].length == 1) {
        this.addMoreRequired[index] = false;
      }
      else {
        this.addMoreRequired[index] = true;
        this.formVal.isRequiredToAddExpForm[index] = false;
      }
      const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
      if (!this.addMoreRequired[index] && this.formVal.clinicianRemaining[index + 1].length !== 0) {
        control.push(this.initialization());
        this.selected1.push({ cliniciansDropDown: '' });
        this.selected2.push({ numberOfClinician: '' });
        this.selected3.push({ operatorChosen: '' });
        this.selected4.push({ selectedClinicianDropDown: '' });
        this.addMoreRequired[index + 1] = false;
      }
    }
  }
  removingExpression() {
    this.toAddExp = false;
    for (let j = 0; j < this.formVal.expressionFormGroup.value.expressionForm.length && this.check; j++) {
      this.formVal.expressionFormGroup.value.expressionForm[j].cliniciansDropDown = this.exp[j + 1][0];
      var splittedValue = this.exp[j + 1][1].split(" ");
      this.formVal.expressionFormGroup.value.expressionForm[j].numberOfClinician = splittedValue[0];
      this.formVal.expressionFormGroup.value.expressionForm[j].operatorChosen = splittedValue[1];
      this.formVal.expressionFormGroup.value.expressionForm[j].selectedClinicianDropDown = splittedValue[2];
    }
    this.check=false;
    this.num = this.formVal.expressionFormGroup.controls.expressionForm.length - 1;
    for (let i = 0; i < this.model1.length; i++) {
      if (this.model1[i].name == (this.formVal.expressionFormGroup.value.expressionForm[this.num].cliniciansDropDown)) {
        if (this.model1[i].expressions.length == 2) {
          this.model1[i].expressions = [];
          this.itr--;
        }
        else {
          this.model1[i].expressions.splice(this.model1[i].expressions.length - 1, 1);
        }
      }
    }
    this.formVal.expressionFormGroup.controls.expressionForm.value.pop()
    this.formVal.expressionFormGroup.controls.expressionForm.removeAt(this.num);
    this.selected1[this.num].cliniciansDropDown = '';
    this.selected2[this.num].numberOfClinician = '';
    this.selected3[this.num].operatorChosen = '';
    this.selected4[this.num].selectedClinicianDropDown = '';
    this.num = this.num - 1;
    if (this.num >= 0) {
      if (this.formVal.alreadySelectedClinician[this.num].length > 1) {
        this.addMoreRequired[this.num] = true;
        this.formVal.isRequiredToAddExpForm[this.num] = false;
      }

      this.formVal.isRead[this.num] = true;
      if (this.addMoreRequired[this.num] != true && this.formVal.clinicianRemaining[this.num + 1].length != 0) {
        this.toAddExp = true;
      }
    }
    if (this.num == -1) {
      for (let i = 0; i < this.model1.length; i++) {
        this.model1[i].expressions = [];
        this.itr = 0;
      }

      this.formVal.clinicianRemaining = [['physician', 'app', 'scribe']]
      this.formVal.alreadySelectedClinician = [[]];
      this.formVal.selectedClinicianDropDown = [[]];
      this.formVal.firstDropDown = false;
      this.formVal.selectedExp = "";
      this.formVal.isRequiredToDelete = false;
    }
  }

  addingExpressionForm(index): void {
    let value = this.formVal.expressionFormGroup.value.expressionForm[index].selectedClinicianDropDown;
    this.formVal.clinicianRemaining[index + 1] = [];
    this.formVal.clinicianRemaining[index + 1].push(this.formVal.expressionFormGroup.value.expressionForm[index].cliniciansDropDown);

    this.formVal.alreadySelectedClinician[index + 1] = [];
    this.formVal.alreadySelectedClinician[index + 1] = this.formVal.alreadySelectedClinician[index].slice();
    var index1 = this.formVal.alreadySelectedClinician[index + 1].indexOf(value);
    this.formVal.alreadySelectedClinician[index + 1].splice(index1, 1);
    this.formVal.alreadySelectedClinician[index + 1] = this.removeDuplicate(this.formVal.alreadySelectedClinician[index + 1]);

    this.addingExpForm(index);
  }

  notAddingExpressionForm(index): void {
    this.settingValueForNextForm(index);
    this.addingExpForm(index);
  }

  private addingExpForm(index: any) {
    const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
    if (this.formVal.clinicianRemaining[index + 1].length !== 0) {
      control.push(this.initialization());
      this.selected1.push({ cliniciansDropDown: '' });
      this.selected2.push({ numberOfClinician: '' });
      this.selected3.push({ operatorChosen: '' });
      this.selected4.push({ selectedClinicianDropDown: '' });
    }
    this.formVal.isRequiredToAddExpForm[index] = true;
    this.addMoreRequired[index + 1] = false;
    this.formVal.isRequiredToAddExpForm[index + 1] = false;
  }
  addingExpression() {
    const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
    control.push(this.initialization());
    this.selected1.push({ cliniciansDropDown: '' });
    this.selected2.push({ numberOfClinician: '' });
    this.selected3.push({ operatorChosen: '' });
    this.selected4.push({ selectedClinicianDropDown: '' });
    this.num = this.formVal.expressionFormGroup.controls.expressionForm.length - 1;
    this.formVal.isRead[this.num] = false;
    this.addMoreRequired[this.num] = false;
    this.toAddExp = false;
  }

  private settingValueForNextForm(index: any) {
    this.formVal.clinicianRemaining[index + 1] = [];
    for (var i = 0; i < this.formVal.clinicianData.length; i++) {
      this.checking = false;
      for (var j = 0; j <= index; j++) {
        if (this.formVal.expressionFormGroup.value.expressionForm[j].cliniciansDropDown === this.formVal.clinicianData[i]) {
          this.checking = true;
          break;
        }
      }
      if (!this.checking) {
        this.formVal.clinicianRemaining[index + 1].push(this.formVal.clinicianData[i]);

      }
    }
    var index1 = this.formVal.clinicianRemaining[index + 1].indexOf(this.formVal.selectedExp);
    this.formVal.clinicianRemaining[index + 1].splice(index1, 1);

    this.formVal.alreadySelectedClinician[index + 1] = [];
    this.formVal.alreadySelectedClinician[index + 1].push(this.formVal.selectedExp);
    for (var j = 0; j <= index; j++) {
      this.formVal.alreadySelectedClinician[index + 1].push(this.formVal.expressionFormGroup.value.expressionForm[j].cliniciansDropDown);
    }
    this.formVal.alreadySelectedClinician[index + 1] = this.removeDuplicate(this.formVal.alreadySelectedClinician[index + 1]);
  }
  removeDuplicate(array) {
    return array.filter((a, b) => array.indexOf(a) === b);
  }

  sendresponse() {
    this.getFlagStatus();
    this.calculateCapacity();
    this.createRequestBody();
    this.requestBodyToSend.emit(this.requestBody);
    this.validateFlagToSend.emit(this.flagForValidation);
  }
  calculateCapacity() {
    for (let i = 0; i < this.model1.length; i++) {
 
      this.model1[i].patientsPerHour = this.formVal.model[i].patientsPerHour;
      this.model1[i].cost = this.formVal.model[i].cost;
      this.model1[i].capacity[0] = this.formVal.efficiencyModel[i].firstHour;
      this.model1[i].capacity[1] = this.formVal.efficiencyModel[i].midHour;
      this.model1[i].capacity[2] = this.formVal.efficiencyModel[i].lastHour;
    }
  }
  sendFile() {
    this.fileToSend.emit(this.inputFile);
  }

  createRequestBody() {
    this.requestBody = {
      "name": "",
      "shiftLengthPreferences": "8, 6, 4",
      "lowerUtilizationFactor": 0.85,
      "upperUtilizationFactor": 1.10,
      "notAllocatedStartTime": 1,
      "notAllocatedEndTime": 6,
      "patientHourWait": 2,
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
    this.requestBody.notAllocatedStartTime = this.formVal.notAllocatedStartTime;
    this.requestBody.notAllocatedEndTime = this.formVal.notAllocatedEndTime;
    this.requestBody.patientHourWait = this.formVal.patientHourWait;
    this.requestBody.name = this.formVal.jobName;
    this.requestBody.clinicians = JSON.parse(JSON.stringify(this.model1));
    this.requestBody.cronExpression = this.formVal.cronExpression;
    this.requestBody.userId = this.authService.currentLoggedInUser;
    this.requestBody.inputFormat = this.formVal.inputFormat;
    if (this.formVal.inputFormat == "FTP_URL") {
      this.requestBody.inputFtpDetails.fileUrl = this.formVal.inputFtpUrl;
      this.requestBody.inputFtpDetails.username = this.formVal.inputFtpUsername;
      this.requestBody.inputFtpDetails.password = this.formVal.inputFtpPassword;
      this.requestBody.inputFileDetails = this.formVal.inputFile;
    }
    else {
      this.requestBody.inputFtpDetails = null;
      this.requestBody.inputFileDetails.fileExtension = 'xlsx';  //*** */
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
      console.log('The dialog was closed');
      this.formVal.cronExpression = result;
      console.log(this.formVal.cronExpression);
    });
  }
}

export interface DialogData {
  cronResult: string;
}
