import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { response, Model } from "../Models/app.types"

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(private http: HttpClient) { }

  getGraphDetailsUsingTableData(requestBody) {
    const apiLink = 'http://localhost:8086/Staffing/api/shiftPlan';
    return this.http.post<response>(apiLink, requestBody);
  }

  getGraphDetailsUsingFileData(requestBody) {
    const apiLink = 'http://localhost:8086/Staffing/api/shiftPlanFileUpload';
    return this.http.post<response>(apiLink, requestBody);
  }
}
