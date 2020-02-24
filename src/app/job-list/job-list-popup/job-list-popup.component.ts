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
  
  inputFTPDetailsColumnDefs = [
    {field: 'Item'},
    {field: 'Value'}
  ];

  outputFTPDetailsColumnDefs = [
    {field: 'Item'},
    {field: 'Value'}
  ];

  cliniciansColumnDefs = [
    {field : 'Role'},
    {field : 'Capacity Per Hr'},
    {field : 'Cost'}
  ];

  inputFTPDetailsRowData = [];
  outputFTPDetailsRowData = [];
  cliniciansRowData = [];

  constructor(private dialogRef: MatDialogRef<JobListPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.jobDetails = data.job_details;
   }

  ngOnInit() {
    this.createTableData();
  }

  createTableData()
  {
    this.createCliniciansData(this.jobDetails.clinicians);
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
        item:'Clinicians',
        value: this.jobDetails.clinicians 
      },
      {
        item:'Cron Expression',
        value: this.jobDetails.cronExpression
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
        item:'Output Email ID',
        value: this.jobDetails.outputEmailId
      },
      {
        item:'Status',
        value: this.jobDetails.status
      }
    ];
    
    if(this.jobDetails.outputFormat !== 'EMAIL') {
      this.dataSource.splice(
        9,
        0,
        {
          item: 'Output FTP Details',
          value: this.outputFTPDetailsRowData
        });
    }
  }

  createCliniciansData(data : any) {
    for (let index = 0; index < data.length; index++) {
      this.cliniciansRowData.push({ Role: data[index].name, 'Capacity Per Hr' : data[index].name, Cost: data[index].cost});
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
