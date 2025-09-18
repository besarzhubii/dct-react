import React, { useState, useRef } from 'react';
import { Card, CardContent, Typography, CircularProgress, Box, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import sumFootprint from '../components/functions/sumFootprint'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const DigitalCarbonDashboard = (props) => {
    const { data, secondData, testRow } = props;
    const [activeIndex, setActiveIndex] = useState(null);
    const chartRef = useRef(null);

    const chartData = {
        labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N'],
        datasets: [
            {
                label: 'Digital Carbon Footprint',
                data: [6, 15, 10, 8, 11, 9, 12, 14, 6, 9, 13],
                backgroundColor: (context) => {
                    const index = context.dataIndex;
                    return index === activeIndex ? 'rgba(255, 99, 132, 0.8)' : 'rgba(102, 102, 255, 0.8)';
                },
                borderRadius: 5,
                borderWidth: 0,
                hoverBackgroundColor: 'rgba(255, 99, 132, 1)',
                hoverBorderWidth: 0,
                hoverBorderColor: 'rgba(255, 99, 132, 1)',
                hoverBorderRadius: 5,
                barThickness: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    beginAtZero: true,
                    stepSize: 5,
                    max: 15,
                    callback: function (value) {
                        return value + 'k';
                    },
                },
            },
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                setActiveIndex(elements[0].index);
            }
        },
        animation: {
            onComplete: () => {
                const chart = chartRef.current;
                if (chart) {
                    const ctx = chart.ctx;
                    chart.data.datasets[0].data.forEach((value, index) => {
                        const meta = chart.getDatasetMeta(0);
                        const bar = meta.data[index];
                        ctx.save();
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
                        ctx.beginPath();
                        ctx.moveTo(bar.x, bar.y + bar.height);
                        ctx.lineTo(bar.x, bar.y + bar.height + 20);
                        ctx.stroke();
                        ctx.restore();
                    });
                }
            },
        },
    };

    return (
        <Box sx={{ padding: '30px' }}>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={3}>
                <Box>
                    <Card sx={{ height: '100%', width: '100%', borderRadius:'15px', boxShadow: 3 }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h5" fontWeight="bold">Total Digital Carbon Footprint vs Wastage - MoM (Year To Date)</Typography>
                            </Box>
                            <Bar ref={chartRef} data={chartData} options={options} />
                        </CardContent>
                    </Card>
                </Box>
                <Box>
                    <Card sx={{ height: '100%', width: '100%', borderRadius:'15px', boxShadow: 3, textAlign:"center" }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" textAlign="center" mb={2}>
                                <Typography sx={{marginTop: "100px"}} variant="h5" fontWeight="bold">Digital Carbon Score</Typography>
                                <IconButton size="small">
                                    <InfoOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box position="relative" display="inline-flex" marginTop={2} justifyContent="center" alignItems="center">
                                <CircularProgress variant="determinate" value={38} size={150} thickness={3} style={{ color: 'rgba(102, 102, 255, 1)' }} />
                                <Box
                                    top={0}
                                    left={0}
                                    bottom={0}
                                    right={0}
                                    position="absolute"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Typography variant="h4" component="div" color="textPrimary" fontWeight="bold">
                                        {sumFootprint(secondData?.facebookCarbonFootprint , secondData?.shopifyCarbonFootprint , secondData?.klaviyoCarbonFootprint)*100/sumFootprint(secondData?.facebookCarbonFootprint , secondData?.shopifyCarbonFootprint , secondData?.klaviyoCarbonFootprint)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box marginTop={3} display="flex" justifyContent="center" alignItems="center" flexDirection="column" textAlign="center">
                                <Typography variant="body1" fontWeight="bold" color="textPrimary">Total Digital Carbon</Typography>
                                <Typography variant="body1" color="textPrimary">{sumFootprint(data?.facebookCarbonFootprint , data?.shopifyCarbonFootprint ,data?.klaviyoCarbonFootprint)}</Typography>
                            </Box>
                            <Box marginTop={1} display="flex" justifyContent="center" alignItems="center" flexDirection="column" textAlign="center">
                                <Typography variant="body1" color="textSecondary">Total Digital Wastage</Typography>
                                <Typography variant="body1" color="textSecondary">{sumFootprint(secondData?.facebookCarbonFootprint , secondData?.shopifyCarbonFootprint , secondData?.klaviyoCarbonFootprint)}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};

export default DigitalCarbonDashboard;
