import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useGeneratedHtmlId } from "@elastic/eui";
import {
  EuiButton,
  EuiForm,
  EuiSelect,
  EuiFlexItem,
  EuiPanel,
  EuiFormRow,
  EuiFilePicker,
  EuiFlexGroup,
  EuiGlobalToastList
} from "@elastic/eui";
import { useAuth } from "../../context/auth";

const UploadData = (props) => {
  const { HEADERS } = useAuth();
  //const {api_key_id, api_key} = HEADERS
  const { slug: project_id } = useParams();
  const filePickerId = useGeneratedHtmlId({ prefix: "filePicker" });
  const [files, setFiles] = useState({});
  const [indexMapping, setIndexMapping] = useState({});
  const isInitialMount = useRef(true);
  const [toasts, setToasts] = useState([]);

  const removeToast = (removedToast) => {
    setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
  };

  const onChange = (files) => {
    setFiles(files.length > 0 ? Array.from(files) : []);
    console.log(files)
  };

  const read = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsText(blob);
    });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (files[0]) {
        read(files[0]).then((result) => {
          const headers = result.slice(0, result.indexOf("\n")).split(",");
          setIndexMapping(
            headers.reduce((a, v) => ({ ...a, [v]: "text" }), {})
          );
        });
      }
    }
  }, [files]);

  const handleVariableType = (key, value) => {
    setIndexMapping((prevState) => {
      return { ...prevState, [key]: value };
    });
  };

  const handleUpload = () => {
    let formData = new FormData();
    formData.append("csv_files", files[0]);
    
    Promise.all([
      fetch("/api/v1/project/" + project_id + "/mapping", {
        method: "PUT",
        headers: new Headers(HEADERS),
        body: JSON.stringify({ mapping: indexMapping }),
      }),
      fetch("/api/v1/project/" + project_id + "/upload_csv", {
        method: "POST",
        headers: new Headers({"api-key-id": HEADERS['api-key-id'], 'api-key':HEADERS['api-key']}),
        body: formData
      })
      .then((response)=>{
        if (response.ok) {
          setToasts([      {
            title: 'Download complete!',
            color: 'success',
            text: <p>Thanks for your patience!</p>,
          },])
        }
      }),
    ]).catch((e) => console.log(e))
  };

  return (
    <>
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiPanel>
          <EuiFormRow label="Upload data">
            <EuiFilePicker
              id={filePickerId}
              ref={isInitialMount}
              multiple
              initialPromptText="Select or drag and drop files"
              onChange={onChange}
              aria-label="Upload data"
            />
          </EuiFormRow>
          {files.length > 0 && (
            <EuiButton onClick={handleUpload}>Upload Data to Index</EuiButton>
          )}
        </EuiPanel>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPanel>
          {files.length > 0 && (
            <EuiForm component="form">
              {Object.keys(indexMapping).map((item, i) => (
                <EuiFormRow label={item}>
                  <EuiSelect
                    value={indexMapping[item]}
                    onChange={(e) => handleVariableType(item, e.target.value)}
                    options={[
                      { value: "text", text: "Text" },
                      { value: "keyword", text: "Keyword" },
                      { value: "date", text: "Date" },
                      { value: "integer", text: "Integer" },
                      { value: "float", text: "Float" },
                    ]}
                  />
                </EuiFormRow>
              ))}
            </EuiForm>
          )}
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
    
    <EuiGlobalToastList
      toasts={toasts}
      dismissToast={removeToast}
      toastLifeTimeMs={6000}
    />
    </>
  );
};

export default UploadData;
