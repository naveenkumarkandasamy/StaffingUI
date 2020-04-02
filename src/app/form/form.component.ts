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
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
@Component({
  selector: 'mainForm',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class MainFormComponent implements OnInit {

  firstDropDown: boolean = false;
  expressionFormGroup: FormGroup;
  clinicianData = [];
  selectedExp: any;
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
  num: any;
  itr: any;

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
  upperUtilization = "";
  notAllocatedStartTime = 1;
  notAllocatedEndTime = 6;
  patientHourWait = "";
  model: Model[] = this.constantsService.model;
  isRequiredToDelete: boolean;
  toAddExp: boolean;
  requestBody: any = {
    "shiftLength": [12, 8, 10, 4],
    "lowerLimitFactor": 0.85, // *** ADD UPPER LIMIT
    "upperLimitFactor": 1.10,
    "patientHourWait": 2,
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

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient,
    private dataService: DataService, private toastr: ToastrService, private constantsService: ConstantsService, private httpClientService: HttpClientService) { }

  ngOnInit() {

    this.dataService.apiData$.subscribe(apiData => this.apiData = apiData);
    this.createColumnData();
    this.clinicianData = ['physician', 'app', 'scribe']
    for (var i = 0; i < this.model.length; i++) {
      this.model[i].expressions = [];
    }

    this.clinicianRemaining = [['physician', 'app', 'scribe']]
    this.alreadySelectedClinician = [[]];
    this.operator = ['*'];
    this.expressionFormGroup = this.fb.group({
      expressionForm: this.fb.array([

      ])
    });
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

    this.clinicianRemaining[0] = this.clinicianData.slice(0);
    var index1 = this.clinicianRemaining[0].indexOf(value);
    this.clinicianRemaining[0].splice(index1, 1);
    this.alreadySelectedClinician[0] = [];
    this.alreadySelectedClinician[0].push(value);
    this.selected = true;
    this.firstDropDown = true;
    this.itr = 0;
    this.num = this.clinicianData.length;
    this.isRead[0] = false;
    this.num = this.num * (this.num + 1) / 2;
    for (let i = 0; i < this.num; i++) {
      this.isRequiredToAddExpForm[i] = true;
      this.addMoreRequired[i] = false;
    }
    for (let i = 0; i < this.model.length; i++) {
      this.model[i].expressions = [];
    }
    for (let i = 0; i < this.model.length; i++) {
      if (this.model[i].name == value) {
        this.model[i].expressions.push(this.itr);
      }
    }
    this.isRequiredToDelete = true;
    if (this.expressionFormGroup.value.expressionForm.length - 1 == -1) {
      const control = <FormArray>this.expressionFormGroup.controls['expressionForm'];
      control.push(this.initialization());

    }
  }
  readingData(index) {
    let clinician = this.expressionFormGroup.value.expressionForm[index].cliniciansDropDown;
    let selectedClinician = this.expressionFormGroup.value.expressionForm[index].selectedClinicianDropDown;
    if (clinician !== '' && this.expressionFormGroup.value.expressionForm[index].numberOfClinician !== '' && this.expressionFormGroup.value.expressionForm[index].operatorChosen !== '' && selectedClinician !== '') {
      for (let i = 0; i < this.model.length; i++) {
        if (this.model[i].name == clinician) {
          if (this.model[i].expressions.length == 0) {
            this.itr++;
            this.model[i].expressions.push(this.itr);

          }
          this.model[i].expressions.push(this.expressionFormGroup.value.expressionForm[index].numberOfClinician + " " + this.expressionFormGroup.value.expressionForm[index].operatorChosen + " " + selectedClinician);
        }
      }
      this.isRead[index] = true;
      this.isRead[index + 1] = false;

      this.settingValueForNextForm(index);
      if (this.alreadySelectedClinician[index].length == 1) {
        this.addMoreRequired[index] = false;
      }
      else {
        this.addMoreRequired[index] = true;
        this.isRequiredToAddExpForm[index] = false;
      }
      const control = <FormArray>this.expressionFormGroup.controls['expressionForm'];
      if (!this.addMoreRequired[index] && this.clinicianRemaining[index + 1].length !== 0) {
        control.push(this.initialization());
        this.addMoreRequired[index + 1] = false;
      }
    }
  }

  addingExpressionForm(index): void {
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

  notAddingExpressionForm(index): void {
    this.settingValueForNextForm(index);
    this.addingExpForm(index);
  }

  private addingExpForm(index: any) {
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
    var index1 = this.clinicianRemaining[index + 1].indexOf(this.selectedExp);
    this.clinicianRemaining[index + 1].splice(index1, 1);

    this.alreadySelectedClinician[index + 1] = [];
    this.alreadySelectedClinician[index + 1].push(this.selectedExp);
    for (var j = 0; j <= index; j++) {
      this.alreadySelectedClinician[index + 1].push(this.expressionFormGroup.value.expressionForm[j].cliniciansDropDown);
    }
    this.alreadySelectedClinician[index + 1] = this.removeDuplicate(this.alreadySelectedClinician[index + 1]);
  }

  removingExpression() {
    this.toAddExp = false;
    this.num = this.expressionFormGroup.value.expressionForm.length - 1;
    for (let i = 0; i < this.model.length; i++) {
      if (this.model[i].name == (this.expressionFormGroup.value.expressionForm[this.num].cliniciansDropDown)) {
        if (this.model[i].expressions.length == 2) {
          this.model[i].expressions = [];
          this.itr--;
        }
        else {
          this.model[i].expressions.splice(this.model[i].expressions.length - 1, 1);
        }
      }
    }
    this.expressionFormGroup.controls.expressionForm.value.pop()
    const control = <FormArray>this.expressionFormGroup.controls.expressionForm;
    control.removeAt(this.num);
    this.num = this.num - 1;
    if (this.num >= 0) {
      if (this.alreadySelectedClinician[this.num].length > 1) {
        this.addMoreRequired[this.num] = true;
        this.isRequiredToAddExpForm[this.num] = false;
      }
      this.isRead[this.num] = true;
      if (this.addMoreRequired[this.num] != true && this.clinicianRemaining[this.num + 1].length != 0) {
        this.toAddExp = true;
      }
    }
    if (this.num == -1) {
      for (let i = 0; i < this.model.length; i++) {
        this.model[i].expressions = [];
        this.itr = 0;
      }
      this.clinicianRemaining = [['physician', 'app', 'scribe']]
      this.alreadySelectedClinician = [[]];
      this.firstDropDown = false;
      this.selectedExp = "";
      this.isRequiredToDelete = false;
    }
  }
  addingExpression() {
    const control = <FormArray>this.expressionFormGroup.controls['expressionForm'];
    control.push(this.initialization());
    this.num = this.expressionFormGroup.value.expressionForm.length - 1;
    this.isRead[this.num] = false;
    this.addMoreRequired[this.num] = false;
    this.toAddExp = false;
  }
  removeDuplicate(array) {
    return array.filter((a, b) => array.indexOf(a) === b);
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
    this.requestBody.notAllocatedStartTime = this.notAllocatedStartTime;
    this.requestBody.notAllocatedEndTime = this.notAllocatedEndTime;
    this.requestBody.patientHourWait = this.patientHourWait != "" ? this.patientHourWait : this.requestBody.patientHourWait;
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
