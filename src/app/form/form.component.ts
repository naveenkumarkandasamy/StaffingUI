import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { response, Model, Efficiency } from "../Models/app.types"
import { ViewChild, ElementRef } from '@angular/core';
import { DataService } from "../services/data.service"
import { ConstantsService } from "../services/constants.service";
import { HttpClientService } from "../services/http-client.service";
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { ExcelService } from '../services/excel.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'mainForm',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class MainFormComponent implements OnInit {

  priorClinicianDropDown: boolean = false;
  expressionFormGroup: FormGroup;
  clinicianData = [];
  selectedPriorClinician: any;
  initiallySelected: String;
  clinicianRemaining = [][10];
  operator = [];
  alreadySelectedClinician = [][10];
  addMoreRequired = [];
  selected: boolean = false;
  checking: boolean = false;
  disableToReadData = [];
  isRequiredToAddExpForm = [];
  expression: String;
  numOfForm: any;
  itr: any;

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  message: string;
  apiData: response;
  transposedColumnDef: Array<any>
  data: any = this.constantsService.data;
  sampleFileData: any = this.constantsService.sampleFileData;
  shiftLength: string = this.constantsService.shiftLength;
  inputTypes: Array<string> = ["Provide Online", "File Upload"];
  inputFormat: string = "Provide Online";
  fileToUpload: File = null;
  utilization = 1.10;
  upperUtilization = 0.85;
  notAllocatedStartTime = 1;
  notAllocatedEndTime = 6;
  patientHourWait = 2;
  model: Model[] = this.constantsService.model;
  isRequiredToDelete: boolean;
  toAddExp: boolean;
  chooseFile: boolean;
  fileData: any;
  transposedFileColumnDef: Array<any>

  efficiencyModel: Efficiency[] = this.constantsService.efficiencyModel;

  requestBody: any = {
    "shiftLength": [12, 8, 10, 4],
    "lowerLimitFactor": 0.85, // *** ADD UPPER LIMIT
    "upperLimitFactor": 1.10,
    "patientHourWait": 2,
    "clinician": this.model,
    "dayWorkload": this.data,
  }

  columnDefs = [
    { headerName: 'Role', field: 'name', editable: true, lockPosition: true },
    {
      headerName: 'Cost', lockPosition: true,
      valueGetter: function (params) {
        return params.data.cost;
      },
      valueSetter: function (params) {
        if (params.data.cost !== params.newValue && !(/[a-zA-Z*&^%$#@!]+/.test(params.newValue)) && params.newValue !=='') {
          params.data.cost = params.newValue;
          return true;
        } else {
          return false;
        }
      },
    }
  ];

  columnDefs1 = [
    { headerName: 'Role', field: 'name', editable: true, lockPosition: true },
    {
      headerName: 'FirstHour', lockPosition: true, valueGetter: function (params) {
        return params.data.firstHour;
      },
      valueSetter: function (params) {
        if (params.data.firstHour !== params.newValue && !(/[a-zA-Z*&^%$#@!]+/.test(params.newValue)) && params.newValue !=='') {
          params.data.firstHour = params.newValue;
          return true;
        } else {
          return false;
        }
      }
    },
    {
      headerName: 'MidHour', lockPosition: true,
      valueGetter: function (params) {
        return params.data.midHour;
      },
      valueSetter: function (params) {
        if (params.data.midHour !== params.newValue && !(/[a-zA-Z*&^%$#@!]+/.test(params.newValue)) && params.newValue !=='') {
          params.data.midHour = params.newValue;
          return true;
        } else {
          return false;
        }
      },
    },
    {
      headerName: 'LastHour', lockPosition: true,
      valueGetter: function (params) {
        return params.data.lastHour;
      },
      valueSetter: function (params) {
        if (params.data.lastHour !== params.newValue && !(/[a-zA-Z*&^%$#@!]+/.test(params.newValue)) && params.newValue !=='') {
          params.data.lastHour = params.newValue;
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

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient,
    private dataService: DataService, private toastr: ToastrService, private constantsService: ConstantsService, private httpClientService: HttpClientService, private excelService: ExcelService) { }

  ngOnInit() {

    this.dataService.apiData$.subscribe(apiData => this.apiData = apiData);
    this.createColumnData();
    this.clinicianData = ['physician', 'app', 'scribe'];
    for (var i = 0; i < this.model.length; i++) {
      this.model[i].expressions = [];
    }
    this.clinicianRemaining = [['physician', 'app', 'scribe']];
    this.alreadySelectedClinician = [[]];
    this.operator = ['*'];
    this.expressionFormGroup = this.fb.group({
      expressionForm: this.fb.array([

      ])
    });
    this.chooseFile = false;
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

    this.clinicianRemaining[0] = this.clinicianData.slice(0);//setting values for first form
    var index1 = this.clinicianRemaining[0].indexOf(value);
    this.clinicianRemaining[0].splice(index1, 1);
    this.alreadySelectedClinician[0] = [];
    this.alreadySelectedClinician[0].push(value);
    this.priorClinicianDropDown = true; //Should be disabled
    this.selected = true;
    this.itr = 0;
    this.numOfForm = this.clinicianData.length;
    this.disableToReadData[0] = false;
    this.numOfForm = this.numOfForm * (this.numOfForm + 1) / 2;
    for (let i = 0; i < this.numOfForm; i++) {
      this.isRequiredToAddExpForm[i] = true;
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
    this.isRequiredToDelete = true;
    if (this.expressionFormGroup.value.expressionForm.length - 1 == -1) { //Creating a Expression Form
      const control = <FormArray>this.expressionFormGroup.controls['expressionForm'];
      control.push(this.initialization());
    }
  }
  readingData(index) {
    let clinician = this.expressionFormGroup.value.expressionForm[index].cliniciansDropDown;
    let selectedClinician = this.expressionFormGroup.value.expressionForm[index].selectedClinicianDropDown;
    if (clinician !== '' && this.expressionFormGroup.value.expressionForm[index].numberOfClinician !== '' && this.expressionFormGroup.value.expressionForm[index].operatorChosen !== '' && selectedClinician !== '') {
      for (let i = 0; i < this.model.length; i++) { //Reading Expression from FormArray
        if (this.model[i].name == clinician) {
          if (this.model[i].expressions.length == 0) {
            this.itr++;
            this.model[i].expressions.push(this.itr);

          }
          this.model[i].expressions.push(this.expressionFormGroup.value.expressionForm[index].numberOfClinician + " " + this.expressionFormGroup.value.expressionForm[index].operatorChosen + " " + selectedClinician);
        }
      }
      this.disableToReadData[index] = true; //Disable the Current Form After reading data
      this.disableToReadData[index + 1] = false; //Enable for Next Form to read data

      this.settingValueForNextForm(index);
      if (this.alreadySelectedClinician[index].length == 1) {
        this.addMoreRequired[index] = false;
      }
      else {
        this.addMoreRequired[index] = true;
        this.isRequiredToAddExpForm[index] = false;
      }
      const control = <FormArray>this.expressionFormGroup.controls['expressionForm'];
      if (!this.addMoreRequired[index] && this.clinicianRemaining[index + 1].length !== 0) { //Creating a Expression Form
        control.push(this.initialization());
        this.addMoreRequired[index + 1] = false;
      }
    }
  }

  addingExpressionForm(index): void { //Adding Expression for the same Clinician if possible
    let value = this.expressionFormGroup.value.expressionForm[index].selectedClinicianDropDown;
    this.clinicianRemaining[index + 1] = [];
    this.clinicianRemaining[index + 1].push(this.expressionFormGroup.value.expressionForm[index].cliniciansDropDown);

    this.alreadySelectedClinician[index + 1] = [];
    this.alreadySelectedClinician[index + 1] = this.alreadySelectedClinician[index].slice();
    var index1 = this.alreadySelectedClinician[index + 1].indexOf(value);
    this.alreadySelectedClinician[index + 1].splice(index1, 1);
    this.alreadySelectedClinician[index + 1] = this.removeDuplicate(this.alreadySelectedClinician[index + 1]);
    this.addingExpForm(index);
  }

  notAddingExpressionForm(index): void { //Not Adding Expression for the same Clinician even it is possible
    this.settingValueForNextForm(index);
    this.addingExpForm(index);
  }

  private addingExpForm(index: any) { //Creating a Expression Form
    const control = <FormArray>this.expressionFormGroup.controls['expressionForm'];
    if (this.clinicianRemaining[index + 1].length !== 0) {
      control.push(this.initialization());
    }
    this.isRequiredToAddExpForm[index] = true;
    this.addMoreRequired[index + 1] = false;
    this.isRequiredToAddExpForm[index + 1] = false;
  }

  private settingValueForNextForm(index: any) {
    this.clinicianRemaining[index + 1] = [];
    for (var i = 0; i < this.clinicianData.length; i++) {
      this.checking = false;
      for (var j = 0; j <= index; j++) {
        if (this.expressionFormGroup.value.expressionForm[j].cliniciansDropDown === this.clinicianData[i]) {
          this.checking = true;
          break;
        }
      }
      if (!this.checking) {
        this.clinicianRemaining[index + 1].push(this.clinicianData[i]);
      }
    }
    var index1 = this.clinicianRemaining[index + 1].indexOf(this.selectedPriorClinician);
    this.clinicianRemaining[index + 1].splice(index1, 1);

    this.alreadySelectedClinician[index + 1] = [];
    this.alreadySelectedClinician[index + 1].push(this.selectedPriorClinician);
    for (var j = 0; j <= index; j++) {
      this.alreadySelectedClinician[index + 1].push(this.expressionFormGroup.value.expressionForm[j].cliniciansDropDown);
    }
    this.alreadySelectedClinician[index + 1] = this.removeDuplicate(this.alreadySelectedClinician[index + 1]);
  }

  removingExpression() {
    this.toAddExp = false;
    this.numOfForm = this.expressionFormGroup.value.expressionForm.length - 1;
    for (let i = 0; i < this.model.length; i++) { //Deleting the Assigned Expression from Model
      if (this.model[i].name == (this.expressionFormGroup.value.expressionForm[this.numOfForm].cliniciansDropDown)) {
        if (this.model[i].expressions.length == 2) {
          this.model[i].expressions = [];
          this.itr--;
        }
        else {
          this.model[i].expressions.splice(this.model[i].expressions.length - 1, 1);
        }
      }
    }
    this.expressionFormGroup.controls.expressionForm.value.pop() //Deleting the Last Form
    const control = <FormArray>this.expressionFormGroup.controls.expressionForm;
    control.removeAt(this.numOfForm);
    this.numOfForm = this.numOfForm - 1;
    if (this.numOfForm >= 0) {
      if (this.alreadySelectedClinician[this.numOfForm].length > 1) {
        this.addMoreRequired[this.numOfForm] = true;
        this.isRequiredToAddExpForm[this.numOfForm] = false;
      }
      this.disableToReadData[this.numOfForm] = true;
      if (this.addMoreRequired[this.numOfForm] != true && this.clinicianRemaining[this.numOfForm + 1].length != 0) {
        this.toAddExp = true;
      }
    }
    if (this.numOfForm == -1) {//after Every Expression are deleted  
      for (let i = 0; i < this.model.length; i++) {
        this.model[i].expressions = [];
        this.itr = 0;
      }
      this.clinicianRemaining = [['physician', 'app', 'scribe']]
      this.alreadySelectedClinician = [[]];
      this.priorClinicianDropDown = false;
      this.selectedPriorClinician = "";
      this.isRequiredToDelete = false;
    }
  }
  addingExpression() {
    const control = <FormArray>this.expressionFormGroup.controls['expressionForm'];
    control.push(this.initialization());
    this.numOfForm = this.expressionFormGroup.value.expressionForm.length - 1;
    this.disableToReadData[this.numOfForm] = false;
    this.addMoreRequired[this.numOfForm] = false;
    this.toAddExp = false;
  }
  removeDuplicate(array) {
    return array.filter((a, b) => array.indexOf(a) === b);
  }
  formatChanged(value) {
    this.inputFormat = value;
    this.chooseFile = false;
  }

  handleFileInput(event) {
    this.fileToUpload = event.target.files[0]
    var ext = this.fileToUpload.name.split(".").pop();
    this.chooseFile = true;
    if (ext != "xlsx") {
      this.toastr.error('file format not supported , upload only xlsx files');
      this.fileInput.nativeElement.value = null;
      this.fileToUpload = undefined;
      this.chooseFile = false;
    }
    const target: DataTransfer = <DataTransfer>(event.target);
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.fileData = XLSX.utils.sheet_to_json(ws, { raw: true });
      this.createFileColumnData();
    };
    reader.readAsBinaryString(target.files[0]);
  }

  onSubmit() {
    this.calculateCapacity();
    this.requestBody.shiftLength = this.shiftLength.split(",");
    this.requestBody.lowerLimitFactor = this.upperUtilization;
    this.requestBody.upperLimitFactor = this.utilization;
    this.requestBody.notAllocatedStartTime = this.notAllocatedStartTime;
    this.requestBody.notAllocatedEndTime = this.notAllocatedEndTime;
    this.requestBody.patientHourWait = this.patientHourWait;

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
    for (let i = 0; i < this.model.length; i++) {

      this.model[i].capacity[0] = this.efficiencyModel[i].firstHour;
      this.model[i].capacity[1] = this.efficiencyModel[i].midHour;
      this.model[i].capacity[2] = this.efficiencyModel[i].lastHour;

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
        width: 250,
        editable: false,
        lockPosition: true
      }
    ];

    for (let i = 0; i < 24; i++) {

      this.transposedColumnDef.push({

        headerName: i + "", lockPosition: true,
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

  exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.sampleFileData, 'sample');
  }
  
  createFileColumnData() {
    this.transposedFileColumnDef = [
      {
        headerName: 'Day',
        field: 'Day',
        cellStyle: { 'font-size': 'large' },
        pinned: 'left',
        width: 250,
        editable: false,
        lockPosition: true
      }
    ];

    for (let i = 0; i < 24; i++) {
      this.transposedFileColumnDef.push({
        headerName: i + "", lockPosition: true,
        valueGetter: function (params) {
          return params.data[i];
        },
        width: 60
      })
    }
  }
}
