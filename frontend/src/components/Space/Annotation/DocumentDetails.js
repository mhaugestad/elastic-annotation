import React, { useEffect, useState, useRef } from "react";
import DocumentTable from './DocumentTable';
import TableForm from "./TableForm";
import LabelSearch from './LabelSearch';
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

const DocumentDetails = (props) => {
    const { HEADERS } = useAuth();
    const { document_id } = props;  
    const { index, labels } = useSpace();
    const [isClearable, setIsClearable] = useState(true);
    const query = useRef("")
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
  
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
      let body = []
      if (query.current.state?.value) {
        body = JSON.stringify({query: query.current.state.value})
      }
      fetch(`/api/v1/documents/most_similar/${document_id}?` + new URLSearchParams({
      index_pattern: index,
      page: pageIndex,
      size: pageSize
        }),
        { headers: new Headers(HEADERS), method: 'POST', body: body})
      .then((response) => response.json())
      .then((response_json) => {
        setData(()=>response_json)
      })
      .catch(setError)
      .finally(() => setLoadingData((prev)=>false));
    }, [pageIndex, pageSize, updatedByQuery])  // Get data
    
    const onSearch = () => {
      setLoadingData((prev)=>true)
      fetch(`/api/v1/documents/most_similar/${document_id}?` + new URLSearchParams({
        index_pattern: index,
        page: pageIndex
        }), 
        { headers: new Headers(HEADERS), method: 'POST', body: JSON.stringify({query: query.current.state.value})})
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
          />) :
          <div>No data</div>
        }
      </EuiCard>
      )
}

export default DocumentDetails;
