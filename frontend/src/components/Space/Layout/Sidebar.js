import { EuiSideNav, htmlIdGenerator } from '@elastic/eui';
import React, { useState, useEffect } from 'react';
import AnnotateData from "../Annotation/AnnotateData";
import SpaceSettings from "../ProjectSettings/SpaceSettings";
import DocumentMap from '../DocumentMap/DocumentMap';


const Sidebar = (props) => {
  
    const sideNav = [
        {
          name: 'Menu',
          id: htmlIdGenerator('sideNav')(),
          items: [
            {
              name: 'Index Settings',
              id: htmlIdGenerator('projectSettings')(),
              onClick: () => {props.setPageComp(<SpaceSettings />)},
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