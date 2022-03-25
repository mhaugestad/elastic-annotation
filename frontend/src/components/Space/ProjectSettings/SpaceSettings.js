import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  EuiCard,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiText,
  EuiHorizontalRule,
  EuiSpacer,
} from "@elastic/eui";
import { useAuth } from "../../../context/auth";
import { useSpace } from "../../../context/spacecontext";
import UploadData from "./UploadData";
import LabelFormRow from "./LabelFormRow";
import TitleFormRow from "./TitleFormRow";
import ButtonsFormRow from "./ButtonsFormRow";
import AnalysisList from "./AnalysisList";

const SpaceSettings = (props) => {
  const { HEADERS } = useAuth();
  const { index, tasks, setTasks, labels, setLabels } = useSpace();
  const { slug: space_id } = useParams();
  const { slug: project_id } = useParams();
  const [selectedOptions, setSelected] = useState([]);

  const [projectTitle, setProjectTitle] = useState("");
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const onClickDownload = () => {
    fetch(`/api/v1/index-patterns/download_csv?index-patterns=${index}`, {
      method: "GET",
      headers: new Headers(HEADERS),
    })
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
      .catch(setError);
  };

  const onClickTask = () => {
    fetch("/api/v1/index-patterns/dummy_task", {
      method: "GET",
      headers: new Headers(HEADERS),
    })
      .then((response) => response.json())
      .then((response) => {
        let tmpTasks = tasks;
        tmpTasks[response.task_id] = {
          task_id: response.task_id,
          "index-pattern": "my-index-pattern",
        };
        setTasks(tmpTasks);
        localStorage.setItem("tasks", JSON.stringify(tmpTasks));
      })
      .catch(setError);
  };

  const onTopicClick = () => {
    fetch("/api/v1/project/" + project_id + "/topic_map", {
      method: "POST",
      headers: new Headers(HEADERS),
    })
      .then((response) => response.json())
      .catch(setError);
  };

  if (notFound) {
    return <Navigate to="/" />;
  } else {
    return (
      <>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiCard>
              <EuiText textAlign="left">
                <h2>Project Settings</h2>
              </EuiText>
              <EuiHorizontalRule />
              {labels && index && (
              <EuiForm id="1" component="form">
                <TitleFormRow title={index} />
                <LabelFormRow
                  setLabels={setLabels}
                  labels={labels}
                  index={index}
                />
                <ButtonsFormRow index={index} labels={labels} />
              </EuiForm>
              )}
              <EuiText textAlign="left">
                <h2>Upload Data</h2>
              </EuiText>
              <EuiHorizontalRule />
              <UploadData />
              <EuiSpacer />
              <EuiSpacer />
              <EuiText textAlign="left">
                <h2>Download Data</h2>
              </EuiText>
              <EuiHorizontalRule />
              <EuiButton onClick={onClickDownload} style={{ float: "left" }}>
                Download data
              </EuiButton>
              <EuiButton onClick={onClickTask}>Create dummy task</EuiButton>
            </EuiCard>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard>
              <EuiText textAlign="left">
                <h2>Analysis</h2>
              </EuiText>
              <EuiHorizontalRule />
              <AnalysisList />
            </EuiCard>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }
};
export default SpaceSettings;
