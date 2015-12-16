import React from 'react';
import { Chart } from 'react-d3-core';
import { LineChart } from 'react-d3-basic';

export default class SensorChart extends React.Component {

//TODO: DATA, chartSeries


render() {
  //let parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
  let parseDate = d3.time.format.iso.parse;
  const margins = {left: 100, right: 100, top: 20, bottom: 50}
  let tempSeries = [
    {
      field: 'temperature',
      name: 'Temperature',
      color: '#20418d'
    }
  ];
  let humSeries = [
    {
      field: 'humidity',
      name: 'Humidity',
      color: '#00b08b'
    }
  ];
  let airSeries = [
    {
      field: 'airquality',
      name: 'Air Quality',
      color: '#00b08b'
    }
  ];
  let x = function(d) {
    return parseDate(d.time);
  }
  const title = '';
  let xScale = 'time';
  return (
    <div>
      <p className="lead"> Current temperature: <strong>{this.props.data.temperature}&deg; C </strong>, current humidity: <strong>{this.props.data.humidity}%</strong></p>
      <p>Last measurement taken: <strong>{this.props.data.time}</strong> </p>
      <h2>Temperutre</h2>
        <Chart
          title={title}
          height={400}
          margins={margins}
          >
          <LineChart
            margins={margins}
            title={title}
            height={380}
            data={this.props.data.data}
            chartSeries={tempSeries}
            x={x}
            xScale={xScale}
          />
        </Chart>
        <h2>Humidity</h2>
        <Chart
          title={title}
          height={400}
          margins={margins}
          >
          <LineChart
            title={title}
            height={380}
            margins={margins}
            data={this.props.data.data}
            chartSeries={humSeries}
            x={x}
            xScale={xScale}
          />
        </Chart>
        <h2>Air Quality</h2>
        <Chart
          title={title}
          height={400}
          margins={margins}
          >
          <LineChart
            title={title}
            height={380}
            margins={margins}
            data={this.props.data.data}
            chartSeries={airSeries}
            x={x}
            xScale={xScale}
          />
        </Chart>
    </div>
  );
/*
  render(){
    let parseDate = d3.time.format.iso.parse;
    const margins = {left: 100, right: 100, top: 20, bottom: 50}
    let tempSeries = [
      {
        field: 'temperature',
        name: 'Temperature',
        color: '#20418d'
      }
    ];
    let humSeries = [
      {
        field: 'humidity',
        name: 'Humidity',
        color: '#00b08b'
      }
    ];
    let x = function(d) {
      return parseDate(d.time);
    }

    /*{
      field: 'total',
      name: 'Total'
    },
    {
      field: 'incineration',
      name: 'Incineration'
    },



    const title = '';
    let xScale = 'time';
    var chartSeries = this.props.data.map(function(sensordata) {

      return ({ field: sensordata.source, name: 'Sensor ' + sensordata.source});
    });
    console.log(this.props.data);
    console.log(chartSeries);
    return (<div>
              <h2>{this.props.title}</h2>
                <Chart
                  title={title}
                  height={400}
                  margins={margins}
                  chartSeries={chartSeries}
                  >
                </Chart>
            </div>);
    return (<div>
      <h2>this.props.title</h2>
        <Chart
          title={title}
          height={400}
          margins={margins}
          chartSeries={tempSeries}
          >

          <LineChart
            margins={margins}
            title={title}
            height={380}
            data={this.state.data[1].data}
            chartSeries={tempSeries}
            x={x}
            xScale={xScale}
          />
        </Chart>
    </div>);*/
  };
}
