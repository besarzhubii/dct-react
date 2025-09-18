import React, { useEffect, useState, CSSProperties } from 'react';
import Sidebar from '../components/Sidebar';
import { Box } from '@mui/material';
import MainRow from '../components/MainRow';
import SecondRow from '../components/SecondRow';
import DoughnutChart from '../components/DoughnutChart';
import IndustryComparisonCard from '../components/IndustryComparisonCard'
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import PuffLoader from "react-spinners/ClipLoader";

const UserGraph = () => {
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [hasData, setHasData] = React.useState(false);
  const [data, setData] = React.useState<any>({});
  const [wastageData, setWastageData] = React.useState({});
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userId = params.get('userId');
  const userName = params.get('userName');
  console.log({userName});
  const user =  JSON.parse(localStorage.getItem('user') || '');
  useEffect(() => {
    axios.post(`${process.env.REACT_APP_API}/shopify/${userId}`,)
    .then(function (response) {
      setData(response.data);
      setHasData(true)
    })
    .catch(function (error) {
      setHasData(false);
    })
    axios.post(`${process.env.REACT_APP_API}/shopify/wastage/${userId}`,)
    .then(function (response) {
      setWastageData(response.data);
      setHasData(true)
    })
    .catch(function (error) {
      setHasData(false);
    })
  },[])

  return <Box sx={{ display: 'flex', backgroundColor:'#f8f8f8' }}>
  <Sidebar />
  {
    hasData ? 
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <MainRow data={data} userName={userName}/>
      <SecondRow data={data} secondData={wastageData} testRow="AAAAAAAASDFVVV"/>
      <DoughnutChart data={data} secondData={wastageData}/>
      <h2 style={{marginLeft:"30px"}}>How does your digital carbon footprint compare to the industry?</h2>
          <IndustryComparisonCard title={"Shopify"} color={"green"} yourScore={data?.shopifyCarbonFootprint} industryAvarage={875}/>
          <IndustryComparisonCard title={"META"} color={"blue"} yourScore={data?.facebookCarbonFootprint} industryAvarage={560}/>
          <IndustryComparisonCard title={"Klaviyo"} color={"orange"} yourScore={data?.klaviyoCarbonFootprint} industryAvarage={180}/>
    </Box> : 
        <PuffLoader

          color={color}
          loading={loading}
          cssOverride={override}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
  }
</Box>
}
export default UserGraph;