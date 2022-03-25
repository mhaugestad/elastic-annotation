import React from "react";

import {
    EuiFieldText,
    EuiFormRow,
  } from "@elastic/eui";

const TitleFormRow = (props) => {
  return (
    <EuiFormRow label={props.title}>
      <EuiFieldText
      prepend='Current index: '
      name="name" 
      value={props.title} 
      isDisabled />
    </EuiFormRow>
  );
};

export default TitleFormRow;