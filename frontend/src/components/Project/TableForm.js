import React, {useEffect, useState} from "react";
import { useGeneratedHtmlId } from '@elastic/eui';
import { useParams } from 'react-router-dom';
import {
    EuiFlexItem,
    EuiFlexGroup,
    EuiComboBox,
    EuiButton,
    EuiPopover,
    EuiFormRow,
    EuiModal,
    EuiModalBody,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSpacer,
  } from '@elastic/eui';

const TableForm = (props) => {
    const {slug: project_id} = useParams();
    const [options, setOptions] = useState();
    const [selectedOptions, setSelected] = useState(options);
    const [isPopoverOpen, setPopover] = useState(false);
    const containerPopoverId = useGeneratedHtmlId({ prefix: 'containerPopover' });

    useEffect(()=>{
      setOptions(()=>props.labels.map((lab) => ({label: lab})))
    },[props.labels])

    const togglePopover = () => {
        setPopover(!isPopoverOpen);
      };
    
      const closePopover = () => {
        setPopover(false);
      };
    
      const onChange = (selectedOptions) => {
        props.setSelected(selectedOptions);
      };
    
    const button = (
        <EuiButton iconType="arrowDown" iconSide="right" onClick={togglePopover}>
          Display labels
        </EuiButton>
    );

    if (!options) {
      return <div>...</div>
    }

    return (
        <>
        <EuiFlexItem>
        <EuiComboBox
            prepend="Display text field"
            singleSelection={{ asPlainText: true }}
            options={props.fields.map((v) => ({ label: v }))}
            selectedOptions={props.chosenField}
            onChange={(e) => {
                props.setChosenField(e);
                localStorage.setItem(project_id, JSON.stringify(e));
            }}/>
        </EuiFlexItem>
        <EuiFlexItem>
        <EuiPopover
            id={containerPopoverId}
            button={button}
            isOpen={isPopoverOpen}
            closePopover={closePopover}
        >
        <EuiComboBox
                placeholder="Select labels to display"
                options={options}
                selectedOptions={props.selectedOptions}
                onChange={(e)=>onChange(e)}
          />
      </EuiPopover>
      </EuiFlexItem>
    </>
  );
};

export default TableForm;
