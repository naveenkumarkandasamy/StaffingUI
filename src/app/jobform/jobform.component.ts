import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { Model,Efficiency } from '../Models/app.types';
import { CronGeneratorComponent } from '../cron-generator/cron-generator.component';
import { MatDialog } from '@angular/material';
import { AuthenticationService } from '../services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators,FormBuilder ,FormArray,FormGroup} from '@angular/forms';

@Component({
  selector: 'app-jobform',
  templateUrl: './jobform.component.html',
  styleUrls: ['./jobform.component.css']
})
export class JobformComponent implements OnInit {
  firstDropDown: boolean = false;
  expressionFormGroup: FormGroup;
  clinicianData = [];
  isaddbutton: boolean = false;
  initiallySelected: String;
  clinicianRemaining = [][10];
  operator = [];
  alreadySelectedClinician = [][10];
  addMoreRequired = [];
  selected: boolean = false;
  checking: boolean = false;
  isRead = [];
  isRequiredToAddExpForm = [];
  expression: String;
  constructor(private fb: FormBuilder,private constantsService: ConstantsService, public dialog: MatDialog, private authService: AuthenticationService, private toastr: ToastrService) { }

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
    "notAllocatedStartTime":1,
     "notAllocatedEndTime":6,
     "patientHourWait":2,
     "first":3,
    "model":"",
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
    "efficiencyModel" :"",
    "firstDropDown":false,
    "selected":false,
    "clinicianData":"",
    "clinicianRemaining":"",
    "alreadySelectedClinician":"",
    "operator":"",
  };

  inputFile: File;
  n:any;
  inputTypes: Array<string> = ["FTP_URL", "DATA_FILE"];
  outputTypes: Array<string> = ["FTP_URL", "EMAIL"];


  model1: Model[] = this.constantsService.model;
  efficiencyModel :Efficiency[] =this.constantsService.efficiencyModel;
  model: Model[]= JSON.parse(JSON.stringify(this.model1));
  columnDefs: any
  powerPlantTypes:any;
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
  notAllocatedStartTime = new FormControl('', [Validators.min(0), Validators.max(23)]);
  notAllocatedEndTime = new FormControl('', [Validators.min(0), Validators.max(23)]);
  patientHourWait = new FormControl('', [Validators.min(0), Validators.max(23)]);
  // exp1 = new FormControl('', [Validators.required]);
  // exp2 = new FormControl('', [Validators.required]);
  // exp3 = new FormControl('', [Validators.required]);
  inputVFile = new FormControl('', [Validators.required]);
  inputFtpUrl = new FormControl('', [Validators.required]);
  inputFtpUsername = new FormControl('', [Validators.required]);
  inputFtpPassword = new FormControl('', [Validators.required]);
  outputFtpUrl = new FormControl('', [Validators.required]);
  outputFtpUsername = new FormControl('', [Validators.required]);
  outputFtpPassword = new FormControl('', [Validators.required]);
  outputEmail = new FormControl('', [Validators.required, Validators.email]);
  cronExp = new FormControl('', [Validators.required]);
  
  
  getFlagStatus() {
    this.checkFlag=0;
    if (this.jobName.hasError('required') || this.shiftLength.hasError('pattern') || 
      this.lowerUtilization.hasError('min') || this.lowerUtilization.hasError('max') || 
      this.upperUtilization.hasError('min') || this.upperUtilization.hasError('max') || 
      // this.exp1.hasError('required') || this.exp3.hasError('required') || 
      // this.exp2.hasError('required') || 
      this.outputEmail.hasError('required') || 
      this.cronExp.hasError('required')) {
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
    else if (this.formVal.outputFormat == 'EMAIL' && this.outputEmail.hasError('email')) {
      this.flagForValidation = 1
      this.checkFlag=1;
    }
    if(this.checkFlag==0){
      this.flagForValidation=0;
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
    console.log(value.options.selectedIndex);
    
    let index = value.options.selectedIndex - 1;
    this.formVal.clinicianRemaining[0].splice(index, 1);
    this.formVal.alreadySelectedClinician[0].push(value.value);
    
    this.initiallySelected = value.value;
    this.formVal.selected = true;
    this.formVal.firstDropDown = true;
    this.n=this.formVal.clinicianData.length;
    this.n=this.n*(this.n+1)/2;
    for(let i=0;i<this.n;i++)
    {
      this.formVal.isRequiredToAddExpForm[i]=true;
      this.addMoreRequired[i]=false;
      console.log(this.formVal.isRequiredToAddExpForm[i]);
    }
    for(let i=0;i<this.model1.length;i++)
    {
      this.model1[i].expressions=[];
    }
    value.options.selectedIndex=0;
  }
  readingData2(index)
  {
    this.formVal.isRead[index] = false;
  }
  readingData(index) {
    let clinician = this.formVal.expressionFormGroup.value.expressionForm[index].cliniciansDropDown;
    let selectedClinician = this.formVal.expressionFormGroup.value.expressionForm[index].selectedClinicianDropDown;

    if (clinician !== '' && this.formVal.expressionFormGroup.value.expressionForm[index].numberOfClinician !== '' && this.formVal.expressionFormGroup.value.expressionForm[index].operatorChosen !== '' && selectedClinician !== '') {
      this.formVal.isRead[index] = true;
      this.formVal.isRead[index + 1] = false;
      this.expression = this.formVal.expressionFormGroup.value.expressionForm[index].numberOfClinician + " " + this.formVal.expressionFormGroup.value.expressionForm[index].operatorChosen + " " + selectedClinician;
      if (clinician == 'physician') {
        this.model1[0].expressions.push(this.expression);
      }
      if (clinician == 'app') {
        this.model1[1].expressions.push(this.expression);
      }
      if (clinician == 'scribe') {
     this.model1[2].expressions.push(this.expression);
      }
      if (this.formVal.alreadySelectedClinician[index].length <= 1) {
        this.removingSelectedClinician(index, clinician);

        this.formVal.alreadySelectedClinician[index + 1] = this.formVal.alreadySelectedClinician[index].slice();
        this.formVal.alreadySelectedClinician[index + 1].push(clinician);

        if (this.formVal.clinicianRemaining[index + 1].length === 0) {
          for (var i = 0; i < this.clinicianData.length; i++) {
            this.checking = false;
            for (var j = 0; j <= index; j++) {
              if (this.formVal.expressionFormGroup.value.expressionForm[j].cliniciansDropDown === this.clinicianData[i]) {
                this.checking = true;
                break;
              }
            }
            if (!this.checking) {
              this.formVal.clinicianRemaining[index + 1].push(this.clinicianData[i]);
            }
          }

          this.formVal.clinicianRemaining[index + 1].splice(this.formVal.clinicianRemaining[index + 1].find(x => x == this.initiallySelected), 1);
          this.formVal.alreadySelectedClinician[index + 1].push(this.initiallySelected);
        }
        if (this.formVal.clinicianRemaining[index + 1].length !== 0 && this.formVal.alreadySelectedClinician[index].length <= 1) {
          this.formVal.alreadySelectedClinician[index + 1] = [];
          this.formVal.alreadySelectedClinician[index + 1].push(this.initiallySelected);
          for (var j = 0; j <= index; j++) {
            this.formVal.alreadySelectedClinician[index + 1].push(this.formVal.expressionFormGroup.value.expressionForm[j].cliniciansDropDown);
          }
          this.formVal.alreadySelectedClinician[index + 1] = this.removeDuplicate(this.formVal.alreadySelectedClinician[index + 1]);
        }
        this.addMoreRequired[index] = false;

      } else {
        this.formVal.alreadySelectedClinician[index + 1] = this.formVal.alreadySelectedClinician[index].slice();
        var index1 = this.formVal.alreadySelectedClinician[index + 1].indexOf(selectedClinician);
        this.formVal.alreadySelectedClinician[index + 1].splice(index1, 1);
        this.addMoreRequired[index] = true;
        this.formVal.isRequiredToAddExpForm[index]=false;
      }
      this.formVal.alreadySelectedClinician[index + 1] = this.removeDuplicate(this.formVal.alreadySelectedClinician[index + 1]);

      const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
      if (!this.addMoreRequired[index] && this.formVal.clinicianRemaining[index + 1].length !== 0) {
        control.push(this.initialization());
        console.log("sdasd");
      }

    }
  }

  private removingSelectedClinician(index: any, value: any) {
    this.formVal.clinicianRemaining[index + 1] = this.formVal.clinicianRemaining[index].slice();
    var index1 = this.formVal.clinicianRemaining[index + 1].indexOf(value);
    this.formVal.clinicianRemaining[index + 1].splice(index1, 1);

  }

  addingExpressionForm(index): void {
    let index1 = this.formVal.expressionFormGroup.value.expressionForm.length - 1;
    this.addMoreRequired[index] = true;
    this.formVal.clinicianRemaining[index + 1] = [];
    this.formVal.clinicianRemaining[index + 1].push(this.formVal.expressionFormGroup.value.expressionForm[index1].cliniciansDropDown);
    this.formVal.alreadySelectedClinician[index + 1] = this.removeDuplicate(this.formVal.alreadySelectedClinician[index + 1]);
    this.addingExpForm(index);
  }

  notAddingExpressionForm(index): void {
    let value = this.formVal.expressionFormGroup.value.expressionForm[index].cliniciansDropDown;
    this.removingSelectedClinician(index, value);
    this.formVal.alreadySelectedClinician[index + 1] = [];
    this.formVal.alreadySelectedClinician[index + 1].push(this.initiallySelected);
    for (var j = 0; j <= index; j++) {
      this.formVal.alreadySelectedClinician[index + 1].push(this.formVal.expressionFormGroup.value.expressionForm[j].cliniciansDropDown);
    }
    this.formVal.alreadySelectedClinician[index + 1] = this.removeDuplicate(this.formVal.alreadySelectedClinician[index + 1]);
    this.addingExpForm(index);
  }

  private addingExpForm(index: any) {
    const control = <FormArray>this.formVal.expressionFormGroup.controls['expressionForm'];
    if (this.formVal.clinicianRemaining[index + 1].length !== 0) {
      control.push(this.initialization());
    }
    this.formVal.isRequiredToAddExpForm[index] = true;
    this.formVal.isRequiredToAddExpForm[index + 1] = false;
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
      this.model1[i].patientsPerHour=this.formVal.model[i].patientsPerHour;
      this.model1[i].cost=this.formVal.model[i].cost;
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
      "notAllocatedStartTime":1,
     "notAllocatedEndTime":6,
     "patientHourWait":2,
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