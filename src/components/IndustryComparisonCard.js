import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
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
    const {title, color, platform, industryAverage, img} = props;
    
    // Extract platform metrics
    const yourScore = platform?.digitalCarbonFootprint || 0;
    const carbonScore = platform?.digitalCarbonScore || 0;
    const rating = platform?.rating || 'N/A';
    const impressions = platform?.impressions || platform?.recipients || 0;
    
    // Calculate per 1000 impressions for comparison
    const yourScorePer1000 = impressions > 0 ? (yourScore / (impressions / 1000)) : 0;
    const difference = industryAverage > 0 && yourScorePer1000 > 0 ? 
        ((yourScorePer1000 / industryAverage) * 100 - 100).toFixed(1) : 0;
    
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: '20px' }}>
                <Box sx={{ 
                    width: '60px', 
                    height: '60px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <img 
                        src={img} 
                        alt={title} 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain' 
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZTBlMGUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2dvPC90ZXh0Pjwvc3ZnPg==';
                        }}
                    />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight:"700", color:"#1d2a53", margin: 0 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", margin: 0 }}>
                        Carbon Score: {carbonScore.toFixed(1)}% • Rating: {rating}
                    </Typography>
                </Box>
            </Box>
            {platform?.configured ? (
                <Grid container spacing={2}>
                    {/* Column 1 */}
                    <Grid item xs={12} sm={4}>
                        <DashboardCard
                            title="Your Carbon Footprint"
                            value={`${yourScore.toFixed(2)} kg CO2`}
                            percentage={0}
                            color={color}
                            chartData={chartDataTemplates[0]}
                        />
                    </Grid>
                    {/* Column 2 */}
                    <Grid item xs={12} sm={4}>
                        <DashboardCard
                            title="Industry Average (per 1k)"
                            value={`${industryAverage} kg CO2`}
                            percentage={0}
                            color={color}
                            chartData={chartDataTemplates[0]}
                        />
                    </Grid>
                    {/* Column 3 */}
                    <Grid item xs={12} sm={4}>
                        <DashboardCard2
                            title="Comparison vs Industry"
                            value={`${difference > 0 ? '+' : ''}${difference}%`}
                            percentage={0}
                            color={difference > 0 ? "#F44336" : "#4CAF50"}
                            chartData={chartDataTemplates[0]}
                        />
                    </Grid>
                </Grid>
            ) : (
                <Box sx={{ textAlign: 'center', padding: '40px', backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
                    <Typography variant="h6" color="text.secondary">
                        Platform Not Configured
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
                        Add your API credentials in the profile settings to view data for this platform.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default IndustryComparisonCard;
