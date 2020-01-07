import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ConstantsService } from "../services/constants.service";
import { ToastrService } from 'ngx-toastr';
import { Model } from '../Models/app.types';

@Component({
  selector: 'autorun',
  templateUrl: './autorun.component.html',
  styleUrls: ['./autorun.component.css']
})

export class AutorunComponent implements OnInit {
  
  constructor(private constantsService: ConstantsService) { }

  ngOnInit(): void {
    this.initialize()
  }


  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  inputFtpUrl: string;
  inputFtpUsername: string;
  inputFtpPassword: string;
  outputFtpUrl: string;
  outputFtpUsername: string;
  outputFtpPassword: string;
  cronExpression: string;
   
  inputTypes: Array<string> = ["FTP URL", "File Upload"];
  inputFormat: string
  outputTypes: Array<string> = ["FTP URL", "Excel"];
  outputFormat: string

  model: Model[]
  columnDefs:any

  defaultColDef = {
    editable: true,
    resizable: true
  }


  initialize(){
    this.inputFtpUrl = null;
    this.inputFtpUsername = null;
    this.inputFtpPassword = null;
    this.outputFtpUrl = null;
    this.outputFtpUsername = null;
    this.outputFtpPassword = null;
    this.cronExpression = null;
    this.inputFormat = "";
    this.outputFormat = "";

    this.model = [
      {
        "patientsPerHour": 1.2,
        "capacity": [1.0, 0.83, 0.67],
        "cost": 200,
        "name": "physician",
        "expressions": []
      },
      {
        "patientsPerHour": 0.6,
        "capacity": [0.6, 0.5, 0.4],
        "cost": 65,
        "name": "app",
        "expressions": []
      },
      {
        "patientsPerHour": 0.37,
        "capacity": [0.15, 0.12, 0.1],
        "cost": 20,
        "name": "scribe",
        "expressions": []
      }];
      
    this.columnDefs = [
      { headerName: 'Role', field: 'name', editable: true },
      {
        headerName: 'Patients Per Hr', valueGetter: function (params) {
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
        headerName: 'Price',
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

  onReset(){
    this.initialize();
  }

  onSubmit() {
    console.log(this.inputFtpUrl, this.inputFtpUsername, this.inputFtpPassword);
  }


  inputformatChanged(value) {
    this.inputFormat = value;
  }

  
  outputformatChanged(value) {
    this.outputFormat = value;
  }





}
