import React, { useState, useEffect } from "react";
import { EuiCard, EuiFlexItem, EuiFlexGroup, EuiSpacer, EuiIcon } from "@elastic/eui";
import { useAuth } from "../../context/auth";

export const ListProjects = (props) => {
  return (
    <>
      {props.spaces.map((data, index) => (
        <EuiFlexItem>
          <EuiCard
            icon={<EuiIcon size="xxl" type="logoKibana" />}
            title={data.name}
            description={data.name}
            key={index}
            href={"/spaces/" + data.id}
          />
          <EuiSpacer />
          </EuiFlexItem>
      ))}
    </>
  );
};

export default ListProjects;
