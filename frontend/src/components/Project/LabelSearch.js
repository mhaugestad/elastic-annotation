import React, {useState} from 'react'
import { useGeneratedHtmlId } from '@elastic/eui';
import { useAuth } from '../../context/auth';
import {
    EuiButton,
    EuiButtonEmpty,
    EuiForm,
    EuiFormRow,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSuperSelect,
    EuiCodeBlock,
    EuiSpacer
  } from '@elastic/eui';

const LabelSearch = (props) => {
    const { HEADERS } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [labelSelected, setLabelSelected] = useState();
    const [labelValue, setLabelValue] = useState('true');

    const [formError, setFormError] = useState();
    const [showErrors, setShowErrors] = useState(false);
  
    const modalFormId = useGeneratedHtmlId({ prefix: 'modalForm' });

    const closeModal = () => {setIsModalVisible(false); console.log(labelSelected)};
    const showModal = () => setIsModalVisible(true);
  
    const labelSelectOptions = props.labels.map((d)=>({value:d, inputDisplay:d}));
    const labelValueOptions = [{value: 'true', inputDisplay: 'True'}, {value: 'false', inputDisplay: 'False'}];
    
    const onLabelChange = (value) => {
        setShowErrors(false)
        setLabelSelected(value);
      };
  
      const onValueChange = (value) => {
          setLabelValue(value);
        };

    const onSubmit = (e) => {
        //e.preventDefault()
        if (labelSelected) {      
            fetch("/api/v1/project/" + props.project_id + "/annotations_by_query/?" + new URLSearchParams({
                field: labelSelected,
                value: labelValue
                  }),
                {headers: new Headers(HEADERS), method: 'POST',  body: JSON.stringify({query: props.query.current.state.value})})
            .then((response) => response.json())
            .then((response) => console.log(response))
            .finally(()=> {
                setTimeout(()=> {
                    props.setUpdatedByQuery(()=>true)
                }, 1000);
            })
            setFormError()
            closeModal()
        } else {
            setShowErrors(true)
            setFormError("Must chose a label field")
        }
    };
  
    const formSample = (
      <EuiForm id={modalFormId} isInvalid={showErrors} error={formError} component="form">  
        <EuiFormRow label="Assign to label:">
          <EuiSuperSelect
            options={labelSelectOptions}
            valueOfSelected={labelSelected}
            onChange={(value) => onLabelChange(value)}
            itemLayoutAlign="top"
            hasDividers
          />
        </EuiFormRow>
        <EuiFormRow label="Value to assign search">
          <EuiSuperSelect
            options={labelValueOptions}
            valueOfSelected={labelValue}
            onChange={(value) => onValueChange(value)}
            itemLayoutAlign="top"
            hasDividers
          />
        </EuiFormRow>
      </EuiForm>
    );
  
    let modal;
  
    if (isModalVisible) {
      modal = (
        <EuiModal onClose={closeModal} initialFocus="[name=popswitch]">
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>Label search by query</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
  
          <EuiModalBody>
              Label all documents that match the query:
              <EuiSpacer />
              <EuiCodeBlock language="javascript" fontSize="m" paddingSize="m">
                  {props.query.current.state.value}
              </EuiCodeBlock>
              {formSample}
          </EuiModalBody>
  
          <EuiModalFooter>
            <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
            <EuiButton type="submit" form={modalFormId} onClick={onSubmit} fill>
              Label data
            </EuiButton>
          </EuiModalFooter>
          {formError && <span>{formError}</span>}
        </EuiModal>
      );
    }
    return (
      <div>
        <EuiButton onClick={showModal}>Label data by query</EuiButton>
        {modal}
      </div>
    );
  };

export default LabelSearch