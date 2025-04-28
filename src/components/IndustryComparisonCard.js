import React from 'react';
import { Box, Grid, Paper, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import { Line } from 'react-chartjs-2';

const DashboardCard = ({ title, value, percentage, color, chartData }) => (
    <Card sx={{ minWidth: 180, margin: '10px', padding: '20px', borderRadius: '15px', boxShadow: 3 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Box sx={{flex:1}}>
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
  const DashboardCard2 = ({ title, value, percentage, color, chartData }) => (
      <Card sx={{ minWidth: 180, margin: '10px', padding: '20px', borderRadius: '15px', boxShadow: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box sx={{ width: '100%', height: '50px', position: 'relative',textAlign:'center', color:"red" }}>
            <h1 style={{margin:0}}>{value}</h1>
          </Box>
        </CardContent>
      </Card>
    );
const IndustryComparisonCard = (props) => {
    const {title, color, yourScore, industryAvarage, img} = props;
    
const chartDataTemplates = [
    {
      labels: [1, 2, 3, 4, 5, 6],
      datasets: [
        {
          data: [10, 15, 13, 20, 18, 22],
          borderColor: color,
          fill: false,
          tension: 0.4,
        },
      ],
    }
  ];
    return (
        <Box
            sx={{
                padding: "30px",
                background: "white",
                boxShadow:3,
                marginLeft:"30px",
                marginRight:"20px",
                borderRadius:"10px",
                marginBottom:"30px"
            }}>
            <img src={img} alt="not found" style={{
            width:"5%"
            }}/>
            <p style={{display:"inline-block",marginBottom:"50px", marginTop:"0", fontWeight:"700", color:"#1d2a53"}}>{title}</p>
            <Grid container spacing={2}>
                {/* Column 1 */}
                <Grid item xs={12} sm={4}>
                    <DashboardCard
                        title="Your Score"
                        value={yourScore}
                        percentage={0}
                        color={color}
                        chartData={chartDataTemplates[0]}
                    />
                </Grid>
                {/* Column 2 */}
                <Grid item xs={12} sm={4}>
                    <DashboardCard
                        title="Industry Avarage"
                        value={industryAvarage}
                        percentage={0}
                        color={color}
                        chartData={chartDataTemplates[0]}
                    />
                </Grid>
                {/* Column 3 */}
                <Grid item xs={12} sm={4}>
                    <DashboardCard2
                        title="Difference +/-"
                        value={(industryAvarage*100)/yourScore}
                        percentage={12}
                        color={color}
                        chartData={chartDataTemplates[0]}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default IndustryComparisonCard;
