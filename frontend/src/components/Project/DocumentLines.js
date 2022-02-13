import React, { useState, useEffect } from "react";
import { HEADERS } from "../../utils/configs";
import { useParams } from "react-router-dom";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiIcon,
  EuiBadge,
  EuiComboBox,
} from "@elastic/eui";

const DocumentLines = (props) => {
  const { slug: project_id } = useParams();
  const [annotations, setAnnotations] = useState(
    props.data.map((d) => {
      let false_labels = props.labels.reduce((a, v) => ({ ...a, [v]: false }), {});
      return {
        id: d._id,
        annotations: { ...false_labels, ...d._source?.annotations },
      };
    })
  );

  const [toggleAllIndicator, setToggleAllIndicator] = useState(
    props.labels.reduce((a, v) => ({ ...a, [v]: false }), {})
  );

  const handleSingleAnnotation = (item) => {

    fetch("/api/v1/project/" + project_id + '/annotations/' + item.id,
        { headers: HEADERS, method: 'PUT', body: JSON.stringify(item)})
      .then((response) => response.json())
      .catch((e) => console.log(e))
      .finally(() => (console.log('SUCCESS')))};

  const handleBulkAnnotation = (items) => {
    fetch("/api/v1/project/" + project_id + '/annotations',
    { headers: HEADERS, method: 'PUT', body: JSON.stringify({annotations: items})})
      .then((response) => response.json())
      .catch((e) => console.log(e))
      .finally(() => (console.log('SUCCESS')))};

  const [icon, setIcon] = useState(true);
  const toggleIcon = (idx, label) => {
    let items = [...annotations];
    let item = { ...items[idx] };
    item["annotations"][label] = !item["annotations"][label];
    items[idx] = item;
    setAnnotations(items);
    handleSingleAnnotation(item)
    console.log(annotations)
  };

  const toggleAllIcons = (label, toggler) => {
    let items = annotations.map((item) => ({
      id: item.id,
      annotations: { ...item.annotations, [label]: toggler },
    }));
    setAnnotations((prevValue) => [...items]);
    setToggleAllIndicator((prevValue) => ({
      ...prevValue,
      [label]: !prevValue[label],
    }));
    handleBulkAnnotation(items)
  };
  console.log(props.chosenField)

  if (!props.chosenField) {
    return <div>No field</div>
  }
  return (
    <>
      <DocumentLinesHeader
        labels={props.labels}
        onClick={toggleAllIcons}
        toggleAllIndicator={toggleAllIndicator}
        fields={props.fields}
        chosenField={props.chosenField}
        setChosenField={props.setChosenField}
      />
      {!props.loadingData &&
        props.data.map((arr, index) => (
          <EuiFlexGroup style={{ paddingTop: index === 0 ? "10px" : "0px", width:'100%', overflow: 'auto' }}>
            <EuiFlexItem grow={true}>
              <TextCard text={arr._source[props.chosenField[0].label]} />
            </EuiFlexItem>
            {props.labels.map((label, idx) => (
              <EuiFlexItem
                style={{ margin: "auto", width: "50%", padding: "10px" }}
              >
                <EuiIcon
                  type={
                    annotations[index]["annotations"][label]
                      ? "checkInCircleFilled"
                      : "crossInACircleFilled"
                  }
                  style={
                    annotations[index]["annotations"][label]
                      ? { fill: "#008000", height: "20px" }
                      : { fill: "#8b0000" }
                  }
                  key={label}
                  onClick={() => toggleIcon(index, label)}
                  size="xxl"
                />
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        ))}
    </>
  );
};

const DocumentLinesHeader = (props) => {
  const { slug: project_id } = useParams();
  return (
    <>
      <EuiFlexGroup style={{ borderBottom: "1px solid black", overflow: 'auto'}}>
        <EuiFlexItem grow={false} style={{ width: "40%"}}>
          <EuiComboBox
            fullWidth={true}
            prepend="Chose field"
            singleSelection={{ asPlainText: true }}
            options={props.fields.map((v) => ({ label: v }))}
            selectedOptions={props.chosenField}
            onChange={(e) => {
              props.setChosenField(e);
              localStorage.setItem(project_id, JSON.stringify(e))
            }}
          />
        </EuiFlexItem>
        {props.labels.map((lab, index) => (
          <EuiFlexItem style={{ margin: "auto", width: "50%", padding: "10px" }}>
            <EuiBadge
              iconType={props.toggleAllIndicator[lab] ? "check" : "cross"}
              onClickAriaLabel="click"
              onClick={() => props.onClick(lab, !props.toggleAllIndicator[lab])}
            >
              {lab}
            </EuiBadge>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </>
  );
};

const TextCard = (props) => {
  const [expandText, setExpandText] = useState(true);
  const expandHandler = () => {
    setExpandText((prevValue) => !prevValue);
  };
  return (
    <EuiCard style={{width:'100%'}}>
      {!props.text ? (
        <div>No data in this field</div>
      ) : props.text.length <= 200 ? (
        props.text
      ) : expandText ? (
        <div>
          {String(props.text).slice(0, 200)}
          <a onClick={expandHandler}>...read more</a>
        </div>
      ) : (
        <div>
          {props.text}
          <a onClick={expandHandler}>...read less</a>
        </div>
      )}
    </EuiCard>
  );
};

export default DocumentLines;
