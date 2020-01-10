import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { response, Model } from "../Models/app.types"

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(private http: HttpClient) { }

  getGraphDetailsUsingTableData(requestBody) {
    const apiLink = 'http://localhost:8086/Staffing/api/request/shiftPlan';
    return this.http.post(apiLink, requestBody);
  }

  getGraphDetailsUsingFileData(requestBody) {
    const apiLink = 'http://localhost:8086/Staffing/api/request/shiftPlanFileUpload';
    return this.http.post(apiLink, requestBody);
  }

  getJobDetails() {
    const apiLink = 'http://localhost:8086/Staffing/api/jobDetails/all';
    return this.http.get(apiLink);
  }

  saveJobDetails(requestBody) {
    const apiLink = 'http://localhost:8086/Staffing/api/jobDetails/add';
    // console.log(requestBody);
    return this.http.post(apiLink, requestBody);
  }

  
}