/* eslint-disable no-dupe-keys */
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale);

const DashboardCard = ({ title, value, percentage, color, chartData, img }) => (
  <Card sx={{ minWidth: 180, margin: '10px', padding: '20px', borderRadius: '15px', boxShadow: 3 }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ flex: 1 }}>
        <img src={img} alt="not found" style={{
          width:"35%"
        }}/>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ marginBottom: '8px', fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ width: '100px', height: '50px', position: 'relative' }}>
        <Typography
          variant="body1"
          sx={{
            color,
            fontWeight: 'bold',
            position: 'absolute',
            top: '-20px',
            right: '10px',
          }}
        >
          {percentage > 0 ? `+${percentage}%` : `${percentage}%`}
        </Typography>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            elements: {
              point: {
                radius: (ctx) => (ctx.dataIndex === ctx.dataset.data.length - 2 ? 8 : 0),
                backgroundColor: color,
              },
              line: {
                borderWidth: 3,
              },
            },
            scales: {
              x: { display: false },
              y: { display: false },
            },
          }}
        />
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = (props) => {
  const data = props?.data;
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userName = params.get('userName');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleApplyDateRange = () => {
    if (!startDate || !endDate) {
      alert('Both dates should be picked');
    } else if (new Date(startDate) > new Date(endDate)) {
      alert('The start date cannot be after the end date');
    } else {
      setIsDatePickerOpen(false);
    }
  };

  const formatDate = (date) => format(new Date(date), 'MMM dd');

  const chartDataTemplates = [
    {
      labels: [1, 2, 3, 4, 5, 6],
      datasets: [
        {
          data: [10, 15, 13, 20, 18, 22],
          borderColor: 'blue',
          fill: false,
          tension: 0.4,
        },
      ],
    },
    {
      labels: [1, 2, 3, 4, 5, 6],
      datasets: [
        {
          data: [30, 25, 28, 20, 18, 15],
          borderColor: 'red',
          fill: false,
          tension: 0.4,
        },
      ],
    },
    {
      labels: [1, 2, 3, 4, 5, 6],
      datasets: [
        {
          data: [5, 10, 12, 18, 20, 25],
          borderColor: 'green',
          fill: false,
          tension: 0.4,
        },
      ],
    },
    {
      labels: [1, 2, 3, 4, 5, 6],
      datasets: [
        {
          data: [12, 15, 18, 20, 23, 25],
          borderColor: 'orange',
          fill: false,
          tension: 0.4,
        },
      ],
    },
  ];

  return (
    <Box sx={{ padding: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: '500', marginBottom: { xs: '10px', sm: '0' },padding:'0 0 0 10px' }}>
          Dashboard - {userName}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer',
            backgroundColor: '#fff',
          }}
          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold', marginRight: '8px' }}>
            {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Select Date Range'}
          </Typography>
          <ArrowDropDownIcon sx={{ color: '#757575' }} />
        </Box>
      </Box>
      {isDatePickerOpen && (
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <TextField
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            inputProps={{ max: endDate || new Date().toISOString().split('T')[0] }}
            sx={{ marginRight: '10px', marginBottom: { xs: '10px', sm: '0' } }}
          />
          <TextField
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            sx={{ marginRight: '10px', marginBottom: { xs: '10px', sm: '0' } }}
          />
          <Button variant="contained" onClick={handleApplyDateRange} sx={{ marginBottom: { xs: '10px', sm: '0' } }}>Apply</Button>
        </Box>
      )}

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3}>
        <DashboardCard
          title="META"
          value={data?.facebookCarbonFootprint}
          percentage={0}
          color="blue"
          chartData={chartDataTemplates[0]}
          img="https://pngimg.com/uploads/meta/meta_PNG5.png"
        />
        <DashboardCard
          title="Google"
          value={data?.googleCarbonFootprint}
          percentage={0}
          color="red"
          chartData={chartDataTemplates[1]}
          img="https://www.pngmart.com/files/23/Google-Ads-Logo-PNG-File.png"
        />
        <DashboardCard
          title="Shopify"
          value={data?.shopifyCarbonFootprint}
          percentage={0}
          color="green"
          chartData={chartDataTemplates[2]}
          img="https://upload.wikimedia.org/wikipedia/commons/e/e1/Shopify_Logo.png"
        />
        <DashboardCard
          title="Klaviyo"
          value={data?.klaviyoCarbonFootprint}
          percentage={0}
          color="orange"
          chartData={chartDataTemplates[3]}
          img="https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Klaviyo_primary_logo.svg/2560px-Klaviyo_primary_logo.svg.png"
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
