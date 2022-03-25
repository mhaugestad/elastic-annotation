import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";
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
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";

const CreateIndexForm = (props) => {
  const {slug: space_id} = useParams();
  const { HEADERS } = useAuth();
  const { setIndex } = useSpace();
  const { closeFlyout } = props;
  const validSlug = new RegExp("^[a-z][a-z-\_]*[a-z]$");
  const [formErrors, setFormErrors] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const [newIndexName, setNewIndexName] = useState('')

  useEffect(()=> {
    if (validSlug.test(newIndexName)) {
        setShowErrors(()=>false)
        setFormErrors(()=>[])
    } else {
        setShowErrors(()=>true)
        setFormErrors(()=>["Index name is not a valid slug"])
    }
  }, [newIndexName])

  const handleCreateIndex = (e) => {
    fetch("/api/v1/index-patterns", {
          method: "POST",
          headers: new Headers(HEADERS),
          body: JSON.stringify({
            id: newIndexName,
            name: newIndexName,
            space_id: space_id
          }),
        })
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          } else {
            
            throw new Error(resp.detail);
          }
        })
        .then((response) => {
          setIndex(response.id)
          closeFlyout()
        })
        .catch((error) => {
            setShowErrors(()=>true);
            setFormErrors(()=>error.message);
        })
        props.closeFlyout()
      }

  return (
    <EuiForm id="1" component="form" isInvalid={showErrors} error={formErrors}>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow>
            <EuiFieldText
            onChange={(e)=>setNewIndexName(e.target.value)}
            value={newIndexName}
            prepend="Index name" 
            autoFocus/>
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow>
            <EuiButton onClick={()=>handleCreateIndex()}>
              Create Meltwater Index
            </EuiButton>
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
}

export default CreateIndexForm;
