import React from 'react';
import { Chart } from 'react-d3-core';
import { LineChart } from 'react-d3-basic';
import SensorChart from './sensorchart.jsx';
import Axios from 'axios';
import Immutable from 'immutable';
import Faye from 'faye';


export default class Main extends React.Component {

  state = {
    data:[],
    selectedSource: "",
  };

  constructor(props) {
    super(props);
    this.selectSensor = this.selectSensor.bind(this);
  }



  componentWillMount() {
    Axios.get('/initialdata')
      .then(function (response) {
        const climate = Object.assign([], response.data);
        const data = Object.assign([], climate[1].data);
        climate.map(function(item, index){
          let last = item.data.pop()
          item.temperature = last.temperature;
          item.time = (new Date(last.time)).toLocaleString('en-GB');
          item.humidity = last.humidity;
          item.trala = last.id;
          item.data.push(last);
        })
        console.log(climate);
        this.setState({
          data: climate,
          selectedSource: climate[0].source
        });
      }.bind(this))
      .catch(function (response) {
        console.log(response);
      }.bind(this));
  }

  componentDidMount() {
    const client = new Faye.Client('/faye');
    client.subscribe('/update', message => {
      const newItem = Object.assign({}, message);

      const data = Object.assign([], this.state.data);
      console.log(this.state.data);
      data.map(function(item){
        if(item.source === message.source){
          item.data.shift();
          item.data.push(newItem);
          item.temperature = newItem.temperature;
          item.humidity = newItem.humidity;
          item.airquality = newItem.airquality;
          item.time = (new Date(newItem.time)).toLocaleString('en-GB');
        }
      });
      this.setState({
        data: data,
        temperature: newItem.temperature,
        humidity: newItem.humidity,
        time: (new Date(newItem.time)).toLocaleString('en-GB')
      });
      if(newItem.source === 10){
        console.log('debug10 -------------')
        console.log(newItem);
        let test = this.state.data[0];
        let lastel = test.data.length - 1
        console.log(test.data[lastel]);
        console.log('debug10 end -------------')
      }

    });
  }

  selectSensor(sensor){
    console.log('selected sensor: ', sensor);
    this.setState({
      selectedSource: sensor
    });
  }


  render(){
    if(this.state.data.length == 0){
      console.log("hallo");
      console.log(this.state);
      return (<div>
        <p className="lead">Es wurde keine Sensordaten gefunden</p>
      </div>)
    } else {

      let click = this.selectSensor
      let selectedSource = this.state.selectedSource;
      let nav = this.state.data.map(function(item){

        if(item.source === selectedSource){
          return <li className="active" key={item.source} onClick={click.bind(this, item.source)} ><a onclick="">Sensor {item.source}</a></li>
        } else{
          return <li key={item.source} onClick={click.bind(this, item.source)} ><a >Sensor {item.source}</a></li>
        }
      });
      let sensor = this.state.data.map(function(item, index){
        if(item.source === selectedSource){
          return <SensorChart data={item} />
        }
      })
      return (
        <div>
          <nav className="navbar navbar-default navbar-fixed-top">
            <div className="container">
              <div className="navbar-header">
                <a className="navbar-brand" >Room Climate</a>
              </div>
              <div id="navbar" className="collapse navbar-collapse">
                <ul className="nav navbar-nav">
                  {nav}
                </ul>
              </div>
            </div>
          </nav>
          {sensor}
        </div>
      );
    }
  }
}
