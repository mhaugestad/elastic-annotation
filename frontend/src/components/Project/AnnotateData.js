import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/auth";
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
import DocumentLines from './DocumentLines';
import TableForm from "./TableForm";
import DocumentTable from "./DocumentTable";
import LabelSearch from "./LabelSearch";
import { useParams } from 'react-router-dom';

const AnnotateData = (props) => {
  const { HEADERS } = useAuth();
  const {slug: project_id} = useParams();
  const [isClearable, setIsClearable] = useState(true);
  const query = useRef("")
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [updatedByQuery, setUpdatedByQuery] = useState(false);
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState({hits:[]});
  const [annotations, setAnnotations] = useState([]);

  const [fields, setFields] = useState([]);
  const [chosenField, setChosenField] = useState(JSON.parse(localStorage.getItem(project_id)));
  console.log(chosenField)

  const [selectedLabelColumns, setSelectedLabelColumns] = useState([]);

  const [loadingLabels, setLoadingLabels] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingMapping, setLoadingMapping] = useState(true);
  const [error, setError] = useState();


  // Get labels
  useEffect(()=>{
    setLoadingLabels(()=>true)
    fetch("/api/v1/project/" + project_id + "/labels", { headers: new Headers(HEADERS) })
    .then((response) => response.json())
    .then((response_json) => {
      if (response_json) {
      setLabels(()=>response_json ? response_json : []);
      setSelectedLabelColumns(()=>response_json.map((lab)=>({label:lab})))
      }
    })
    .catch(setError)
    .finally(() => setLoadingLabels(()=>false));

  } ,[])

 
  // loading mappings
  useEffect(()=>{
    setLoadingMapping(()=>true);
    fetch("/api/v1/project/" + project_id + "/mapping", { headers: new Headers(HEADERS) })
      .then((response) => response.json())
      .then((response) => {
        let items = Object.keys(response)
        setFields(items)
        if (!chosenField) {
          setChosenField(()=>[{label: items[0]}])
        }
      })
      .catch(setError)
      .finally(() => setLoadingMapping(()=>false));
  },[])

  useEffect(()=>{
    setLoadingData((prev)=>true)
    let body = []
    if (query.current.state?.value) {
      body = JSON.stringify({query: query.current.state.value})
    }
    fetch("/api/v1/project/" + project_id + "/documents/?" + new URLSearchParams({
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
    fetch("/api/v1/project/" + project_id + "/documents/?" + new URLSearchParams({
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
      <EuiFlexItem>
      {(!loadingLabels & !loadingMapping) ?
          <LabelSearch labels={labels} query={query} project_id={project_id} setUpdatedByQuery={setUpdatedByQuery}/> :
          <div>...</div>
        }
      </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        { (labels && chosenField) ? (
        <TableForm 
          fields={fields} 
          labels={labels}
          chosenField={chosenField} 
          setChosenField={setChosenField}
          selectedOptions={selectedLabelColumns}
          setSelected={setSelectedLabelColumns}
          />) :
          (<div>...</div>)
        }
      </EuiFlexGroup>

      <EuiSpacer />
      {data.hits ? (
      <DocumentTable 
        labels={selectedLabelColumns} 
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
  );
};

export default AnnotateData;