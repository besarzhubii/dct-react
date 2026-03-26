import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API || 'http://localhost:3004';

export interface PlatformMetrics {
    impressions?: number;
    clicks?: number;
    recipients?: number;
    linkClicks?: number;
    digitalCarbonFootprint: number;
    digitalCarbonWastage: number;
    digitalCarbonScore: number;
    rating: string;
    industryAverage?: number;
    industryComparison?: number;
    unit: string;
}

export interface PlatformData {
    configured: boolean;
    impressions?: number;
    clicks?: number;
    recipients?: number;
    digitalCarbonFootprint?: number;
    digitalCarbonWastage?: number;
    digitalCarbonScore?: number;
    rating?: string;
    unit?: string;
    error?: string;
}

export interface AggregatedResponse {
    userId: number;
    userName: string;
    email: string;
    dateRange: {
        start_date?: string;
        end_date?: string;
    };
    platforms: {
        shopify: PlatformData;
        klaviyo: PlatformData;
        meta: PlatformData;
        google: PlatformData;
    };
    aggregated: {
        totalImpressions: number;
        totalClicks: number;
        totalFootprint: number;
        totalWastage: number;
        digitalCarbonFootprint: number;
        digitalCarbonWastage: number;
        digitalCarbonScore: number;
        rating: string;
        unit: string;
    };
}

/**
 * Fetch all platforms data (aggregated)
 */
export const fetchAllPlatformsData = async (
    userId: number,
    startDate?: string,
    endDate?: string
): Promise<AggregatedResponse> => {
    const response = await axios.post(`${API_BASE_URL}/platforms/all/${userId}`, {
        start_date: startDate,
        end_date: endDate
    });
    return response.data;
};

/**
 * Get platform configuration status
 */
export const getPlatformStatus = async (userId: number) => {
    const response = await axios.get(`${API_BASE_URL}/platforms/status/${userId}`);
    return response.data;
};

/**
 * Fetch Shopify data
 */
export const fetchShopifyData = async (
    userId: number,
    startDate?: string,
    endDate?: string
) => {
    const response = await axios.post(`${API_BASE_URL}/platforms/shopify/${userId}`, {
        start_date: startDate,
        end_date: endDate
    });
    return response.data;
};

/**
 * Calculate Shopify footprint
 */
export const calculateShopifyFootprint = async (
    impressions: number,
    linkClicks: number
): Promise<PlatformMetrics> => {
    const response = await axios.post(`${API_BASE_URL}/platforms/shopify/calculate`, {
        impressions,
        linkClicks
    });
    return response.data;
};

/**
 * Fetch Klaviyo data
 */
export const fetchKlaviyoData = async (
    userId: number,
    startDate?: string,
    endDate?: string,
    campaignId?: string
) => {
    const response = await axios.post(`${API_BASE_URL}/platforms/klaviyo/${userId}`, {
        start_date: startDate,
        end_date: endDate,
        campaignId
    });
    return response.data;
};

/**
 * Calculate Klaviyo footprint
 */
export const calculateKlaviyoFootprint = async (
    recipients: number,
    clicks: number
): Promise<PlatformMetrics> => {
    const response = await axios.post(`${API_BASE_URL}/platforms/klaviyo/calculate`, {
        recipients,
        clicks
    });
    return response.data;
};

/**
 * Fetch Meta (Facebook) data
 */
export const fetchMetaData = async (
    userId: number,
    startDate?: string,
    endDate?: string,
    adAccountId?: string
) => {
    const response = await axios.post(`${API_BASE_URL}/platforms/meta/${userId}`, {
        start_date: startDate,
        end_date: endDate,
        adAccountId
    });
    return response.data;
};

/**
 * Calculate Meta footprint
 */
export const calculateMetaFootprint = async (
    impressions: number,
    clicks: number
): Promise<PlatformMetrics> => {
    const response = await axios.post(`${API_BASE_URL}/platforms/meta/calculate`, {
        impressions,
        clicks
    });
    return response.data;
};

/**
 * Fetch Google Ads data
 */
export const fetchGoogleAdsData = async (
    userId: number,
    startDate?: string,
    endDate?: string,
    customerId?: string
) => {
    const response = await axios.post(`${API_BASE_URL}/platforms/google/${userId}`, {
        start_date: startDate,
        end_date: endDate,
        customerId
    });
    return response.data;
};

/**
 * Calculate Google Ads footprint
 */
export const calculateGoogleAdsFootprint = async (
    impressions: number,
    clicks: number
): Promise<PlatformMetrics> => {
    const response = await axios.post(`${API_BASE_URL}/platforms/google/calculate`, {
        impressions,
        clicks
    });
    return response.data;
};

/**
 * Helper function to format carbon value
 */
export const formatCarbonValue = (value: number | string | undefined): string => {
    if (value === undefined || value === null || value === 'N/A') return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? 'N/A' : `${numValue.toFixed(2)} kg CO2`;
};

/**
 * Helper function to get rating color
 */
export const getRatingColor = (rating: string): string => {
    switch (rating) {
        case 'Excellent':
            return '#4CAF50'; // Green
        case 'Good':
            return '#2196F3'; // Blue
        case 'Needs work':
            return '#FF9800'; // Orange
        case 'High waste':
            return '#F44336'; // Red
        default:
            return '#757575'; // Grey
    }
};

/**
 * Helper function to get score color
 */
export const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Excellent
    if (score >= 60) return '#2196F3'; // Good
    if (score >= 40) return '#FF9800'; // Needs work
    return '#F44336'; // High waste
};

