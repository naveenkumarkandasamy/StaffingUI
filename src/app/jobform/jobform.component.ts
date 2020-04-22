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

  selectedClinician: any[] = [];
  selectedNumOfClinician: any[] = [];
  selectedOperator: any[] = [];
  selectedCinincianForExp: any[] = [];
  check: boolean = false;
  addMoreRequired = [];
  checking: boolean = false;
  expression: String;

  constructor(private fb: FormBuilder, private constantsService: ConstantsService, public dialog: MatDialog, private authService: AuthenticationService, private toastr: ToastrService) {
  }
  ngOnInit() {
    this.itr = 1;
  }
  @Input() expData: any;
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
    "efficiencyModel": "",
    "priorClinicianDropDown": false,
    "selected": false,
    "clinicianData": "",
    "clinicianRemaining": "",
    "alreadySelectedClinician": "",
    "operator": "",
    "expressionRowData": "",
  };

  inputFile: File;
  numOfForm: any; exp: any = [];
  inputTypes: Array<string> = ["FTP_URL", "DATA_FILE"];
  outputTypes: Array<string> = ["FTP_URL", "EMAIL"];
  itr: any;
  model: Model[] = this.constantsService.model;
  efficiencyModel: Efficiency[] = this.constantsService.efficiencyModel;

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
  toAddExp: boolean;
  checkFlag=0;
  cronValid =0;

  //FORM VALIDATION
  jobName = new FormControl('', [Validators.required]);
  shiftLength = new FormControl('', [Validators.pattern('^[1-9][0-9]?(,[1-9][0-9]?)*$')])
  lowerUtilization = new FormControl('', [Validators.min(0.5), Validators.max(1.1)]);
  upperUtilization = new FormControl('', [Validators.min(0.8), Validators.max(1.5)]);
  notAllocatedStartTime = new FormControl('', [Validators.min(0), Validators.max(23)]);
  notAllocatedEndTime = new FormControl('', [Validators.min(0), Validators.max(23)]);
  patientHourWait = new FormControl('', [Validators.min(1), Validators.max(167)]);
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
    if (this.reset != true ) {

      this.exp = [];
      for (let index1 = 0; index1 < this.expData.length; index1++) {
        for (let j = 0; j < this.expData.length; j++) {
          if (index1 == this.expData[j].expressions[0]) {
            if (this.expData[j].expressions.length == 1) {
              this.exp.push(this.expData[j].name);
            }
            for (let index2 = 1; index2 < this.expData[j].expressions.length; index2++) {
              this.exp.push(this.expData[j].name + "," + this.expData[j].expressions[index2]);
            }
          }
        }
      }
      for (let index1 = 0; index1 < this.expData.length; index1++) {//storing the expData into model
        for (let i = 0; i < this.model.length; i++) {
          if (this.model[i].name == this.expData[index1].name) {
            this.model[i].expressions = this.expData[index1].expressions;
          }
        }
      }
      this.itr = this.model.length - 1;
      for (let i = 1; i < this.exp.length; i++) {//creating the expression form using data from db
        this.check = true;
        this.formVal.clinicianRemaining[i - 1] = ['physician', 'app', 'scribe'];
        this.formVal.alreadySelectedClinician[i - 1] = [];
        var splittedData = this.exp[i].split(",");
        this.exp[i] = [];
        this.exp[i].push(splittedData[0]);
        this.exp[i].push(splittedData[1]);
        var splittedDataBySpace = splittedData[1].split(" ");

        if (this.exp[i][0] == this.exp[i - 1][0]) { //setting values for clinicianRemaining
          this.formVal.clinicianRemaining[i - 1] = [];
          this.formVal.clinicianRemaining[i - 1].push(this.exp[i - 1][0]);
        }
        else {
          for (let j = i - 1; j >= 1; j--) {
            var index1 = this.formVal.clinicianRemaining[i - 1].indexOf(this.exp[j][0]);
            this.formVal.clinicianRemaining[i - 1].splice(index1, 1);
          }
          var index1 = this.formVal.clinicianRemaining[i - 1].indexOf(this.formVal.selectedPriorClinician);
          this.formVal.clinicianRemaining[i - 1].splice(index1, 1);
        }

        if (this.exp[i][0] == this.exp[i - 1][0] && i >= 2) {//setting values for already selected clincian
          this.formVal.alreadySelectedClinician[i - 1] = this.formVal.alreadySelectedClinician[i - 2].slice();
          var splitted1 = this.exp[i - 1][1].split(" ");
          var index1 = this.formVal.alreadySelectedClinician[i - 1].indexOf(splitted1[2]);
          this.formVal.alreadySelectedClinician[i - 1].splice(index1, 1);
        }
        else {
          for (let j = i - 1; j >= 1; j--) {
            this.formVal.alreadySelectedClinician[i - 1].push(this.exp[j][0]);
          }
          this.formVal.alreadySelectedClinician[i - 1].push(this.formVal.selectedPriorClinician);
        }
        this.formVal.alreadySelectedClinician[i - 1] = this.removeDuplicate(this.formVal.alreadySelectedClinician[i - 1]);

        const control = this.formVal.expressionFormGroup.controls.expressionForm as FormArray;//creating a expression Form
        control.push(this.initialization());
        this.selectedClinician.push({ cliniciansDropDown: splittedData[0] });
        this.selectedNumOfClinician.push({ numberOfClinician: splittedDataBySpace[0] });
        this.selectedOperator.push({ operatorChosen: splittedDataBySpace[1] });
        this.selectedCinincianForExp.push({ selectedClinicianDropDown: splittedDataBySpace[2] });
        this.formVal.expressionFormGroup.value.expressionForm[i - 1].cliniciansDropDown = splittedData[0];
        this.formVal.expressionFormGroup.value.expressionForm[i - 1].numberOfClinician = splittedDataBySpace[0];
        this.formVal.expressionFormGroup.value.expressionForm[i - 1].operatorChosen = splittedDataBySpace[1];
        this.formVal.expressionFormGroup.value.expressionForm[i - 1].selectedClinicianDropDown = splittedDataBySpace[2];
      }
    }
  }
  getFlagStatus() {
    this.checkFlag = 0;
    if (this.jobName.hasError('required') || this.shiftLength.hasError('pattern') ||
      this.lowerUtilization.hasError('min') || this.lowerUtilization.hasError('max') ||
      this.upperUtilization.hasError('min') || this.upperUtilization.hasError('max') ||
      this.notAllocatedStartTime.hasError('min')||this.notAllocatedStartTime.hasError('max')||
      this.notAllocatedEndTime.hasError('min')||this.notAllocatedEndTime.hasError('max')||
      this.patientHourWait.hasError('min')|| this.patientHourWait.hasError('max')||
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
    else if (this.formVal.outputFormat == 'EMAIL' && (this.outputEmail.hasError('email') || 
    this.outputEmail.hasError('required'))) {
      this.flagForValidation = 1
      this.checkFlag=1;
    }
    else if (this.cronValid == 0 && this.cronExp.hasError('required')){
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
    this.formVal.clinicianRemaining[0] = this.formVal.clinicianData.slice(0);//setting values for first form
    var index1 = this.formVal.clinicianRemaining[0].indexOf(value);
    this.formVal.clinicianRemaining[0].splice(index1, 1);
    this.formVal.alreadySelectedClinician[0] = [];
    this.formVal.alreadySelectedClinician[0].push(value);
    this.formVal.priorClinicianDropDown = true;//Should be disabled
    this.formVal.disableToReadData[0] = false;
    this.formVal.selected = true;
    this.itr = 0;
    this.numOfForm = this.formVal.clinicianData.length;
    this.numOfForm = this.numOfForm * (this.numOfForm + 1) / 2;
    for (let i = 0; i < this.numOfForm; i++) {
      this.formVal.isRequiredToAddExpForm[i] = true;
      this.addMoreRequired[i] = false;
    }
    for (let i = 0; i < this.model.length; i++) {//Initially Exp for all clinician should be empty
      this.model[i].expressions = [];
    }
    for (let i = 0; i < this.model.length; i++) {//Reading Expression Starts
      if (this.model[i].name == value) {
        this.model[i].expressions.push(this.itr);
      }
    }
    for (let i = 0; i < this.selectedClinician.length; i++) {
      this.selectedClinician[i].cliniciansDropDown = '';
      this.selectedNumOfClinician[i].numberOfClinician = '';
      this.selectedOperator[i].operatorChosen = '';
      this.selectedCinincianForExp[i].selectedClinicianDropDown = '';
    }
    this.formVal.isRequiredToDelete = true;
    if (this.formVal.expressionFormGroup.controls.expressionForm.length - 1 == -1) {//Creating a Expression Form
      const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
      control.push(this.initialization());
      this.selectedClinician.push({ cliniciansDropDown: '' });
      this.selectedNumOfClinician.push({ numberOfClinician: '' });
      this.selectedOperator.push({ operatorChosen: '' });
      this.selectedCinincianForExp.push({ selectedClinicianDropDown: '' });
    }
  }
  readingData(index) {

    let clinician = this.formVal.expressionFormGroup.value.expressionForm[index].cliniciansDropDown;
    let selectedClinicianValue = this.formVal.expressionFormGroup.value.expressionForm[index].selectedClinicianDropDown;
    if (clinician !== '' && this.formVal.expressionFormGroup.value.expressionForm[index].numberOfClinician !== '' && this.formVal.expressionFormGroup.value.expressionForm[index].operatorChosen !== '' && selectedClinicianValue !== '') {
      for (let i = 0; i < this.model.length; i++) { //Reading Expression from FormArray
        if (this.model[i].name == clinician) {
          if (this.model[i].expressions.length == 0) {
            this.itr++;
            this.model[i].expressions.push(this.itr);

          }
          this.model[i].expressions.push(this.formVal.expressionFormGroup.value.expressionForm[index].numberOfClinician + " " + this.formVal.expressionFormGroup.value.expressionForm[index].operatorChosen + " " + selectedClinicianValue);
        }
      }
      this.formVal.disableToReadData[index] = true;//Disable the Current Form After reading data
      this.formVal.disableToReadData[index + 1] = false;//Enable for Next Form to read data

      this.settingValueForNextForm(index);
      if (this.formVal.alreadySelectedClinician[index].length == 1) {
        this.addMoreRequired[index] = false;
      }
      else {
        this.addMoreRequired[index] = true;
        this.formVal.isRequiredToAddExpForm[index] = false;
      }
      const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
      if (!this.addMoreRequired[index] && this.formVal.clinicianRemaining[index + 1].length !== 0) {//Creating a Expression Form
        control.push(this.initialization());
        this.selectedClinician.push({ cliniciansDropDown: '' });
        this.selectedNumOfClinician.push({ numberOfClinician: '' });
        this.selectedOperator.push({ operatorChosen: '' });
        this.selectedCinincianForExp.push({ selectedClinicianDropDown: '' });
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
    this.check = false;
    this.numOfForm = this.formVal.expressionFormGroup.controls.expressionForm.length - 1;
    for (let i = 0; i < this.model.length; i++) {//Deleting the Assigned Expression from Model
      if (this.model[i].name == (this.formVal.expressionFormGroup.value.expressionForm[this.numOfForm].cliniciansDropDown)) {
        if (this.model[i].expressions.length == 2) {
          this.model[i].expressions = [];
          this.itr--;
        }
        else {
          this.model[i].expressions.splice(this.model[i].expressions.length - 1, 1);
        }
      }
    }
    this.formVal.expressionFormGroup.controls.expressionForm.value.pop()//Deleting the Last Form
    this.formVal.expressionFormGroup.controls.expressionForm.removeAt(this.numOfForm);
    this.selectedClinician[this.numOfForm].cliniciansDropDown = '';
    this.selectedNumOfClinician[this.numOfForm].numberOfClinician = '';
    this.selectedOperator[this.numOfForm].operatorChosen = '';
    this.selectedCinincianForExp[this.numOfForm].selectedClinicianDropDown = '';
    this.numOfForm = this.numOfForm - 1;
    if (this.numOfForm >= 0) {
      if (this.formVal.alreadySelectedClinician[this.numOfForm].length > 1) {
        this.addMoreRequired[this.numOfForm] = true;
        this.formVal.isRequiredToAddExpForm[this.numOfForm] = false;
      }

      this.formVal.disableToReadData[this.numOfForm] = true;
      if (this.addMoreRequired[this.numOfForm] != true && this.formVal.clinicianRemaining[this.numOfForm + 1].length != 0) {
        this.toAddExp = true;
      }
    }
    if (this.numOfForm == -1) {//after Every Expression are deleted  
      for (let i = 0; i < this.model.length; i++) {
        this.model[i].expressions = [];
        this.itr = 0;
      }
      this.formVal.clinicianRemaining = [['physician', 'app', 'scribe']]
      this.formVal.alreadySelectedClinician = [[]];
      this.formVal.selectedClinicianDropDown = [[]];
      this.formVal.priorClinicianDropDown = false;
      this.formVal.selectedPriorClinician = "";
      this.formVal.isRequiredToDelete = false;
    }
  }

  addingExpressionForm(index): void {//Adding Expression for the same Clinician if possible
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

  notAddingExpressionForm(index): void {//Not Adding Expression for the same Clinician even it is possible
    this.settingValueForNextForm(index);
    this.addingExpForm(index);
  }

  private addingExpForm(index: any) {//Creating a Expression Form
    const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
    if (this.formVal.clinicianRemaining[index + 1].length !== 0) {
      control.push(this.initialization());
      this.selectedClinician.push({ cliniciansDropDown: '' });
      this.selectedNumOfClinician.push({ numberOfClinician: '' });
      this.selectedOperator.push({ operatorChosen: '' });
      this.selectedCinincianForExp.push({ selectedClinicianDropDown: '' });
    }
    this.formVal.isRequiredToAddExpForm[index] = true;
    this.addMoreRequired[index + 1] = false;
    this.formVal.isRequiredToAddExpForm[index + 1] = false;
  }
  addingExpression() {
    const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
    control.push(this.initialization());
    this.selectedClinician.push({ cliniciansDropDown: '' });
    this.selectedNumOfClinician.push({ numberOfClinician: '' });
    this.selectedOperator.push({ operatorChosen: '' });
    this.selectedCinincianForExp.push({ selectedClinicianDropDown: '' });
    this.numOfForm = this.formVal.expressionFormGroup.controls.expressionForm.length - 1;
    this.formVal.disableToReadData[this.numOfForm] = false;
    this.addMoreRequired[this.numOfForm] = false;
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
    var index1 = this.formVal.clinicianRemaining[index + 1].indexOf(this.formVal.selectedPriorClinician);
    this.formVal.clinicianRemaining[index + 1].splice(index1, 1);

    this.formVal.alreadySelectedClinician[index + 1] = [];
    this.formVal.alreadySelectedClinician[index + 1].push(this.formVal.selectedPriorClinician);
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
    for (let i = 0; i < this.model.length; i++) {

      this.model[i].patientsPerHour = this.formVal.model[i].patientsPerHour;
      this.model[i].cost = this.formVal.model[i].cost;
      this.model[i].capacity[0] = this.formVal.efficiencyModel[i].firstHour;
      this.model[i].capacity[1] = this.formVal.efficiencyModel[i].midHour;
      this.model[i].capacity[2] = this.formVal.efficiencyModel[i].lastHour;
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
    this.requestBody.clinicians = JSON.parse(JSON.stringify(this.model));
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
      this.cronValid = 1;
      this.sendresponse();
    });
  }
}

export interface DialogData {
  cronResult: string;
}
