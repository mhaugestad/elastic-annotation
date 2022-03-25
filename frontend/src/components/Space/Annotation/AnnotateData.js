import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../context/auth";
import { useSpace } from "../../../context/spacecontext";
import {
  EuiCard,
  EuiFormRow,
  EuiFieldSearch,
  EuiPagination,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiSpacer
} from "@elastic/eui";
import TableForm from "./TableForm";
import DocumentTable from "./DocumentTable";
import SimilarCard from "./SimilarCard";
import LabelSearch from "./LabelSearch";
import { useParams } from 'react-router-dom';

const AnnotateData = (props) => {
  const { HEADERS } = useAuth();
  const { index, labels } = useSpace();
  console.log(labels)
  const [isClearable, setIsClearable] = useState(true);
  const query = useRef("")
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [documentId, setDocumentId] = useState(null);

  const [updatedByQuery, setUpdatedByQuery] = useState(false);
  const [data, setData] = useState({hits:[]});
  const [annotations, setAnnotations] = useState([]);

  const [fields, setFields] = useState([{label: 'Hit Sentence', value: 'HitSentence'}, 
                                        {label: 'Opening Text', value: 'OpeningText'}, 
                                        {label: 'Twitter Bio', value: 'TwitterBio'}, 
                                        {label: 'Headline', value: 'Headline'}]);
  const [chosenField, setChosenField] = useState([{label: 'Headline', value: 'Headline'}])

  const [selectedLabelColumns, setSelectedLabelColumns] = useState(labels ? labels : []);

  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState();
  
  // Get data
  useEffect(()=>{
    setLoadingData((prev)=>true)
    fetch("/api/v1/documents?" + new URLSearchParams({
    index_pattern: index,
    page: pageIndex,
    size: pageSize
      }),
      { headers: new Headers(HEADERS), method: 'POST', 
      body: JSON.stringify({query: query.current.state.value ? query.current.state.value : null,
                            document_id: documentId? documentId : null})})
    .then((response) => response.json())
    .then((response_json) => {
      setData(()=>response_json)
    })
    .catch(setError)
    .finally(() => setLoadingData((prev)=>false));
  }, [pageIndex, pageSize, updatedByQuery, documentId])  // Get data
  
  const onSearch = () => {
    setLoadingData((prev)=>true)
    fetch("/api/v1/documents?" + new URLSearchParams({
      index_pattern: index,
      page: pageIndex
      }), 
      { headers: new Headers(HEADERS), method: 'POST', 
        body: JSON.stringify({query: query.current.state.value,
                              document_id: documentId? documentId : null})})
    .then((response) => response.json())
    .then((response_json) => {setData(()=>response_json); console.log(response_json)})
    .catch(setError)
    .finally(() => setLoadingData((prev)=> false));
  };

  if (!labels) {
    return <div>Please set some labels</div>
  }

  if (!data) {
    return <div>Please upload some data</div>
  }

  if (!chosenField) {
    return <div>No Chosen field</div>
  }

  return (  
    <>
    <EuiCard style={{height:'auto'}}>
       <EuiFlexGroup grow={false}>
      <EuiFlexItem grow={9}>
      <EuiFieldSearch
        placeholder="Search"
        fullWidth="true"
        value={query.current.value}
        //onChange={(e) => onChange(e)}
        ref={query}
        isClearable={isClearable}
        onSearch={onSearch}
      />
      </EuiFlexItem>
      <EuiFlexItem>
          <LabelSearch query={query} setUpdatedByQuery={setUpdatedByQuery}/>
      </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <TableForm 
          fields={fields} 
          labels={labels}
          chosenField={chosenField} 
          setChosenField={setChosenField}
          selectedLabels={selectedLabelColumns}
          setSelectedLabels={setSelectedLabelColumns}
          />
      </EuiFlexGroup>
      {documentId && 
        <SimilarCard documentId={documentId} setDocumentId={setDocumentId}/>
      }
      <EuiSpacer />
      {data.hits ? (
      <DocumentTable 
        labels={labels}
        selectedlabels={selectedLabelColumns} 
        data={data}
        loadingData={loadingData} 
        fields={fields} 
        chosenField={chosenField} 
        setChosenField={setChosenField}
        setPageIndex={setPageIndex}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setDocumentId={setDocumentId}
        />) :
        <div>No data</div>
      }
    </EuiCard>
    </> 
  );
};

export default AnnotateData;