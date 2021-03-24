import React, { Component } from "react";

function sayHello(params) {
  fetch("https://arcane-crag-38492.herokuapp.com/students/allStudents").then(response =>
    response.json().then(data => ({
      data: data,
      status: response.status
    })
    ).then(res => {
      console.log(res.status, res.data)
    }));

}

export default class App extends Component {
  constructor(props) {
    super();
    this.state = {
      students: []
    };
  }



  render() {
    return (
      <div className="container">
        <button onClick={sayHello}>Default</button>

      </div>
    )
  }

}