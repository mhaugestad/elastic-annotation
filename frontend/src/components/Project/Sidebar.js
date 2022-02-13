import { EuiSideNav, htmlIdGenerator } from '@elastic/eui';
import React, { useState } from 'react';
import UploadData from "./UploadData";
import AnnotateData from "./AnnotateData";
import DocumentTable from './DocumentTable';
import ProjectSettings from "./ProjectSettings";
import DocumentMap from './DocumentMap/DocumentMap';

const Sidebar = (props) => {
    const sideNav = [
        {
          name: 'Menu',
          id: htmlIdGenerator('sideNav')(),
          items: [
            {
              name: 'Project Settings',
              id: htmlIdGenerator('projectSettings')(),
              onClick: () => {props.setPageComp(<ProjectSettings />)},
            },
            {
              name: 'Upload data',
              id: htmlIdGenerator('dataUpload')(),
              onClick: () => {props.setPageComp(<UploadData />)},
            },
            {
              name: 'Annotate data',
              id: htmlIdGenerator('annotateData')(),
              onClick: () => {props.setPageComp(<AnnotateData />)}
            },
            {
              name: 'Document Map',
              id: htmlIdGenerator('documentMap')(),
              onClick: () => {props.setPageComp(<DocumentMap />)}
            },
          ],
        },
      ];

  return (
    <EuiSideNav
      aria-label="Basic example"
      style={{ width: 192, height:'100%' }}
      items={sideNav}
    />
  );
};

export default Sidebar;