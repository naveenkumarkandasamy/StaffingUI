import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {response} from '../Models/app.types'

@Injectable()
export class DataService {

 private requestBody : any = null;
  private apiData = new BehaviorSubject<response>(null);
//  public requestBody$ = this.requestBody.asObservable();
public apiData$ = this.apiData.asObservable();
  private messageSource = new BehaviorSubject('default message');
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  setRequestBody(data){
    console.log("hi")
    this.requestBody = data;
  }

  getRequestBody(){
    return this.requestBody;
  }

  setData(data) { 
    this.apiData.next(data)
  }
}