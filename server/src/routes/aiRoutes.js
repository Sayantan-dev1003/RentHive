const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

/**
 * @swagger
 * components:
 *   schemas:
 *     DynamicPricing:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *           description: Unique product identifier
 *         product_name:
 *           type: string
 *           description: Name of the product
 *         base_price:
 *           type: number
 *           description: Original base price
 *         new_price:
 *           type: number
 *           description: Calculated new price based on demand
 *         price_adjustment:
 *           type: string
 *           description: Price adjustment description
 *         average_monthly_rentals:
 *           type: number
 *           description: Average rentals per month
 *         latest_month_rentals:
 *           type: number
 *           description: Rentals in the latest month
 *     
 *     RentalDurationRecommendation:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *           description: Product identifier
 *         product_name:
 *           type: string
 *           description: Name of the product
 *         recommended_duration:
 *           type: number
 *           description: Recommended rental duration in days
 *         confidence:
 *           type: number
 *           description: Confidence percentage of the recommendation
 *         analysis:
 *           type: object
 *           properties:
 *             total_rentals:
 *               type: number
 *             average_duration:
 *               type: number
 *             duration_distribution:
 *               type: object
 *     
 *     LateReturnPrediction:
 *       type: object
 *       properties:
 *         customer_id:
 *           type: string
 *           description: Customer identifier
 *         risk:
 *           type: string
 *           enum: [low, medium, high, unknown]
 *           description: Risk level for late return
 *         risk_score:
 *           type: number
 *           description: Numeric risk score (0-100)
 *         analysis:
 *           type: object
 *           properties:
 *             total_rentals:
 *               type: number
 *             late_returns:
 *               type: number
 *             on_time_returns:
 *               type: number
 *             late_return_rate:
 *               type: number
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/ai/dynamic-pricing:
 *   get:
 *     summary: Get dynamic pricing recommendations for all products
 *     description: Analyzes rental demand patterns and calculates price adjustments based on demand vs average rentals
 *     tags: [AI/ML Features]
 *     responses:
 *       200:
 *         description: Dynamic pricing recommendations calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DynamicPricing'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total_products:
 *                       type: number
 *                     price_increases:
 *                       type: number
 *                     price_decreases:
 *                       type: number
 *                     no_change:
 *                       type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get('/dynamic-pricing', async (req, res) => {
  try {
    const pricingData = await aiService.calculateDynamicPricing();
    
    // Calculate metadata
    const meta = {
      total_products: pricingData.length,
      price_increases: pricingData.filter(p => p.price_adjustment === '+10%').length,
      price_decreases: pricingData.filter(p => p.price_adjustment === '-5%').length,
      no_change: pricingData.filter(p => p.price_adjustment === 'No change').length
    };

    res.status(200).json({
      success: true,
      message: 'Dynamic pricing calculated successfully',
      data: pricingData,
      meta: meta
    });
  } catch (error) {
    console.error('Dynamic pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating dynamic pricing',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/recommend-duration/{productId}:
 *   get:
 *     summary: Get rental duration recommendation for a specific product
 *     description: Analyzes historical rental data to recommend the most common rental duration for a product
 *     tags: [AI/ML Features]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to get duration recommendation for
 *     responses:
 *       200:
 *         description: Duration recommendation calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RentalDurationRecommendation'
 *       400:
 *         description: Bad request - missing or invalid product ID
 *       500:
 *         description: Server error
 */
