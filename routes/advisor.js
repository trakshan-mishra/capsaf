import express from 'express';
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import axios from 'axios';

const router = express.Router();

// Get AI Recommendations
router.post('/recommend', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.userId });
    const transactions = await Transaction.find({ userId: req.userId });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const recommendations = generateRecommendations(portfolio, transactions);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// AI Chat Endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context = 'general' } = req.body;

    const portfolio = await Portfolio.findOne({ userId: req.userId });
    const transactions = await Transaction.find({ userId: req.userId }).limit(10);

    // Use free AI model (Groq or HuggingFace)
    const response = await callFreeAIModel(message, {
      portfolio,
      transactions,
      context
    });

    res.json({
      success: true,
      data: {
        message: response,
        context,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Tax Optimization Suggestions
router.get('/tax-optimization', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.userId });
    const transactions = await Transaction.find({ userId: req.userId });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const suggestions = generateTaxOptimizationSuggestions(portfolio, transactions);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Portfolio Analysis
router.get('/portfolio-analysis', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.userId });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const analysis = {
      overview: {
        totalValue: portfolio.totalValue,
        totalInvested: portfolio.totalInvested,
        gainLoss: portfolio.totalGainLoss,
        gainLossPercentage: portfolio.totalGainLossPercentage
      },
      diversification: {
        score: portfolio.diversificationScore,
        status: getDiversificationStatus(portfolio.diversificationScore),
        recommendation: getDiversificationRecommendation(portfolio.holdings)
      },
      riskAnalysis: {
        riskProfile: portfolio.riskProfile,
        volatilityIndex: calculateVolatilityIndex(portfolio.holdings),
        betaRating: calculateBetaRating(portfolio.holdings)
      },
      performance: {
        monthlyTrend: portfolio.performanceHistory.slice(-30),
        yearlyGrowth: portfolio.performanceHistory.slice(-365),
        bestPerformer: getBestPerformer(portfolio.holdings),
        worstPerformer: getWorstPerformer(portfolio.holdings)
      },
      alerts: generatePortfolioAlerts(portfolio)
    };

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Market Insights
router.get('/market-insights', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.userId });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const insights = await generateMarketInsights(portfolio.holdings);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper Functions

function generateRecommendations(portfolio, transactions) {
  const recommendations = [];

  if (portfolio.diversificationScore < 40) {
    recommendations.push({
      type: 'diversification',
      priority: 'high',
      title: 'Improve Portfolio Diversification',
      description: 'Your portfolio is concentrated in a few assets. Consider adding complementary assets.',
      action: 'Allocate funds to underrepresented asset classes'
    });
  }

  if (portfolio.holdings.length === 0) {
    recommendations.push({
      type: 'portfolio',
      priority: 'high',
      title: 'Start Building Your Portfolio',
      description: 'Begin investing in cryptocurrencies that align with your risk profile.',
      action: 'Add your first holding'
    });
  }

  const largeLosers = portfolio.holdings.filter(h => h.gainLossPercentage < -10);
  if (largeLosers.length > 0) {
    recommendations.push({
      type: 'tax-loss-harvesting',
      priority: 'medium',
      title: 'Tax Loss Harvesting Opportunity',
      description: `Consider selling ${largeLosers.map(h => h.symbol).join(', ')} to offset gains.`,
      potentialTaxSavings: calculateTaxSavings(largeLosers)
    });
  }

  return recommendations;
}

function generateTaxOptimizationSuggestions(portfolio, transactions) {
  const suggestions = [];

  const longTermHoldings = portfolio.holdings.filter(h => {
    const holdingDays = (new Date() - h.acquisitionDate) / (1000 * 60 * 60 * 24);
    return holdingDays >= 365;
  });

  if (longTermHoldings.length > 0) {
    suggestions.push({
      type: 'long-term-capital-gains',
      title: 'Long-term Capital Gains Benefit',
      description: `You have ${longTermHoldings.length} assets eligible for lower LTCG tax rates.`,
      savings: 'Up to 20% tax rate advantage',
      assets: longTermHoldings.map(h => h.symbol)
    });
  }

  const gains = transactions
    .filter(t => t.type === 'sell')
    .reduce((sum, t) => sum + (t.tax?.capitalGainsTax || 0), 0);

  if (gains > 100000) {
    suggestions.push({
      type: 'gst-registration',
      title: 'Consider GST Registration',
      description: 'High transaction volume may trigger GST registration requirements.',
      estimatedLiability: gains * 0.18
    });
  }

  return suggestions;
}

