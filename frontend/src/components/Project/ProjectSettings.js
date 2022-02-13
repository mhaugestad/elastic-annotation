import React, { useState, useEffect } from "react";
import { useParams, Navigate } from 'react-router-dom';
import {
  EuiCard,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton
} from "@elastic/eui";
import { useAuth } from "../../context/auth";
import LabelFormRow from "./ProjectFormRows/LabelFormRow";
import TitleFormRow from "./ProjectFormRows/TitleFormRow";
import DescriptionFormRow from "./ProjectFormRows/DescriptionFormRow";
import ButtonsFormRow from "./ProjectFormRows/ButtonsFormRow";

const ProjectSettings = (props) => {
  const { HEADERS } = useAuth();
  const {slug: project_id} = useParams();
  const [ProjectDescription, setProjectDescription] = useState("");
  const [selectedOptions, setSelected] = useState([]);
  
  const [projectTitle ,setProjectTitle] = useState("");
  const [newDescription ,setNewDescription] = useState("");
  const [newLabels ,setNewLabels] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
    fetch('/api/v1/project/' + project_id, {method: 'GET', headers: new Headers(HEADERS) })
      .then((response) => {
        if (response.status=='404') {
          setNotFound(()=>true)
        }
        return response.json()
      })
      .then((response_json) => {
        setProjectTitle(response_json.project_name)
        setNewDescription(response_json.description)
        setNewLabels(response_json.labels ? response_json.labels.map((data)=>({value:data, label:data})) : []);
      })
      .catch(setError)
      .finally(setLoading(false));
  },[])

  const onClickDownload = () => {
    fetch('/api/v1/project/' + project_id + "/download_csv", {method: 'GET', headers: new Headers(HEADERS) })
    .then((response) => response.blob())
    .then((blob) => window.URL.createObjectURL(blob))
    .then((uri) => {
      var link = document.createElement("a");
      link.href = uri;
      link.download = "export.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(setError)
  }

  const onTopicClick = () => {
    fetch('/api/v1/project/' + project_id + "/topic_map", {method: 'POST', headers: new Headers(HEADERS) })
    .then((response) => response.json())
    .catch(setError)
    .finally(console.log("finito!"));
  }

  if (notFound) {
    return <Navigate to='/'/>
  } else {

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiCard>
            <EuiForm id="1" component="form">
              <TitleFormRow title={projectTitle}/>
              <DescriptionFormRow description={newDescription} setNewDescription={setNewDescription}/>
              <LabelFormRow setLabels={setNewLabels} labels={newLabels}/>
              <ButtonsFormRow project_id={project_id} project_name={projectTitle} description={newDescription} labels={newLabels}/>
            </EuiForm>
          </EuiCard>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiCard>
            <EuiButton onClick={onClickDownload}>Download data</EuiButton>
          </EuiCard>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiCard>
            <EuiButton onClick={onTopicClick}>Create topic map</EuiButton>
          </EuiCard>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
};
export default ProjectSettings;
