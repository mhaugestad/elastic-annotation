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
import { useSpace } from "../../../context/spacecontext";

const TableForm = (props) => {
    const {slug: project_id} = useParams();
    const {labels} = useSpace();
    const { selectedLabels, setSelectedLabels } = props;
    const [isPopoverOpen, setPopover] = useState(false);
    const containerPopoverId = useGeneratedHtmlId({ prefix: 'containerPopover' });

    const togglePopover = () => {
        setPopover(!isPopoverOpen);
      };
    
      const closePopover = () => {
        setPopover(false);
      };
    
      const onChange = (selectedOptions) => {
        props.setSelectedLabels(selectedOptions);
      };
    
    const button = (
        <EuiButton iconType="arrowDown" iconSide="right" onClick={togglePopover}>
          Display labels
        </EuiButton>
    );

    if (!selectedLabels) {
      return <div>...</div>
    }

    return (
        <>
        <EuiFlexItem>
        <EuiComboBox
            prepend="Display text field"
            singleSelection={{ asPlainText: true }}
            options={props.fields}
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
            style={{float:'right', display: 'flex', justifyContent: 'flex-end'}}
        >
        <EuiComboBox
                placeholder="Select labels to display"
                options={labels}
                selectedOptions={selectedLabels}
                onChange={(e)=>onChange(e)}
          />
      </EuiPopover>
      </EuiFlexItem>
    </>
  );
};

export default TableForm;
