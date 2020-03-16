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
  formGroup: FormGroup;
  clinicianData = [];
  isaddbutton: boolean = false;
  initiallySelected: String;
  clinicianDataRemaining = [][10];
  operator = [];
  previousSelectedData = [][10];
  addMoreRequired = [];
  selected: boolean = false;
  checking: boolean = false;
  checkedOk = [];
  checkedButton = [];
  expression: String;

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
    this.clinicianDataRemaining = [['physician', 'app', 'scribe']]
    this.previousSelectedData = [[]];
    this.operator = ['*'];
    this.formGroup = this.fb.group({
      form: this.fb.array([
        this.initialization()
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
      selectedDataDropDown: this.fb.control(''),
      trackingId: this.generateUniqueId()
    });
  }

  generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  onSelect(value) {
    let index = value.options.selectedIndex - 1;
    this.clinicianDataRemaining[0].splice(index, 1);
    this.previousSelectedData[0].push(value.value);
    this.checkedOk[0] = false;
    this.initiallySelected = value.value;
    this.selected = true;
    this.firstDropDown = true;
  }
  onOK(index) {
    let value = this.formGroup.value.form[index].cliniciansDropDown;
    let clinician = this.formGroup.value.form[index].selectedDataDropDown;

    if (value !== '' && this.formGroup.value.form[index].numberOfClinician !== '' && this.formGroup.value.form[index].operatorChosen !== '' && clinician !== '') {
      this.checkedOk[index] = true;
      this.checkedOk[index + 1] = false;
      this.expression = this.formGroup.value.form[index].numberOfClinician + " " + this.formGroup.value.form[index].operatorChosen + " " + clinician;
      if (value == 'physician') {
        var iterator = this.clinicianData.indexOf(value);
        this.model[iterator].expressions.push(this.expression);
      }
      if (value == 'app') {
        var iterator = this.clinicianData.indexOf(value);
        this.model[iterator].expressions.push(this.expression);
      }
      if (value == 'scribe') {
        var iterator = this.clinicianData.indexOf(value);
        this.model[iterator].expressions.push(this.expression);
      }
      if (this.previousSelectedData[index].length <= 1) {
        this.removingPreviousOne(index, value);

        this.previousSelectedData[index + 1] = this.previousSelectedData[index].slice();
        this.previousSelectedData[index + 1].push(value);

        if (this.clinicianDataRemaining[index + 1].length === 0) {
          for (var i = 0; i < this.clinicianData.length; i++) {
            this.checking = false;
            for (var j = 0; j <= index; j++) {
              if (this.formGroup.value.form[j].cliniciansDropDown === this.clinicianData[i]) {
                this.checking = true;
                break;
              }
            }
            if (!this.checking) {
              this.clinicianDataRemaining[index + 1].push(this.clinicianData[i]);
            }
          }

          this.clinicianDataRemaining[index + 1].splice(this.clinicianDataRemaining[index + 1].find(x => x == this.initiallySelected), 1);
          this.previousSelectedData[index + 1].push(this.initiallySelected);
        }
        if (this.clinicianDataRemaining[index + 1].length !== 0 && this.previousSelectedData[index].length <= 1) {
          this.previousSelectedData[index + 1] = [];
          this.previousSelectedData[index + 1].push(this.initiallySelected);
          for (var j = 0; j <= index; j++) {
            this.previousSelectedData[index + 1].push(this.formGroup.value.form[j].cliniciansDropDown);
          }
          this.previousSelectedData[index + 1] = this.removeDuplicate(this.previousSelectedData[index + 1]);
        }
        this.addMoreRequired[index] = false;

      } else {
        this.previousSelectedData[index + 1] = this.previousSelectedData[index].slice();
        var index1 = this.previousSelectedData[index + 1].indexOf(clinician);
        this.previousSelectedData[index + 1].splice(index1, 1);
        this.addMoreRequired[index] = true;
      }
      this.previousSelectedData[index + 1] = this.removeDuplicate(this.previousSelectedData[index + 1]);

      const control = <FormArray>this.formGroup.controls['form'];
      if (!this.addMoreRequired[index] && this.clinicianDataRemaining[index + 1].length !== 0) {
        control.push(this.initialization());
      }

    }
  }

  private removingPreviousOne(index: any, value: any) {
    this.clinicianDataRemaining[index + 1] = this.clinicianDataRemaining[index].slice();
    var index1 = this.clinicianDataRemaining[index + 1].indexOf(value);
    this.clinicianDataRemaining[index + 1].splice(index1, 1);

  }

  addButton(index): void {
    let index1 = this.formGroup.value.form.length - 1;
    this.addMoreRequired[index] = true;
    this.clinicianDataRemaining[index + 1] = [];
    this.clinicianDataRemaining[index + 1].push(this.formGroup.value.form[index1].cliniciansDropDown);
    this.previousSelectedData[index + 1] = this.removeDuplicate(this.previousSelectedData[index + 1]);
    this.addingForm(index);
  }

  noButton(index): void {
    let value = this.formGroup.value.form[index].cliniciansDropDown;
    this.removingPreviousOne(index, value);
    this.previousSelectedData[index + 1] = [];
    this.previousSelectedData[index + 1].push(this.initiallySelected);
    for (var j = 0; j <= index; j++) {
      this.previousSelectedData[index + 1].push(this.formGroup.value.form[j].cliniciansDropDown);
    }
    this.previousSelectedData[index + 1] = this.removeDuplicate(this.previousSelectedData[index + 1]);
    this.addingForm(index);
  }

  private addingForm(index: any) {
    const control = <FormArray>this.formGroup.controls['form'];
    if (this.clinicianDataRemaining[index + 1].length !== 0) {
      control.push(this.initialization());
    }
    this.checkedButton[index] = true;
    this.checkedButton[index + 1] = false;
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
