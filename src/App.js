import React, { Component } from 'react';
import './App.css';
import io from 'socket.io-client';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      messages: [],
      position: [0, 0],
      charMap: [],
      cleanSpace: 0,
      totalSpace: 0,
      finalMessages: []
    }
    this.socket = io("http://localhost:8080");
    this.socket.on('message', (msg)=>{
      //console.log(msg);
      this.setState({
        messages: [msg]
      })
    })
    .on('data refresh', (data)=>{
        //console.log(`The robot is at position: row ${data.position[0]}, column ${data.position[1]}`);
        // console.log(`Progress: ${data.cleanSpace} cleaned out of ${data.totalSpace}`);
        let charmap = data.charMap;
        charmap[data.position[0]][data.position[1]] = '*';
        // console.log(charmap);
        this.setState({
          messages: [
            `Robot Position: row ${data.position[0]}, column ${data.position[1]}`,
            `Progress: ${data.cleanSpace} cleaned out of ${data.totalSpace}`
          ],
          charMap: charmap,
          cleanSpace: data.cleanSpace,
          totalSpace: data.totalSpace,
          position: data.position
        })
    })
    .on('finish', (data)=>{
        console.log(data.msg);
        console.log(`Time Duration: ${data.timeDuration} seconds`);
        this.setState({
          finalMessages: [
            `${data.msg}`,
            `Time Duration: ${data.timeDuration} seconds`
          ]
        })
    })
  }
  handler_start = () => {
    console.log("function_handle_start");
    this.socket.emit('start', {time: new Date().toLocaleTimeString()});
  }
  render() {
    return (
      <div className="App">
        <div>
          <button onClick={this.handler_start}>Start Cleaning</button>
        </div>
        <div>
          <MessageSpan messages={this.state.messages} />
        </div>
        <div>
          <Map charMap={this.state.charMap} position={this.state.position} />
        </div>
        <div>
          <MessageSpan messages={this.state.finalMessages} />
        </div>
      </div>
    );
  }
}
class MessageSpan extends Component {
  createMessageList(){
    let messageList = []
    this.props.messages.forEach(element => {
      messageList.push(<p>{element}</p>);
    });
    return messageList;
  }
  render(){
    return (
    <div>
      {this.createMessageList()}
    </div>
    );
  }
}
class Map extends Component {
  createMap() {
    let tableLines = [];
    let data = this.props.charMap;
    for(let i=0; i<data.length; i++){
      let tableColumns = [];
      for(let j=0; j<data[i].length; j++){
        tableColumns.push(<div className='Cell'>{data[i][j]}</div>)
      }
      tableLines.push(
        <div>{tableColumns}</div>
      )
    }
    return tableLines;
  }
  render() {
    return(
      <div>
        {this.createMap()}
      </div>
    );
  }
}

export default App;
