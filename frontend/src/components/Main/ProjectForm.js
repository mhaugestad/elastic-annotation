import React, { useState } from "react";
import { useAuth } from "../../context/auth";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalFooter,
} from "@elastic/eui";

const ProjectForm = (props) => {
  const { HEADERS } = useAuth();
  const validSlug = new RegExp("^[a-z][a-z-]*[a-z]$");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [formErrors, setFormErrors] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const handleCreate = (e) => {
    //e.preventDefault()

    if (validSlug.test(newProjectName)) {
      fetch("/api/v1/project", {
        method: "POST",
        headers: new Headers(HEADERS),
        body: JSON.stringify({
          project_name: newProjectName,
          description: newProjectDescription,
        }),
      })
        .then((resp) => resp.json())
        .then((response) => {
          props.setProjects((prevValue)=> [...prevValue, {project_name: newProjectName, description: newProjectDescription}])
          closeModal();
          setNewProjectName("");
          setNewProjectDescription("");
        })
        .catch((error) => {
          setShowErrors(true);
          setFormErrors(["Server-side error"]);
        })
    } else {
      setShowErrors(true);
      setFormErrors(["Could not validate input!"]);
    }
  };

  const formSample = (
    <EuiForm id="1" component="form" isInvalid={showErrors} error={formErrors}>
      <EuiFormRow label="Project name">
        <EuiFieldText
          name="project_name"
          onChange={(event) => setNewProjectName(event.target.value)}
        />
      </EuiFormRow>
      <EuiFormRow label="Description">
        <EuiFieldText
          name="description"
          onChange={(event) => setNewProjectDescription(event.target.value)}
        />
      </EuiFormRow>
    </EuiForm>
  );

  let modal;

  if (isModalVisible) {
    modal = (
      <EuiModal onClose={closeModal} initialFocus="[name=name]">
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h1>Create new project</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>{formSample}</EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>

          <EuiButton onClick={handleCreate} fill>
            Create
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  }
  return (
    <div>
      <EuiButton onClick={showModal} style={{ marginLeft: "40%" }}>
        Create new project
      </EuiButton>
      {modal}
    </div>
  );
};

export default ProjectForm;
