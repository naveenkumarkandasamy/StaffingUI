import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {response} from '../Models/app.types';
import { Model, Efficiency } from "../Models/app.types";
import { ConstantsService } from "../services/constants.service";
@Injectable()
export class DataService {
 private expData: Model[] = this.constantsService.model;
 private requestBody : any = null;
 private apiData = new BehaviorSubject<response>(null);
//  public requestBody = this.requestBody.asObservable();
public apiData$ = this.apiData.asObservable();


  private jobDetailsToEditObject = new BehaviorSubject(this.requestBody);
  jobDetailsToEdit = this.jobDetailsToEditObject.asObservable();
  
  constructor(private constantsService: ConstantsService) { }

  getJobDetailsToEdit(){
    return this.jobDetailsToEdit;
  }

  setJobDetailsToEdit(requestBody){
    this.jobDetailsToEdit = requestBody;
  }

  setRequestBody(data){
    this.requestBody = data;
  }
  setExpData(data){
    this.expData=data;
    this.expData[0].expressions=data[0].expressions;
    this.expData[1].expressions=data[1].expressions;
    this.expData[2].expressions=data[2].expressions;
  }
  getExpData(){
    return this.expData;
  }

  getRequestBody(){
    return this.requestBody;
  }

  setData(data) { 
    this.apiData.next(data)
  }
}