function getDiversificationStatus(score) {
  if (score >= 70) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 30) return 'Moderate';
  return 'Poor';
}

function getDiversificationRecommendation(holdings) {
  if (!holdings || holdings.length < 3) {
    return 'Add at least 3-5 different cryptocurrencies';
  }
  if (holdings.length < 10) {
    return 'Consider adding 2-3 more assets for better diversification';
  }
  return 'Portfolio is well diversified';
}

function calculateVolatilityIndex(holdings) {
  const changes = holdings.map(h => Math.abs(h.percentageChange || 0));
  return changes.reduce((a, b) => a + b, 0) / holdings.length;
}

function calculateBetaRating(holdings) {
  // Simplified beta calculation
  return holdings.length > 3 ? 'Moderate' : 'High';
}

function getBestPerformer(holdings) {
  return holdings.reduce((best, h) => 
    (h.gainLossPercentage || 0) > (best.gainLossPercentage || 0) ? h : best
  );
}

function getWorstPerformer(holdings) {
  return holdings.reduce((worst, h) => 
    (h.gainLossPercentage || 0) < (worst.gainLossPercentage || 0) ? h : worst
  );
}

function generatePortfolioAlerts(portfolio) {
  const alerts = [];
  
  if (portfolio.totalGainLossPercentage < -20) {
    alerts.push({
      level: 'warning',
      message: 'Portfolio has declined more than 20%'
    });
  }

  return alerts;
}

async function generateMarketInsights(holdings) {
  const insights = {
    market_overview: {
      btc_sentiment: 'Neutral',
      eth_sentiment: 'Bullish',
      general_trend: 'Consolidating'
    },
    your_holdings_impact: holdings.map(h => ({
      symbol: h.symbol,
      expected_movement: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
      confidence: Math.floor(Math.random() * 30) + 60 + '%'
    })),
    opportunities: [
      { asset: 'Bitcoin', reason: 'Technical support at key level', action: 'Buy on dip' },
      { asset: 'Ethereum', reason: 'Positive development news', action: 'Hold' }
    ]
  };

  return insights;
}

function calculateTaxSavings(losers) {
  const totalLoss = losers.reduce((sum, h) => sum + (h.gainLoss || 0), 0);
  return totalLoss * 0.18; // Assuming 18% tax rate
}

async function callFreeAIModel(message, context) {
  try {
    // Using Groq API (free tier available)
    if (process.env.GROQ_API_KEY) {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'mixtral-8x7b-32768',
        messages: [{
          role: 'system',
          content: `You are a financial advisor for crypto and tax management. 
            Portfolio Value: $${context.portfolio?.totalValue || 0}
            Holdings: ${context.portfolio?.holdings?.map(h => h.symbol).join(', ') || 'None'}
            Context: ${context.context}`
        }, {
          role: 'user',
          content: message
        }],
        temperature: 0.7,
        max_tokens: 500
      }, {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
      });

      return response.data.choices[0].message.content;
    }

    // Fallback responses
    return getFallbackAIResponse(message, context);
  } catch (error) {
    return getFallbackAIResponse(message, context);
  }
}

function getFallbackAIResponse(message, context) {
  const responses = {
    'portfolio': `Your current portfolio value is $${context.portfolio?.totalValue || 0} with ${context.portfolio?.holdings?.length || 0} holdings.`,
    'tax': `Based on your transactions, consider tax-loss harvesting on underperforming assets.`,
    'risk': `Your portfolio's risk profile is ${context.portfolio?.riskProfile || 'moderate'}.`,
    'default': `I understand you're asking about ${message}. Based on your portfolio and transactions, here's my recommendation...`
  };

  for (const [key, response] of Object.entries(responses)) {
    if (message.toLowerCase().includes(key)) {
      return response;
    }
  }

  return responses.default;
}

export default router;
