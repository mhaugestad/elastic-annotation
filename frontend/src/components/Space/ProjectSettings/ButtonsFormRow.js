import React, { useState } from "react";
import { useAuth } from "../../../context/auth";
import { useSpace } from "../../../context/spacecontext";
import { EuiButton, EuiFormRow, EuiConfirmModal } from "@elastic/eui";
import { useParams, useNavigate } from "react-router-dom";

const ButtonsFormRow = (props) => {
  const { HEADERS } = useAuth();
  const { index, labels } = useSpace();
  const navigate = useNavigate();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const closeDeleteModal = () => setIsDeleteModalVisible(false);
  const showDeleteModal = () => setIsDeleteModalVisible(true);

  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const closeUpdateModal = () => setIsUpdateModalVisible(false);
  const showUpdateModal = () => setIsUpdateModalVisible(true);

  const handleUpdate = () => {
    fetch("/api/v1/index-patterns/labels", {
      method: "PUT",
      headers: new Headers(HEADERS),
      body: JSON.stringify({
        index: index,
        labels: labels,
      }),
    })
      .then((resp) => resp.json())
      .catch((error) => error);
    closeUpdateModal();
  };
  return (
    <>
      <EuiFormRow>
        <EuiButton color="success" style={{float:'right'}} onClick={showUpdateModal} isDisabled={!index}>
          Update labels
        </EuiButton>
      </EuiFormRow>
      {isUpdateModalVisible && (
        <EuiConfirmModal
          title="Update project settings"
          onCancel={closeUpdateModal}
          onConfirm={handleUpdate}
          cancelButtonText="No, go back"
          confirmButtonText="Yes, update"
          defaultFocusedButton="confirm"
        >
          <p>You&rsquo;re about to update the labels for index: 
            <br />
            <br />
            <b>{`${index}`}</b>
            </p>
          <p>Are you sure you want to do this?</p>
        </EuiConfirmModal>
      )}
    </>
  );
};

export default ButtonsFormRow;
