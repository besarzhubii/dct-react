import React, { useEffect, useState, CSSProperties } from 'react';
import Sidebar from '../components/Sidebar';
import { Box } from '@mui/material';
import MainRow from '../components/MainRow';
import SecondRow from '../components/SecondRow';
import DoughnutChart from '../components/DoughnutChart';
import IndustryComparisonCard from '../components/IndustryComparisonCard'
import ClipLoader from "react-spinners/ClipLoader";
import { fetchAllPlatformsData, AggregatedResponse } from '../services/platformApi';

const Main = () => {
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [hasData, setHasData] = React.useState(false);
  const [aggregatedData, setAggregatedData] = React.useState<AggregatedResponse | null>(null);
  const [error, setError] = React.useState<string>('');
  const user =  JSON.parse(localStorage.getItem('user') || '');
  
  useEffect(() => {
    if (!user?.id) {
      setError('User not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchAllPlatformsData(user.id)
      .then((response) => {
        setAggregatedData(response);
        setHasData(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching platform data:', error);
        setError('Failed to fetch data');
        setHasData(false);
        setLoading(false);
      });
  }, [])
    return <Box sx={{ display: 'flex', backgroundColor:'#f8f8f8' }}>
      <Sidebar />
      {
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}>
            <ClipLoader
              color={color}
              loading={loading}
              cssOverride={override}
              size={150}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </Box>
        ) : hasData && aggregatedData ? (
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <MainRow data={aggregatedData}/>
            <SecondRow data={aggregatedData}/>
            <DoughnutChart data={aggregatedData}/>
            <h2 style={{marginLeft:"30px"}}>How does your digital carbon footprint compare to the industry?</h2>
            <IndustryComparisonCard 
              img="https://cdn.worldvectorlogo.com/logos/shopify.svg" 
              title={"Shopify"} 
              color={"green"} 
              platform={aggregatedData.platforms.shopify}
              industryAverage={8}
            />
            <IndustryComparisonCard 
              img="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/320px-Meta_Platforms_Inc._logo.svg.png" 
              title={"Meta (Facebook)"} 
              color={"blue"} 
              platform={aggregatedData.platforms.meta}
              industryAverage={8}
            />
            <IndustryComparisonCard 
              img="/images/klaviyo.png" 
              title={"Klaviyo"} 
              color={"orange"} 
              platform={aggregatedData.platforms.klaviyo}
              industryAverage={8}
            />
            <IndustryComparisonCard 
              img="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" 
              title={"Google Ads"} 
              color={"#4285F4"} 
              platform={aggregatedData.platforms.google}
              industryAverage={8}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}>
            <p style={{ color: 'red' }}>{error || 'No data available'}</p>
          </Box>
        )
      }
    </Box>
}
export default Main;