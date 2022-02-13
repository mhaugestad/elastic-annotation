import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/auth";
import { useParams } from "react-router-dom";
import Plot from "react-plotly.js";
import {
  EuiCard,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSpacer,
} from "@elastic/eui";
import LabelModal from "./LabelModal";

const DocumentMap = () => {
  const { HEADERS } = useAuth();
  const { slug: project_id } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const query = useRef("")
  const [labels, setLabels] = useState();
  const [mappings, setMappings] = useState([
    { value: "text", text: "Text" },
    { value: "user_description", text: "User Description" },
  ]);

  const [selectedLabel, setSelectedLabel] = useState();
  const [selectedMapping, setSelectedMapping] = useState();
  const [textArray, setTextArray] = useState();
  const [reloadData, setReloadData] = useState(false);

  const [data, setData] = useState([]);
  const [highlightedData, setHighlightedData] = useState([]);

  useEffect(() => {
    fetch(
      `/api/v1/project/${project_id}/documents/?${new URLSearchParams({
        page: 0,
        size: 1000,
      })}`,
      { headers: new Headers(HEADERS), method: "POST" }
    )
      .then((response) => response.json())
      .then(setData)
      .catch((error)=>console.log(error));

      setReloadData((prev)=>false)
      console.log('reload data')
  }, [reloadData]);

  useEffect(() => {
    fetch(`/api/v1/project/${project_id}/labels`, { headers: new Headers(HEADERS) })
      .then((response) => response.json())
      .then((response) => {setLabels(['None', ...response].map((item)=>({value: item, label: item}))); console.log(response)})
      .catch((error)=>console.log(error));
  }, []);

  useEffect(() => {
    if (data?.hits) {
      setTextArray(() => data.hits.map((item) => item._source[selectedMapping ? selectedMapping : mappings[0].value]));
    }
  }, [selectedMapping, data]);

  const [colorHighlight, setColorHighlight] = useState();
  const [selected, setSelected] = useState({ points: [] });

  const onSelected = (data) => {
    console.log(data)
    setSelected(data);
    if (data?.length === 0) {
      setIsModalVisible(() => false);
    } else {
      setIsModalVisible(() => true);
    }
  };

  const onChangeLabels = (e) => {
    setSelectedLabel(e.target.value)
    setHighlightedData(data.hits.filter((item)=>{
      if (item._source.annotations) {
        return item._source.annotations[e.target.value]
      } else {
        return false
      }
    }))
  }

  const onSearch = () => {
    fetch("/api/v1/project/" + project_id + "/documents/?" + new URLSearchParams({
      page: 0,
      size: 1000
      }), 
      { headers: new Headers(HEADERS), method: 'POST', body: JSON.stringify({query: query.current.state.value})})
    .then((response) => response.json())
    .then(setData)
    .catch((error) => console.log(error))
  };

  return (
    <EuiCard style={{ height: "auto" }}>
      <EuiFlexGroup>
        <EuiFlexItem grow={true}>
          <EuiFieldSearch
            placeholder="Search"
            fullWidth="true"
            value={query.current.value}
            ref={query}
            isClearable={true}
            onSearch={onSearch}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiSelect
            prepend="Highlight"
            style={{ marginLeft: "15px" }}
            options={labels}
            value={selectedLabel}
            onChange={(e) => onChangeLabels(e)}
            aria-label="Use aria labels when no actual label is in use"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSelect
            prepend="Hover text"
            style={{ marginLeft: "15px" }}
            options={mappings}
            value={selectedMapping}
            onChange={(e) => {
              setSelectedMapping(e.target.value);
              console.log(e.target.value);
            }}
            aria-label="Use aria labels when no actual label is in use"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem>
          {data?.hits && textArray ? (
            <Plot
              data={[
                {
                  ids: data.hits.map((item) => item._id),
                  labels: ["label1", "label2", "label3"],
                  x: data.hits.map((item) => item._source.topic_map.x),
                  y: data.hits.map((item) => item._source.topic_map.y),
                  text: textArray,
                  hovertemplate: "<b>%{text}</b>",
                  showlegend: false,
                  type: "scatter",
                  mode: "markers",
                  marker: {
                    color: data.hits.map(
                      (item) => item._source.topic_map.density
                    ),
                    colorscale: "Hot",
                  },
                },
                {
                  x: selected ? selected.points.map((item) => item.x) : [],
                  y: selected ? selected.points.map((item) => item.y) : [],
                  text: selected
                    ? selected.points.map((item) => item.text)
                    : [],
                  hovertemplate: "<b>%{text}</b>",
                  type: "scatter",
                  mode: "markers",
                  marker: { color: "pink" },
                },
                {
                  x: selectedLabel === 'None' ? [] : highlightedData.map((item)=>item._source.topic_map.x),
                  y: selectedLabel === 'None' ? [] : highlightedData.map((item)=>item._source.topic_map.y),
                  type: "scatter",
                  mode: "markers",
                  marker: { color: "pink" },
                },
              ]}
              layout={{
                width: 1200,
                height: 900,
                plot_bgcolor: "#000000",
                xaxis: {
                  showgrid: false,
                  zeroline: false,
                  visible: false,
                },
                yaxis: {
                  showgrid: false,
                  zeroline: false,
                  visible: false,
                },
                showlegend: false
              }}
              onSelected={(data) => onSelected(data)}
            />
          ) : (
            <div>no data yet</div>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      <LabelModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        labels={labels}
        setLabels={setLabels}
        selectedLabel={selectedLabel}
        setSelectedLabel={setSelectedLabel}
        selected={selected}
        setReloadData={setReloadData}
      />
    </EuiCard>
  );
};

export default DocumentMap;
