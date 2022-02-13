import React from 'react'

import {
    EuiFieldText,
    EuiFormRow,
  } from "@elastic/eui";

const DescriptionFormRow = (props) => {
    return (
        <EuiFormRow label="Description">
        <EuiFieldText
          name="description"
          onChange={(event) =>
            props.setNewDescription(event.target.value)
          }
          value = {props.description}
        />
      </EuiFormRow>
    )
}

export default DescriptionFormRow;