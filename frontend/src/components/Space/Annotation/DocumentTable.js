import React, { useEffect, useState } from "react";
import {
  EuiBasicTable,
  EuiCard,
  EuiButtonEmpty,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiPopover,
  useGeneratedHtmlId,
  EuiButton,
  EuiIcon,
  EuiBadge,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
} from "@elastic/eui";
import { useAuth } from "../../../context/auth";
import { useSpace } from "../../../context/spacecontext";
import { useParams } from "react-router-dom";
import DocumentDetails from "./DocumentDetails";

const DocumentTable = (props) => {
  const { HEADERS } = useAuth();
  const { labels, index } = useSpace();
  const { selectedlabels, setDocumentId } = props;
  const { slug: project_id } = useParams();
  const { data, pageIndex, pageSize, chosenField, setChosenField } = props;
  const [totalItemCount, setTotalItemCount] = useState(500);
  const [annotations, setAnnotations] = useState([]);
  const [toggleAllIndicator, setToggleAllIndicator] = useState(
    labels
      .map((item) => item.value)
      .reduce((a, v) => ({ ...a, [v]: false }), {})
  );

  useEffect(() => {
    setAnnotations(() =>
      data.hits.map((arr) => {
        let false_labels = labels
          .map((item) => item.value)
          .map((d) => d)
          .reduce((a, v) => ({ ...a, [v]: false }), {});
        return {
          id: arr._id,
          text: arr._source[chosenField[0].value],
          ...{ ...false_labels, ...arr._source?.annotations },
        };
      })
    );
  }, [data, chosenField, pageIndex]);

  useEffect(() => {
    if (data.total) {
      setTotalItemCount(() => data.total.value);
    }
  }, [pageIndex, data, pageSize]);

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount,
  };

  const handleSingleAnnotation = (item) => {
    fetch(`/api/v1/documents/annotate/${item.id}?index_pattern=${index}`, {
      headers: new Headers(HEADERS),
      method: "PUT",
      body: JSON.stringify(item),
    })
      .then((response) => response.json())
      .catch((e) => console.log(e));
  };

  const handleBulkAnnotation = (items) => {
    fetch(`/api/v1/documents/annotate?index_pattern=${index}`, {
      headers: new Headers(HEADERS),
      method: "PUT",
      body: JSON.stringify({ annotations: items }),
    })
      .then((response) => response.json())
      .catch((e) => console.log(e));
  };

  const columns = [
    {
      field: "text",
      name: "Text",
      width: "500px",
      render: (doc, item) => <TextCard doc={doc} item={item} setDocumentId={setDocumentId}/>,
    },
    ...selectedlabels.map((label) => ({
      field: label.value,
      name: (
        <EuiBadge
          iconType={toggleAllIndicator[label.value] ? "check" : "cross"}
          onClickAriaLabel="click"
          onClick={() =>
            toggleAllIcons(label.value, !toggleAllIndicator[label.value])
          }
        >
          {label.label}
        </EuiBadge>
      ),
      width: "100px",
      align: "center",
      render: (annotation, item) => (
        <EuiIcon
          type={
            item[label.value] ? "checkInCircleFilled" : "crossInACircleFilled"
          }
          style={
            item[label.value]
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
        if (field !== "text") {
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
  const {setDocumentId} = props;
  const [isPopoverOpen, setPopover] = useState(false);

  const singleContextMenuPopoverId = useGeneratedHtmlId({
    prefix: "singleContextMenuPopover",
  });

  const onButtonClick = () => {
    setPopover(!isPopoverOpen);
  };

  const closePopover = () => {
    setPopover(false);
  };

  const button = (
    <EuiButtonEmpty
      size="s"
      iconType="arrowDown"
      iconSide="left"
      onClick={onButtonClick}
    />
  );

  const items = [
    <EuiContextMenuItem
      key="similar"
      icon="lensApp"
      onClick={() => {
        closePopover();
        setDocumentId(()=>props.item.id)
      }}
    >
      Order search by similarity
    </EuiContextMenuItem>,
  ];

  const [expandText, setExpandText] = useState(true);

  const expandHandler = () => {
    setExpandText((prevValue) => !prevValue);
  };
  return (
    <>
      <EuiCard style={{ width: "100%" }}>
        <EuiFlexGroup>
          <EuiFlexItem grow={1}>
            <EuiPopover
              id={singleContextMenuPopoverId}
              button={button}
              isOpen={isPopoverOpen}
              closePopover={closePopover}
              panelPaddingSize="none"
              anchorPosition="downLeft"
            >
              <EuiContextMenuPanel size="s" items={items} />
            </EuiPopover>
          </EuiFlexItem>
          <EuiFlexItem grow={9}>
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
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiCard>
    </>
  );
};
