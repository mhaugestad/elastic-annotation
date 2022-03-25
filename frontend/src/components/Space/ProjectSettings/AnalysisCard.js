import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useGeneratedHtmlId } from "@elastic/eui";
import {
  EuiButton,
  EuiCard,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiLink,
  EuiSelect,
  EuiFlyout,
  EuiTitle,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiCallOut
} from "@elastic/eui";
import { useAuth } from "../../../context/auth";
import { useSpace } from "../../../context/spacecontext";

const AnalysisCard = (props) => {
  const { index } = useSpace();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  return (
    <>
      <EuiCard
        icon={<EuiIcon size="m" type="visMetric" />}
        title={props.analysis.name}
        description={props.analysis.last_run}
        footer={
          <div>
            <EuiButton 
            onClick={() => setIsFlyoutVisible(true)}
            >
              Go for it
            </EuiButton>
          </div>
        }
      />
      {isFlyoutVisible && (
        <AnalysisFlyOut
          setIsFlyoutVisible={setIsFlyoutVisible}
          title={props.analysis.name}
          last_run={props.analysis.last_run}
          path={props.analysis.path}
        />
      )}
      <EuiSpacer />
    </>
  );
};

const AnalysisFlyOut = (props) => {
  const { HEADERS } = useAuth();
  const { index, setTasks, toasts, setToasts } = useSpace();
  const { setIsFlyoutVisible } = props;
  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: "simpleFlyoutTitle",  });
  const basicSelectId = useGeneratedHtmlId({ prefix: 'basicSelect' });
  const options = [
      { value: 'Headline', text: 'Headline' },
      { value: 'HitSentence', text: 'Hit Sentence' },
    ];
  
  const [value, setValue] = useState(options[1].value);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const onSubmit = (analysis, field, index_pattern) => {
    fetch(`/api/v1/index-patterns/${analysis}?index_pattern=${index}&field=${field}`, {
      headers: new Headers(HEADERS),
      method: "POST",  
    })
    .then(async (resp) => {
      if (!resp.ok) {
        throw await resp.json();
      }
      return resp.json();
    })
    .then((resp) => {
      setTasks((prevValue)=>[...prevValue, resp]);
      setToasts(()=>[{title: 'Analysis started', text: <p>Topic map analysis started for index: {index}</p>}]);
    })
    .catch((error) => {
      setToasts(()=>[error.detail])
    })
  }

  return (
    <EuiFlyout
      ownFocus
      onClose={() => setIsFlyoutVisible(false)}
      aria-labelledby={simpleFlyoutTitleId}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id={simpleFlyoutTitleId}>{props.title}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {props.last_run && 
          <>
          <EuiCallOut title={`This analysis has already been run on index: ${index}`} color="danger" iconType="alert">
          <p>
            This analysis was last run on {props.last_run}. Rerunning this analysis will overwrite the previous one!
          </p>
        </EuiCallOut>
        <EuiSpacer />
        </>
        }

        <EuiForm component="form">
          <EuiFormRow
            label="Text field"
          >
          <EuiSelect
              id={basicSelectId}
              options={options}
              value={value}
              onChange={(e) => onChange(e)}
              aria-label="Use aria labels when no actual label is in use"
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton onClick={()=>onSubmit(props.path, value, index)}>Submit</EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default AnalysisCard;
