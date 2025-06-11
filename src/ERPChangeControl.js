import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, FileText, MessageSquare, RotateCw, Award, Search, Users, UserPlus, Clock, AlertCircle, Save } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';
import { trainingDataProcessor } from './trainingDataProcessor';

const ERPChangeControl = () => {
  const [changeDescription, setChangeDescription] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'
  const [editableJustification, setEditableJustification] = useState('');
  const [editableDelay, setEditableDelay] = useState(0);
  const [editableClassification, setEditableClassification] = useState('');

  const colorPalette = {
    darkBlue: '#004e92',
    mediumBlue: '#4285f4',
    lightBlue: '#74a9d8',
    veryLightBlue: '#adcbe3',
    textColor: '#000428',
    background: '#eef2f7'
  };

  // Data for charts
  const scheduleImpactData = [
    { name: 'Minor Change', days: 4, fill: colorPalette.lightBlue },
    { name: 'Significant Change', days: 8, fill: colorPalette.mediumBlue },
    { name: 'Major Change', days: 20, fill: colorPalette.darkBlue }
  ];

  const stakeholderData = {
    minor: [
      { name: 'Notified', value: 2, fill: colorPalette.veryLightBlue },
      { name: 'Approvers', value: 1, fill: colorPalette.lightBlue }
    ],
    significant: [
      { name: 'Notified', value: 5, fill: colorPalette.veryLightBlue },
      { name: 'Approvers', value: 2, fill: colorPalette.mediumBlue }
    ],
    major: [
      { name: 'Notified', value: 7, fill: colorPalette.veryLightBlue },
      { name: 'Approvers', value: 4, fill: colorPalette.darkBlue }
    ]
  };

  const rippleEffectData = [
    { subject: 'System Development', significant: 3, major: 8 },
    { subject: 'Process Docs', significant: 4, major: 9 },
    { subject: 'UAT Scenarios', significant: 5, major: 8 },
    { subject: 'Training Materials', significant: 6, major: 9 },
    { subject: 'Go-Live Readiness', significant: 2, major: 7 }
  ];

  const flowSteps = [
    { title: 'Request Submitted', subtitle: '' },
    { title: 'Initial Assessment', subtitle: '' },
    { title: 'Categorization', subtitle: '' },
    { title: 'Initiate Change Process Request', subtitle: '' },
    { title: 'Implementation', subtitle: '' }
  ];

  const developmentCycle = [
    {
      title: 'Alpha Draft (ISG)',
      subtitle: '4 business days',
      description: 'Gathering materials, AI assist, complete Outline, e-Learning Module, Facilitator Guide & Training Deck. QA before SME Review.'
    },
    {
      title: 'Beta Revision (ISG)',
      subtitle: '1 business day',
      description: 'Complete SME requested revisions, refine missing details, clean up document. Accept/reject track changes.'
    },
    {
      title: 'Final Revision (ISG)',
      subtitle: '1 business day',
      description: 'Complete Beta Review requests (minor). Clear comments. Final QA by ISG Team. OCM changes may be implemented.'
    },
    {
      title: 'Alpha Review (SMEs)',
      subtitle: '3 business days',
      description: 'SME content review, detailed review of business context and course structure. BA content identified. **Changes are made here.** OCM changes can be implemented.'
    },
    {
      title: 'Beta Review (SMEs)',
      subtitle: '2 business days',
      description: 'Validate Beta Revision. Small wording tweaks. **No major changes at this point.** OCM changes may be implemented.'
    },
    {
      title: 'Final Sign off Request',
      subtitle: '1 business day',
      description: 'Validate Final Revision. Sign off on deliverables. **No changes to process or content at this stage.** OCM changes accepted during Outline/Storyboard depend on priority.'
    }
  ];

  const guidingPrinciples = [
    { icon: '📝', title: 'Documentation', description: 'Log every request, decision, and approval.' },
    { icon: '📢', title: 'Communication', description: 'Keep all stakeholders informed and aligned.' },
    { icon: '🔄', title: 'Version Control', description: 'Maintain a clear history of all revisions.' },
    { icon: '🥇', title: 'Prioritization', description: 'Focus on changes critical to business success.' },
    { icon: '🔍', title: 'Regular Review', description: 'Continuously refine the process.' }
  ];

  // Save current prediction to database
  const savePrediction = async () => {
    if (!prediction || !changeDescription.trim()) {
      console.error('No prediction to save');
      return;
    }

    try {
      setSaveStatus('saving');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeDescription: changeDescription,
          classification: editableClassification || prediction.classification,
          daysDelay: editableDelay !== null ? editableDelay : prediction.daysDelay,
          justification: editableJustification || prediction.justification,
          analysisDetails: prediction.analysisDetails,
          sessionId: Date.now().toString(), // Simple session ID
          userId: null // Can be set if user authentication is implemented
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSaveStatus('saved');
      
      // Create Outlook email for all classification types
      createOutlookEmail();
      
      // Clear save status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
      
      return result;
    } catch (error) {
      console.error('Error saving prediction:', error);
      setSaveStatus('error');
      
      // Clear save status after 5 seconds
      setTimeout(() => setSaveStatus(null), 5000);
      
      throw error;
    }
  };

  // Create Outlook email with prediction details
  const createOutlookEmail = () => {
    const subject = `Training Impact Alert: ${editableClassification} Required`;
    
    const emailBody = `
Dear Team,

A training impact prediction has been completed that requires attention:

CHANGE DESCRIPTION:
${changeDescription}

IMPACT ASSESSMENT:
• Classification: ${editableClassification}
• Estimated Delay: ${editableDelay === 0 ? 'No delay' : `${editableDelay} business days`}

JUSTIFICATION:
${editableJustification}

${prediction.analysisDetails ? `
ANALYSIS DETAILS:
${prediction.analysisDetails.matchedKeywords && (
  prediction.analysisDetails.matchedKeywords.minor.length > 0 || 
  prediction.analysisDetails.matchedKeywords.significant.length > 0 || 
  prediction.analysisDetails.matchedKeywords.major.length > 0
) ? `• Matched Keywords: ${[
  ...prediction.analysisDetails.matchedKeywords.minor.slice(0, 3),
  ...prediction.analysisDetails.matchedKeywords.significant.slice(0, 3),
  ...prediction.analysisDetails.matchedKeywords.major.slice(0, 3)
].join(', ')}` : ''}
${prediction.analysisDetails.valueStreams && prediction.analysisDetails.valueStreams.length > 0 ? `• Value Streams Affected: ${prediction.analysisDetails.valueStreams.join(', ')}` : ''}
${prediction.analysisDetails.riskFactors && prediction.analysisDetails.riskFactors.length > 0 ? `• Risk Factors: ${prediction.analysisDetails.riskFactors.join(', ')}` : ''}
` : ''}

Please review this impact assessment and take appropriate action.

Best regards,
Training Impact Predictor System
    `.trim();

    // Create mailto URL
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.open(mailtoUrl, '_self');
  };

  const predictImpact = async () => {
    if (!changeDescription.trim()) {
      setPrediction({
        classification: 'Error',
        justification: 'Please describe the change to predict its impact.',
        daysDelay: 0
      });
      return;
    }

    setIsLoading(true);
    setSaveStatus(null); // Reset save status for new prediction
    setEditableJustification(''); // Reset editable justification
    setEditableDelay(0); // Reset editable delay
    setEditableClassification(''); // Reset editable classification
    
    try {
      // Check if API key is available
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      
      if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
        // Use enhanced prediction model based on historical data
        setTimeout(() => {
          const analysis = trainingDataProcessor.analyzeChange(changeDescription);
          const result = trainingDataProcessor.classifyChange(analysis);
          
          // Add analysis details to the result
          const enhancedResult = {
            ...result,
            analysisDetails: {
              valueStreams: analysis.valueStreams,
              riskFactors: analysis.riskFactors.map(r => r.factor),
              complexityScore: Math.round(analysis.complexityScore * 100),
              confidence: Math.round(analysis.confidence * 100),
              matchedKeywords: analysis.matchedKeywords
            }
          };
          
          setPrediction(enhancedResult);
          setEditableJustification(enhancedResult.justification);
          setEditableDelay(enhancedResult.daysDelay);
          setEditableClassification(enhancedResult.classification);
          setIsLoading(false);
        }, 1500);
        return;
      }

      // Use Claude API with enhanced context from historical data
      const analysis = trainingDataProcessor.analyzeChange(changeDescription);
      const historicalResult = trainingDataProcessor.classifyChange(analysis);
      
      const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Note: In production, you should use a backend proxy
        defaultHeaders: {
          'anthropic-dangerous-direct-browser-access': 'true'
        }
      });

      const prompt = `You are an expert in ERP training change management with access to historical project data. Your task is to classify a proposed change into one of three categories: 'Minor Change', 'Significant Change', or 'Major Change' and estimate the days delay.

Change description: "${changeDescription}"

Historical analysis suggests:
- Affected value streams: ${analysis.valueStreams.length > 0 ? analysis.valueStreams.join(', ') : 'Not identified'}
- Risk factors detected: ${analysis.riskFactors.map(r => r.factor).join(', ') || 'None'}
- Complexity score: ${Math.round(analysis.complexityScore * 100)}%
- Initial estimate: ${historicalResult.classification} with ${historicalResult.daysDelay} days delay
- Confidence level: ${Math.round(analysis.confidence * 100)}%

Please provide your expert assessment, considering this historical context and your knowledge of ERP training projects.

Please respond in the following JSON format:
{
  "classification": "Minor Change|Significant Change|Major Change",
  "daysDelay": number,
  "justification": "brief explanation incorporating historical insights"
}`;

      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const response = message.content[0].text;
      const parsedResponse = JSON.parse(response);
      
      setPrediction({
        classification: parsedResponse.classification,
        justification: parsedResponse.justification,
        daysDelay: parsedResponse.daysDelay,
        analysisDetails: {
          valueStreams: analysis.valueStreams,
          riskFactors: analysis.riskFactors.map(r => r.factor),
          complexityScore: Math.round(analysis.complexityScore * 100),
          confidence: Math.round(analysis.confidence * 100),
          matchedKeywords: analysis.matchedKeywords
        }
      });
      
      setEditableJustification(parsedResponse.justification);
      setEditableDelay(parsedResponse.daysDelay);
      setEditableClassification(parsedResponse.classification);
      
    } catch (error) {
      console.error('Error calling Claude API:', error);
      setPrediction({
        classification: 'Error',
        justification: 'Unable to process the request. Please try again or check your API configuration.',
        daysDelay: 0
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colorPalette.background, color: colorPalette.textColor }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: colorPalette.textColor }}>
            Streamlining Success
          </h1>
          <p className="text-lg md:text-xl" style={{ color: colorPalette.darkBlue }}>
            The ERP Training Material Change Control Process
          </p>
        </header>

        {/* Change Categories */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: 'Minor Change',
              subtitle: 'Est. Delay 0-4 Days',
              description: 'Quick fixes like typos and simple clarifications. Handled rapidly to maintain content accuracy without disrupting workflow.',
              borderColor: colorPalette.lightBlue
            },
            {
              title: 'Significant Change',
              subtitle: 'Est. Delay 5-10 Days',
              description: 'Broader modifications affecting content or structure, requiring formal review and potentially pushing work to the next sprint.',
              borderColor: colorPalette.mediumBlue
            },
            {
              title: 'Major Change',
              subtitle: 'Est. Delay 11+ Days',
              description: 'Substantial revisions to core content or strategy, requiring high-level approval and a potential pause in development.',
              borderColor: colorPalette.darkBlue
            }
          ].map((category, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full"
              style={{ borderBottom: `4px solid ${category.borderColor}` }}
            >
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-2" style={{ color: colorPalette.darkBlue }}>
                  {category.title}
                </h3>
                <p className="text-gray-600">{category.description}</p>
                {(category.title === 'Significant Change' || category.title === 'Major Change') && <br />}
              </div>
              {category.subtitle && (
                <p className="text-base font-bold text-gray-600 mt-4">
                  {category.subtitle}
                </p>
              )}
            </div>
          ))}
        </section>

        {/* Change Control Flow - Hidden
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: colorPalette.textColor }}>
            The Change Control Flow
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8">
            This process ensures every change request is efficiently identified, assessed, and dispositioned, guaranteeing alignment and quality from submission to resolution.
          </p>
          <div className="overflow-x-auto">
            <div className="flex flex-nowrap justify-center items-center gap-2 min-w-max px-4">
              {flowSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <div
                    className="flex flex-col items-center justify-center text-center p-3 rounded-lg shadow flex-shrink-0"
                    style={{ backgroundColor: colorPalette.veryLightBlue, minHeight: '90px', width: '140px' }}
                  >
                    <h4 className={`text-sm ${step.title === 'Initiate Change Process Request' ? "font-bold" : "font-semibold"}`}>{step.title}</h4>
                    {step.subtitle && <p className="text-xs text-gray-600 mt-1">{step.subtitle}</p>}
                  </div>
                  {index < flowSteps.length - 1 && (
                    <ArrowRight className="flex-shrink-0" size={24} color={colorPalette.mediumBlue} style={{ strokeWidth: 2.5 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section> */}

        {/* Change Process Request Workflow */}
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: colorPalette.textColor }}>
            Change Process Request Workflow
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8">
            Once a change is assessed, it enters this workflow to ensure proper evaluation, communication, and approval before implementation.
          </p>
          
          {/* Circular Workflow - Pie Chart Style */}
          <div className="w-full flex justify-center">
            <svg
              width="600"
              height="600"
              viewBox="0 0 600 600"
              className="max-w-full h-auto"
            >
              {/* Pie slices */}
              {[
                {
                  number: "1",
                  title: "Change Requested",
                  subtitle: "SME, OCM, or Process Initiated",
                  color: colorPalette.mediumBlue,
                  lightColor: colorPalette.veryLightBlue
                },
                {
                  number: "2",
                  title: "Evaluation",
                  subtitle: "VS Lead determines complexity",
                  color: colorPalette.mediumBlue,
                  lightColor: colorPalette.veryLightBlue
                },
                {
                  number: "3",
                  title: "Ticketing",
                  subtitle: "VS lead submits ticket if due dates are impacted",
                  color: colorPalette.mediumBlue,
                  lightColor: colorPalette.veryLightBlue
                },
                {
                  number: "4",
                  title: "Pause Course",
                  subtitle: "Course is paused pending stakeholder approval for Major changes",
                  color: colorPalette.mediumBlue,
                  lightColor: colorPalette.veryLightBlue
                },
                {
                  number: "5",
                  title: "Stakeholder Communication",
                  subtitle: "Notify stakeholders or request approval based on requested change",
                  color: colorPalette.mediumBlue,
                  lightColor: colorPalette.veryLightBlue
                },
                {
                  number: "6",
                  title: "Approval & Resumption",
                  subtitle: "Once approval is received, course is moved to later sprint",
                  color: colorPalette.mediumBlue,
                  lightColor: colorPalette.veryLightBlue
                }
              ].map((step, index) => {
                const startAngle = (index * 60) - 90;
                const endAngle = ((index + 1) * 60) - 90;
                const outerRadius = 280;
                const innerRadius = 100;
                
                // Calculate path for pie slice
                const x1 = 300 + Math.cos(startAngle * Math.PI / 180) * outerRadius;
                const y1 = 300 + Math.sin(startAngle * Math.PI / 180) * outerRadius;
                const x2 = 300 + Math.cos(endAngle * Math.PI / 180) * outerRadius;
                const y2 = 300 + Math.sin(endAngle * Math.PI / 180) * outerRadius;
                const x3 = 300 + Math.cos(startAngle * Math.PI / 180) * innerRadius;
                const y3 = 300 + Math.sin(startAngle * Math.PI / 180) * innerRadius;
                const x4 = 300 + Math.cos(endAngle * Math.PI / 180) * innerRadius;
                const y4 = 300 + Math.sin(endAngle * Math.PI / 180) * innerRadius;
                
                // Text positioning - moved inward for better fit
                const midAngle = startAngle + 30;
                const textRadius = innerRadius + ((outerRadius - innerRadius) * 0.55);
                const textX = 300 + Math.cos(midAngle * Math.PI / 180) * textRadius;
                const textY = 300 + Math.sin(midAngle * Math.PI / 180) * textRadius;
                
                return (
                  <g 
                    key={index} 
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      const path = document.getElementById(`pie-slice-${index}`);
                      if (path) {
                        path.style.filter = 'brightness(1.1)';
                        path.style.strokeWidth = '4';
                      }
                    }}
                    onMouseLeave={() => {
                      const path = document.getElementById(`pie-slice-${index}`);
                      if (path) {
                        path.style.filter = 'brightness(1)';
                        path.style.strokeWidth = '3';
                      }
                    }}
                  >
                    {/* Pie slice */}
                    <path
                      id={`pie-slice-${index}`}
                      d={`M ${x3} ${y3} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x3} ${y3}`}
                      fill={step.lightColor}
                      stroke="white"
                      strokeWidth="3"
                      className="transition-all duration-200"
                      style={{
                        filter: 'brightness(1)',
                        pointerEvents: 'all'
                      }}
                    />
                    
                    {/* Number circle - positioned at inner edge */}
                    <circle
                      cx={300 + Math.cos(midAngle * Math.PI / 180) * 110}
                      cy={300 + Math.sin(midAngle * Math.PI / 180) * 110}
                      r="15"
                      fill={step.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={300 + Math.cos(midAngle * Math.PI / 180) * 110}
                      y={300 + Math.sin(midAngle * Math.PI / 180) * 110}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {step.number}
                    </text>
                    
                    {/* Title text */}
                    {step.title.includes(' ') && step.title.length > 15 ? (
                      // Split long titles into two lines
                      <>
                        <text
                          x={textX}
                          y={textY - 18}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={colorPalette.darkBlue}
                          fontSize="13"
                          fontWeight="bold"
                          style={{ pointerEvents: 'none' }}
                        >
                          {step.title.split(' ').slice(0, Math.ceil(step.title.split(' ').length / 2)).join(' ')}
                        </text>
                        <text
                          x={textX}
                          y={textY - 5}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={colorPalette.darkBlue}
                          fontSize="13"
                          fontWeight="bold"
                          style={{ pointerEvents: 'none' }}
                        >
                          {step.title.split(' ').slice(Math.ceil(step.title.split(' ').length / 2)).join(' ')}
                        </text>
                      </>
                    ) : (
                      <text
                        x={textX}
                        y={textY - 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={colorPalette.darkBlue}
                        fontSize="13"
                        fontWeight="bold"
                        style={{ pointerEvents: 'none' }}
                      >
                        {step.title}
                      </text>
                    )}
                    
                    {/* Subtitle text - wrapped */}
                    <foreignObject
                      x={textX - 65}
                      y={textY}
                      width="130"
                      height="50"
                      style={{ pointerEvents: 'none' }}
                    >
                      <div className="text-center">
                        <p className="text-xs text-gray-600 leading-tight break-words" style={{ fontSize: '10px', pointerEvents: 'none' }}>
                          {step.subtitle}
                        </p>
                      </div>
                    </foreignObject>
                    
                  </g>
                );
              })}
              
              {/* Center circle */}
              <circle
                cx="300"
                cy="300"
                r="95"
                fill="white"
                stroke={colorPalette.veryLightBlue}
                strokeWidth="2"
              />
            </svg>
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Schedule Impact Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-center mb-2" style={{ color: colorPalette.textColor }}>
              Impact on Development Timeline
            </h3>
            <p className="text-center text-gray-600 mb-4">
              The category of a change request directly correlates to its impact on project timelines. Major changes require significant re-planning, leading to the longest delays.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={scheduleImpactData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  cursor={false}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="days" fill={colorPalette.mediumBlue}>
                  {scheduleImpactData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      style={{ 
                        filter: 'brightness(1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.filter = 'brightness(1.1)';
                        e.target.style.transform = 'scaleY(1.05)';
                        e.target.style.transformOrigin = 'bottom';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.filter = 'brightness(1)';
                        e.target.style.transform = 'scaleY(1)';
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stakeholder Involvement */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-center mb-2" style={{ color: colorPalette.textColor }}>
              Stakeholder Involvement
            </h3>
            <p className="text-center text-gray-600 mb-4">
              As the complexity of a change increases, so does the circle of stakeholders required for notification and approval, ensuring comprehensive oversight.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stakeholderData).map(([key, data]) => (
                <div key={key} className="text-center">
                  <h4 className="font-semibold capitalize mb-2" style={{ color: colorPalette.darkBlue }}>
                    {key}
                  </h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.fill}
                            style={{ 
                              filter: 'brightness(1)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.filter = 'brightness(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.filter = 'brightness(1)';
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Individual Legend for each chart */}
                  <div className="mt-2 w-full flex justify-center">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center">
                        <div 
                          className="rounded" 
                          style={{ 
                            backgroundColor: data[0].fill,
                            width: '12px',
                            height: '12px',
                            marginRight: '8px'
                          }}
                        ></div>
                        <span className="text-xs text-gray-600">{data[0].name} ({data[0].value})</span>
                      </div>
                      <div className="flex items-center">
                        <div 
                          className="rounded" 
                          style={{ 
                            backgroundColor: data[1].fill,
                            width: '12px',
                            height: '12px',
                            marginRight: '8px'
                          }}
                        ></div>
                        <span className="text-xs text-gray-600">{data[1].name} ({data[1].value})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ripple Effect and Resource Impact - Hidden
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Ripple Effect Chart */}
          {/* <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-center mb-2" style={{ color: colorPalette.textColor }}>
              The Ripple Effect of Major Changes
            </h3>
            <p className="text-center text-gray-600 mb-4">
              Major changes don't just affect training materials; they have a cascading impact across the entire project, from system development to go-live readiness.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={rippleEffectData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar name="Significant Change" dataKey="significant" stroke={colorPalette.mediumBlue} fill={colorPalette.mediumBlue} fillOpacity={0.3} />
                <Radar name="Major Change" dataKey="major" stroke={colorPalette.darkBlue} fill={colorPalette.darkBlue} fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div> */}

          {/* Resource Impact */}
          {/* <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-center mb-2" style={{ color: colorPalette.textColor }}>
              Resource Impact
            </h3>
            <p className="text-center text-gray-600 mb-4">
              The resources required scale directly with the magnitude of the change. Minor changes are handled by the core team, while major changes can require mobilizing a much larger group.
            </p>
            <div className="flex flex-col justify-center gap-6">
              {[
                { type: 'Minor Change', people: '👤', count: '1-2 people', color: colorPalette.lightBlue },
                { type: 'Significant Change', people: '👤👤👤', count: '3-5 people', color: colorPalette.mediumBlue },
                { type: 'Major Change', people: '👤👤👤👤👤+', count: '5+ people', color: colorPalette.darkBlue }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <h4 className="font-semibold mb-2" style={{ color: item.color }}>{item.type}</h4>
                  <div className="text-2xl mb-1" title={item.count}>{item.people}</div>
                  <p className="text-sm text-gray-600">{item.count}</p>
                </div>
              ))}
            </div>
          </div> */}
        {/* </section> */}

        {/* Development Cycle */}
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: colorPalette.textColor }}>
            Training Material Development & Review Cycle
          </h2>
          <p className="text-center text-gray-600 max-w-4xl mx-auto mb-8">
            Training material development follows a structured iterative review process to ensure content accuracy, relevance, and quality. Change requests are integrated at specific stages within this cycle.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developmentCycle.map((phase, index) => (
              <div key={index} className="relative">
                <div
                  className="p-4 rounded-lg shadow-md h-full"
                  style={{ backgroundColor: colorPalette.veryLightBlue }}
                >
                  <h4 className="font-bold mb-1">{phase.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{phase.subtitle}</p>
                  <p className="text-xs text-gray-700">{phase.description}</p>
                </div>
                {index < developmentCycle.length - 1 && (
                  <ArrowRight 
                    className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2" 
                    size={24} 
                    color={colorPalette.lightBlue} 
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Training Impact Predictor */}
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: colorPalette.textColor }}>
            ✨ Enhanced Training Impact Predictor ✨
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-6">
            Our enhanced AI predictor uses historical data from 335+ courses and 1,500+ modules to analyze your proposed change. It identifies value streams, risk factors, and complexity patterns based on real project outcomes to provide accurate impact predictions.
          </p>
          <div className="flex flex-col items-center">
            <textarea
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              className="w-full max-w-xl p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2"
              style={{ 
                focusRingColor: colorPalette.darkBlue,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
              }}
              rows={6}
              placeholder="e.g., 'Update R2R tax accounting module for new SAP S/4 HANA process' or 'Major revision to O2C billing training due to scope change in ITC3 phase' or 'Fix typo in P2P procurement guide'"
            />
            <button
              onClick={predictImpact}
              className="btn-primary btn-with-icon"
              disabled={isLoading}
            >
              <Search className="btn-icon" size={20} />
              {isLoading ? 'Analyzing...' : 'Predict Training Impact'}
            </button>
            
            {isLoading && (
              <div className="mt-6 text-gray-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: colorPalette.darkBlue }}></div>
                Processing your request...
              </div>
            )}
            
            {prediction && !isLoading && (
              <div className="mt-6 p-4 w-full max-w-xl bg-gray-100 rounded-md">
                <h4 className="font-semibold mb-2" style={{ color: colorPalette.darkBlue }}>
                  Enhanced Prediction Results:
                </h4>
                <div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p className="font-semibold">
                      Classification: 
                      <select
                        value={editableClassification}
                        onChange={(e) => setEditableClassification(e.target.value)}
                        className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm font-semibold focus:outline-none focus:ring-1"
                        style={{ focusRingColor: colorPalette.darkBlue }}
                      >
                        <option value="Minor Change">Minor Change</option>
                        <option value="Significant Change">Significant Change</option>
                        <option value="Major Change">Major Change</option>
                      </select>
                    </p>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p className="font-semibold">
                      Estimated Delay: {editableDelay === 0 ? (
                        'No delay'
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            value={editableDelay}
                            onChange={(e) => setEditableDelay(parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-center focus:outline-none focus:ring-1"
                            style={{ focusRingColor: colorPalette.darkBlue }}
                          />
                          business days
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Editable Justification */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label className="block font-semibold mb-2" style={{ color: colorPalette.darkBlue }}>
                      Justification (editable):
                    </label>
                    <textarea
                      value={editableJustification}
                      onChange={(e) => setEditableJustification(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-sm"
                      style={{ 
                        focusRingColor: colorPalette.darkBlue,
                        minHeight: '80px',
                        resize: 'vertical',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
                      }}
                      placeholder="Edit the justification if needed..."
                    />
                  </div>
                  
                  {prediction.analysisDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <h5 className="text-sm font-semibold mb-2" style={{ color: colorPalette.mediumBlue }}>
                        Historical Analysis:
                      </h5>
                      <div className="text-sm space-y-3">
                        {prediction.analysisDetails.matchedKeywords && (
                          <>
                            {prediction.analysisDetails.matchedKeywords.minor.length > 0 && (
                              <p><strong>Minor Keywords:</strong> {prediction.analysisDetails.matchedKeywords.minor.slice(0, 5).join(', ')}{prediction.analysisDetails.matchedKeywords.minor.length > 5 ? '...' : ''}</p>
                            )}
                            {prediction.analysisDetails.matchedKeywords.significant.length > 0 && (
                              <p><strong>Significant Keywords:</strong> {prediction.analysisDetails.matchedKeywords.significant.slice(0, 5).join(', ')}{prediction.analysisDetails.matchedKeywords.significant.length > 5 ? '...' : ''}</p>
                            )}
                            {prediction.analysisDetails.matchedKeywords.major.length > 0 && (
                              <p><strong>Major Keywords:</strong> {prediction.analysisDetails.matchedKeywords.major.slice(0, 5).join(', ')}{prediction.analysisDetails.matchedKeywords.major.length > 5 ? '...' : ''}</p>
                            )}
                          </>
                        )}
                        {prediction.analysisDetails.valueStreams.length > 0 && (
                          <p><strong>Value Streams:</strong> {prediction.analysisDetails.valueStreams.join(', ')}</p>
                        )}
                        {prediction.analysisDetails.riskFactors.length > 0 && (
                          <p><strong>Risk Factors:</strong> {prediction.analysisDetails.riskFactors.join(', ')}</p>
                        )}
                        <p><strong>Complexity Score:</strong> {prediction.analysisDetails.complexityScore}%</p>
                        <p><strong>Confidence Level:</strong> {prediction.analysisDetails.confidence}%</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Save Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={savePrediction}
                    disabled={saveStatus === 'saving' || saveStatus === 'saved' || prediction.classification === 'Error'}
                    className={`btn-primary btn-with-icon ${
                      saveStatus === 'saved' ? 'btn-saved' : 
                      saveStatus === 'saving' ? 'btn-saving' : ''
                    }`}
                    style={{
                      background: saveStatus === 'saved' 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                        : saveStatus === 'saving'
                        ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                        : undefined, // Use default btn-primary gradient
                      opacity: saveStatus === 'saving' ? 0.8 : undefined
                    }}
                  >
                    {saveStatus === 'saved' ? (
                      <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    ) : saveStatus === 'saving' ? (
                      <div className="btn-icon animate-spin">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                      </div>
                    ) : (
                      <Save className="btn-icon" size={20} strokeWidth={2.5} />
                    )}
                    
                    {saveStatus === 'saved' ? 'Successfully Saved!' :
                     saveStatus === 'saving' ? 'Saving to Database...' :
                     'Save to Database'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Guiding Principles */}
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: colorPalette.textColor }}>
            Guiding Principles for Success
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {guidingPrinciples.map((principle, index) => (
              <div key={index} className="p-4">
                <div className="text-4xl mb-2">{principle.icon}</div>
                <h4 className="font-bold" style={{ color: colorPalette.darkBlue }}>{principle.title}</h4>
                <p className="text-sm text-gray-600">{principle.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ERPChangeControl;