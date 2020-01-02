import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'autorun',
  templateUrl: './autorun.component.html',
  styleUrls: ['./autorun.component.css']
})

export class AutorunComponent implements OnInit {
  ngOnInit(): void {
   
  }


  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  ftpUrl: string;
  cronExpression: string;
  resultFormat: string;

  onSubmit() {
    console.log(this.ftpUrl, this.cronExpression, this.resultFormat);
  }

}
