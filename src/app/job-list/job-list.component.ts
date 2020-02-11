import { Component, OnInit, ViewChild } from '@angular/core';
import { ConstantsService } from './../services/constants.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClientService } from './../services/http-client.service';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {

  jobListData: any;

  displayedColumns: string[] = ['name', 'shiftLengthPreferences', 'lowerUtilizationFactor', 'upperUtilizationFactor', 'scheduleDateTime', 'deleteButton', 'editButton'];
  dataSource: any;
  responseBody: any = {"message":""};

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private toastr: ToastrService, private constantsService: ConstantsService, private httpClientService: HttpClientService,
    private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.getJobListData();
  }

  getJobListData() {

    this.httpClientService.getJobDetails().subscribe(data => {
      this.jobListData = data;
      
      this.dataSource = new MatTableDataSource(this.jobListData);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      this.dataSource.filterPredicate = function (data: any, filter: string): boolean {
        return data.name.toLowerCase().includes(filter);
      };

    });

  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  redirect(pagename: string, requestBody) {
    this.router.navigate(['/'+pagename]);
    this.dataService.setJobDetailsToEdit(requestBody);
  }

  deleteJob(jobId: String){

    this.httpClientService.deleteJobDetails(jobId).subscribe(data => { 
      this.responseBody = data;
      this.toastr.success(this.responseBody.message);
      // this.toastr.success(data.toString()) 
    }, error => {
      this.toastr.error(error.message);
    });
    this.getJobListData();
  }
  
}
