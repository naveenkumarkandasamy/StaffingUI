import { Injectable } from '@angular/core';
import { Model, Efficiency } from '../Models/app.types';


@Injectable()
export class ConstantsService {
   readonly baseAppUrl: string = 'http://localhost:3000/';
   readonly distLocation: string = 'MyApplication/';
   readonly data: any = [
      {
         "name": "Monday",
         "expectedPatientsPerHour": [
            2.59,
            2.58,
            2.09,
            2.09,
            1.45,
            0.75,
            2.24,
            3.68,
            3.86,
            3.78,
            4.94,
            5.64,
            4.29,
            4.5,
            6.23,
            5.68,
            4.75,
            4.3,
            4.44,
            3.92,
            4.12,
            4.11,
            3.99,
            3.61
         ]
      },
      {
         "name": "Tuesday",
         "expectedPatientsPerHour": [
            3.85,
            2.9,
            2.34,
            2.34,
            1.62,
            0.85,
            2.51,
            4.13,
            4.34,
            4.26,
            5.55,
            6.33,
            4.82,
            5.06,
            6.99,
            6.39,
            5.33,
            4.83,
            4.99,
            4.4,
            4.63,
            4.61,
            4.48,
            4.05
         ]
      },
      {
         "name": "Wednesday",
         "expectedPatientsPerHour": [
            4.45,
            3.4,
            2.75,
            2.75,
            1.9,
            1,
            2.94,
            4.84,
            5.08,
            4.98,
            6.51,
            7.41,
            5.64,
            5.92,
            8.18,
            7.47,
            6.24,
            5.66,
            5.84,
            5.15,
            5.42,
            5.41,
            5.25,
            4.75
         ]
      },
      {
         "name": "Thursday",
         "expectedPatientsPerHour": [
            4.26,
            2.97,
            2.4,
            2.4,
            1.67,
            0.87,
            2.57,
            4.24,
            4.44,
            4.36,
            5.69,
            6.49,
            4.93,
            5.19,
            7.16,
            6.54,
            5.46,
            4.96,
            5.1,
            4.51,
            4.74,
            4.73,
            4.59,
            4.15
         ]
      },
      {
         "name": "Friday",
         "expectedPatientsPerHour": [
            4.05,
            2.93,
            2.37,
            2.37,
            1.64,
            0.86,
            2.54,
            4.18,
            4.39,
            4.31,
            5.62,
            6.41,
            4.88,
            5.12,
            7.07,
            6.47,
            5.4,
            4.89,
            5.04,
            4.45,
            4.68,
            4.67,
            4.53,
            4.09
         ]
      },
      {
         "name": "Saturday",
         "expectedPatientsPerHour": [
            2.9,
            1.74,
            1.41,
            1.41,
            0.98,
            0.51,
            1.5,
            2.47,
            2.59,
            2.54,
            3.32,
            3.78,
            2.88,
            3.03,
            4.18,
            3.81,
            3.19,
            2.88,
            2.98,
            2.63,
            2.77,
            2.76,
            2.68,
            2.42
         ]
      },
      {
         "name": "Sunday",
         "expectedPatientsPerHour": [
            1.08,
            0.35,
            0.28,
            0.28,
            0.2,
            0.1,
            0.31,
            0.51,
            0.53,
            0.52,
            0.68,
            0.78,
            0.58,
            0.62,
            0.85,
            0.77,
            0.65,
            0.59,
            0.61,
            0.53,
            0.56,
            0.56,
            0.55,
            0.5
         ]
      }
   ];
   readonly model: Model[] = [
      {
         "capacity": [1.0, 0.83, 0.67],
         "cost": 200,
         "name": "physician",
         "expressions": ["0"],
         "minCount":1,
         "maxCount":6,
      },
      {
         "capacity": [0.6, 0.5, 0.4],
         "cost": 65,
         "name": "app",
         "expressions": ["1", "1 * physician"],
         "minCount":1,
         "maxCount":6,
      },
      {
         "capacity": [0.15, 0.12, 0.1],
         "cost": 20,
         "name": "scribe",
         "expressions": ["2", "1 * physician", "1 * app"],
         "minCount":1,
         "maxCount":6,
      }];
      readonly efficiencyModel: Efficiency[] = [
         {
            "name": "physician",
            "firstHour": 1.2,
            "midHour":1.0 ,
            "lastHour": 0.9
         },
         {
            "name": "app",
            "firstHour": 0.8,
            "midHour": 0.7,
            "lastHour": 0.6,
         },
         {
            "name": "scribe",
            "firstHour": 0.5,
            "midHour": 0.4,
            "lastHour": 0.3
         }
      ];
   readonly shiftLength: string = "12,8,10,4"
   readonly requestBody: any = {
      "shiftLength": [12, 8, 10, 4],
      "lowerLimitFactor": 0.85,
      "dayWorkload": this.data,
   }

   readonly jobListData: any = [{
      "jobName": "XYZ Dept",
      "shiftLengthPreferences": [12, 8, 10, 4],
      "lowerUtilizationFactor": 0.85,
      "upperUtilizationFactor": 1.10,
      "scheduleDateTime": Date().toString()
   }, {
      "jobName": "ABC Dept",
      "shiftLengthPreferences": [12, 10, 6, 4],
      "lowerUtilizationFactor": 0.75,
      "upperUtilizationFactor": 1.10,
      "scheduleDateTime": Date().toString()
   }, {
      "jobName": "XYZ Dept",
      "shiftLengthPreferences": [12, 8, 10, 4],
      "lowerUtilizationFactor": 0.85,
      "upperUtilizationFactor": 1.10,
      "scheduleDateTime": Date().toString()
   }, {
      "jobName": "ABC Dept",
      "shiftLengthPreferences": [12, 10, 6, 4],
      "lowerUtilizationFactor": 0.75,
      "upperUtilizationFactor": 1.10,
      "scheduleDateTime": Date().toString()
   }, {
      "jobName": "XYZ Dept",
      "shiftLengthPreferences": [12, 8, 10, 4],
      "lowerUtilizationFactor": 0.85,
      "upperUtilizationFactor": 1.10,
      "scheduleDateTime": Date().toString()
   }, {
      "jobName": "ABC Dept",
      "shiftLengthPreferences": [12, 10, 6, 4],
      "lowerUtilizationFactor": 0.75,
      "upperUtilizationFactor": 1.10,
      "scheduleDateTime": Date().toString()
   }];

   readonly sampleFileData: any = [
      {
         "Day": "Monday",
         "0": "",
         "1": "",
         "2": "",
         "3": "",
         "4": "",
         "5": "",
         "6": "",
         "7": "",
         "8": "",
         "9": "",
         "10": "",
         "11": "",
         "12": "",
         "13": "",
         "14": "",
         "15": "",
         "16": "",
         "17": "",
         "18": "",
         "19": "",
         "20": "",
         "21": "",
         "22": "",
         "23": ""
      },
      {
         "Day": "Tuesday"
      },
      {
         "Day": "Wednesday"
      },
      {
         "Day": "Thursday"
      },
      {
         "Day": "Friday"
      },
      {
         "Day": "Saturday"
      },
      {
         "Day": "Sunday"
      }
   ];
}