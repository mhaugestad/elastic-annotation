import React, { useState } from "react";
import { useAuth } from "../../../context/auth";
import { useParams } from "react-router-dom";
import {
  EuiFormRow,
  EuiButton,
  EuiButtonEmpty,
  EuiSelect,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiForm,
} from "@elastic/eui";

const LabelModal = (props) => {
    const { HEADERS } = useAuth();
    const { slug: project_id } = useParams();
    const closeModal = () => props.setIsModalVisible(false);
    const showModal = () => props.setIsModalVisible(true);
    const [labelValue, setLabelValue] = useState(true);
    const labelValueOptions = [{value: true, label:'True'}, {value:false, label:'False'}]

    const handleBulkAnnotation = (items) => {
        fetch(`/api/v1/project/${project_id}/annotations`, {
          headers: new Headers(HEADERS),
          method: "PUT",
          body: JSON.stringify({ annotations: items }),
        })
          .then((response) => response.json())
          .catch((e) => console.log(e))
      };
    
    const submitAnnotations = (e) => {
        //e.preventDefault()
        let items_for_es = props.selected.points.map((item) => {
            return {
            id: item.id,
            annotations: { [props.selectedLabel] : labelValue }
          }}
        )
        handleBulkAnnotation(items_for_es);
        setTimeout(()=> {
          props.setSelectedLabel('None')
          props.setReloadData(()=>true)
        }, 1000);
        closeModal()
    }

    const formSample = (
        <EuiForm id='asdjiugiub' component="form">
          <EuiFormRow label="Label documents">
            <EuiSelect
              options={props.labels}
              valueOfSelected={props.selectedLabel}
              onChange={(e) => props.setSelectedLabel(e.target.value)}
              itemLayoutAlign="top"
              hasDividers
            />
          </EuiFormRow>
          <EuiFormRow>
          <EuiSelect
              options={labelValueOptions}
              valueOfSelected={labelValue}
              onChange={(value) => setLabelValue(value)}
              itemLayoutAlign="top"
              hasDividers
            />
          </EuiFormRow>
        </EuiForm>
      );

    let modal;

    if (props.isModalVisible) {
        modal = (
          <EuiModal onClose={closeModal} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>Label Highlighted Points</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
    
            <EuiModalBody>{formSample}</EuiModalBody>
    
            <EuiModalFooter>
              <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
              <EuiButton type="submit" form='asdjiugiub' onClick={(e)=>submitAnnotations(e,props.selectedLabel)} fill>
                Label points
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        );
      }
    
    return (
        <>
        {modal}
        </>
    );
};

export default LabelModal;