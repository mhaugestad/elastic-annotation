import React, { useEffect, useState } from "react";
import { EuiBasicTable, EuiCard, EuiIcon, EuiBadge } from "@elastic/eui";
import { useAuth } from "../../context/auth";
import { useParams } from "react-router-dom";

const DocumentTable = (props) => {
  const { HEADERS } = useAuth();
  const { slug: project_id } = useParams();
  const { pageIndex, pageSize } = props;
  const [totalItemCount, setTotalItemCount] = useState(500);
  const [annotations, setAnnotations] = useState([]);
  const [toggleAllIndicator, setToggleAllIndicator] = useState(
    props.labels.reduce((a, v) => ({ ...a, [v]: false }), {})
  );

  useEffect(() => {
    setAnnotations(() =>
      props.data.hits.map((arr) => {
        let false_labels = props.labels
          .map((d) => d.label)
          .reduce((a, v) => ({ ...a, [v]: false }), {});
        return {
          id: arr._id,
          text: arr._source[props.chosenField[0].label],
          ...{ ...false_labels, ...arr._source?.annotations },
        };
      })
    );
  }, [props.data, props.chosenField, pageIndex]);

  useEffect(() => {
    if (props.data.total) {
      setTotalItemCount(() => props.data.total.value);
    }
  }, [pageIndex, props.data, pageSize]);

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount,
  };

  const handleSingleAnnotation = (item) => {
    fetch("/api/v1/project/" + project_id + "/annotations/" + item.id, {
      headers: new Headers(HEADERS),
      method: "PUT",
      body: JSON.stringify(item),
    })
      .then((response) => response.json())
      .catch((e) => console.log(e))
      .finally(() => console.log("SUCCESS"));
  };

  const handleBulkAnnotation = (items) => {
    fetch("/api/v1/project/" + project_id + "/annotations", {
      headers: new Headers(HEADERS),
      method: "PUT",
      body: JSON.stringify({ annotations: items }),
    })
      .then((response) => response.json())
      .catch((e) => console.log(e))
      .finally(() => console.log("SUCCESS"));
  };

  const columns = [
    {
      field: "text",
      name: "Text",
      width: "500px",
      render: (doc) => <TextCard doc={doc} />,
    },
    ...props.labels.map((lab) => ({
      field: lab.label,
      name: (
        <EuiBadge
          iconType={toggleAllIndicator[lab.label] ? "check" : "cross"}
          onClickAriaLabel="click"
          onClick={() =>
            toggleAllIcons(lab.label, !toggleAllIndicator[lab.label])
          }
        >
          {lab.label}
        </EuiBadge>
      ),
      width: "100px",
      align: "center",
      render: (annotation, item) => (
        <EuiIcon
          type={item[lab.label] ? "checkInCircleFilled" : "crossInACircleFilled"}
          style={
            item[lab.label]
              ? { fill: "#008000", height: "80px" }
              : { fill: "#8b0000" }
          }
          onClickAriaLabel="click"
          onClick={() => console.log(item)}
          size="xxl"
        />
      ),
    })),
  ];

  const onTableChange = ({ page = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    props.setPageIndex(() => pageIndex);
    props.setPageSize(() => pageSize);
  };

  const toggleAllIcons = (label, toggler) => {
    let new_items = annotations.map((item) => ({
      ...item,
      [label]: toggler,
    }));
    setAnnotations((prevValue) => [...new_items]);
    setToggleAllIndicator((prevValue) => ({
      ...prevValue,
      [label]: !prevValue[label],
    }));

    let items_for_es = annotations.map((item) => ({
      id: item.id,
      annotations: { [label]: toggler },
    }));
    handleBulkAnnotation(items_for_es);
  };

  const getRowProps = (item) => {
    const { id } = item;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {},
    };
  };

  const getCellProps = (item, column) => {
    const { id } = item;
    const { field } = column;
    const itemIdx = annotations.findIndex((arr) => arr.id === id);
    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${field}`,
      textOnly: true,
      onClick: () => {
        if (field !== props.chosenField[0].label) {
          let new_items = [...annotations];
          new_items[itemIdx][field] = !item[field];
          const { id, text, ...labelExtract } = new_items[itemIdx];
          setAnnotations(() => new_items);
          handleSingleAnnotation({ id: id, annotations: { ...labelExtract } });
        }
      },
    };
  };
  return (
    <EuiBasicTable
      tableCaption="Demo of EuiBasicTable"
      items={annotations}
      loading={props.loadingData}
      rowHeader="text"
      style={{ width: "100%" }}
      columns={columns}
      rowProps={getRowProps}
      cellProps={getCellProps}
      pagination={pagination}
      onChange={onTableChange}
    />
  );
};

export default DocumentTable;

const TextCard = (props) => {
  const [expandText, setExpandText] = useState(true);
  const expandHandler = () => {
    setExpandText((prevValue) => !prevValue);
  };
  return (
    <EuiCard style={{ width: "100%" }}>
      {!props.doc ? (
        <div>No data in this field</div>
      ) : props.doc.length <= 100 ? (
        props.doc
      ) : expandText ? (
        <div>
          {String(props.doc).slice(0, 100)}
          <a onClick={expandHandler}>...read more</a>
        </div>
      ) : (
        <div>
          {props.doc}
          <a onClick={expandHandler}>...read less</a>
        </div>
      )}
    </EuiCard>
  );
};
