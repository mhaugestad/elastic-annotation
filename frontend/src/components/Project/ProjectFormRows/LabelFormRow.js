import React, { useState } from "react";
import {
  EuiFormRow,
  EuiComboBox,
  EuiHighlight,
  EuiHealth,
} from "@elastic/eui";

import {
  euiPaletteColorBlind,
  euiPaletteColorBlindBehindText,
} from "@elastic/eui";

const LabelFormRow = (props) => {
  const visColors = euiPaletteColorBlind();
  const visColorsBehindText = euiPaletteColorBlindBehindText();

  const [options, setOptions] = useState([]);
  //const [selectedOptions, setSelected] = useState([]);

  const onChange = (selectedOptions) => {
    props.setLabels(selectedOptions);
  };

  const onCreateOption = (searchValue, flattenedOptions = []) => {
    if (!searchValue) {
      return;
    }
    const normalizedSearchValue = searchValue.trim().toLowerCase();
    if (!normalizedSearchValue) {
      return;
    }
    const newOption = {
      value: searchValue,
      label: searchValue,
    };

    // Create the option if it doesn't exist.
    if (
      flattenedOptions.findIndex(
        (option) => option.label.trim().toLowerCase() === normalizedSearchValue
      ) === -1
    ) {
      options.push(newOption);
      setOptions([...options, newOption]);
    }

    // Select the option.
    props.setLabels((prevSelected) => [...prevSelected, newOption]);
  };

  const renderOption = (option, searchValue, contentClassName) => {
    const { color, label, value } = option;
    const dotColor = visColors[visColorsBehindText.indexOf(color)];
    return (
      <EuiHealth color={dotColor}>
        <span className={contentClassName}>
          <EuiHighlight search={searchValue}>{label}</EuiHighlight>
          &nbsp;
          <span>({value.size})</span>
        </span>
      </EuiHealth>
    );
  };

  return (
    <EuiFormRow label="Labels">
      <EuiComboBox
        aria-label="Accessible screen reader label"
        placeholder="Select or create options"
        options={options}
        selectedOptions={props.labels}
        onChange={onChange}
        onCreateOption={onCreateOption}
        renderOption={renderOption}
      />
    </EuiFormRow>
  );
};

export default LabelFormRow;
