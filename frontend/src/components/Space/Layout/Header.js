import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import { useSpace } from "../../../context/spacecontext";
import {
  EuiTitle,
  EuiText,
  EuiHeader,
  EuiHeaderSectionItem,
  EuiHeaderLogo,
  EuiHeaderLinks,
  EuiHeaderLink,
  useGeneratedHtmlId,
  EuiLoadingElastic,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
} from "@elastic/eui";
import IndexFlyout from "./IndexFlyout";

const Header = (props) => {
  const {slug: space_id} = useParams();
  const {index, setIndex, indexPatterns, tasks} = useSpace();
  const { HEADERS } = useAuth();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const closeFlyout = () => setIsFlyoutVisible(false);
  const toggleFlyout = () => setIsFlyoutVisible((isVisible) => !isVisible);
  const withoutFocusFlyoutTitleId = useGeneratedHtmlId({
    prefix: "withoutFocusFlyoutTitle",
  });

  useEffect(()=> {
    console.log('Header props: ' + index)
  }, [index])

  return (
    <EuiHeader>
      <EuiHeaderSectionItem border="right">
        {tasks?.filter(item=>item.index==index).length > 0 ?
        <EuiLoadingElastic size="xl" /> :  
        <EuiHeaderLogo>MadAnnotator</EuiHeaderLogo>
      }
      </EuiHeaderSectionItem>
      <EuiHeaderSectionItem>
        <EuiHeaderLinks aria-label="App navigation links example">
          <EuiHeaderLink iconType="logoElasticsearch" onClick={toggleFlyout}>
            {index && index}
          </EuiHeaderLink>
          <EuiHeaderLink iconType="logoKibana" target='blank' href={`https://elastic-deployment.kb.eastus2.azure.elastic-cloud.com:9243/s/${space_id}/app/home#/`} >Go to Kibana</EuiHeaderLink>
        </EuiHeaderLinks>
      </EuiHeaderSectionItem>
      {isFlyoutVisible && (
        <IndexFlyout setIsFlyoutVisible={setIsFlyoutVisible} indexPatterns={indexPatterns} index={index} setIndex={setIndex}/>
      )}
    </EuiHeader>
  );
};

export default Header;
