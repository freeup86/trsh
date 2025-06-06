import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, FileText, MessageSquare, RotateCw, Award, Search, Users, UserPlus, Clock, AlertCircle } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';

const ERPChangeControl = () => {
  const [changeDescription, setChangeDescription] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    { name: 'Minor Change', days: 0, fill: colorPalette.lightBlue },
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
    { subject: 'Business Process Docs', significant: 4, major: 9 },
    { subject: 'UAT Scenarios', significant: 5, major: 8 },
    { subject: 'Other Training Materials', significant: 6, major: 9 },
    { subject: 'Go-Live Readiness', significant: 2, major: 7 }
  ];

  const flowSteps = [
    { title: 'Request Submitted', subtitle: '' },
    { title: 'Initial Assessment', subtitle: '24 hrs' },
    { title: 'Categorization', subtitle: '' },
    { title: 'Stakeholder Approval', subtitle: '' },
    { title: 'Implementation', subtitle: '' }
  ];

  const developmentCycle = [
    {
      title: 'Alpha Draft (ISG)',
      subtitle: '90% complete',
      description: 'Gathering materials, AI assist, complete OUTLINE, e-LEARNING MODULE, FACILITATOR GUIDE & TRAINING DECK. QA before SME Review.'
    },
    {
      title: 'Alpha Review (SMEs)',
      subtitle: '3 business days',
      description: 'SME content review, detailed review of business context and course structure. BA content identified. **Changes are made here.** OCM changes can be implemented.'
    },
    {
      title: 'Beta Revision (ISG)',
      subtitle: '1 business day',
      description: 'Complete SME requested revisions, refine missing details, clean up document. Accept/reject track changes.'
    },
    {
      title: 'Beta Review (SMEs)',
      subtitle: '2 business days',
      description: 'Validate Beta Revision. Small wording tweaks. **No major changes at this point.** OCM changes may be implemented.'
    },
    {
      title: 'Final Revision (ISG)',
      subtitle: '1 business day',
      description: 'Complete Beta Review requests (minor). Clear comments. Final QA by ISG Team. OCM changes may be implemented.'
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
    
    try {
      // Check if API key is available
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      
      if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
        // Fallback to simulated logic if no API key
        setTimeout(() => {
          const description = changeDescription.toLowerCase();
          let classification = '';
          let justification = '';
          let daysDelay = 0;

          if (description.includes('typo') || description.includes('screenshot') || description.includes('minor') || description.includes('small')) {
            classification = 'Minor Change';
            justification = 'This appears to be a simple correction or update that doesn\'t affect the overall content structure or meaning. It can be implemented quickly without disrupting the development workflow.';
            daysDelay = 0;
          } else if (description.includes('module') || description.includes('process') || description.includes('significant') || description.includes('structure')) {
            classification = 'Significant Change';
            justification = 'This change affects content structure or requires broader modifications. It will need formal review and may impact the current sprint timeline, requiring coordination with multiple stakeholders.';
            daysDelay = Math.floor(Math.random() * 5) + 5; // 5-9 days
          } else if (description.includes('major') || description.includes('scope') || description.includes('complete') || description.includes('strategy') || description.includes('overhaul')) {
            classification = 'Major Change';
            justification = 'This represents a substantial revision to core content or strategic direction. It requires high-level approval, impacts multiple project areas, and may necessitate a development pause for re-planning.';
            daysDelay = Math.floor(Math.random() * 11) + 15; // 15-25 days
          } else {
            classification = 'Significant Change';
            justification = 'Based on the description, this change appears to have moderate impact on the training materials and will require standard review processes.';
            daysDelay = Math.floor(Math.random() * 5) + 5; // 5-9 days
          }

          setPrediction({ classification, justification, daysDelay });
          setIsLoading(false);
        }, 1500);
        return;
      }

      // Use Claude API
      const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, you should use a backend proxy
      });

      const prompt = `You are an expert in ERP training change management. Your task is to classify a proposed change into one of three categories: 'Minor Change', 'Significant Change', or 'Major Change' and the number of days delay. Provide a brief justification for your classification based on typical impacts in ERP training projects.

Change description: "${changeDescription}"

Please respond in the following JSON format:
{
  "classification": "Minor Change|Significant Change|Major Change",
  "daysDelay": number,
  "justification": "brief explanation"
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
        daysDelay: parsedResponse.daysDelay
      });
      
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
              description: 'Quick fixes like typos and simple clarifications. Handled rapidly to maintain content accuracy without disrupting workflow.',
              borderColor: colorPalette.lightBlue
            },
            {
              title: 'Significant Change',
              description: 'Broader modifications affecting content or structure, requiring formal review and potentially pushing work to the next sprint.',
              borderColor: colorPalette.mediumBlue
            },
            {
              title: 'Major Change',
              description: 'Substantial revisions to core content or strategy, requiring high-level approval and a potential pause in development.',
              borderColor: colorPalette.darkBlue
            }
          ].map((category, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md"
              style={{ borderBottom: `4px solid ${category.borderColor}` }}
            >
              <h3 className="text-2xl font-bold mb-2" style={{ color: colorPalette.darkBlue }}>
                {category.title}
              </h3>
              <p className="text-gray-600">{category.description}</p>
            </div>
          ))}
        </section>

        {/* Change Control Flow */}
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: colorPalette.textColor }}>
            The Change Control Flow
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8">
            This process ensures every change request is efficiently identified, assessed, and dispositioned, guaranteeing alignment and quality from submission to resolution.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {flowSteps.map((step, index) => (
              <React.Fragment key={index}>
                <div
                  className="flex flex-col items-center justify-center text-center p-4 rounded-lg shadow"
                  style={{ backgroundColor: colorPalette.veryLightBlue, minHeight: '100px', minWidth: '150px' }}
                >
                  <h4 className="font-semibold">{step.title}</h4>
                  {step.subtitle && <p className="text-sm text-gray-600 mt-1">{step.subtitle}</p>}
                </div>
                {index < flowSteps.length - 1 && (
                  <ArrowRight className="hidden md:block" size={24} color={colorPalette.lightBlue} />
                )}
              </React.Fragment>
            ))}
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
              <BarChart data={scheduleImpactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="days" fill={colorPalette.mediumBlue}>
                  {scheduleImpactData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
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
                  <h4 className="font-semibold capitalize" style={{ color: colorPalette.darkBlue }}>
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
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ripple Effect and Resource Impact */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Ripple Effect Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
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
          </div>

          {/* Resource Impact */}
          <div className="bg-white p-6 rounded-lg shadow-md">
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
          </div>
        </section>

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

        {/* Change Impact Predictor */}
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: colorPalette.textColor }}>
            ✨ Change Impact Predictor ✨
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-6">
            Describe a proposed change to your ERP training materials below, and our AI assistant will help categorize its likely impact (Minor, Significant, or Major) and provide a brief justification.
          </p>
          <div className="flex flex-col items-center">
            <textarea
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              className="w-full max-w-xl p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2"
              style={{ focusRingColor: colorPalette.darkBlue }}
              rows={6}
              placeholder="e.g., 'Update a screenshot in a single module to reflect new UI element.' or 'Add a completely new process module due to scope change.'"
            />
            <button
              onClick={predictImpact}
              className="text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out hover:opacity-90"
              style={{ backgroundColor: colorPalette.darkBlue }}
            >
              Predict Change Impact
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
                  Prediction:
                </h4>
                <p className="font-semibold">Classification: {prediction.classification}</p>
                <p className="font-semibold">Estimated Delay: {prediction.daysDelay === 0 ? 'No delay' : `${prediction.daysDelay} business days`}</p>
                <p className="mt-2">Justification: {prediction.justification}</p>
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