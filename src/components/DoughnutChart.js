import React from "react";
import { Box, Typography, Grid, Divider } from "@mui/material";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

// Register Chart.js modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const DoughnutChart = (props) => {
  const { data } = props;
  
  // Extract platform data
  const shopifyFootprint = data?.platforms?.shopify?.digitalCarbonFootprint || 0;
  const metaFootprint = data?.platforms?.meta?.digitalCarbonFootprint || 0;
  const klaviyoFootprint = data?.platforms?.klaviyo?.digitalCarbonFootprint || 0;
  const googleFootprint = data?.platforms?.google?.digitalCarbonFootprint || 0;
  
  const totalFootprint = shopifyFootprint + metaFootprint + klaviyoFootprint + googleFootprint;
  
  // Calculate percentages
  const calculatePercentage = (value) => totalFootprint > 0 ? ((value / totalFootprint) * 100).toFixed(1) : 0;
  
  // Doughnut Chart Data
  const doughnutData = {
    labels: ["Shopify", "Meta", "Klaviyo", "Google"],
    datasets: [
      {
        data: [shopifyFootprint, metaFootprint, klaviyoFootprint, googleFootprint],
        backgroundColor: ["#66BB6A", "#29B6F6", "#FF9800", "#7E57C2"],
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const doughnutLabels = [
    { 
      name: "Shopify", 
      value: `${shopifyFootprint.toFixed(2)} kg`, 
      percentage: `${calculatePercentage(shopifyFootprint)}%`, 
      color: "#66BB6A" 
    },
    { 
      name: "Meta", 
      value: `${metaFootprint.toFixed(2)} kg`, 
      percentage: `${calculatePercentage(metaFootprint)}%`, 
      color: "#29B6F6" 
    },
    { 
      name: "Klaviyo", 
      value: `${klaviyoFootprint.toFixed(2)} kg`, 
      percentage: `${calculatePercentage(klaviyoFootprint)}%`, 
      color: "#FF9800" 
    },
    { 
      name: "Google", 
      value: `${googleFootprint.toFixed(2)} kg`, 
      percentage: `${calculatePercentage(googleFootprint)}%`, 
      color: "#7E57C2" 
    },
  ];

  // Line Chart Data
  const lineData = {
    labels: ["16", "18", "20", "22", "24", "26", "28", "30"],
    datasets: [
      {
        label: "Store Visits",
        data: [1000, 1500, 1300, 2000, 1800, 2500, 2200, 2800],
        borderColor: "#7E57C2",
        tension: 0.4,
        fill: true,
        backgroundColor: "rgba(126, 87, 194, 0.2)",
        pointBackgroundColor: "#7E57C2",
      },
    ],
  };

  const cardHeight = "600px"; // Set consistent height for both cards

  return (
    <Box
      sx={{
        padding: "30px",
        marginBottom:"240px"
      }}
    >
      <Grid container spacing={3}>
        {/* Carbon Footprint by Channel */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              boxShadow: 3,
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              padding: "20px",
              height: cardHeight, // Set consistent height
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: "#333333", marginBottom: "20px" }}
            >
              Carbon Footprint by Channel
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: "300px", // Adjust Doughnut chart height
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </Box>
            {/* Legend Section */}
            <Box
              mt={3}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box flex={1}>
                {doughnutLabels.slice(0, 2).map((label, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    mb={1}
                    gap="8px"
                  >
                    <Box
                      sx={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: label.color,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "#333333", fontWeight: "bold" }}
                    >
                      {label.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#333333", fontWeight: "bold" }}
                    >
                      {label.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#999999", marginLeft: "4px" }}
                    >
                      {label.percentage}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ backgroundColor: "#E0E0E0", marginX: "10px" }}
              />
              <Box flex={1}>
                {doughnutLabels.slice(2).map((label, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    mb={1}
                    gap="8px"
                  >
                    <Box
                      sx={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: label.color,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "#333333", fontWeight: "bold" }}
                    >
                      {label.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#333333", fontWeight: "bold" }}
                    >
                      {label.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#999999", marginLeft: "4px" }}
                    >
                      {label.percentage}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Digital Carbon Footprint */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              boxShadow: 3,
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              padding: "20px",
              height: cardHeight, // Set consistent height
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: "#333333", marginBottom: "10px" }}
            >
              Digital Carbon Footprint
            </Typography>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#555555", marginBottom: "5px" }}
                >
                  Total Footprint
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: "#4CAF50", fontWeight: "bold" }}
                >
                  {totalFootprint.toFixed(2)} kg
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#4CAF50", fontWeight: "bold" }}
                >
                   CO2
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#555555", marginBottom: "5px" }}
                >
                  Total Wastage
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: "#F44336", fontWeight: "bold" }}
                >
                  {(data?.aggregated?.digitalCarbonWastage || 0).toFixed(2)} kg
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#F44336", fontWeight: "bold" }}
                >
                  CO2
                </Typography>
              </Box>
            </Box>
            <Box>
              <Line data={lineData} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoughnutChart;
