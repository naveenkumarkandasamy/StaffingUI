import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ConstantsService } from './../services/constants.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClientService } from './../services/http-client.service';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { JobListPopupComponent } from './job-list-popup/job-list-popup.component';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {

  jobListData: any;
  scheduledJobListData: any = [];
  draftJobListData: any = [];
  private idColumn = 'id';
  private dsData: any;
  isScheduled: string = "scheduled";

  displayedColumnsScheduled: string[] = ['name', 'userId', 'cronExpression','infoButton', 'deleteButton', 'editButton'];
  displayedColumnsDrafts: string[] = ['name', 'userId','infoButton', 'deleteButton', 'editButton'];
  dataSource: any;
  responseBody: any = {"message":""};

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private toastr: ToastrService, private constantsService: ConstantsService, private httpClientService: HttpClientService,
    private router: Router, private dataService: DataService, private dialog: MatDialog) { }

  ngOnInit() {
    this.getJobListData();
  }

  getJobListData() {

    this.httpClientService.getJobDetails().subscribe(data => {
      this.jobListData = data;
      this.getSegregatedData();
      this.dataSource = new MatTableDataSource();
      this.dataSource.data = ((this.isScheduled === 'scheduled') ? this.scheduledJobListData : this.draftJobListData);
      this.dataSource.sort = this.sort;
      setTimeout(() => this.dataSource.paginator = this.paginator);
      this.dataSource.filterPredicate = function (data: any, filter: string): boolean {
        return data.name.toLowerCase().includes(filter);
      };

    });

  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  redirect(pagename: string, requestBody: any, elementid: string) {
    this.router.navigate(['/'+pagename+'/'+elementid]);
    this.dataService.setJobDetailsToEdit(requestBody);
  }

  deleteJob(jobId: String){
    this.httpClientService.deleteJobDetails(jobId).subscribe(data => { 
      this.responseBody = data;
      this.toastr.success(this.responseBody.message);
      this.dsData = this.dataSource.data;
      const itemIndex = this.dsData.findIndex(obj => obj[this.idColumn] === jobId);
      this.dataSource.data.splice(itemIndex, 1);
      this.dataSource.paginator = this.paginator;
    }, error => {
      this.toastr.error(error.message);
    });
    this.getJobListData();
  }

  jobListPopup(element: any) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = { title: 'Job List Info', job_details : element };
    this.dialog.open(JobListPopupComponent, dialogConfig).afterClosed()
      .subscribe(data => {
         
      });
  }

  getSegregatedData()
  {
    this.scheduledJobListData = [];
    this.draftJobListData = [];
    for (let index = 0; index < this.jobListData.length; index++) {
      if(this.jobListData[index].status === 'SCHEDULED')
      {
        this.scheduledJobListData.push(this.jobListData[index]);
      }else {
        this.draftJobListData.push(this.jobListData[index]);
      }
    }
  }
  
  onJobTypeChange(type: any) {
    if(type.value === 'scheduled') 
    {
      this.dataSource.data = this.scheduledJobListData;
    } else {
      this.dataSource.data = this.draftJobListData;
    }
    this.dataSource.sort = this.sort;
    setTimeout(() => this.dataSource.paginator = this.paginator);
  }
  
}
