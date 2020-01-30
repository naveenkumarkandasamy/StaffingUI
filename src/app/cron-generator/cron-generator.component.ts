import { Component, OnInit, ViewChild, SimpleChanges, Inject } from '@angular/core';
import { CronOptions } from 'ngx-cron-editor';
import { CronGenComponent } from 'ngx-cron-editor';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../autorun/autorun.component';


@Component({
  selector: 'app-cron-generator',
  templateUrl: './cron-generator.component.html',
  styleUrls: ['./cron-generator.component.css']
})
export class CronGeneratorComponent implements OnInit {

  public cronExpression = '0 0 1/1 * *';
  public isCronDisabled = false;
  public cronOptions: CronOptions = {
    formInputClass: 'form-control cron-editor-input',
    formSelectClass: 'form-control cron-editor-select',
    formRadioClass: 'cron-editor-radio',
    formCheckboxClass: 'cron-editor-checkbox',

    defaultTime: '00:00:00',

    hideMinutesTab: false,
    hideHourlyTab: false,
    hideDailyTab: false,
    hideWeeklyTab: false,
    hideMonthlyTab: false,
    hideYearlyTab: false,
    hideAdvancedTab: true,
    hideSpecificWeekDayTab: false,
    hideSpecificMonthWeekTab: false,

    use24HourTime: true,
    hideSeconds: false,

    cronFlavor: 'standard'
  };

  @ViewChild('cronEditorDemo', { static: false })
  cronEditorDemo: CronGenComponent;

  cronForm: FormControl;

  constructor(public dialogRef: MatDialogRef<CronGeneratorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.cronForm = new FormControl('0 0 1/1 * *');
  }

  cronFlavorChange() {
    this.cronEditorDemo.options = this.cronOptions;
  }

}
