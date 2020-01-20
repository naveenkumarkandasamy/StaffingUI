import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { response, Model } from "../Models/app.types"
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  private apiUrl:string="";
  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
   }

  getGraphDetailsUsingTableData(requestBody) {
    console.log(environment.environment)
    const apiLink = this.apiUrl+'/Staffing/api/request/shiftPlan';
    return this.http.post<response>(apiLink, requestBody);
  }

  getGraphDetailsUsingFileData(requestBody) {
    const apiLink = this.apiUrl+'/Staffing/api/request/shiftPlanFileUpload';
    return this.http.post<response>(apiLink, requestBody);
  }

  getJobDetailsData() {
    const apiLink = this.apiUrl + '/Staffing/api/jobDetails/all';
    return this.http.get(apiLink);
  }

  getJobDetails() {
    const apiLink = this.apiUrl+'/Staffing/api/jobDetails/all';
    return this.http.get(apiLink);
  }

  saveJobDetails(requestBody) {
    const apiLink = this.apiUrl+'/Staffing/api/jobDetails/add';
    // console.log(requestBody);
    return this.http.post(apiLink, requestBody);
  }

  
}