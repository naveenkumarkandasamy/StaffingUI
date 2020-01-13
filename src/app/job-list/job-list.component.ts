import { Component, OnInit, ViewChild } from '@angular/core';
import { ConstantsService } from './../services/constants.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClientService } from './../services/http-client.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {

  jobListData: any

  displayedColumns: string[] = ['name', 'shiftLengthPreferences', 'lowerUtilizationFactor', 'upperUtilizationFactor', 'scheduleDateTime', 'customColumn1'];
  dataSource: any;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private constantsService: ConstantsService, private httpClientService: HttpClientService) { }

  ngOnInit() {

    this.httpClientService.getJobDetailsData().subscribe(data => {
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

}
