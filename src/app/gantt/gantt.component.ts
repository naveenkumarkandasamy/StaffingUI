import { Component, OnInit } from '@angular/core';
import * as d3 from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import { HOUR, DATA } from './data';

@Component({
  selector: 'app-gantt',
  templateUrl: './gantt.component.html',
  styleUrls: ['./gantt.component.css']
})
export class GanttComponent implements OnInit {
  title = "Sample Gantt Chart";

  private width: number;
  private height: number;
  private margin = { top: 20, right: 80, bottom: 40, left: 80 };

  private x: any;
  private y: any;
  private svg: any;
  private g: any;

  constructor() { }

  ngOnInit() {
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawBars();
  }

  private initSvg() {
    this.svg = d3.select("svg");
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height =
      +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    this.g = this.svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );
  }

  private initAxis() {
    this.x = d3Scale.scaleLinear()
      .rangeRound([0, this.width])
      .domain([0, d3Array.max(HOUR, d => d.hour)]);

    this.y = d3Scale.scaleBand()
      .rangeRound([this.height, 0])
      .domain(DATA.map(d => d.y));
  }

  private drawAxis() {
    this.g
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3Axis.axisBottom(this.x))
      .append("text")
      .attr("class", "axis-title")
      .attr("y", -195)
      .attr("x", 400)
      .attr("dy", "22.71em")
      .text("Hours");
    this.g
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3Axis.axisLeft(this.y).ticks(0, "%"))
      .append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -200)
      .attr("dy", "0.71em")
      .text("Clinicians");
  }

  private drawBars() {
    this.g
      .selectAll(".bar")
      .data(DATA)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => this.y(d.y))
      .attr("height", this.y.bandwidth())
      .attr("x", d => this.x(d.x))
      .attr("width", d => this.x(d.width))
      .attr("fill", "#69b3a2");
  }

}
