const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Valid metric types
const VALID_METRICS = ['temperature', 'pressure', 'vibration', 'power'];

// Get all metrics data
router.get('/', async (req, res) => {
  try {
    const allData = {};
    
    for (const metric of VALID_METRICS) {
      const filePath = path.join(__dirname, '../data', `${metric}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      allData[metric] = JSON.parse(data);
    }
    
    res.json(allData);
  } catch (error) {
    console.error('Error reading metrics data:', error);
    res.status(500).json({ error: 'Failed to load metrics data' });
  }
});

// Get specific metric data
router.get('/:metricType', async (req, res) => {
  try {
    const { metricType } = req.params;
    
    // Validate metric type
    if (!VALID_METRICS.includes(metricType)) {
      return res.status(400).json({ 
        error: 'Invalid metric type',
        validTypes: VALID_METRICS 
      });
    }
    
    // Read the data file
    const filePath = path.join(__dirname, '../data', `${metricType}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    res.json(jsonData);
  } catch (error) {
    console.error(`Error reading ${req.params.metricType} data:`, error);
    
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Metric data not found' });
    } else {
      res.status(500).json({ error: 'Failed to load metric data' });
    }
  }
});

module.exports = router;
