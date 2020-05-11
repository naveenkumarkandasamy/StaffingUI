import { Component,Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-job-list-popup',
  templateUrl: './job-list-popup.component.html',
  styleUrls: ['./job-list-popup.component.css']
})
export class JobListPopupComponent implements OnInit {

  public jobDetails : any;
  displayedColumns = ['item', 'value'];
  public dataSource;
  private gridApi;
  private gridColumnApi;
  clinicianModel =[
   {"name": "physician"},
   {"name": "app"},
   {"name": "scribe"}
  ];
  inputFTPDetailsColumnDefs = [
    {field: 'Item'},
    {field: 'Value'}
  ];

  outputFTPDetailsColumnDefs = [
    {field: 'Item'},
    {field: 'Value'}
  ];

  cliniciansColumnDefs = [
    {field : 'Role',lockPosition: true },
    {field : 'Patient Per Hr',lockPosition: true },
    {field : 'Cost',lockPosition: true }
  ];

  cliniciansEfficiencyColumnDefs = [
    {field : 'Role',lockPosition: true },
    {field : 'First Hour',lockPosition: true },
    {field : 'Mid Hour',lockPosition: true },
    {field : 'Last Hour',lockPosition: true }
  ];

  cliniciansRelationshipColumnDefs = [
    {field : 'Role',lockPosition: true },
    {field : 'Expression',lockPosition: true },
  ];

  inputFTPDetailsRowData = [];
  outputFTPDetailsRowData = [];
  cliniciansRowData = [];
  cliniciansEfficiencyRowData = [];
  cliniciansRelationshipRowData = [];

  constructor(private dialogRef: MatDialogRef<JobListPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.jobDetails = data.job_details;
   }

  ngOnInit() {
    this.createTableData();
  }

  createTableData()
  {
    this.createExpressions(this.jobDetails.clinicians)
    this.createCliniciansData(this.jobDetails.clinicians);
    this.createClinicianEfficieny(this.jobDetails.clinicians);
    this.createInputFTPDetails(this.jobDetails.inputFtpDetails);
    this.createOutputFTPDetails(this.jobDetails.outputFtpDetails);

    this.dataSource = [
      {
        item:'Name',
        value: this.jobDetails.name
      },
      {
        item:'Shift Length Preferences',
        value: this.jobDetails.shiftLengthPreferences
      },
      {
        item:'Lower Utilization Factor',
        value: this.jobDetails.lowerUtilizationFactor
      },
      {
        item:'Upper Utilization Factor',
        value: this.jobDetails.upperUtilizationFactor
      },
      {
        item:'Restricted Start Time',
        value: this.jobDetails.notAllocatedStartTime
      },
      {
        item:'Restricted End Time',
        value: this.jobDetails.notAllocatedEndTime
      },
      {
        item:'Patient Hour Wait',
        value: this.jobDetails.patientHourWait
      },
      {
        item:'Clinician Relationship',
        value: this.cliniciansRelationshipRowData
      },
      {
        item:'Clinician Summary',
        value: this.cliniciansRowData
      },
      {
        item:'Clinician Efficiency',
        value: this.cliniciansEfficiencyRowData
      },
      {
        item:'Input Format',
        value: this.jobDetails.inputFormat
      },
      {
        item:((this.jobDetails.inputFormat === 'DATA_FILE') ? 'Input File Details' : 'Input FTP Details'),
        value: ((this.jobDetails.inputFormat === 'DATA_FILE') ? this.jobDetails.inputFileDetails.fileExtension : this.inputFTPDetailsRowData)
      },
      {
        item:'Output Format',
        value: this.jobDetails.outputFormat
      },
      {
        item:((this.jobDetails.outputFormat === 'EMAIL') ? 'Output Email ID' : 'Output FTP Details'),
        value: ((this.jobDetails.outputFormat === 'EMAIL') ? this.jobDetails.outputEmailId : this.outputFTPDetailsRowData)
      },
      {
        item:'Cron Expression',
        value: this.jobDetails.cronExpression
      },
      {
        item:'Status',
        value: this.jobDetails.status
      }
    ];
  }
  createExpressions(data: any) {
    for (let i=0; i < this.clinicianModel.length; i++){
    for (let index = 0; index < data.length; index++) {
      if(this.clinicianModel[i].name==data[index].name){
      this.cliniciansRelationshipRowData.push({ Role: data[index].name, Expression : data[index].expressions});
      }
    }
    }
  }
  
  createClinicianEfficieny(data: any) {
    for (let i=0; i < this.clinicianModel.length; i++){
    for (let index = 0; index < data.length; index++) {
      if(this.clinicianModel[i].name==data[index].name){
      this.cliniciansEfficiencyRowData.push({ Role: data[index].name, 'First Hour' : data[index].capacity[0], 'Mid Hour' : data[index].capacity[1], 'Last Hour' : data[index].capacity[2]});
      }
    }
    }  
  }

  createCliniciansData(data : any) {
    for (let i=0; i < this.clinicianModel.length; i++){
    for (let index = 0; index < data.length; index++) {
      if(this.clinicianModel[i].name==data[index].name){
      this.cliniciansRowData.push({ Role: data[index].name, 'Patient Per Hr' : data[index].patientsPerHour, Cost: data[index].cost});
      }
    }
    }  
  }

  createInputFTPDetails(data : any) { 
    if(data) {
      this.inputFTPDetailsRowData = [
        {
          Item: 'FTP URL',
          Value: data.fileUrl
        },
        {
          Item: 'Username',
          Value: data.username
        },
        {
          Item: 'Password',
          Value: data.password
        }
      ];
    }
  }

  createOutputFTPDetails(data : any) { 
    if(data) {
      this.outputFTPDetailsRowData = [
        {
          Item: 'FTP URL',
          Value: data.fileUrl
        },
        {
          Item: 'Username',
          Value: data.username
        },
        {
          Item: 'Password',
          Value: data.password
        }
      ];
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function() {
      setTimeout(function() {
        params.api.sizeColumnsToFit();
      });
    });
  }
}
