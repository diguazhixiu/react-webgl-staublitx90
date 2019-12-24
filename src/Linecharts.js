import React, { Component } from "react";
import { render } from "react-dom";
import { VictoryChart , VictoryLine} from "victory";
import moment from 'moment'
export default class PieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
       data: this.getData(),
       size: this.getSize()
    };
  }
  componentDidMount() {
    this.setStateInterval = window.setInterval(() => {
      this.setState({
        data: this.getData(),
        size: this.getSize()
      });
      console.log(this.state.data);
    }, 3000);
  }
  componentWillUnmount() {
    window.clearInterval(this.setStateInterval);
  }
  getData() {
    const num = 10;
    const points = new Array(num).fill(1);
    return points.map((point, index) => {
      return { x: index + moment().format('mm:ss'), y: index+1 };
    });
  }
  getSize() {
    return Math.random() * 10
  }
  render() {
    return (
      <div>
      <VictoryChart
        // domain={{ y: [0, 1] }}
        animate={{ duration: 2000 }}
      >
      <VictoryLine classname ='line'
        size={this.state.size}
        data={this.state.data}
        // style={{ data: { opacity: ({ datum }) => datum.opacity || 1 } }}
        animate={{
          animationWhitelist: ["style", "data", "size"], // Try removing "size"
          onExit: {
            duration: 500,
            before: () => ({ opacity: 0.3, _y: 0 })
          },
          onEnter: {
            duration: 500,
            before: () => ({ opacity: 0.3, _y: 0 }),
            after: (datum) => ({ opacity: 1, _y: datum._y })
          }
        }}
      />
      </VictoryChart>

      </div>
      );
  }
}

