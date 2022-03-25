import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import { useSpace } from "../../../context/spacecontext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import {
  EuiPage,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiPageSideBar,
  EuiPageBody,
  EuiGlobalToastList,
  EuiButton, 
  EuiControlBar,
  EuiText,
  EuiLoadingSpinner
} from "@elastic/eui";
import "./Layout.css";
import SpaceSettings from "../ProjectSettings/SpaceSettings";

const Layout = (props) => {
  const { slug: space_id } = useParams();
  const { HEADERS } = useAuth();
  const {index, setIndex, indexPatterns, setIndexPatterns, tasks, setTasks, toasts, setToasts, labels, setLabels } = useSpace();
  const [pageComponent, setPageComponent] = useState();
  const [isDisplaying, setDisplay] = useState(false);

  // Pick up tasks loaded to local storage 
  useEffect(()=>{
    let tmp_task = JSON.parse(localStorage.getItem("tasks"))
    if (tmp_task) {
      setTasks(()=>tmp_task.filter(item=>item.index===index))
    }
  },[])

  // Sync local storage tasks with state tasks
  useEffect(()=>{
    localStorage.setItem("tasks", JSON.stringify(tasks ? tasks : []));

    if (tasks?.filter(item=>item.index==index).length > 0) {
      setDisplay(()=>true)
    } else {
      setDisplay(()=>false)
    }
  },[tasks])

  // Function to remove toasts notifications
  const removeToast = (removedToast) => {
    setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
  };

  // Get labels
  useEffect(()=>{
    fetch(`/api/v1/index-patterns/labels?index_pattern=${index}`, { headers: new Headers(HEADERS) })
    .then((response) => {
      if (!response.ok) {
        throw Error('Error')
      }
      return response.json()
    })
    .then((response_json) => {setLabels(()=>response_json ? response_json.labels : []) ; console.log(response_json)})
    .catch(error=>setLabels(()=>[]))
  } ,[index])

  useEffect(() => {
    setPageComponent(() => <SpaceSettings />);
  }, [index]);

  // If there are tasks available then query the api for their status with 5 seconds gaps
  useEffect(() => {
    const interval = setInterval(() => {
      if (tasks) {
        let completed_tasks = []
        tasks.forEach((task)=> {
          fetch(`/api/v1/tasks/${task.task_id}`)
          .then((resp)=>resp.json())
          .then((resp) => {
            if (resp.status === 'SUCCESS') {
              completed_tasks.push({
                title: 'Task complete',
                color: 'success',
                text: <p>{task.onSuccess}</p>,
              })
              setTasks((prevVal)=> prevVal.filter(item=>item.task_id !== task.task_id))
            } 
          if (resp.status === 'FAILURE') {
              completed_tasks.push({
                title: 'Task failed',
                color: 'danger',
                text: <p>{tasks.onFailure}</p>,
              })
              setTasks((prevVal)=> prevVal.filter(item=>item.task_id !== task.task_id))
            }
          setToasts(()=>completed_tasks)
          })
          
        })
 
      } else {
        console.log("no task")
      }
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [tasks]);

  // Get Default index from Kibana and set as state index
  useEffect(() => {
    fetch(`/api/v1/spaces/default-index?space_id=${space_id}`, {
      headers: new Headers(HEADERS),
    })
      .then((response) => response.json())
      .then((resp) => setIndex(resp.name))
      .catch((error) => console.log(error));
  }, []);


  useEffect(() => {
    fetch(`/api/v1/spaces/index-patterns?space_id=${space_id}`, {
      headers: new Headers(HEADERS),
    })
      .then((response) => response.json())
      .then((resp) => setIndexPatterns(resp))
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <Header
        index={index}
        setIndex={setIndex}
        indexPatterns={indexPatterns}
        setIndexPatterns={setIndexPatterns}
      />
      <EuiPage style={{ height: "100%", width: "auto" }}>
        <Sidebar
          setPageComp={setPageComponent}
          style={{ height: "100%" }}
        />
        {pageComponent}
        <EuiGlobalToastList
        toasts={toasts}
        dismissToast={removeToast}
        toastLifeTimeMs={10000}
      />
      </EuiPage>
    </>
  );
};

export default Layout;
