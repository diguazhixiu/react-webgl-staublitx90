import React, { Component } from 'react';
import './App.css';
import ThreeMap from './ThreeMap';
import PieChart from './Linecharts'
import Highchart from './highchart'
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ThreeMap></ThreeMap>
        {/* <Highchart/> */}
      </div>
    );
  }
}
export default App;
