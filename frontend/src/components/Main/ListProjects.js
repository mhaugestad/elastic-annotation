import React, {useState, useEffect} from "react";
import { EuiCard, EuiFlexGroup, EuiSpacer } from "@elastic/eui";
import { useAuth } from "../../context/auth";

export const ListProjects = (props) => {

  return (
    <>
      {props.projects.map((data, index) => (
        <>
        <EuiCard title={data.project_name} description={data.description} key={index} href={'/projects/' + data.project_name} />
        <EuiSpacer />
        </>
      ))}
    </>
  );
};

export default ListProjects;
