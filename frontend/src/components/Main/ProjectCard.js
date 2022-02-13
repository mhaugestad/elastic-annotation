import React from 'react'
import {
    EuiCard,
  } from "@elastic/eui";

const ProjectCard = (props) => {
    return (
        <EuiCard
            title="Login"
            style={{
                position: "fixed",
                top: "40%",
                left: "40%",
                marginTop: "-50px",
                marginLeft: "-100px",
                width: "25%",
            }}>
        </EuiCard>
    );
};

export default ProjectCard
