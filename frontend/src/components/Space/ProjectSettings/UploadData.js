import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useGeneratedHtmlId } from "@elastic/eui";
import {
  EuiButton,
  EuiForm,
  EuiSelect,
  EuiSpacer,
  EuiFlexItem,
  EuiPanel,
  EuiFormRow,
  EuiFilePicker,
  EuiFlexGroup,
  EuiGlobalToastList,
} from "@elastic/eui";
import { useAuth } from "../../../context/auth";
import { useSpace } from "../../../context/spacecontext";

const UploadData = (props) => {
  const { HEADERS } = useAuth();
  const { index, tasks, setTasks, setToasts, toasts } = useSpace();
  const { slug: project_id } = useParams();
  const filePickerId = useGeneratedHtmlId({ prefix: "filePicker" });
  const [files, setFiles] = useState({});

  const onChange = (files) => {
    setFiles(()=>files.length > 0 ? Array.from(files) : []);
  };

  const handleUpload = () => {
    let formData = new FormData();
    formData.append("csv_files", files[0]);
    fetch(`/api/v1/index-patterns/upload_data?index_pattern=${index}`, {
      method: "POST",
      headers: new Headers({
        "api-key-id": HEADERS["api-key-id"],
        "api-key": HEADERS["api-key"],
      }),
      body: formData,
    })
      .then(async (resp) => {
        if (!resp.ok) {
          throw await resp.json();
        }
        return resp.json();
      })
      .then((resp) => {
        setTasks((prevValue)=>[...prevValue, ...resp]);
        setToasts(()=>[{title: 'Uploading file', text: (<p>Started uploading file(s)</p>)}])
      })
      .catch((error) => {
        setToasts(()=>[error.detail])
      })
      .finally(setFiles(()=>[]));
  };
  return (
    <>
      <EuiFormRow>
        <EuiFilePicker
          id={filePickerId}
          multiple
          initialPromptText="Select or drag and drop files"
          onChange={onChange}
        />
      </EuiFormRow>
      {files.length > 0 && (
        <EuiButton
          onClick={handleUpload}
          style={{ float: "left" }}
          isDisabled={!index}
        >
          Upload Data to Index
        </EuiButton>
      )}
    </>
  );
};

export default UploadData;
