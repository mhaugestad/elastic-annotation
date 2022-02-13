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
import ProjectForm from './ProjectForm'
import ListProjects from './ListProjects'

const Main = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const { HEADERS } = useAuth();

  useEffect(() => {
    fetch("/api/v1/project", {method: "GET", headers: new Headers(HEADERS)})
    .then((response) => response.json())
    .then(setProjects)
    .catch((error) => setError(error))
    .finally(() => {
      setLoading(false)
    });
  },[]);

  return (
    <EuiPageTemplate
      restrictWidth={false}
      template="empty"
      pageHeader={{
        iconType: "logoElastic",
        pageTitle: "Main page",
      }}
    >
      <EuiFlexGrid columns={2}>
        <EuiFlexItem>
          <EuiPanel style={{ height: 600 }}>
            <ProjectForm setProjects={setProjects}/>
            </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel style={{ height: 600 }}>
          <EuiText style={{ marginLeft: '40%'}}>
            <h2>Projects</h2>
          </EuiText>
            {projects.length > 0 &&
            <ListProjects projects={projects} setProjects={setProjects} />
            }
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGrid>
    </EuiPageTemplate>
  );
};

export default Main;
