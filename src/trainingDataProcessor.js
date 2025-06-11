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
        'legal review', 'instructional strategy', 'structural change',
        'bottleneck', 'review cycle', 'reformat', 'rebuild', 'valid assessment',
        'reliable assessment', 'lms integration', 'custom video', 'animation',
        'instructional design', 'programming', 'branching scenario', 'drag-and-drop',
        'media production', 'reorganization',
        'navigation logic', 'scripting', 'storyboarding', 'production', 'editing',
        'vague feedback', 'contradictory feedback'
      ],
      delayRange: { min: 5, max: 10 }
    },
    major: {
      keywords: [
        'tooling overhaul', 'platform overhaul', 'pilot feedback', 'testing feedback',
        'sme unavailable', 'compliance change', 'legal change', 'policy change',
        'delivery format', 'wbt to ilt', 'ilt to wbt', 'target audience shift', 'shifting target audience',
        'stakeholder disruption', 'resource disruption', 'leadership change',
        'organizational change', 'tech stack', 'integration issue', 'course purpose',
        'course goal', 'key sme loss', 'sensitive topic', 'legal team', 'brand team',
        'strategic shift', 'directional shift', 'regulatory requirement',
        'pilot flaw', 'major flaw', 'redesign', 'budget freeze', 'funding cut',
        'lms change', 'authoring tool', 'hris', 'crm', 'compliance tracking',
        'business objective', 'learning outcome', 'instructor-led', 'entry-level',
        'senior manager', 'complete redesign', 'financial constraint', 'priority shift',
        'negative pilot', 'accessibility failure', 'usability failure',
        'accessibility audit', 'usability testing', 'platform change', 'tone, content, and complexity'
      ],
      delayRange: { min: 11, max: 30 }
    }
  },

  // Historical patterns extracted from spreadsheets
  historicalData: {
    // Average delays by Value Stream (enhanced with ClickUp and ISG data)
    valueStreamDelays: {
      'O2C': { avgDelay: 12, riskFactor: 0.8, pausedTasks: 11, commonIssues: ['billing', 'invoicing', 'costing sheets'] },
      'P2P': { avgDelay: 8, riskFactor: 0.65, pausedTasks: 3, commonIssues: ['procurement', 'purchase orders'] },
      'R2R': { avgDelay: 14, riskFactor: 0.85, pausedTasks: 5, commonIssues: ['tax accounting', 'federal tax', 'state tax', 'provision'] },
      'HCM': { avgDelay: 6, riskFactor: 0.55, pausedTasks: 0, commonIssues: ['payroll', 'human resources'] },
      'PLM': { avgDelay: 9, riskFactor: 0.7, pausedTasks: 1, commonIssues: ['manufacturing', 'product lifecycle'] },
      'PLP': { avgDelay: 10, riskFactor: 0.75, pausedTasks: 2, commonIssues: ['project management', 'wbs', 'project approval'] },
      'A2R': { avgDelay: 11, riskFactor: 0.8, pausedTasks: 2, commonIssues: ['asset accounting', 'depreciation', 'asset transfer'] },
      'PTS': { avgDelay: 8, riskFactor: 0.65, pausedTasks: 1, commonIssues: ['production', 'service orders'] },
      'Finance': { avgDelay: 10, riskFactor: 0.75, pausedTasks: 0, commonIssues: ['financial reporting', 'accounting'] },
      'Tax Accounting': { avgDelay: 16, riskFactor: 0.9, pausedTasks: 5, commonIssues: ['tax compliance', 'tax provision', 'tax return'] },
      'default': { avgDelay: 9, riskFactor: 0.7 }
    },

    // Real project data from ISG Courses spreadsheet
    projectPatterns: {
      phaseRiskMultipliers: {
        'Not Started': 1.0,
        'Design': 1.2,
        'Alpha Development': 1.3,
        'Beta Development': 1.4,
        'Final Approval': 1.5,
        'Complete': 0.8
      },
      riskStatusMultipliers: {
        'On Track': 1.0,
        'Behind Schedule': 1.6,
        'At Risk': 1.4,
        'Blocked': 2.0
      },
      delayIndicators: [
        'pending update of change impacts',
        'curriculum redesign',
        'behind schedule',
        'blocked',
        'resource constraint',
        'stakeholder approval',
        'scope change'
      ]
    },

    // ITC Phase complexity multipliers
    itcPhaseComplexity: {
      'ITC1': 1.0,
      'ITC2': 1.3,
      'ITC3': 1.5,
      'ITC3B': 1.7,
      'default': 1.2
    },

    // Risk indicators from historical data (enhanced with real project data)
    riskKeywords: {
      'blocked': { severity: 0.95, avgDelay: 15 },
      'behind schedule': { severity: 0.8, avgDelay: 12 },
      'curriculum redesign': { severity: 0.85, avgDelay: 14 },
      'change impacts': { severity: 0.75, avgDelay: 8 },
      'pending update': { severity: 0.7, avgDelay: 6 },
      'waiting': { severity: 0.7, avgDelay: 5 },
      'dependency': { severity: 0.8, avgDelay: 7 },
      'sme review': { severity: 0.6, avgDelay: 3 },
      'approval needed': { severity: 0.7, avgDelay: 5 },
      'scope change': { severity: 0.9, avgDelay: 12 },
      'technical issue': { severity: 0.8, avgDelay: 8 },
      'resource constraint': { severity: 0.85, avgDelay: 10 },
      'stakeholder approval': { severity: 0.75, avgDelay: 9 },
      'final approval': { severity: 0.6, avgDelay: 4 }
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
      description: description, // Store for later use
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

    // Identify affected value streams with improved pattern matching
    const valueStreamPatterns = {
      'Tax Accounting': ['tax accounting', 'taxation', 'tax compliance', 'tax reporting'], // Check tax accounting first to avoid conflicts
      'O2C': ['o2c', 'order to cash', 'order-to-cash', 'sales', 'billing', 'revenue', 'customer'],
      'P2P': ['p2p', 'procure to pay', 'procure-to-pay', 'procurement', 'purchasing', 'vendor', 'supplier'],
      'R2R': ['r2r', 'record to report', 'record-to-report', 'reporting', 'financial reporting'],
      'HCM': ['hcm', 'human capital', 'hr', 'human resources', 'payroll', 'employee'],
      'PLM': ['plm', 'product lifecycle', 'product', 'manufacturing'],
      'Finance': ['finance', 'financial', 'accounting', 'budget', 'cost']
    };

    Object.entries(valueStreamPatterns).forEach(([stream, patterns]) => {
      if (patterns.some(pattern => descLower.includes(pattern))) {
        if (!analysis.valueStreams.includes(stream)) {
          analysis.valueStreams.push(stream);
        }
      }
    });

    // Debug logging for value stream detection
    console.log('Value stream analysis debug:', {
      description: description.substring(0, 100) + '...',
      detectedValueStreams: analysis.valueStreams,
      descriptionLower: descLower.substring(0, 100) + '...'
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

    // Enhanced value stream complexity (using real data)
    if (analysis.valueStreams.length > 0) {
      const avgRisk = analysis.valueStreams.reduce((sum, stream) => {
        const streamData = this.historicalData.valueStreamDelays[stream] || this.historicalData.valueStreamDelays.default;
        // Factor in paused tasks as additional risk
        const pausedTaskRisk = streamData.pausedTasks ? streamData.pausedTasks * 0.05 : 0;
        return sum + streamData.riskFactor + pausedTaskRisk;
      }, 0) / analysis.valueStreams.length;
      complexity += avgRisk * 0.25;
    }

    // Enhanced risk factor complexity
    if (analysis.riskFactors.length > 0) {
      const avgSeverity = analysis.riskFactors.reduce((sum, risk) => {
        return sum + risk.severity;
      }, 0) / analysis.riskFactors.length;
      complexity += avgSeverity * 0.3;
    }

    // Real project phase detection
    const descLower = description.toLowerCase();
    if (this.historicalData.projectPatterns.delayIndicators.some(indicator => descLower.includes(indicator))) {
      complexity += 0.2; // Add complexity for known delay indicators
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

    // Enhanced base delay from value streams (using real data)
    if (analysis.valueStreams.length > 0) {
      const avgStreamDelay = analysis.valueStreams.reduce((sum, stream) => {
        const streamData = this.historicalData.valueStreamDelays[stream] || this.historicalData.valueStreamDelays.default;
        // Factor in paused tasks data
        const pausedTaskDelay = streamData.pausedTasks ? streamData.pausedTasks * 0.8 : 0;
        return sum + streamData.avgDelay + pausedTaskDelay;
      }, 0) / analysis.valueStreams.length;
      totalDelay += avgStreamDelay;
    } else {
      totalDelay += this.historicalData.valueStreamDelays.default.avgDelay;
    }

    // Enhanced risk factor delays
    if (analysis.riskFactors.length > 0) {
      const maxRiskDelay = Math.max(...analysis.riskFactors.map(r => r.expectedDelay));
      totalDelay += maxRiskDelay * 0.8; // Increased weight based on real project data
    }

    // Apply complexity multiplier (enhanced)
    totalDelay *= (1 + analysis.complexityScore * 0.6);

    // Apply project phase multipliers if detected
    const description = analysis.description || '';
    const descLower = description.toLowerCase();
    
    if (descLower.includes('final approval') || descLower.includes('sign off')) {
      totalDelay *= this.historicalData.projectPatterns.phaseRiskMultipliers['Final Approval'];
    } else if (descLower.includes('behind schedule') || descLower.includes('delayed')) {
      totalDelay *= this.historicalData.projectPatterns.riskStatusMultipliers['Behind Schedule'];
    } else if (descLower.includes('blocked')) {
      totalDelay *= this.historicalData.projectPatterns.riskStatusMultipliers['Blocked'];
    }

    return Math.round(Math.max(totalDelay, 0));
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