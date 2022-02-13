import React, { useState } from "react";
import { useAuth } from "../../../context/auth";
import {
    EuiButton,
    EuiFormRow,
    EuiConfirmModal,
  } from "@elastic/eui";
import { useParams, useNavigate } from 'react-router-dom';

const ButtonsFormRow = (props) => {
    const { HEADERS } = useAuth();
    const navigate = useNavigate()
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const closeDeleteModal = () => setIsDeleteModalVisible(false);
    const showDeleteModal = () => setIsDeleteModalVisible(true);

    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const closeUpdateModal = () => setIsUpdateModalVisible(false);
    const showUpdateModal = () => setIsUpdateModalVisible(true);
    
    const handleDelete = () => {
        fetch('/api/v1/project/' + props.project_id, {method:'DELETE', headers: new Headers(HEADERS)})
        .then((resp)=> {
          if (resp.ok) {
            navigate('/projects')
          } else {
            throw new Error('Something went wrong');
          }
        });
      };

    const handleUpdate = () => {
        fetch('/api/v1/project/' + props.project_id, 
        {method:'PUT', headers: new Headers(HEADERS), body: JSON.stringify({project_name: props.project_name, 
                                                               description: props.description,
                                                               labels: props.labels.map((data)=>(data.value))})})
        .then((resp)=> resp.json())
        .catch(error => error);

        closeUpdateModal()
      };

    let deleteModal;
    if (isDeleteModalVisible) {
      deleteModal = (
        <EuiConfirmModal
          title="Delete project"
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
          cancelButtonText="No, go back"
          confirmButtonText="Yes, delete"
          buttonColor="danger"
          defaultFocusedButton="confirm"
        >
          <p>You&rsquo;re about to delete this project.</p>
          <p>Are you sure you want to do this?</p>
        </EuiConfirmModal>
      );
    }

    let updateModal;

    if (isUpdateModalVisible) {
      updateModal = (
        <EuiConfirmModal
          title="Update project settings"
          onCancel={closeUpdateModal}
          onConfirm={handleUpdate}
          cancelButtonText="No, go back"
          confirmButtonText="Yes, update"
          defaultFocusedButton="confirm"
        >
          <p>You&rsquo;re about to update project settings.</p>
          <p>Are you sure you want to do this?</p>
        </EuiConfirmModal>
      );
    }
    return (
        <>
        <EuiFormRow>
        <div style={{ float: "right" }}>
          <EuiButton
            color="danger"
            style={{ marginRight: "10px" }}
            onClick={showDeleteModal}
          >
            Delete project
          </EuiButton>
          <EuiButton color="success" onClick={showUpdateModal}>
            Update project
          </EuiButton>
        </div>
      </EuiFormRow>
      {deleteModal}
      {updateModal}
      </>
    )
}

export default ButtonsFormRow;