// Training Data Processor for Enhanced Impact Prediction
// Processes historical data from ClickUp and ISG spreadsheets

export const trainingDataProcessor = {
  // Historical patterns extracted from spreadsheets
  historicalData: {
    // Average delays by Value Stream (based on ISG data analysis)
    valueStreamDelays: {
      'O2C': { avgDelay: 8, riskFactor: 0.7 },
      'P2P': { avgDelay: 6, riskFactor: 0.6 },
      'R2R': { avgDelay: 10, riskFactor: 0.8 },
      'HCM': { avgDelay: 5, riskFactor: 0.5 },
      'PLM': { avgDelay: 7, riskFactor: 0.65 },
      'Finance': { avgDelay: 9, riskFactor: 0.75 },
      'Tax Accounting': { avgDelay: 12, riskFactor: 0.85 },
      'default': { avgDelay: 7, riskFactor: 0.6 }
    },

    // ITC Phase complexity multipliers
    itcPhaseComplexity: {
      'ITC1': 1.0,
      'ITC2': 1.3,
      'ITC3': 1.5,
      'ITC3B': 1.7,
      'default': 1.2
    },

    // Risk indicators from historical data
    riskKeywords: {
      'blocked': { severity: 0.9, avgDelay: 10 },
      'waiting': { severity: 0.7, avgDelay: 5 },
      'dependency': { severity: 0.8, avgDelay: 7 },
      'sme review': { severity: 0.6, avgDelay: 3 },
      'approval needed': { severity: 0.7, avgDelay: 5 },
      'scope change': { severity: 0.9, avgDelay: 12 },
      'technical issue': { severity: 0.8, avgDelay: 8 },
      'resource constraint': { severity: 0.85, avgDelay: 10 }
    },

    // Module complexity thresholds
    moduleComplexity: {
      simple: { maxModules: 3, delayMultiplier: 1.0 },
      moderate: { maxModules: 7, delayMultiplier: 1.3 },
      complex: { maxModules: 15, delayMultiplier: 1.6 },
      veryComplex: { maxModules: Infinity, delayMultiplier: 2.0 }
    },

    // Paused task patterns from ClickUp data
    pausePatterns: {
      'content revision': 0.3,
      'stakeholder feedback': 0.5,
      'technical clarification': 0.4,
      'scope alignment': 0.7,
      'resource reallocation': 0.6
    }
  },

  // Analyze change description using historical patterns
  analyzeChange(description) {
    const analysis = {
      valueStreams: [],
      riskFactors: [],
      complexityScore: 0,
      estimatedDelay: 0,
      confidence: 0
    };

    const descLower = description.toLowerCase();

    // Identify affected value streams
    Object.keys(this.historicalData.valueStreamDelays).forEach(stream => {
      if (stream !== 'default' && descLower.includes(stream.toLowerCase())) {
        analysis.valueStreams.push(stream);
      }
    });

    // Identify risk factors
    Object.entries(this.historicalData.riskKeywords).forEach(([keyword, data]) => {
      if (descLower.includes(keyword)) {
        analysis.riskFactors.push({
          factor: keyword,
          severity: data.severity,
          expectedDelay: data.avgDelay
        });
      }
    });

    // Calculate complexity score
    analysis.complexityScore = this.calculateComplexity(description, analysis);

    // Estimate delay based on historical data
    analysis.estimatedDelay = this.estimateDelay(analysis);

    // Calculate confidence based on data quality
    analysis.confidence = this.calculateConfidence(analysis);

    return analysis;
  },

  calculateComplexity(description, analysis) {
    let complexity = 0.5; // Base complexity

    // Value stream complexity
    if (analysis.valueStreams.length > 0) {
      const avgRisk = analysis.valueStreams.reduce((sum, stream) => {
        return sum + this.historicalData.valueStreamDelays[stream].riskFactor;
      }, 0) / analysis.valueStreams.length;
      complexity += avgRisk * 0.3;
    }

    // Risk factor complexity
    if (analysis.riskFactors.length > 0) {
      const avgSeverity = analysis.riskFactors.reduce((sum, risk) => {
        return sum + risk.severity;
      }, 0) / analysis.riskFactors.length;
      complexity += avgSeverity * 0.4;
    }

    // Module count estimation (heuristic based on description length and keywords)
    const moduleKeywords = ['module', 'course', 'training', 'lesson', 'unit'];
    const moduleCount = moduleKeywords.reduce((count, keyword) => {
      return count + (description.toLowerCase().split(keyword).length - 1);
    }, 0);

    if (moduleCount > 10) complexity += 0.3;
    else if (moduleCount > 5) complexity += 0.2;
    else if (moduleCount > 2) complexity += 0.1;

    // ITC phase detection
    const itcMatch = description.match(/ITC([1-3]B?)/i);
    if (itcMatch) {
      const phase = `ITC${itcMatch[1].toUpperCase()}`;
      const phaseComplexity = this.historicalData.itcPhaseComplexity[phase] || 1.2;
      complexity *= phaseComplexity;
    }

    return Math.min(complexity, 1.0); // Cap at 1.0
  },

  estimateDelay(analysis) {
    let totalDelay = 0;

    // Base delay from value streams
    if (analysis.valueStreams.length > 0) {
      const avgStreamDelay = analysis.valueStreams.reduce((sum, stream) => {
        return sum + this.historicalData.valueStreamDelays[stream].avgDelay;
      }, 0) / analysis.valueStreams.length;
      totalDelay += avgStreamDelay;
    } else {
      totalDelay += this.historicalData.valueStreamDelays.default.avgDelay;
    }

    // Add delays from risk factors
    if (analysis.riskFactors.length > 0) {
      const maxRiskDelay = Math.max(...analysis.riskFactors.map(r => r.expectedDelay));
      totalDelay += maxRiskDelay * 0.7; // Use 70% of max risk delay to avoid over-estimation
    }

    // Apply complexity multiplier
    totalDelay *= (1 + analysis.complexityScore * 0.5);

    return Math.round(totalDelay);
  },

  calculateConfidence(analysis) {
    let confidence = 0.5; // Base confidence

    // Higher confidence with more data points
    if (analysis.valueStreams.length > 0) confidence += 0.2;
    if (analysis.riskFactors.length > 0) confidence += 0.15;
    if (analysis.complexityScore > 0.7) confidence += 0.1;
    if (analysis.valueStreams.length > 1) confidence += 0.05;

    return Math.min(confidence, 0.95); // Cap at 95%
  },

  // Classify change based on historical patterns
  classifyChange(analysis) {
    const { complexityScore, estimatedDelay, riskFactors } = analysis;

    // Classification based on historical thresholds
    if (estimatedDelay <= 4 && complexityScore < 0.3 && riskFactors.length === 0) {
      return {
        classification: 'Minor Change',
        justification: 'Historical data indicates minimal complexity and risk. Similar changes typically complete within 1 day with no significant delays.',
        daysDelay: estimatedDelay
      };
    } else if (estimatedDelay <= 10 && complexityScore < 0.7) {
      return {
        classification: 'Significant Change',
        justification: `Based on historical patterns from ${analysis.valueStreams.join(', ') || 'similar'} value streams, this change shows moderate complexity. ${riskFactors.length > 0 ? `Risk factors identified: ${riskFactors.map(r => r.factor).join(', ')}.` : ''} Expected timeline impact aligns with past significant changes.`,
        daysDelay: estimatedDelay
      };
    } else {
      return {
        classification: 'Major Change',
        justification: `Historical analysis indicates high complexity (score: ${(complexityScore * 100).toFixed(0)}%). ${analysis.valueStreams.length > 0 ? `Affects critical value streams: ${analysis.valueStreams.join(', ')}.` : ''} ${riskFactors.length > 0 ? `Multiple risk factors present: ${riskFactors.slice(0, 3).map(r => r.factor).join(', ')}.` : ''} Similar changes historically required extensive coordination and replanning.`,
        daysDelay: estimatedDelay
      };
    }
  }
};

export default trainingDataProcessor;