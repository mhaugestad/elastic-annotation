import React, {useState, useEffect} from "react";
import {
  EuiPageTemplate,
  EuiButton,
  EuiFlexGrid,
  EuiFlexItem,
  EuiPanel,
  EuiText
} from "@elastic/eui";
import { useAuth } from "../../context/auth";
import ListProjects from "./ListProjects";

const Main = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState();
  const { HEADERS } = useAuth();

  useEffect(() => {
    setLoading(()=>true)
    fetch("/api/v1/spaces", {method: "GET", headers: new Headers(HEADERS)})
    .then((response) => response.json())
    .then(setSpaces)
    .catch((error) => console.log(error))
    .finally(() => {
      setLoading(()=>false)
    });
  },[]);

  return (
    <EuiPageTemplate
      restrictWidth={false}
      template="empty"
      pageHeader={{
        iconType: "logoElastic",
        pageTitle: "Choose Space",
      }}
    >
      <EuiFlexGrid columns={4}>
        {spaces.length > 0 &&
            <ListProjects spaces={spaces} />
        }
      </EuiFlexGrid>
    </EuiPageTemplate>
  );
};

export default Main;
