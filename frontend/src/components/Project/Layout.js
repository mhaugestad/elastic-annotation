import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import {
  EuiPage,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiPageSideBar,
  EuiPageBody,
} from "@elastic/eui";
import './Layout.css';
import ProjectSettings from "./ProjectSettings";

const Layout = (props) => {
  const [pageComponent, setPageComponent] = useState(<ProjectSettings />);
  return (
    <>
      <Header />
      <EuiPage style={{height:'100%', width:'auto'}}>
        <Sidebar setPageComp={setPageComponent} style={{height:'100%'}} />
        {pageComponent}
      </EuiPage>
    </>
  );
};

export default Layout;
