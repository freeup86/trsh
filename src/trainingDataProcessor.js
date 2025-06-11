// Training Data Processor for Enhanced Impact Prediction
// Processes historical data from ClickUp and ISG spreadsheets

export const trainingDataProcessor = {
  // Change definitions from Change_Definitions.csv
  changeDefinitions: {
    minor: {
      keywords: [
        'quick note', 'tip', 'quick reference', 'link', 'caption', 'label',
        'font', 'color', 'emphasis', 'slide title', 'header', 'clarification',
        'fact correction', 'minor script edit', 'voiceover', 'reorder bullet',
        'swap image', 'icon', 'terminology tweak', 'adjust word', 'narration',
        'audio suggestion', 'video suggestion', 'sequence of points',
        'content adjustment', 'highlight keyword', 'hyperlink', 'resource',
        'glossary', 'side note', 'tip box', 'stock image', 'replace term',
        'rewording for clarity', 'slight rewording', 'update date', 'statistic',
        'name', 'screenshot', 'field addition', 'field removal'
      ],
      delayRange: { min: 0, max: 5 }
    },
    significant: {
      keywords: [
        'media overhaul', 'interactivity overhaul', 'delay sme', 'sme feedback',
        'assessment', 'certification requirement', 'content rewrite', 'module',
        'course flow', 'sequence', 'compliance', 'legal requirement',
        'new stakeholder', 'complex interaction', 'simulation', 'learning objective',
        'legal review', 'tone', 'instructional strategy', 'structural change',
        'bottleneck', 'review cycle', 'reformat', 'rebuild', 'valid assessment',
        'reliable assessment', 'lms integration', 'custom video', 'animation',
        'instructional design', 'programming', 'branching scenario', 'drag-and-drop',
        'media production', 'target audience', 'skill level', 'reorganization',
        'navigation logic', 'scripting', 'storyboarding', 'production', 'editing',
        'vague feedback', 'contradictory feedback'
      ],
      delayRange: { min: 5, max: 10 }
    },
    major: {
      keywords: [
        'tooling overhaul', 'platform overhaul', 'pilot feedback', 'testing feedback',
        'sme unavailable', 'compliance change', 'legal change', 'policy change',
        'delivery format', 'wbt to ilt', 'ilt to wbt', 'target audience',
        'stakeholder disruption', 'resource disruption', 'leadership change',
        'organizational change', 'tech stack', 'integration issue', 'course purpose',
        'course goal', 'key sme loss', 'sensitive topic', 'legal team', 'brand team',
        'strategic shift', 'directional shift', 'regulatory requirement',
        'pilot flaw', 'major flaw', 'redesign', 'budget freeze', 'funding cut',
        'lms change', 'authoring tool', 'hris', 'crm', 'compliance tracking',
        'business objective', 'learning outcome', 'instructor-led', 'entry-level',
        'senior manager', 'complete redesign', 'financial constraint', 'priority shift',
        'negative pilot', 'accessibility failure', 'usability failure',
        'accessibility audit', 'usability testing', 'platform change'
      ],
      delayRange: { min: 11, max: 30 }
    }
  },

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

  // Check if description contains any keywords from a category
  checkKeywords(description, keywords) {
    const descLower = description.toLowerCase();
    const matches = [];
    
    for (const keyword of keywords) {
      if (descLower.includes(keyword.toLowerCase())) {
        matches.push(keyword);
      }
    }
    
    return matches;
  },

  // Analyze change description using historical patterns and keyword matching
  analyzeChange(description) {
    const analysis = {
      valueStreams: [],
      riskFactors: [],
      complexityScore: 0,
      estimatedDelay: 0,
      confidence: 0,
      matchedKeywords: {
        minor: [],
        significant: [],
        major: []
      }
    };

    const descLower = description.toLowerCase();
    
    // Check for keyword matches from change definitions
    analysis.matchedKeywords.minor = this.checkKeywords(description, this.changeDefinitions.minor.keywords);
    analysis.matchedKeywords.significant = this.checkKeywords(description, this.changeDefinitions.significant.keywords);
    analysis.matchedKeywords.major = this.checkKeywords(description, this.changeDefinitions.major.keywords);

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
    let complexity = 0.3; // Base complexity

    // Keyword-based complexity
    const keywordWeight = {
      minor: 0.1,
      significant: 0.3,
      major: 0.6
    };
    
    // Add complexity based on matched keywords
    if (analysis.matchedKeywords.major.length > 0) {
      complexity += keywordWeight.major * (1 + analysis.matchedKeywords.major.length * 0.1);
    } else if (analysis.matchedKeywords.significant.length > 0) {
      complexity += keywordWeight.significant * (1 + analysis.matchedKeywords.significant.length * 0.1);
    } else if (analysis.matchedKeywords.minor.length > 0) {
      complexity += keywordWeight.minor * (1 + analysis.matchedKeywords.minor.length * 0.05);
    }

    // Value stream complexity
    if (analysis.valueStreams.length > 0) {
      const avgRisk = analysis.valueStreams.reduce((sum, stream) => {
        return sum + this.historicalData.valueStreamDelays[stream].riskFactor;
      }, 0) / analysis.valueStreams.length;
      complexity += avgRisk * 0.2;
    }

    // Risk factor complexity
    if (analysis.riskFactors.length > 0) {
      const avgSeverity = analysis.riskFactors.reduce((sum, risk) => {
        return sum + risk.severity;
      }, 0) / analysis.riskFactors.length;
      complexity += avgSeverity * 0.3;
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

    // Higher confidence with keyword matches
    const totalKeywords = analysis.matchedKeywords.minor.length + 
                         analysis.matchedKeywords.significant.length + 
                         analysis.matchedKeywords.major.length;
    
    if (totalKeywords > 0) {
      confidence += Math.min(totalKeywords * 0.05, 0.25); // Up to 25% boost for keywords
    }
    
    // Higher confidence with more data points
    if (analysis.valueStreams.length > 0) confidence += 0.15;
    if (analysis.riskFactors.length > 0) confidence += 0.1;
    if (analysis.complexityScore > 0.7) confidence += 0.05;
    if (analysis.valueStreams.length > 1) confidence += 0.05;

    return Math.min(confidence, 0.95); // Cap at 95%
  },

  // Classify change based on historical patterns and keyword matches
  classifyChange(analysis) {
    const { complexityScore, estimatedDelay, riskFactors, matchedKeywords } = analysis;
    
    // Priority classification based on keyword matches
    if (matchedKeywords.major.length > 0) {
      const keywordList = matchedKeywords.major.slice(0, 3).join(', ');
      const otherKeywords = matchedKeywords.major.length > 3 ? ` and ${matchedKeywords.major.length - 3} more` : '';
      return {
        classification: 'Major Change',
        justification: `This request contains major change indicators: ${keywordList}${otherKeywords}. ${analysis.valueStreams.length > 0 ? `Affects ${analysis.valueStreams.join(', ')} value streams. ` : ''}These changes typically require extensive coordination, approvals, and potential project restructuring. Historical data shows similar changes taking 11+ days with high impact on timelines.`,
        daysDelay: Math.max(estimatedDelay, 11)
      };
    } else if (matchedKeywords.significant.length > 0) {
      const keywordList = matchedKeywords.significant.slice(0, 3).join(', ');
      return {
        classification: 'Significant Change',
        justification: `This request involves significant modifications: ${keywordList}. ${riskFactors.length > 0 ? `Risk factors: ${riskFactors.map(r => r.factor).join(', ')}. ` : ''}These changes require formal review processes and may impact multiple course components. Expected delay of 5-10 days based on similar historical changes.`,
        daysDelay: Math.max(Math.min(estimatedDelay, 10), 5)
      };
    } else if (matchedKeywords.minor.length > 0) {
      const keywordList = matchedKeywords.minor.slice(0, 3).join(', ');
      return {
        classification: 'Minor Change',
        justification: `This request includes minor adjustments: ${keywordList}. These changes can be implemented quickly without disrupting the overall development flow. Historical data shows completion within 0-5 days.`,
        daysDelay: Math.min(estimatedDelay, 5)
      };
    }
    
    // Fallback to complexity-based classification if no keywords match
    if (estimatedDelay <= 4 && complexityScore < 0.3 && riskFactors.length === 0) {
      return {
        classification: 'Minor Change',
        justification: 'Analysis indicates minimal complexity and risk. Similar changes typically complete within 4 days with no significant delays.',
        daysDelay: estimatedDelay
      };
    } else if (estimatedDelay <= 10 && complexityScore < 0.7) {
      return {
        classification: 'Significant Change',
        justification: `Based on patterns from ${analysis.valueStreams.join(', ') || 'similar'} value streams, this change shows moderate complexity. ${riskFactors.length > 0 ? `Risk factors identified: ${riskFactors.map(r => r.factor).join(', ')}.` : ''} Expected timeline impact aligns with past significant changes.`,
        daysDelay: estimatedDelay
      };
    } else {
      return {
        classification: 'Major Change',
        justification: `Analysis indicates high complexity (score: ${(complexityScore * 100).toFixed(0)}%). ${analysis.valueStreams.length > 0 ? `Affects critical value streams: ${analysis.valueStreams.join(', ')}.` : ''} ${riskFactors.length > 0 ? `Multiple risk factors present: ${riskFactors.slice(0, 3).map(r => r.factor).join(', ')}.` : ''} Similar changes historically required extensive coordination and replanning.`,
        daysDelay: estimatedDelay
      };
    }
  }
};

export default trainingDataProcessor;