router.get('/recommend-duration/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const recommendation = await aiService.recommendRentalDuration(productId);
    
    res.status(200).json({
      success: true,
      message: 'Duration recommendation calculated successfully',
      data: recommendation
    });
  } catch (error) {
    console.error('Duration recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating duration recommendation',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/predict-late/{customerId}:
 *   get:
 *     summary: Predict late return risk for a specific customer
 *     description: Analyzes customer's rental history to predict the likelihood of late returns
 *     tags: [AI/ML Features]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID to predict late return risk for
 *     responses:
 *       200:
 *         description: Late return prediction calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/LateReturnPrediction'
 *       400:
 *         description: Bad request - missing or invalid customer ID
 *       500:
 *         description: Server error
 */
router.get('/predict-late/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    const prediction = await aiService.predictLateReturn(customerId);
    
    res.status(200).json({
      success: true,
      message: 'Late return prediction calculated successfully',
      data: prediction
    });
  } catch (error) {
    console.error('Late return prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error predicting late return',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/insights/product/{productId}:
 *   get:
 *     summary: Get comprehensive AI insights for a product
 *     description: Combines pricing and duration insights for a specific product
 *     tags: [AI/ML Features]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to get insights for
 *     responses:
 *       200:
 *         description: Product insights calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     pricing_insights:
 *                       $ref: '#/components/schemas/DynamicPricing'
 *                     duration_insights:
 *                       $ref: '#/components/schemas/RentalDurationRecommendation'
 *                     generated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - missing or invalid product ID
 *       500:
 *         description: Server error
 */
router.get('/insights/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const insights = await aiService.getProductInsights(productId);
    
    res.status(200).json({
      success: true,
      message: 'Product insights calculated successfully',
      data: insights
    });
  } catch (error) {
    console.error('Product insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating product insights',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/insights/customer/{customerId}:
 *   get:
 *     summary: Get comprehensive AI insights for a customer
 *     description: Provides risk assessment and recommendations for a specific customer
 *     tags: [AI/ML Features]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID to get insights for
 *     responses:
 *       200:
 *         description: Customer insights calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer_id:
 *                       type: string
 *                     risk_assessment:
 *                       $ref: '#/components/schemas/LateReturnPrediction'
 *                     generated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - missing or invalid customer ID
 *       500:
 *         description: Server error
 */
router.get('/insights/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    const insights = await aiService.getCustomerInsights(customerId);
    
    res.status(200).json({
      success: true,
      message: 'Customer insights calculated successfully',
      data: insights
    });
  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating customer insights',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/cache/clear:
 *   post:
 *     summary: Clear AI service cache
 *     description: Clears all cached data in the AI service (useful when data files are updated)
 *     tags: [AI/ML Features]
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/cache/clear', async (req, res) => {
  try {
    aiService.clearCache();
    
    res.status(200).json({
      success: true,
      message: 'AI service cache cleared successfully'
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cache',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/database/pricing/update:
 *   post:
 *     summary: Update database product prices based on AI recommendations
 *     description: Applies dynamic pricing recommendations to actual database products
 *     tags: [AI/ML Features]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Specific product ID to update (optional, updates all if not provided)
 *     responses:
 *       200:
 *         description: Database prices updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       productName:
 *                         type: string
 *                       oldPricing:
 *                         type: object
 *                       newPricing:
 *                         type: object
 *                       adjustment:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.post('/database/pricing/update', async (req, res) => {
  try {
    const { productId } = req.body;
    const updatedProducts = await aiService.updateDatabasePrices(productId);
    
    res.status(200).json({
      success: true,
      message: `${updatedProducts.length} products updated successfully`,
      data: updatedProducts
    });
  } catch (error) {
    console.error('Database pricing update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating database prices',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/database/rental-insights/{productId}:
 *   get:
 *     summary: Get rental insights from actual database orders
 *     description: Analyzes real order data to provide rental duration recommendations
 *     tags: [AI/ML Features]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Database product ID
 *     responses:
 *       200:
 *         description: Database rental insights retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/database/rental-insights/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const insights = await aiService.getDatabaseRentalInsights(productId);
    
    res.status(200).json({
      success: true,
      message: 'Database rental insights retrieved successfully',
      data: insights
    });
  } catch (error) {
    console.error('Database rental insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting database rental insights',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/database/customer-risk/{customerId}:
 *   get:
 *     summary: Get customer risk assessment from actual database orders
 *     description: Analyzes real customer order history to assess late return risk
 *     tags: [AI/ML Features]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Database customer ID
 *     responses:
 *       200:
 *         description: Database customer risk assessment retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/database/customer-risk/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    const riskAssessment = await aiService.getDatabaseCustomerRisk(customerId);
    
    res.status(200).json({
      success: true,
      message: 'Database customer risk assessment retrieved successfully',
      data: riskAssessment
    });
  } catch (error) {
    console.error('Database customer risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting database customer risk',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/hybrid/product-recommendation/{productId}:
 *   get:
 *     summary: Get hybrid product recommendation combining database and CSV data
 *     description: Provides the best recommendation using both real database data and CSV insights
 *     tags: [AI/ML Features]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Hybrid recommendation retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/hybrid/product-recommendation/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const recommendation = await aiService.getHybridProductRecommendation(productId);
    
    res.status(200).json({
      success: true,
      message: 'Hybrid product recommendation retrieved successfully',
      data: recommendation
    });
  } catch (error) {
    console.error('Hybrid recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting hybrid recommendation',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/analytics/dashboard:
 *   get:
 *     summary: Get comprehensive AI analytics dashboard data
 *     description: Provides overview of all AI features with database statistics
 *     tags: [AI/ML Features]
 *     responses:
 *       200:
 *         description: Analytics dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     dynamic_pricing:
 *                       type: object
 *                     database_statistics:
 *                       type: object
 *                     recommendations:
 *                       type: object
 *                     generated_at:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const dashboardData = await aiService.getAnalyticsDashboard();
    
    res.status(200).json({
      success: true,
      message: 'Analytics dashboard data retrieved successfully',
      data: dashboardData
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting analytics dashboard data',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/health:
 *   get:
 *     summary: Check AI service health
 *     description: Checks if AI service can access all required data files
 *     tags: [AI/ML Features]
 *     responses:
 *       200:
 *         description: AI service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     files_accessible:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *       500:
 *         description: AI service health check failed
 */
router.get('/health', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const files = {
      dynamic_csv: path.join(__dirname, '../../../Dynamic.csv'),
      late_returns_csv: path.join(__dirname, '../../../late_returns.csv'),
      rental_history_json: path.join(__dirname, '../../../rental_history.json')
    };
    
    const fileStatus = {};
    
    for (const [key, filePath] of Object.entries(files)) {
      try {
        const stats = fs.statSync(filePath);
        fileStatus[key] = {
          accessible: true,
          size: stats.size,
          modified: stats.mtime
        };
      } catch (error) {
        fileStatus[key] = {
          accessible: false,
          error: error.message
        };
      }
    }
    
    const allFilesAccessible = Object.values(fileStatus).every(status => status.accessible);
    
    res.status(200).json({
      success: true,
      message: allFilesAccessible ? 'AI service is healthy' : 'Some data files are inaccessible',
      data: {
        status: allFilesAccessible ? 'healthy' : 'degraded',
        files_accessible: fileStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service health check failed',
      error: error.message
    });
  }
});

module.exports = router;
