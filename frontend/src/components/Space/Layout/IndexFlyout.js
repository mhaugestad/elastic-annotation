import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSpace } from "../../../context/spacecontext";
import {
  EuiTitle,
  EuiText,
  useGeneratedHtmlId,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiSelect,
  EuiFieldText,
  EuiFormRow,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";
import CreateIndexForm from "./CreateIndexForm";

const IndexFlyout = (props) => {
  const { slug: space_id } = useParams();
  const {index, indexPatterns} = useSpace();
  const closeFlyout = () => props.setIsFlyoutVisible(false);
  const toggleFlyout = () =>
    props.setIsFlyoutVisible((isVisible) => !isVisible);
  const withoutFocusFlyoutTitleId = useGeneratedHtmlId({
    prefix: "withoutFocusFlyoutTitle",
  });

  const options = indexPatterns.map((item)=> ({value: item.name, label: item.name}))

  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });

  const onChange = (e) => {
    props.setIndex(()=>e.target.value);
  };

  return (
    <EuiFlyout
      ownFocus={false}
      onClose={closeFlyout}
      aria-labelledby={withoutFocusFlyoutTitleId}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="s">
          <h2 id={withoutFocusFlyoutTitleId}>Set existing index-pattern</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiSelect
          id={basicSelectId}
          options={options}
          value={index && index}
          onChange={(e) => onChange(e)}
          aria-label="Use aria labels when no actual label is in use"
        />
      </EuiFlyoutBody>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="s">
          <h2 id={withoutFocusFlyoutTitleId}>Or create a Meltwater Index</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <CreateIndexForm closeFlyout={closeFlyout}/>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default IndexFlyout;
