import {  Component, } from 'react';
import  React  from 'react';
//import { Link } from "react-router-dom";

import { Container, Button, Form, FormGroup, Label, Input } from 'reactstrap';
var sha = require("sha1")
var axios = require("axios")

export default class  StudentHome extends Component {
  constructor(props){
    super(props);
    this.state = {
      error:0,
      username: "",
      password: "",

  };
  
  }

  login = ()=> {
    let json_data = {
        sbu_id: this.state.username,
        password: sha(this.state.password + "SaltAndP3pp3r!ghtialkdsflkavnlkanfalglkahtklagnalfkja")

    }

    axios.withCredentials=true
    axios({
      method: 'POST',
      url: `http://localhost:3001/students/login`,
      data:  json_data,
      // responseType: 'json',
      headers: {
        Accept: 'application/json',

        'Content-Type': 'application/json'
      },          credentials: 'same-origin',

      withCredentials: true

    }).then((response) => {
      response.json()
      window.location.reload(true)


    }).catch((response) => {
      // dispatch(pushState(null, '/error'));
      window.location.reload(true)
    }) 




}

  render(){
  return (
    <Container style={{display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
      <Form>
        <FormGroup>
          <Label for="login_id">ID</Label>
          <Input type="text" name="id" id="login_id" placeholder="studentID" style={{width:200}}  onChange = {e=> this.setState( {username: e.target.value })} />
        </FormGroup>
        <FormGroup>
          <Label for="login_password">Password</Label>
          <Input type="password" name="password" id="login_password" placeholder="" style={{width:200}} onChange = {e=> this.setState( {password: e.target.value })} />
      </FormGroup>                           
      
        <Button onClick ={this.login}>Submit</Button>

      </Form>
    </Container>
  );
}
}
