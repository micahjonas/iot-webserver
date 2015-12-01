import React from 'react';
import { Chart } from 'react-d3-core';
import { LineChart } from 'react-d3-basic';
import Axios from 'axios';
import Immutable from 'immutable';
import Faye from 'faye';


export default class Main extends React.Component {

  state = {
    temperature: 0,
    humidity: 0,
    data:[],
    time: (new Date()).toLocaleString('en-GB')
  };

  constructor(props) {
    super(props);
  }



  componentWillMount() {
    Axios.get('/initialdata')
      .then(function (response) {
        const data = Object.assign([], response.data);
        const last = response.data.pop();
          this.setState({
            data: data,
            temperature: last.temperature,
            humidity: last.humidity,
            time: (new Date(last.time)).toLocaleString('en-GB')
          });
      }.bind(this))
      .catch(function (response) {
        console.log(response);
      }.bind(this));
  }

  componentDidMount() {
    const client = new Faye.Client('http://localhost:3000/faye');
    client.subscribe('/update', message => {
      console.log(message);
      const item = Object.assign({}, message);
      console.log(item);
      const data = Object.assign([], this.state.data);
      data.shift();
      data.push(message);
      this.setState({
        data: data,
        temperature: item.temperature,
        humidity: item.humidity,
        time: (new Date(item.time)).toLocaleString('en-GB')
      });
      console.log(this.state);
    });

  }

  render() {
    //let parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
    let parseDate = d3.time.format.iso.parse;
    const margins = {left: 100, right: 100, top: 20, bottom: 50}
    let chartSeries = [
      {
        field: 'temperature',
        name: 'Temperature',
        color: '#20418d'
      },
      {
        field: 'humidity',
        name: 'Humidity',
        color: '#00b08b'
      },
    ];
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
    const title = '';
    let xScale = 'time';
    return (
      <div>
        <p className="lead"> Current temperature: <strong>{this.state.temperature}&deg; C </strong>, current humidity: <strong>{this.state.humidity}%</strong></p>
        <p>Last measurement taken: <strong>{this.state.time}</strong> </p>
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
              data={this.state.data}
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
              data={this.state.data}
              chartSeries={humSeries}
              x={x}
              xScale={xScale}
            />
          </Chart>
      </div>
    );
  }
}
