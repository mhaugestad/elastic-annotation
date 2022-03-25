import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
import {
  EuiCard,
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiFieldPassword,
} from "@elastic/eui";
import { useAuth } from "../../context/auth";

const Login = () => {
  const { setTokens } = useAuth();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate();

  const handleFormSubmission = (formObject) => {
      console.log(formObject)
      fetch("api/v1/token", 
          {method: 'POST',
          headers: { "Content-Type": "application/json" },
          body:JSON.stringify(formObject)}).then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error ('Invalid login details');
        }
      }).then((json_resp) => {
        setTokens(json_resp.id, json_resp.api_key)
      })
      .catch((error)=>{
        setError(error)
      }).finally(()=> {
        navigate('/spaces')
      })
  }

  return (
    <EuiCard
      title="Login"
      style={{
        position: "fixed",
        top: "40%",
        left: "40%",
        marginTop: "-50px",
        marginLeft: "-100px",
        width: "25%",
      }}
    >
      <EuiForm component="form">
        <EuiFormRow label="Username">
          <EuiFieldText name="username" onChange={(e)=>(setUsername(e.target.value))}/>
        </EuiFormRow>
        <EuiFormRow label="Password">
          <EuiFieldPassword name="password" onChange={(e)=>(setPassword(e.target.value))}/>
        </EuiFormRow>
        <EuiButton onClick={()=>(handleFormSubmission({username:username, password:password}))}>Login</EuiButton>
      </EuiForm>
    </EuiCard>
  );
};

export default Login;
