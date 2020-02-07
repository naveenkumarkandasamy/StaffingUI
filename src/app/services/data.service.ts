import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {response} from '../Models/app.types'

@Injectable()
export class DataService {

 private requestBody : any = null;
  private apiData = new BehaviorSubject<response>(null);
//  public requestBody = this.requestBody.asObservable();
public apiData$ = this.apiData.asObservable();


  private jobDetailsToEditObject = new BehaviorSubject(this.requestBody);
  jobDetailsToEdit = this.jobDetailsToEditObject.asObservable();

  constructor() { }

  getJobDetailsToEdit(){
    return this.jobDetailsToEdit;
  }

  setJobDetailsToEdit(requestBody){
    this.jobDetailsToEdit = requestBody;
  }

  setRequestBody(data){
    this.requestBody = data;
  }

  getRequestBody(){
    return this.requestBody;
  }

  setData(data) { 
    this.apiData.next(data)
  }
}