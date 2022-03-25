import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useGeneratedHtmlId } from "@elastic/eui";
import {
  EuiButton,
  EuiCard,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiLink
} from "@elastic/eui";
import { useAuth } from "../../../context/auth";
import { useSpace } from "../../../context/spacecontext";
import AnalysisCard from "./AnalysisCard";

const AnalysisList = (props) => {
    const {index} = useSpace();
    const analysis = [{name: 'Topic Map', path: 'topic_map', description: 'Analysis to run a topic map', last_run: '2022-XX-XX'}, 
                      {name: 'Twitter Audiences', path: 'audiences', description: 'Analysis to run a audience classification', last_run: '2022-XX-XX'}, 
                      {name: 'Get Full Text', path: 'full_text', description: 'Analysis to get full text', last_run: '2022-XX-XX'}
                    ] 
    return (
        <>
        {analysis.map((item)=>(
            <AnalysisCard analysis={item} index={index}/>
        ))}
        </>
    );
};

export default AnalysisList;
