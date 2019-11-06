import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {response} from '../Models/app.types'

@Injectable()
export class DataService {

  private apiData = new BehaviorSubject<response>(null);
public apiData$ = this.apiData.asObservable();
  private messageSource = new BehaviorSubject('default message');
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }


  setData(data) { 
    this.apiData.next(data)
  }
}