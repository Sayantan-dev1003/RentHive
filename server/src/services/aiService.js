const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

// Import database models for integration
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

class AIService {
  constructor() {
    // Cache for parsed data to avoid re-parsing on every request
    this.dynamicPricingCache = null;
    this.rentalHistoryCache = null;
    this.lateReturnsCache = null;
  }

  /**
   * Parse CSV file using fast-csv
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<Array>} Parsed CSV data
   */
  async parseCsv(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: true }))
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Read and parse JSON file
   * @param {string} filePath - Path to JSON file
   * @returns {Promise<Array>} Parsed JSON data
   */
  async parseJson(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Error reading JSON file: ${error.message}`);
    }
  }

  /**
   * Dynamic Demand-Based Pricing
   * Analyzes rental patterns and adjusts prices based on demand
   * @returns {Promise<Array>} Array of products with new prices
   */
  async calculateDynamicPricing() {
    try {
      // Use cache if available, otherwise parse the file
      if (!this.dynamicPricingCache) {
        const csvPath = path.join(__dirname, '../../../Dynamic.csv');
        this.dynamicPricingCache = await this.parseCsv(csvPath);
      }

      const data = this.dynamicPricingCache;
      
      // Group data by product_id
      const productGroups = data.reduce((acc, row) => {
        const productId = row.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            product_id: productId,
            product_name: row.product_name,
            records: []
          };
        }
        
        acc[productId].records.push({
          month: row.month,
          rentals_count: parseInt(row.rentals_count),
          base_price: parseFloat(row.base_price.replace('₹', '').replace(',', ''))
        });
        
        return acc;
      }, {});

      const pricingResults = [];

      // Process each product
      for (const productId in productGroups) {
        const product = productGroups[productId];
        const records = product.records;

        // Calculate average rentals per month
        const totalRentals = records.reduce((sum, record) => sum + record.rentals_count, 0);
        const averageRentals = totalRentals / records.length;

        // Find the latest month's data
        const latestRecord = records.reduce((latest, current) => {
          return new Date(latest.month) > new Date(current.month) ? latest : current;
        });

        // Calculate new price based on demand
        let newPrice = latestRecord.base_price;
        const latestDemand = latestRecord.rentals_count;

        if (latestDemand > averageRentals) {
          // High demand: increase price by 10%
          newPrice = Math.round(latestRecord.base_price * 1.10);
        } else if (latestDemand < averageRentals) {
          // Low demand: decrease price by 5%
          newPrice = Math.round(latestRecord.base_price * 0.95);
        }

        pricingResults.push({
          product_id: productId,
          product_name: product.product_name,
          base_price: latestRecord.base_price,
          average_monthly_rentals: Math.round(averageRentals * 100) / 100,
          latest_month_rentals: latestDemand,
          price_adjustment: newPrice !== latestRecord.base_price ? 
            (newPrice > latestRecord.base_price ? '+10%' : '-5%') : 'No change',
          new_price: newPrice
        });
      }

      return pricingResults;
    } catch (error) {
      throw new Error(`Error calculating dynamic pricing: ${error.message}`);
    }
  }

  /**
   * Rental Duration Recommendation
   * Finds the most common rental duration for a specific product
   * @param {string} productId - Product ID to analyze
   * @returns {Promise<Object>} Recommended duration for the product
   */
  async recommendRentalDuration(productId) {
    try {
      // Use cache if available, otherwise parse the file
      if (!this.rentalHistoryCache) {
        const jsonPath = path.join(__dirname, '../../../rental_history.json');
        this.rentalHistoryCache = await this.parseJson(jsonPath);
      }

      const data = this.rentalHistoryCache;

      // Filter records for the specific product
      const productRentals = data.filter(record => record.product_id === productId);

      if (productRentals.length === 0) {
        return {
          product_id: productId,
          recommended_duration: null,
          message: 'No rental history found for this product',
          analysis: {
            total_rentals: 0,
            duration_distribution: {}
          }
        };
      }

      // Count frequency of each rental duration
      const durationCounts = productRentals.reduce((counts, record) => {
        const duration = record.rental_duration_days;
        counts[duration] = (counts[duration] || 0) + 1;
        return counts;
      }, {});

      // Find the most common duration
      const mostCommonDuration = Object.keys(durationCounts).reduce((a, b) => 
        durationCounts[a] > durationCounts[b] ? a : b
      );

      // Get product name from the first record
      const productName = productRentals[0].product_name;

      // Calculate additional statistics
      const totalRentals = productRentals.length;
      const averageDuration = productRentals.reduce((sum, record) => 
        sum + record.rental_duration_days, 0) / totalRentals;

      // Sort duration distribution for better readability
      const sortedDistribution = Object.keys(durationCounts)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .reduce((obj, key) => {
          obj[`${key} days`] = durationCounts[key];
          return obj;
        }, {});

      return {
        product_id: productId,
        product_name: productName,
        recommended_duration: parseInt(mostCommonDuration),
        confidence: Math.round((durationCounts[mostCommonDuration] / totalRentals) * 100),
        analysis: {
          total_rentals: totalRentals,
          average_duration: Math.round(averageDuration * 100) / 100,
          duration_distribution: sortedDistribution,
          most_common_frequency: durationCounts[mostCommonDuration]
        }
      };
    } catch (error) {
      throw new Error(`Error recommending rental duration: ${error.message}`);
    }
  }

  /**
   * Late Return Prediction
   * Predicts late return risk for a customer based on their history
   * @param {string} customerId - Customer ID to analyze
   * @returns {Promise<Object>} Risk assessment for the customer
   */
  async predictLateReturn(customerId) {
    try {
      // Use cache if available, otherwise parse the file
      if (!this.lateReturnsCache) {
        const csvPath = path.join(__dirname, '../../../late_returns.csv');
        this.lateReturnsCache = await this.parseCsv(csvPath);
      }

      const data = this.lateReturnsCache;

      // Filter records for the specific customer
      const customerRecords = data.filter(record => record.customer_id === customerId);

      if (customerRecords.length === 0) {
        return {
          customer_id: customerId,
          risk: 'unknown',
          message: 'No rental history found for this customer',
          analysis: {
            total_rentals: 0,
            late_returns: 0,
            on_time_returns: 0,
            late_return_rate: 0
          }
        };
      }

      // Get the most recent record for past late returns count
      const latestRecord = customerRecords.reduce((latest, current) => {
        return new Date(latest.rental_id) > new Date(current.rental_id) ? latest : current;
      });

      const pastLateReturns = parseInt(latestRecord.customer_past_late_returns) || 0;

      // Calculate additional statistics
      const totalRentals = customerRecords.length;
      const actualLateReturns = customerRecords.filter(record => 
        parseInt(record.is_late) === 1
      ).length;
      const onTimeReturns = totalRentals - actualLateReturns;
      const lateReturnRate = totalRentals > 0 ? (actualLateReturns / totalRentals) * 100 : 0;

      // Determine risk level based on past late returns
      let risk;
      let riskScore;
      
      if (pastLateReturns > 3) {
        risk = 'high';
        riskScore = 85;
      } else if (pastLateReturns >= 1) {
        risk = 'medium';
        riskScore = 55;
      } else {
        risk = 'low';
        riskScore = 15;
      }

      // Adjust risk score based on actual performance
      if (lateReturnRate > 50) {
        riskScore = Math.min(riskScore + 15, 100);
      } else if (lateReturnRate < 10) {
        riskScore = Math.max(riskScore - 10, 0);
      }

      // Determine final risk category based on adjusted score
      if (riskScore >= 70) {
        risk = 'high';
      } else if (riskScore >= 40) {
        risk = 'medium';
      } else {
        risk = 'low';
      }

      // Analyze payment patterns
      const paymentTypes = customerRecords.reduce((types, record) => {
        const type = record.payment_type;
        types[type] = (types[type] || 0) + 1;
        return types;
      }, {});

      return {
        customer_id: customerId,
        risk: risk,
        risk_score: riskScore,
        analysis: {
          total_rentals: totalRentals,
          past_late_returns_reported: pastLateReturns,
          actual_late_returns: actualLateReturns,
          on_time_returns: onTimeReturns,
          late_return_rate: Math.round(lateReturnRate * 100) / 100,
          payment_type_distribution: paymentTypes,
          risk_factors: {
            high_past_late_count: pastLateReturns > 3,
            medium_past_late_count: pastLateReturns >= 1 && pastLateReturns <= 3,
            high_actual_late_rate: lateReturnRate > 50,
            consistent_customer: totalRentals >= 5
          }
        },
        recommendations: this.generateRiskRecommendations(risk, riskScore, pastLateReturns, lateReturnRate)
      };
    } catch (error) {
      throw new Error(`Error predicting late return: ${error.message}`);
    }
  }

  /**
   * Generate recommendations based on risk assessment
   * @param {string} risk - Risk level (low/medium/high)
   * @param {number} riskScore - Numeric risk score
   * @param {number} pastLateReturns - Number of past late returns
   * @param {number} lateReturnRate - Percentage of late returns
   * @returns {Array} Array of recommendations
   */
  generateRiskRecommendations(risk, riskScore, pastLateReturns, lateReturnRate) {
    const recommendations = [];

    if (risk === 'high') {
      recommendations.push('Require additional security deposit');
      recommendations.push('Consider shorter rental periods');
      recommendations.push('Implement stricter return policies');
      recommendations.push('Send frequent reminder notifications');
    } else if (risk === 'medium') {
      recommendations.push('Send timely reminder notifications');
      recommendations.push('Consider slight security deposit increase');
      recommendations.push('Monitor closely during rental period');
    } else {
      recommendations.push('Standard rental terms apply');
      recommendations.push('Consider offering loyalty benefits');
    }

    if (lateReturnRate > 30) {
      recommendations.push('Review customer communication preferences');
    }

    if (pastLateReturns === 0 && lateReturnRate < 5) {
      recommendations.push('Excellent customer - consider premium services');
    }

    return recommendations;
  }

  /**
   * Clear all caches (useful for testing or when data files are updated)
   */
  clearCache() {
    this.dynamicPricingCache = null;
    this.rentalHistoryCache = null;
    this.lateReturnsCache = null;
  }

  /**
   * Update database product prices based on AI recommendations
   * @param {string} productId - Product ID to update (optional, updates all if not provided)
   * @returns {Promise<Array>} Updated products
   */
  async updateDatabasePrices(productId = null) {
    try {
      const pricingData = await this.calculateDynamicPricing();
      const updatedProducts = [];

      const productsToUpdate = productId 
        ? pricingData.filter(p => p.product_id === productId)
        : pricingData.filter(p => p.price_adjustment !== 'No change');

      for (const pricing of productsToUpdate) {
        try {
          // Find product in database by matching name (since IDs might be different)
          const product = await Product.findOne({ 
            name: { $regex: pricing.product_name, $options: 'i' }
          });

          if (product) {
            // Calculate percentage change
            const multiplier = pricing.new_price / pricing.base_price;
            
            // Update all pricing tiers proportionally
            const updatedPricing = {
              hour: Math.round(product.pricing.hour * multiplier),
              day: Math.round(product.pricing.day * multiplier),
              week: Math.round(product.pricing.week * multiplier),
              month: Math.round(product.pricing.month * multiplier)
            };

            const updatedProduct = await Product.findByIdAndUpdate(
              product._id,
              { pricing: updatedPricing },
              { new: true }
            );

            updatedProducts.push({
              productId: updatedProduct._id,
              productName: updatedProduct.name,
              oldPricing: product.pricing,
              newPricing: updatedPricing,
              adjustment: pricing.price_adjustment
            });
          }
        } catch (error) {
          console.error(`Error updating product ${pricing.product_name}:`, error);
        }
      }

      return updatedProducts;
    } catch (error) {
      throw new Error(`Error updating database prices: ${error.message}`);
    }
  }

  /**
   * Get rental insights from actual database orders
   * @param {string} productId - Database product ID
   * @returns {Promise<Object>} Database-based rental insights
   */
  async getDatabaseRentalInsights(productId) {
    try {
      // Get actual orders for this product from database
      const orders = await Order.find({
        'items.productId': productId,
        status: { $in: ['returned', 'picked_up', 'late'] }
      }).populate('customerId', 'role').populate('items.productId', 'name');

      if (orders.length === 0) {
        return {
          productId,
          message: 'No rental history found in database',
          fallback_csv_recommendation: await this.recommendRentalDuration(productId)
        };
      }

      // Extract rental durations from actual orders
      const rentalDurations = [];
      const customerTypes = [];
      
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.productId._id.toString() === productId) {
            const startDate = new Date(item.rentalDuration.startDate);
            const endDate = new Date(item.rentalDuration.endDate);
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            rentalDurations.push(duration);
            customerTypes.push(order.customerId.role || 'customer');
          }
        });
      });

      // Calculate statistics
      const durationCounts = rentalDurations.reduce((counts, duration) => {
        counts[duration] = (counts[duration] || 0) + 1;
        return counts;
      }, {});

      const mostCommonDuration = Object.keys(durationCounts).reduce((a, b) => 
        durationCounts[a] > durationCounts[b] ? a : b
      );

      const averageDuration = rentalDurations.reduce((sum, d) => sum + d, 0) / rentalDurations.length;

      // Customer type analysis
      const customerTypeAnalysis = customerTypes.reduce((counts, type) => {
        counts[type] = (counts[type] || 0) + 1;
        return counts;
      }, {});

      return {
        productId,
        productName: orders[0].items.find(item => 
          item.productId._id.toString() === productId
        )?.productId.name,
        database_insights: {
          total_rentals: rentalDurations.length,
          recommended_duration: parseInt(mostCommonDuration),
          average_duration: Math.round(averageDuration * 100) / 100,
          duration_distribution: durationCounts,
          customer_type_breakdown: customerTypeAnalysis,
          confidence: Math.round((durationCounts[mostCommonDuration] / rentalDurations.length) * 100)
        },
        source: 'database'
      };
    } catch (error) {
      throw new Error(`Error getting database rental insights: ${error.message}`);
    }
  }

  /**
   * Get customer risk assessment from actual database orders
   * @param {string} customerId - Database customer ID
   * @returns {Promise<Object>} Database-based risk assessment
   */
  async getDatabaseCustomerRisk(customerId) {
    try {
      // Get actual orders for this customer
      const orders = await Order.find({
        customerId: customerId
      }).populate('customerId', 'name email role');

      if (orders.length === 0) {
        return {
          customerId,
          message: 'No order history found in database',
          risk: 'unknown',
          source: 'database'
        };
      }

      const customer = orders[0].customerId;
      let lateReturns = 0;
      let totalOrders = orders.length;
      let currentlyOverdue = 0;

      // Analyze order history
      orders.forEach(order => {
        if (order.status === 'late' || order.daysOverdue > 0) {
          lateReturns++;
        }
        if (order.isOverdue) {
          currentlyOverdue++;
        }
      });

      const lateReturnRate = (lateReturns / totalOrders) * 100;

      // Risk calculation based on database data
      let risk = 'low';
      let riskScore = 20;

      if (lateReturnRate > 50 || currentlyOverdue > 0) {
        risk = 'high';
        riskScore = 80;
      } else if (lateReturnRate > 20 || lateReturns > 2) {
        risk = 'medium';
        riskScore = 50;
      }

      // Additional factors
      if (totalOrders < 3) {
        riskScore += 10; // New customers have slightly higher risk
      }

      const recommendations = this.generateRiskRecommendations(risk, riskScore, lateReturns, lateReturnRate);

      return {
        customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        risk,
        riskScore: Math.min(riskScore, 100),
        database_analysis: {
          total_orders: totalOrders,
          late_returns: lateReturns,
          late_return_rate: Math.round(lateReturnRate * 100) / 100,
          currently_overdue: currentlyOverdue,
          customer_type: customer.role,
          member_since: customer.createdAt
        },
        recommendations,
        source: 'database',
        fallback_csv_prediction: totalOrders < 5 ? await this.predictLateReturn(customerId) : null
      };
    } catch (error) {
      throw new Error(`Error getting database customer risk: ${error.message}`);
    }
  }

  /**
   * Hybrid recommendation combining database and CSV data
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Combined insights
   */
  async getHybridProductRecommendation(productId) {
    try {
      const [dbInsights, csvInsights] = await Promise.all([
        this.getDatabaseRentalInsights(productId).catch(() => null),
        this.recommendRentalDuration(productId).catch(() => null)
      ]);

      return {
        productId,
        hybrid_recommendation: {
          database_insights: dbInsights,
          csv_insights: csvInsights,
          final_recommendation: dbInsights?.database_insights?.total_rentals >= 5 
            ? dbInsights.database_insights.recommended_duration
            : csvInsights?.recommended_duration,
          confidence_source: dbInsights?.database_insights?.total_rentals >= 5 ? 'database' : 'csv',
          data_quality: {
            database_orders: dbInsights?.database_insights?.total_rentals || 0,
            csv_records: csvInsights?.analysis?.total_rentals || 0
          }
        },
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error generating hybrid recommendation: ${error.message}`);
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   * @returns {Promise<Object>} Dashboard analytics
   */
  async getAnalyticsDashboard() {
    try {
      const [pricingData, dbStats] = await Promise.all([
        this.calculateDynamicPricing(),
        this.getDatabaseStatistics()
      ]);

      return {
        dynamic_pricing: {
          total_products_analyzed: pricingData.length,
          price_increases: pricingData.filter(p => p.price_adjustment === '+10%').length,
          price_decreases: pricingData.filter(p => p.price_adjustment === '-5%').length,
          no_changes: pricingData.filter(p => p.price_adjustment === 'No change').length,
          avg_price_adjustment: this.calculateAveragePriceAdjustment(pricingData)
        },
        database_statistics: dbStats,
        recommendations: {
          products_needing_price_update: pricingData.filter(p => p.price_adjustment !== 'No change').length,
          high_demand_products: pricingData.filter(p => p.latest_month_rentals > p.average_monthly_rentals * 1.2).length,
          low_demand_products: pricingData.filter(p => p.latest_month_rentals < p.average_monthly_rentals * 0.8).length
        },
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error generating analytics dashboard: ${error.message}`);
    }
  }

  /**
   * Get database statistics for analytics
   * @returns {Promise<Object>} Database statistics
   */
  async getDatabaseStatistics() {
    try {
      const [
        totalProducts,
        totalOrders,
        totalCustomers,
        activeOrders,
        overdueOrders,
        recentOrders
      ] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Order.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Order.countDocuments({ status: 'picked_up' }),
        Order.countDocuments({ status: 'late' }),
        Order.countDocuments({ 
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
      ]);

      return {
        total_products: totalProducts,
        total_orders: totalOrders,
        total_customers: totalCustomers,
        active_rentals: activeOrders,
        overdue_orders: overdueOrders,
        orders_last_30_days: recentOrders
      };
    } catch (error) {
      throw new Error(`Error getting database statistics: ${error.message}`);
    }
  }

  /**
   * Calculate average price adjustment percentage
   * @param {Array} pricingData - Pricing data array
   * @returns {number} Average adjustment percentage
   */
  calculateAveragePriceAdjustment(pricingData) {
    const adjustments = pricingData.map(p => {
      if (p.price_adjustment === '+10%') return 10;
      if (p.price_adjustment === '-5%') return -5;
      return 0;
    });

    return adjustments.reduce((sum, adj) => sum + adj, 0) / adjustments.length;
  }

  /**
   * Get comprehensive AI insights for a product
   * @param {string} productId - Product ID to analyze
   * @returns {Promise<Object>} Comprehensive insights
   */
  async getProductInsights(productId) {
    try {
      const [pricingData, durationData] = await Promise.all([
        this.calculateDynamicPricing(),
        this.recommendRentalDuration(productId)
      ]);

      const productPricing = pricingData.find(p => p.product_id === productId);

      return {
        product_id: productId,
        pricing_insights: productPricing || { message: 'No pricing data found' },
        duration_insights: durationData,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error getting product insights: ${error.message}`);
    }
  }

  /**
   * Get comprehensive AI insights for a customer
   * @param {string} customerId - Customer ID to analyze
   * @returns {Promise<Object>} Comprehensive customer insights
   */
  async getCustomerInsights(customerId) {
    try {
      const riskData = await this.predictLateReturn(customerId);

      return {
        customer_id: customerId,
        risk_assessment: riskData,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error getting customer insights: ${error.message}`);
    }
  }
}

module.exports = new AIService();
