import './ThreeMap.css';
import React, { Component } from 'react';
import * as THREE from 'three';
import OBJLoader from './OBJLoader.js';
import MTLLoader from './MTLLoader.js'
import OrbitControls from './OrbitControls.js';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import Checkbox from '@material-ui/core/Checkbox';
import { width } from '@material-ui/system';
import Stats from 'stats.js/src/Stats'
import axios from 'axios' ;
import Highcharts from 'highcharts';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
//1111
const style={
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: '2%',
    border:'2px solid #d7dbde',
    width: '60%',
    height: '80%',
    marginLeft: '30%',
    marginTop: '75px'
}
const paperstyle={
    marginLeft: '50px',
    marginTop: '20px',
    width: '25%',
}
const paperstyle2={
  marginRight: '0px',
  marginTop: '0px',
  width: '100%',
  height: '80%',
}
const PrettoSlider ={
  root: {
    color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
}

var scene = new THREE.Scene();
var objbase = new THREE.Object3D();
var objjoint1 = new THREE.Object3D();
var objjoint2 = new THREE.Object3D();
var objjoint3 = new THREE.Object3D();
var objjoint4 = new THREE.Object3D();
var objjoint5 = new THREE.Object3D();
var objjoint6 = new THREE.Object3D();
var splineObject = new THREE.Line();//画线

var curvepoint = [new THREE.Vector3( -100, 0, 0 ),

  new THREE.Vector3( -50, 50, 0 ),

  new THREE.Vector3( 0, 0, 0 ),

  new THREE.Vector3( 50, -50, 0 ), //设置线经过的坐标

  new THREE.Vector3( 100, 0, 0 ) ];
var linematerial = new THREE.LineBasicMaterial( { color : 0xff0000 } ); //纹理，（这里设置的是颜色）
var curve = new THREE.SplineCurve3(curvepoint);
const useStyles = makeStyles(theme => ({
    root: {
      width: 300,
    },
    margin: {
      height: theme.spacing(3),
    },
    card: {
      minWidth: 275,
      width: 300,
    },
  }));
const marks = [
    {
      value: 0,
      label: '0°C',
    },
    {
      value: 20,
      label: '20°C',
    },
    {
      value: 37,
      label: '37°C',
    },
    {
      value: 100,
      label: '100°C',
    },
];
function valuetext(value) {
  return `${value}°C`;
}

let timergetjoint = undefined;
let timergetsensor = undefined;
class ThreeMap extends Component{
 	componentDidMount(){
    this.renderGraph();
    this.initThree();
    this.forwardkinematic(0,0,90,0,45,0);
  }
  constructor(props) {
    super(props);
    this.state = {
      joint1: 0,
      joint2: 0,
      joint3: 90,
      joint4: 0,
      joint5: 45,
      joint6: 0,
      sensorFx: 0,
      sensorFy: 0,
      sensorFz: 0,
      sensorTx: 0,
      sensorTy: 0,
      sensorTz: 0,
      posx:0,
      posy:0,
      posz:0,
      visible: false,
      activityName:'',
      tabsvalue:0,
      chart1title:'关节1',
      chart2title:'关节2',
      chart3title:'关节3',
      chart4title:'关节4',
      chart5title:'关节5',
      chart6title:'关节6',
      connectzt:'服务器状态：未连接',
      tongbuzt:'同步状态：未同步'
    };
  }
  renderGraph = () => {
    const _this=this;
    let Data1 = {
        chart: {
            type: 'spline',
            animation: {
              duration: 1,
              easing: 'easeOutBounce'
            }, // don't animate in old IE
            marginRight: 10,
            events: {
                load: function () {

                    // set up the updating of the chart each second
                    var series = this.series[0];
                    setInterval(function () {
                        var x = (new Date()).getTime(); // current time
                        if (_this.state.tabsvalue ===0 ) {
                          var y = _this.state.joint1;
                        } else {
                          var y = _this.state.sensorFx;
                        }
                        series.addPoint([x, y], true, true);
                    }, 100);
                }
            }
        },
        title: false,
        time: {
            useUTC: false
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: '值'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        credits: {
          enabled:false
        },
        series: [{
            name: 'data',
            data: (function () {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -59; i <= 0; i += 1) {
                    data.push({
                        x: time + i * 1000,
                        y: _this.state.joint1,
                    });
                }
                return data;
            }())
        }]
    }
    Highcharts.chart(this.refs.alarmHighChart1, Data1 ).setSize(300,300);
    let Data2 = {
      chart: {
          type: 'spline',
          animation: {
            duration: 1,
            easing: 'easeOutBounce'
          }, // don't animate in old IE
          marginRight: 10,
          events: {
              load: function () {

                  // set up the updating of the chart each second
                  var series = this.series[0];
                  setInterval(function () {
                      var x = (new Date()).getTime(); // current time
                      if (_this.state.tabsvalue ===0 ) {
                        var y = _this.state.joint2;
                      } else {
                        var y = _this.state.sensorFy;
                      }
                      series.addPoint([x, y], true, true);
                  }, 100);
              }
          }
      },
      title: false,
      time: {
          useUTC: false
      },
      xAxis: {
          type: 'datetime',
          tickPixelInterval: 150
      },
      yAxis: {
          title: {
              text: '值'
          },
          plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
          }]
      },
      tooltip: {
          headerFormat: '<b>{series.name}</b><br/>',
          pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
      },
      legend: {
          enabled: false
      },
      exporting: {
          enabled: false
      },
      credits: {
        enabled:false
      },
      series: [{
          name: 'data',
          data: (function () {
              // generate an array of random data
              var data = [],
                  time = (new Date()).getTime(),
                  i;

              for (i = -59; i <= 0; i += 1) {
                  data.push({
                      x: time + i * 1000,
                      y: _this.state.joint2,
                  });
              }
              return data;
          }())
      }]
    }
    Highcharts.chart(this.refs.alarmHighChart2, Data2 ).setSize(300,300);
    let Data3 = {
      chart: {
          type: 'spline',
          animation: {
            duration: 1,
            easing: 'easeOutBounce'
          }, // don't animate in old IE
          marginRight: 10,
          events: {
              load: function () {

                  // set up the updating of the chart each second
                  var series = this.series[0];
                  setInterval(function () {
                      var x = (new Date()).getTime(); // current time
                      if (_this.state.tabsvalue ===0 ) {
                        var y = _this.state.joint3;
                      } else {
                        var y = _this.state.sensorFz;
                      }
                      series.addPoint([x, y], true, true);
                  }, 100);
              }
          }
      },
      title: false ,
      time: {
          useUTC: false
      },
      xAxis: {
          type: 'datetime',
          tickPixelInterval: 150
      },
      yAxis: {
          title: {
              text: '值'
          },
          plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
          }]
      },
      tooltip: {
          headerFormat: '<b>{series.name}</b><br/>',
          pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
      },
      legend: {
          enabled: false
      },
      exporting: {
          enabled: false
      },
      credits: {
        enabled:false
      },
      series: [{
          name: 'data',
          data: (function () {
              // generate an array of random data
              var data = [],
                  time = (new Date()).getTime(),
                  i;

              for (i = -59; i <= 0; i += 1) {
                  data.push({
                      x: time + i * 1000,
                      y: _this.state.joint3,
                  });
              }
              return data;
          }())
      }]
    }
    Highcharts.chart(this.refs.alarmHighChart3, Data3 ).setSize(300,300);
    let Data4 = {
      chart: {
          type: 'spline',
          animation: {
            duration: 1,
            easing: 'easeOutBounce'
          }, // don't animate in old IE
          marginRight: 10,
          events: {
              load: function () {

                  // set up the updating of the chart each second
                  var series = this.series[0];
                  setInterval(function () {
                      var x = (new Date()).getTime(); // current time
                      if (_this.state.tabsvalue ===0 ) {
                        var y = _this.state.joint4;
                      } else {
                        var y = _this.state.sensorTx;
                      }
                      series.addPoint([x, y], true, true);
                  }, 100);
              }
          }
      },
      title: false,
      time: {
          useUTC: false
      },
      xAxis: {
          type: 'datetime',
          tickPixelInterval: 150
      },
      yAxis: {
          title: {
              text: '值'
          },
          plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
          }]
      },
      tooltip: {
          headerFormat: '<b>{series.name}</b><br/>',
          pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
      },
      legend: {
          enabled: false
      },
      exporting: {
          enabled: false
      },
      credits: {
        enabled:false
      },
      series: [{
          name: 'data',
          data: (function () {
              // generate an array of random data
              var data = [],
                  time = (new Date()).getTime(),
                  i;

              for (i = -59; i <= 0; i += 1) {
                  data.push({
                      x: time + i * 1000,
                      y: _this.state.joint4,
                  });
              }
              return data;
          }())
      }]
    }
    Highcharts.chart(this.refs.alarmHighChart4, Data4 ).setSize(300,300);
    let Data5 = {
      chart: {
          type: 'spline',
          animation: {
            duration: 1,
            easing: 'easeOutBounce'
          }, // don't animate in old IE
          marginRight: 10,
          events: {
              load: function () {

                  // set up the updating of the chart each second
                  var series = this.series[0];
                  setInterval(function () {
                      var x = (new Date()).getTime(); // current time
                      if (_this.state.tabsvalue ===0 ) {
                        var y = _this.state.joint5;
                      } else {
                        var y = _this.state.sensorTy;
                      }
                      series.addPoint([x, y], true, true);
                  }, 100);
              }
          }
      },
      title: false,
      time: {
          useUTC: false
      },
      xAxis: {
          type: 'datetime',
          tickPixelInterval: 150
      },
      yAxis: {
          title: {
              text: '值'
          },
          plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
          }]
      },
      tooltip: {
          headerFormat: '<b>{series.name}</b><br/>',
          pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
      },
      legend: {
          enabled: false
      },
      exporting: {
          enabled: false
      },
      credits: {
        enabled:false
      },
      series: [{
          name: 'data',
          data: (function () {
              // generate an array of random data
              var data = [],
                  time = (new Date()).getTime(),
                  i;

              for (i = -59; i <= 0; i += 1) {
                  data.push({
                      x: time + i * 1000,
                      y: _this.state.joint5,
                  });
              }
              return data;
          }())
      }]
    }
    Highcharts.chart(this.refs.alarmHighChart5, Data5 ).setSize(300,300);
    let Data6 = {
      chart: {
          type: 'spline',
          animation: {
            duration: 1,
            easing: 'easeOutBounce'
          }, // don't animate in old IE
          marginRight: 10,
          events: {
              load: function () {

                  // set up the updating of the chart each second
                  var series = this.series[0];
                  setInterval(function () {
                      var x = (new Date()).getTime(); // current time
                      if (_this.state.tabsvalue ===0 ) {
                        var y = _this.state.joint6;
                      } else {
                        var y = _this.state.sensorTz;
                      }
                      series.addPoint([x, y], true, true);
                  }, 100);
              }
          }
      },
      title: false,
      time: {
          useUTC: false
      },
      xAxis: {
          type: 'datetime',
          tickPixelInterval: 150
      },
      yAxis: {
          title: {
              text: '值'
          },
          plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
          }]
      },
      tooltip: {
          headerFormat: '<b>{series.name}</b><br/>',
          pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
      },
      legend: {
          enabled: false
      },
      credits: {
          enabled:false
      },
      exporting: {
          enabled: false
      },
      series: [{
          name: 'data',
          data: (function () {
              // generate an array of random data
              var data = [],
                  time = (new Date()).getTime(),
                  i;

              for (i = -59; i <= 0; i += 1) {
                  data.push({
                      x: time + i * 1000,
                      y: _this.state.joint6,
                  });
              }
              return data;
          }())
      }]
    }
    Highcharts.chart(this.refs.alarmHighChart6, Data6 ).setSize(300,300);
    }
  forwardkinematic = (j1,j2,j3,j4,j5,j6)=>{
    var angle1_radian=j1*Math.PI/180.0;
    var angle2_radian=(j2-90)*Math.PI/180.0;
    var angle3_radian=(j3+90)*Math.PI/180.0;
    var angle4_radian=j4*Math.PI/180.0;
    var angle5_radian=j5*Math.PI/180.0;
    var angle6_radian=j6*Math.PI/180.0;
    var a1 = 50;
    var a2 = 425;
    var a3 = 0;
    var a4 = 0;
    var a5 = 0;
    var a6 = 0;

    var d1 = 0;
    var d2 = 0;
    var d3 = 50;
    var d4 = 425;
    var d5 = 0;
    var d6 = 100;
    var c1=Math.cos(angle1_radian);
    var c2=Math.cos(angle2_radian);
    var c3=Math.cos(angle3_radian);
    var c4=Math.cos(angle4_radian);
    var c5=Math.cos(angle5_radian);
    var c6=Math.cos(angle6_radian);

    var s1=Math.sin(angle1_radian);
    var s2=Math.sin(angle2_radian);
    var s3=Math.sin(angle3_radian);
    var s4=Math.sin(angle4_radian);
    var s5=Math.sin(angle5_radian);
    var s6=Math.sin(angle6_radian);

    var nx =- c6*(s5*(c1*c2*s3 + c1*c3*s2) + c5*(s1*s4 - c4*(c1*c2*c3 - c1*s2*s3))) - s6*(c4*s1 + s4*(c1*c2*c3 - c1*s2*s3));
    var ny =s6*(s5*(c1*c2*s3 + c1*c3*s2) + c5*(s1*s4 - c4*(c1*c2*c3 - c1*s2*s3))) - c6*(c4*s1 + s4*(c1*c2*c3 - c1*s2*s3));
    var nz =c5*(c1*c2*s3 + c1*c3*s2) - s5*(s1*s4 - c4*(c1*c2*c3 - c1*s2*s3));
    var ox =s6*(c1*c4 - s4*(c2*c3*s1 - s1*s2*s3)) - c6*(s5*(c2*s1*s3 + c3*s1*s2) - c5*(c1*s4 + c4*(c2*c3*s1 - s1*s2*s3)));
    var oy =s6*(s5*(c2*s1*s3 + c3*s1*s2) - c5*(c1*s4 + c4*(c2*c3*s1 - s1*s2*s3))) + c6*(c1*c4 - s4*(c2*c3*s1 - s1*s2*s3));
    var oz =c5*(c2*s1*s3 + c3*s1*s2) + s5*(c1*s4 + c4*(c2*c3*s1 - s1*s2*s3));
    var ax =s4*s6*(c2*s3 + c3*s2) - c6*(s5*(c2*c3 - s2*s3) + c4*c5*(c2*s3 + c3*s2));
    var ay =s6*(s5*(c2*c3 - s2*s3) + c4*c5*(c2*s3 + c3*s2)) + c6*s4*(c2*s3 + c3*s2);
    var az =c5*(c2*c3 - s2*s3) - c4*s5*(c2*s3 + c3*s2);
    var px =a1*c1 - d2*s1 - d3*s1 + d6*(c5*(c1*c2*s3 + c1*c3*s2) - s5*(s1*s4 - c4*(c1*c2*c3 - c1*s2*s3))) + d4*(c1*c2*s3 + c1*c3*s2) - d5*(c4*s1 + s4*(c1*c2*c3 - c1*s2*s3)) - a5*c5*(s1*s4 - c4*(c1*c2*c3 - c1*s2*s3)) - a6*s6*(c4*s1 + s4*(c1*c2*c3 - c1*s2*s3)) + a2*c1*c2 - a6*c6*(s5*(c1*c2*s3 + c1*c3*s2) + c5*(s1*s4 - c4*(c1*c2*c3 - c1*s2*s3))) - a4*s1*s4 + a4*c4*(c1*c2*c3 - c1*s2*s3) - a5*s5*(c1*c2*s3 + c1*c3*s2) - a3*c1*s2*s3 + a3*c1*c2*c3;
    var py =c1*d2 + c1*d3 + a1*s1 + d6*(c5*(c2*s1*s3 + c3*s1*s2) + s5*(c1*s4 + c4*(c2*c3*s1 - s1*s2*s3))) + d4*(c2*s1*s3 + c3*s1*s2) + d5*(c1*c4 - s4*(c2*c3*s1 - s1*s2*s3)) + a5*c5*(c1*s4 + c4*(c2*c3*s1 - s1*s2*s3)) + a6*s6*(c1*c4 - s4*(c2*c3*s1 - s1*s2*s3)) + a2*c2*s1 + a4*c1*s4 - a6*c6*(s5*(c2*s1*s3 + c3*s1*s2) - c5*(c1*s4 + c4*(c2*c3*s1 - s1*s2*s3))) + a4*c4*(c2*c3*s1 - s1*s2*s3) - a5*s5*(c2*s1*s3 + c3*s1*s2) - a3*s1*s2*s3 + a3*c2*c3*s1;
	  var pz =d1 - a2*s2 + d4*(c2*c3 - s2*s3) + d6*(c5*(c2*c3 - s2*s3) - c4*s5*(c2*s3 + c3*s2)) + d5*s4*(c2*s3 + c3*s2) - a6*c6*(s5*(c2*c3 - s2*s3) + c4*c5*(c2*s3 + c3*s2)) - a3*c2*s3 - a3*c3*s2 - a4*c4*(c2*s3 + c3*s2) - a5*s5*(c2*c3 - s2*s3) - a5*c4*c5*(c2*s3 + c3*s2) + a6*s4*s6*(c2*s3 + c3*s2);
    this.setState({posx : px});
    this.setState({posy : py});
    this.setState({posz : pz});
  }

  handle1 = (event, newValue) => {
    objjoint1.rotateY(Math.PI*(newValue-this.state.joint1)/180);
    this.setState({joint1 : newValue});
    var target = new THREE.Vector3();
    // scene.updateMatrixWorld(true);
    objjoint6.getWorldPosition(target);
    target.setZ(-target.z);
    curvepoint.push(target);

    var path = new THREE.Path( curve.getPoints( 500 ) ); //决定画线的精度，学过微积分的都知道，这就是不断趋近
    var geometry = path.createPointsGeometry( 500 ); //将坐标数组包装入几何性质中
    console.log(curve.getPoints( 500 ) );
    splineObject.geometry =  geometry;
    splineObject.material =  linematerial;
    // this.forwardkinematic(this.state.joint1,this.state.joint2,this.state.joint3,this.state.joint4,this.state.joint5,this.state.joint6);
  }
  handle2 = (event, newValue) => {
    objjoint2.rotateZ(Math.PI*(-newValue+this.state.joint2)/180);
    this.setState({joint2 : newValue});
    // this.forwardkinematic(this.state.joint1,this.state.joint2,this.state.joint3,this.state.joint4,this.state.joint5,this.state.joint6);
  }
  handle3 = (event, newValue) => {
    objjoint3.rotateZ(Math.PI*(-newValue+this.state.joint3)/180);
    this.setState({joint3 : newValue});
    // this.forwardkinematic(this.state.joint1,this.state.joint2,this.state.joint3,this.state.joint4,this.state.joint5,this.state.joint6);
  }
  handle4 = (event, newValue) => {
    objjoint4.rotateY(Math.PI*(newValue-this.state.joint4)/180);
    this.setState({joint4 : newValue});
    // this.forwardkinematic(this.state.joint1,this.state.joint2,this.state.joint3,this.state.joint4,this.state.joint5,this.state.joint6);
  }
  handle5 = (event, newValue) => {
    objjoint5.rotateZ(Math.PI*(-newValue+this.state.joint5)/180);
    this.setState({joint5 : newValue});
    // this.forwardkinematic(this.state.joint1,this.state.joint2,this.state.joint3,this.state.joint4,this.state.joint5,this.state.joint6);
  }
  handle6 = (event, newValue) => {
    objjoint6.rotateY(Math.PI*(newValue-this.state.joint6)/180);
    this.setState({joint6 : newValue});
    // this.forwardkinematic(this.state.joint1,this.state.joint2,this.state.joint3,this.state.joint4,this.state.joint5,this.state.joint6);
  }
  handleButtonFuwei = event => {
    this.setState({joint1 : 0});
    this.setState({joint2 : 0});
    this.setState({joint3 : 90});
    this.setState({joint4 : 0});
    this.setState({joint5 : 45});
    this.setState({joint6 : 0});
    objjoint1.rotateY(Math.PI*(0-this.state.joint1)/180);
    objjoint2.rotateZ(Math.PI*(0+this.state.joint2)/180);
    objjoint3.rotateZ(Math.PI*(-90+this.state.joint3)/180);
    objjoint4.rotateY(Math.PI*(0-this.state.joint4)/180);
    objjoint5.rotateZ(Math.PI*(-45+this.state.joint5)/180);
    objjoint6.rotateY(Math.PI*(0-this.state.joint6)/180);
    this.forwardkinematic(0,0,90,0,45,0);
  }
  setjoint = (joint1,joint2,joint3,joint4,joint5,joint6) => {
    objjoint1.rotateY(Math.PI*(joint1-this.state.joint1)/180);
    objjoint2.rotateZ(Math.PI*(-joint2+this.state.joint2)/180);
    objjoint3.rotateZ(Math.PI*(-joint3+this.state.joint3)/180);
    objjoint4.rotateY(Math.PI*(joint4-this.state.joint4)/180);
    objjoint5.rotateZ(Math.PI*(-joint5+this.state.joint5)/180);
    objjoint6.rotateY(Math.PI*(joint6-this.state.joint6)/180);
    this.setState({joint1:joint1,joint2:joint2,joint3:joint3,joint4:joint4,joint5:joint5,joint6:joint6});
  }
  setsensor = (Fx,Fy,Fz,Tx,Ty,Tz) => {
    this.setState({sensorFx:Fx,sensorFy:Fy,sensorFz:Fz,sensorTx:Tx,sensorTy:Ty,sensorTz:Tz});
  }
  timerStart = () => {
    timergetjoint = setInterval(() =>this.sendgetjoint() , 100)
    timergetsensor = setInterval(() =>this.sendgetsensor() , 100)
    this.setState({tongbuzt:"同步状态：同步中"})
  }
  timerStop = () => {
    clearTimeout(timergetjoint);
    clearTimeout(timergetsensor);
    this.setState({tongbuzt:"同步状态：未同步"})
  }
  sendgetjoint = () => {
    // let  url="http://127.0.0.1:8000/login?username=xxx&password=123456"
    let  url="http://192.168.0.148:8000/getjoint"
    const _this=this; //先存一下this，以防使用箭头函数this会指向我们不希望它所指向的对象。
    axios.get(url)
      .then(function (response) {
        let data =response.data;
        console.log(data);
        _this.setjoint(data.joint1,data.joint2,data.joint3,data.joint4,data.joint5,data.joint6);
        console.log(data);
      })
      .catch(function (error) {
        alert('连接服务器失败');
        _this.timerStop();
      });
  }
  sendgetsensor = () => {
    // let  url="http://127.0.0.1:8000/login?username=xxx&password=123456"
    let  url="http://192.168.0.148:8000/getsensor"
    const _this=this; //先存一下this，以防使用箭头函数this会指向我们不希望它所指向的对象。
    axios.get(url)
      .then(function (response) {
        let data =response.data;
        console.log(data);
        _this.setsensor(data.Fx,data.Fy,data.Fz,data.Tx,data.Ty,data.Tz);
        console.log(data);
      })
      .catch(function (error) {
        alert('连接服务器失败');
        _this.timerStop();
      });
  }
  handleButtonLogin = () =>{
    let  url="http://192.168.0.148:8000/login"
    const _this=this;
    axios.get(url)
      .then(function (response) {
        let data =response.data;
        alert(data);
        _this.setState({connectzt:"服务器状态：已连接"})
      })
      .catch(function (error) {
        alert('连接服务器失败');
      });
    axios.post()
  }
  handleTabsChange = (event, newValue) =>{
    this.setState({tabsvalue:newValue});
    switch (newValue) {
      case 0:
          this.setState({
            chart1title:'关节1',
            chart2title:'关节2',
            chart3title:'关节3',
            chart4title:'关节4',
            chart5title:'关节5',
            chart6title:'关节6'
            })
        break;
      case 1:
          this.setState({
            chart1title:'forcex',
            chart2title:'forcey',
            chart3title:'forcez',
            chart4title:'forcerx',
            chart5title:'forcery',
            chart6title:'forcerz'
            })
        break;
      default:
          this.setState({
            chart1title:'关节1',
            chart2title:'关节2',
            chart3title:'关节3',
            chart4title:'关节4',
            chart5title:'关节5',
            chart6title:'关节6'
            })
        break;
    }
    console.log(this.state.chart1title);
  }
	initThree(){

		let camera, renderer;
		let canvas1 = document.getElementById('canvas1');
    let width = canvas1.clientWidth;
    let height = canvas1.clientHeight;
    // var stats = new Stats();
    // stats.showPanel( 0 );
    // document.body.appendChild( stats.dom );
		init();
    animate();
		function init() {
            //自定义画布位置
            renderer = new THREE.WebGLRenderer({ canvas: canvas1 });
            renderer.setSize(width, height);

            // THREE.OrthographicCamera
            // camera = new THREE.PerspectiveCamera( 40, width / height, 1, 1000 );
            camera = new THREE.OrthographicCamera(-100, 100, 62, -62, 1, 1000);
            camera.position.set(300, 300, 300);
            camera.up.x = 0;//相机以哪个方向为上方
            camera.up.y = 0;
            camera.up.z = 1;
            camera.lookAt(0, 0, 0)//相机看向哪个坐标,(0,0,0)是原点
            //这里可以修改背景颜色
            renderer.setClearColor(0x53868B);
            //这里实现是否可以控制object的位置、旋转
            var controls = new OrbitControls(camera, renderer.domElement);
            // //是否可以缩放
            // controls.enableZoom = true;
            // //禁止鼠标交互,此处设置为false之后，不能移动位置，不能旋转物体
            // controls.enableRotate = ture;
            var light = new THREE.DirectionalLight(0xF5F5ED, 0.5);
            light.position.setScalar(100);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0xF5F5ED, 0.8));




              scene.add( splineObject );//将对象加入场景
            //加载OBJ格式的模型
            var mtlLoader = new MTLLoader();
            mtlLoader.load('changjing1.mtl', function(materials) {

              materials.preload();
              var objLoaderCj = new OBJLoader();
              objLoaderCj.setMaterials(materials);
              objLoaderCj.load('changjing1.obj', function (object) {
                object.rotateX(-Math.PI * 0.5);
                object.position.set(0,0,-50);
                object.scale.set(0.1,0.1,0.1);
                scene.add(object);
              },function(xhr){
                  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
              });
            });
            var mtlyellowLoader = new MTLLoader();
            mtlyellowLoader.load('base.mtl', function(materials) {
              materials.preload();
              var objLoaderBase = new OBJLoader();
              objLoaderBase.setMaterials(materials);
              objLoaderBase.load('base.obj', function (object) {
                  //辅助工具,x,y,z三维坐标轴
                  // var  = new THREE.Object3D();
                  var worldaxes = new THREE.AxesHelper(200);
                  worldaxes.rotateX(Math.PI * 1 );
                  worldaxes.position.set(0,0,-47.8);
                  scene.add(worldaxes);
                  scene.position.set(0,0,50);
                  //模型放大1.5倍
                  object.scale.set(0.1, 0.1, 0.1);
                  // object.position.set(0, 0, 200);
                  // // //PI属性就是π,还表示了弧度π = 180°,Math.PI = 3.14 = 180°
                  object.rotateX(Math.PI * 0.5);
                  object.rotateY(Math.PI * 1);
                  object.rotateZ(Math.PI * 1);
                  // object.add(objjoint1);
                  objbase = object;
                  scene.add(objbase);
                  // objbase.add(cube);
                      // var mtlLoader = new MTLLoader();
                      // mtlLoader.load('base.mtl', function(materials) {

                      //     materials.preload();
                      //     objbase.setMaterials(materials);

                      // });
                      var objLoaderJoint1 = new OBJLoader();
                      objLoaderJoint1.setMaterials(materials);
                      objLoaderJoint1.load('joint1.obj', function (object) {
                        //辅助工具,x,y,z三维坐标轴
                        // var  = new THREE.Object3D();
                        // scene.add(new THREE.AxesHelper(40));
                        //模型放大1.5倍
                        // object.scale.set(0.1, 0.1, 0.1);
                        object.position.set(0, 245.25, 0);
                        // // //PI属性就是π,还表示了弧度π = 180°,Math.PI = 3.14 = 180°
                        // object.rotateX(Math.PI * 0.5);
                        // object.rotateY(-Math.PI * 0);
                        // object.rotateZ(-Math.PI * 1);
                        objjoint1 = object;
                        objbase.add(objjoint1);
                            var objLoaderJoint2 = new OBJLoader();
                            objLoaderJoint2.setMaterials(materials);
                            objLoaderJoint2.load('joint2.obj', function (object) {
                              //辅助工具,x,y,z三维坐标轴
                              // var  = new THREE.Object3D();
                              // scene.add(new THREE.AxesHelper(40));
                              //模型放大1.5倍
                              // object.scale.set(0.1, 0.1, 0.1);
                              object.position.set(50, 232.75, -161);
                              // // //PI属性就是π,还表示了弧度π = 180°,Math.PI = 3.14 = 180°
                              // object.rotateX(Math.PI * 0.5);
                              // object.rotateY(-Math.PI * 0);
                              // object.rotateZ(-Math.PI * 1);
                              objjoint2 = object;
                              objjoint1.add(objjoint2);
                              var objLoaderJoint3 = new OBJLoader();
                              objLoaderJoint3.setMaterials(materials);
                              objLoaderJoint3.load('joint3.obj', function (object) {
                                //辅助工具,x,y,z三维坐标轴
                                // var  = new THREE.Object3D();
                                // scene.add(new THREE.AxesHelper(40));
                                //模型放大1.5倍
                                // object.scale.set(0.1, 0.1, 0.1);
                                object.position.set(0, 425, 0);
                                // // //PI属性就是π,还表示了弧度π = 180°,Math.PI = 3.14 = 180°
                                // object.rotateX(Math.PI * 0.5);
                                // object.rotateY(-Math.PI * 0);
                                object.rotateZ(-Math.PI * 90/180);
                                objjoint3 = object;
                                objjoint2.add(objjoint3);


                                  var objLoaderJoint4 = new OBJLoader();
                                  objLoaderJoint4.setMaterials(materials);
                                  objLoaderJoint4.load('joint4.obj', function (object) {
                                    //辅助工具,x,y,z三维坐标轴
                                    // var  = new THREE.Object3D();
                                    // scene.add(new THREE.AxesHelper(40));
                                    //模型放大1.5倍
                                    // object.scale.set(0.1, 0.1, 0.1);
                                    object.position.set(0, 157, 111);
                                    // // //PI属性就是π,还表示了弧度π = 180°,Math.PI = 3.14 = 180°
                                    // object.rotateX(Math.PI * 0.5);
                                    // object.rotateY(-Math.PI * 0);
                                    // object.rotateZ(-Math.PI * 1);
                                    objjoint4 = object;
                                    objjoint3.add(objjoint4);
                                    var mtlgreyLoader = new MTLLoader();
                                    mtlgreyLoader.load('grey.mtl', function(materials) {
                                    materials.preload();
                                      var objLoaderJoint5 = new OBJLoader();
                                      objLoaderJoint5.setMaterials(materials);
                                      objLoaderJoint5.load('joint5.obj', function (object) {
                                        //辅助工具,x,y,z三维坐标轴
                                        // var  = new THREE.Object3D();
                                        // scene.add(new THREE.AxesHelper(40));
                                        //模型放大1.5倍
                                        // object.scale.set(0.1, 0.1, 0.1);
                                        object.position.set(0, 269, 0);
                                        // // //PI属性就是π,还表示了弧度π = 180°,Math.PI = 3.14 = 180°
                                        // object.rotateX(Math.PI * 0.5);
                                        // object.rotateY(-Math.PI * 0);
                                        object.rotateZ(-Math.PI * 45/180);
                                        objjoint5 = object;
                                        objjoint4.add(objjoint5);
                                        var objLoaderJoint6 = new OBJLoader();
                                        objLoaderJoint6.setMaterials(materials);
                                        objLoaderJoint6.load('joint6.obj', function (object) {
                                          //辅助工具,x,y,z三维坐标轴
                                          // var  = new THREE.Object3D();
                                          // scene.add(new THREE.AxesHelper(40));
                                          //模型放大1.5倍
                                          // object.scale.set(0.1, 0.1, 0.1);
                                          object.position.set(0, 89.5, 0);
                                          // // //PI属性就是π,还表示了弧度π = 180°,Math.PI = 3.14 = 180°
                                          // object.rotateX(Math.PI * 0.5);
                                          // object.rotateY(-Math.PI * 0);
                                          // object.rotateZ(-Math.PI * 1);
                                          objjoint6 = object;
                                          var axes = new THREE.AxesHelper(200);
                                          axes.rotateX(-Math.PI * 0.5);
                                          objjoint6.add(axes);
                                          objjoint5.add(objjoint6);
                                          var objLoaderjiajv = new OBJLoader();
                                          objLoaderjiajv.setMaterials(materials);
                                          objLoaderjiajv.load('jiajv.obj', function (object) {
                                            //辅助工具,x,y,z三维坐标轴
                                            // var  = new THREE.Object3D();
                                            // scene.add(new THREE.AxesHelper(40));
                                            //模型放大1.5倍
                                            // object.scale.set(0.1, 0.1, 0.1);
                                            object.position.set(0, 113, 0);
                                            // // //PI属性就是π,还表示了弧度π = 180°,Math.PI = 3.14 = 180°
                                            // object.rotateX(Math.PI * 0.5);
                                            // object.rotateY(-Math.PI * 0);
                                            // object.rotateZ(-Math.PI * 1);
                                            objjoint6.add(object);
                                            var mtlyellowLoader = new MTLLoader();
                                            mtlyellowLoader.load('base.mtl', function(materials) {
                                              materials.preload();
                                              var objLoadermaobi = new OBJLoader();
                                              objLoadermaobi.setMaterials(materials);
                                              objLoadermaobi.load('maobi.obj', function (object) {
                                                //辅助工具,x,y,z三维坐标轴
                                                // var  = new THREE.Object3D();
                                                // scene.add(new THREE.AxesHelper(40));
                                                //模型放大1.5倍
                                                // object.scale.set(0.1, 0.1, 0.1);
                                                object.position.set(0, 130, 0);
                                                // // //PI属性就是π,还表示了弧度π = 180°,Math.PI = 3.14 = 180°
                                                // object.rotateX(Math.PI * 0.5);
                                                // object.rotateY(-Math.PI * 0);
                                                object.rotateZ(-Math.PI * 0.5);
                                                objjoint6.add(object);
                                              },function(xhr){
                                                  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                                              });
                                            });
                                          },function(xhr){
                                              console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                                          });
                                        },function(xhr){
                                            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                                        });
                                      },function(xhr){
                                          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                                      });
                                    },function(xhr){
                                        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                                    });
                                  },function(xhr){
                                      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                                  });
                              });
                            },function(xhr){
                                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                            });
                      },function(xhr){
                          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                      });

              },function(xhr){
                  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
              });
            });


            controls.update();
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }
            animate();
    }

		function animate() {
      // stats.begin();
			// requestAnimationFrame( animate );
      render();
      // stats.end();
			requestAnimationFrame( animate );
		}
		function render() {
            renderer.render(scene, camera);
    }

  }

	render(){

		return (
            <div >
              <AppBar position="static" style ={{height:'80%'}}>
                <Toolbar>
                  <Typography variant="h6" >
                    基于力传感学习的工业机器人书法云仿真平台
                  </Typography>
                </Toolbar>
              </AppBar>

                <Grid container spacing={2} alignItems="center">

                <Grid item xs>

            <Paper style={paperstyle}>
            <canvas id='canvas1' style={style}>
                </canvas>
            <div >
            <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                <Typography gutterBottom>
                  汉字图像
                </Typography>
                <Card style={{maxWidth: 140}}>
                  <CardMedia image="书法图片.jpg" style={{height: 140}}/>
                </Card>
                </Grid>
                <Grid item xs>
                <Typography gutterBottom>
                  风格迁移
                </Typography>
                <Card style={{maxWidth: 140}}>
                  <CardMedia image="风格迁移1.jpg" style={{height: 140}}/>
                </Card>
                </Grid>
                <Grid item xs>
                <Typography gutterBottom>
                  骨架化
                </Typography>
                <Card style={{maxWidth: 140}}>
                  <CardMedia image="骨架.jpg" style={{height: 140}}/>
                </Card>
                </Grid>
            </Grid>
            <Button variant="contained" color="primary" onClick={this.handleButtonFuwei}>
            复位
            </Button>
            <Button variant="contained" color="primary" onClick={this.handleButtonLogin}>
            登录
            </Button>
            <Button variant="contained" color="primary" onClick={this.timerStart}>
            同步
            </Button>
            <Button variant="contained" color="primary" onClick={this.timerStop}>
            停止同步
            </Button>
            <Button variant="contained" color="primary" onClick={this.timerStop}>
            传入图片
            </Button>
            <Button variant="contained" color="primary" onClick={this.timerStop}>
            风格迁移
            </Button>
            <Button variant="contained" color="primary" onClick={this.timerStop}>
            取骨架
            </Button>
            <Button variant="contained" color="primary" onClick={this.timerStop}>
            生成控制程序
            </Button>
            <Typography gutterBottom>
                {this.state.connectzt}
            </Typography>
            <Typography gutterBottom>
                {this.state.tongbuzt}
            </Typography>
            <Grid container spacing={2} alignItems="center">

                <Grid item xs>
                <Typography gutterBottom>
                  关节一
                </Typography>
                <Slider
                  defaultValue={0}
                  getAriaValueText={valuetext}
                  aria-labelledby="continuous-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  value={this.state.joint1}
                  min={-180}
                  max={180}
                  onChange={this.handle1}
                />
                </Grid>
                <Grid item>
                  <Input
                    style={{
                      width:'50px',
                    }}
                    value={this.state.joint1}
                  />
                </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                <Typography gutterBottom>
                  关节二
                </Typography>
                <Slider
                  defaultValue={0}
                  getAriaValueText={valuetext}
                  aria-labelledby="continuous-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  value={this.state.joint2}
                  min={-130}
                  max={148}
                  onChange={this.handle2}
                />
                </Grid>
                <Grid item>
                  <Input
                    style={{
                      width:'50px',
                    }}
                    value={this.state.joint2}
                  />
                </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                <Typography gutterBottom>
                  关节三
                </Typography>
                <Slider
                  defaultValue={0}
                  getAriaValueText={valuetext}
                  aria-labelledby="continuous-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  value={this.state.joint3}
                  min={-145}
                  max={145}
                  onChange={this.handle3}
                />
                </Grid>
                <Grid item>
                  <Input
                    style={{
                      width:'50px',
                    }}
                    value={this.state.joint3}
                  />
                </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                <Typography gutterBottom>
                  关节四
                </Typography>
                <Slider
                  defaultValue={0}
                  getAriaValueText={valuetext}
                  aria-labelledby="continuous-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  value={this.state.joint4}
                  min={-270}
                  max={270}
                  onChange={this.handle4}
                />
                </Grid>
                <Grid item>
                  <Input
                    style={{
                      width:'50px',
                    }}
                    value={this.state.joint4}
                  />
                </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                <Typography gutterBottom>
                  关节五
                </Typography>
                <Slider
                  defaultValue={0}
                  getAriaValueText={valuetext}
                  aria-labelledby="continuous-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  value={this.state.joint5}
                  min={-115}
                  max={140}
                  onChange={this.handle5}
                />
                </Grid>
                <Grid item>
                  <Input
                    style={{
                      width:'50px',
                    }}
                    value={this.state.joint5}
                  />
                </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                <Typography gutterBottom>
                  关节六
                </Typography>
                <Slider
                  defaultValue={0}
                  getAriaValueText={valuetext}
                  aria-labelledby="continuous-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  value={this.state.joint6}
                  min={-270}
                  max={270}
                  onChange={this.handle6}
                />
                </Grid>
                <Grid item>
                  <Input
                    style={{
                      width:'50px',
                    }}
                    value={this.state.joint6}
                  />
                </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                <Typography gutterBottom>
                  位置X:
                </Typography>
                </Grid>
                <Grid item>
                  <Input
                    style={{
                      width:'50px',
                    }}
                    value={this.state.posx}
                  />
                </Grid>
                <Grid item>
                <Typography gutterBottom>
                  位置Y:
                </Typography>
                </Grid>
                <Grid item>
                  <Input
                    style={{
                      width:'50px',
                    }}
                    value={this.state.posy}
                  />
                </Grid>
                <Grid item>
                <Typography gutterBottom>
                  位置Z:
                </Typography>
                </Grid>
                <Grid item>
                  <Input
                    style={{
                      width:'50px',
                    }}
                    value={this.state.posz}
                  />
                </Grid>

            </Grid>

          </div>
          </Paper>
          <AppBar
            position="static"
            style={{width : '100%' ,marginTop: '20px',}}
          >
            <Tabs value={this.state.tabsvalue} onChange={this.handleTabsChange} aria-label="simple tabs example">
              <Tab label="关节角"  />
              <Tab label="力传感器"  />
            </Tabs>
          </AppBar>
          </Grid>
            <Paper style={paperstyle2}>
            <Grid container spacing={0} alignItems="center" >
                <Grid item>
                <div ref="alarmHighChart1" style={ {width : '100%' , height :'20%'}}/>
                <Typography variant="subtitle1" component="h2">
                  {this.state.chart1title}
                </Typography>
                </Grid>
                <Grid item>
                <div ref="alarmHighChart2" style={ {width : '100%' , height :'20%'}}/>
                <Typography variant="subtitle1" component="h2">
                  {this.state.chart2title}
                </Typography>
                </Grid>
                <Grid item>
                <div ref="alarmHighChart3" style={ {width : '100%' , height :'20%'}}/>
                <Typography variant="subtitle1" component="h2">
                  {this.state.chart3title}
                </Typography>
                </Grid>
                <Grid item>
                <div ref="alarmHighChart4" style={ {width : '100%' , height :'20%'}}/>
                <Typography variant="subtitle1" component="h2">
                  {this.state.chart4title}
                </Typography>
                </Grid>
                <Grid item>
                <div ref="alarmHighChart5" style={ {width : '100%' , height :'20%'}}/>
                <Typography variant="subtitle1" component="h2">
                  {this.state.chart5title}
                </Typography>
                </Grid>
                <Grid item>
                <div ref="alarmHighChart6" style={ {width : '100%' , height :'20%'}}/>
                <Typography variant="subtitle1" component="h2">
                  {this.state.chart6title}
                </Typography>
                </Grid>
            </Grid>
            </Paper>

          </Grid>
          </div>
        );
	}
}

export default ThreeMap;
