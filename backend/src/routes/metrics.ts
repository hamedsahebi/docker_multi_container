import express, { Request, Response, Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { MetricType, SensorData, AllMetricsData, ErrorResponse } from '../types';
import { isAuthenticated } from '../middleware/auth';

const router: Router = express.Router();

// Valid metric types
const VALID_METRICS: MetricType[] = ['temperature', 'pressure', 'vibration', 'power'];

// Get all metrics data (protected)
router.get('/', isAuthenticated, async (_req: Request, res: Response<AllMetricsData | ErrorResponse>) => {
  try {
    const allData: Partial<AllMetricsData> = {};
    
    for (const metric of VALID_METRICS) {
      const filePath = path.join(__dirname, '../../data', `${metric}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      allData[metric] = JSON.parse(data) as SensorData[];
    }
    
    res.json(allData as AllMetricsData);
  } catch (error) {
    console.error('Error reading metrics data:', error);
    res.status(500).json({ error: 'Failed to load metrics data' });
  }
});

// Get specific metric data (protected)
router.get('/:metricType', isAuthenticated, async (req: Request<{ metricType: string }>, res: Response<SensorData[] | ErrorResponse>) => {
  try {
    const { metricType } = req.params;
    
    // Validate metric type
    if (!VALID_METRICS.includes(metricType as MetricType)) {
      return res.status(400).json({ 
        error: 'Invalid metric type',
        validTypes: VALID_METRICS 
      });
    }
    
    // Read the data file
    const filePath = path.join(__dirname, '../../data', `${metricType}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData: SensorData[] = JSON.parse(data);
    
    return res.json(jsonData);
  } catch (error: any) {
    console.error(`Error reading ${req.params.metricType} data:`, error);
    
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Metric data not found' });
    }
    
    return res.status(500).json({ error: 'Failed to load metric data' });
  }
});

export default router;
