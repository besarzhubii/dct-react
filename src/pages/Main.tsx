import React, { useEffect, useState, CSSProperties } from 'react';
import Sidebar from '../components/Sidebar';
import { Box } from '@mui/material';
import MainRow from '../components/MainRow';
import SecondRow from '../components/SecondRow';
import DoughnutChart from '../components/DoughnutChart';
import IndustryComparisonCard from '../components/IndustryComparisonCard'
import axios from 'axios';
import ClipLoader from "react-spinners/ClipLoader";

const Main = () => {
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [hasData, setHasData] = React.useState(false);
  const [data, setData] = React.useState<any>({});
  const [wastageData, setWastageData] = React.useState<any>({});
  const user =  JSON.parse(localStorage.getItem('user') || '');
  useEffect(() => {
    axios.post(`${process.env.REACT_APP_API}/shopify/${user.id}`,)
    .then(function (response) {
      setData(response.data);
      setHasData(true)
    })
    .catch(function (error) {
      setHasData(false);
    })
    axios.post(`${process.env.REACT_APP_API}/shopify/wastage/${user.id}`,)
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
          <MainRow data={data}/>
          <SecondRow data={data} secondData={wastageData} testRow="AAAAAAAASDFVVV"/>
          <DoughnutChart data={data} secondData={wastageData}/>
          <h2 style={{marginLeft:"30px"}}>How does your digital carbon footprint compare to the industry?</h2>
          <IndustryComparisonCard img="https://upload.wikimedia.org/wikipedia/commons/e/e1/Shopify_Logo.png" title={"Shopify"} color={"green"} yourScore={data?.shopifyCarbonFootprint} industryAvarage={875}/>
          <IndustryComparisonCard img="https://pngimg.com/uploads/meta/meta_PNG5.png" title={"META"} color={"blue"} yourScore={data?.facebookCarbonFootprint} industryAvarage={560}/>
          <IndustryComparisonCard img="https://www.pngmart.com/files/23/Google-Ads-Logo-PNG-File.png" title={"Google"} color={"red"} yourScore={data?.googleCarbonFootprint} industryAvarage={780}/>
          <IndustryComparisonCard img="https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Klaviyo_primary_logo.svg/2560px-Klaviyo_primary_logo.svg.png" title={"Klaviyo"} color={"orange"} yourScore={data?.klaviyoCarbonFootprint} industryAvarage={180}/>
        </Box> :
        <ClipLoader
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
export default Main;