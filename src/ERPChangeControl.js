import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, FileText, MessageSquare, RotateCw, Award, Search, Users, UserPlus, Clock, AlertCircle, Save, Download } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';
import { trainingDataProcessor } from './trainingDataProcessor';
import * as XLSX from 'xlsx';

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
    
    // Get affected value streams with improved logic
    let valueStreams = 'Multiple';
    
    if (prediction.analysisDetails && prediction.analysisDetails.valueStreams && prediction.analysisDetails.valueStreams.length > 0) {
      valueStreams = prediction.analysisDetails.valueStreams.join(', ');
    } else {
      // Fallback: try to detect value streams directly from the change description
      const descLower = changeDescription.toLowerCase();
      const detectedStreams = [];
      
      const valueStreamPatterns = {
        'Tax Accounting': ['tax accounting', 'taxation', 'tax compliance', 'tax reporting'],
        'O2C': ['o2c', 'order to cash', 'order-to-cash', 'sales', 'billing', 'revenue'],
        'P2P': ['p2p', 'procure to pay', 'procure-to-pay', 'procurement', 'purchasing'],
        'R2R': ['r2r', 'record to report', 'record-to-report', 'reporting', 'financial reporting'],
        'HCM': ['hcm', 'human capital', 'hr', 'human resources', 'payroll'],
        'PLM': ['plm', 'product lifecycle', 'manufacturing'],
        'Finance': ['finance', 'financial', 'accounting', 'budget', 'cost']
      };
      
      Object.entries(valueStreamPatterns).forEach(([stream, patterns]) => {
        if (patterns.some(pattern => descLower.includes(pattern))) {
          if (!detectedStreams.includes(stream)) {
            detectedStreams.push(stream);
          }
        }
      });
      
      if (detectedStreams.length > 0) {
        valueStreams = detectedStreams.join(', ');
      }
      
      // Debug logging
      console.log('Email creation debug:', {
        originalValueStreams: prediction.analysisDetails?.valueStreams,
        fallbackDetected: detectedStreams,
        finalValueStreams: valueStreams,
        changeDescription: changeDescription.substring(0, 100) + '...'
      });
    }
    
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { border-bottom: 2px solid #0078d4; padding-bottom: 10px; margin-bottom: 20px; }
        .alert-banner { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        .alert-title { font-weight: bold; color: #856404; font-size: 12pt; }
        h2 { color: #0078d4; font-size: 12pt; margin: 20px 0 10px 0; border-bottom: 1px solid #e1e1e1; padding-bottom: 5px; }
        .section { margin-bottom: 0px; }
        .change-description { background-color: #f8f9fa; border-left: 4px solid #0078d4; padding: 15px; margin: 10px 0; border-radius: 0 4px 4px 0; }
        .impact-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .impact-table td { padding: 8px 12px; border: 1px solid #e1e1e1; }
        .impact-table .label { background-color: #f8f9fa; font-weight: bold; width: 30%; }
        .justification { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .next-steps { background-color: #fff; border: 2px dashed #ccc; padding: 20px; margin: 15px 0; text-align: center; color: #666; }
        .signature { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e1e1e1; font-style: italic; color: #666; }
        .classification-high { color: #d63384; font-weight: bold; }
        .classification-medium { color: #fd7e14; font-weight: bold; }
        .classification-low { color: #198754; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <p>Dear Team,</p>
        
        <p>A <b>${editableClassification}</b> has been identified for the [value stream], [value substream] value stream in the [course(s)]. Please review the description of the change, the impact assessment, and the next steps plan.</p>

        <div class="section">
            <h2>Change Description</h2>
            <div class="change-description">
                ${changeDescription.replace(/\n/g, '<br>')}
            </div>
        </div><br/>

        <div class="section">
            <h2>Impact Assessment</h2>
            <table class="impact-table">
                <tr>
                    <td class="label">Classification:</td>
                    <td class="classification-${editableClassification.toLowerCase()}">${editableClassification}</td>
                </tr>
                <tr>
                    <td class="label">Estimated Delay:</td>
                    <td>${editableDelay === 0 ? 'No delay expected' : `${editableDelay} business days`}</td>
                </tr>
            </table>
        </div><br/>

        <div class="section">
            <h2>Justification</h2>
            <div class="justification">
                ${editableJustification.replace(/\n/g, '<br>')}
            </div>
        </div><br/>

        <div class="section">
            <h2>Next Steps</h2>
            <div class="next-steps" style="text-align: left;">
                <ul>
                    <li></li>
                    <li></li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();

    // Create a new window/tab with the HTML email that can be copied
    const emailWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    // Write the HTML content to the new window
    emailWindow.document.write(`
      <html>
      <head>
        <title>Email Preview - ${subject}</title>
        <style>
          .email-controls { 
            position: sticky; 
            top: 0; 
            background: #f0f0f0; 
            padding: 15px; 
            border-bottom: 2px solid #ccc; 
            text-align: center;
            font-family: Arial, sans-serif;
          }
          .email-controls button {
            background: #0078d4;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 0 5px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .email-controls button:hover { background: #106ebe; }
          .email-content { margin: 20px; }
          .copy-instructions {
            background: #e7f3ff;
            border: 1px solid #b3d8ff;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="email-controls">
          <h3 style="margin: 0 0 10px 0; color: #333;">Training Impact Alert Email</h3>
          <div class="copy-instructions">
            <strong>Instructions:</strong> Click Copy to Clipboard, then Open Outlook and paste the content.
          </div>
          <button onclick="copyToClipboard()" title="Copy email content to clipboard">Copy to Clipboard</button>
          <button onclick="openOutlook()" title="Open Outlook with subject">Open Outlook</button>
        </div>
        
        <div class="email-content" id="emailContent">
          ${emailBody}
        </div>
        
        <script>
          function selectAllContent() {
            const content = document.getElementById('emailContent');
            const range = document.createRange();
            range.selectNodeContents(content);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          }
          
          function copyToClipboard() {
            selectAllContent();
            try {
              document.execCommand('copy');
              alert('Email content copied to clipboard! You can now paste it into Outlook.');
            } catch (err) {
              alert('Copy failed. Please manually select and copy the content below.');
            }
          }
          
          function openOutlook() {
            const subject = "${encodeURIComponent(subject)}";
            const mailtoUrl = \`mailto:?subject=\${subject}\`;
            window.open(mailtoUrl, '_self');
          }
        </script>
      </body>
      </html>
    `);
    
    emailWindow.document.close();
  };

  // Export all prediction data from database to Excel
  const exportToExcel = async () => {
    try {
      // Fetch all predictions from the database
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/predictions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prediction data from database');
      }
      
      const responseData = await response.json();
      
      if (!responseData.success || !responseData.data || responseData.data.length === 0) {
        alert('No prediction data found in the database to export.');
        return;
      }

      const allPredictions = responseData.data;

      // Prepare data for Excel export
      const exportData = allPredictions.map((pred, index) => ({
        'Record #': index + 1,
        'Date Created': pred.created_at ? new Date(pred.created_at).toLocaleString() : 'Unknown',
        'Change Description': pred.change_description || 'Not provided',
        'Classification': pred.classification || 'Not classified',
        'Estimated Delay (Days)': pred.days_delay || 0,
        'Justification': pred.justification || 'Not provided',
        'Value Streams': Array.isArray(pred.value_streams) ? pred.value_streams.join(', ') : (pred.value_streams || 'Not specified'),
        'Risk Factors': Array.isArray(pred.risk_factors) ? pred.risk_factors.join(', ') : (pred.risk_factors || 'None'),
        'Complexity Score': pred.complexity_score || 'N/A',
        'Confidence Level': pred.confidence_level || 'N/A',
        'User ID': pred.user_id || 'Anonymous',
        'Session ID': pred.session_id || 'N/A',
        'Prediction ID': pred.id || 'N/A'
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 10 }, // Record #
        { wch: 20 }, // Date Created
        { wch: 50 }, // Change Description
        { wch: 20 }, // Classification
        { wch: 20 }, // Estimated Delay
        { wch: 50 }, // Justification
        { wch: 30 }, // Value Streams
        { wch: 30 }, // Risk Factors
        { wch: 15 }, // Complexity Score
        { wch: 15 }, // Confidence Level
        { wch: 20 }, // User ID
        { wch: 25 }, // Session ID
        { wch: 15 }  // Prediction ID
      ];
      ws['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'All Training Impact Predictions');
      
      // Generate filename with timestamp and record count
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `All_Training_Impact_Predictions_${allPredictions.length}_records_${timestamp}.xlsx`;
      
      // Save the file
      XLSX.writeFile(wb, filename);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data to Excel. Please try again or check your connection.');
    }
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
      // Primary: Use training material data from ai_training_material folder
      const analysis = trainingDataProcessor.analyzeChange(changeDescription);
      const trainingResult = trainingDataProcessor.classifyChange(analysis);
      
      // Check confidence level to determine if Claude enhancement is needed
      const useClaudeEnhancement = analysis.confidence < 0.7; // Use Claude if confidence < 70%
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      
      if (useClaudeEnhancement && apiKey && apiKey !== 'your_anthropic_api_key_here') {
        // Secondary: Enhance with Claude AI when confidence is low
        const anthropic = new Anthropic({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true,
          defaultHeaders: {
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        });

        const prompt = `You are an expert in ERP training change management. I have a primary prediction from historical training data, but the confidence is low (${Math.round(analysis.confidence * 100)}%). Please review and enhance the prediction if needed.

Change description: "${changeDescription}"

Primary prediction from training material analysis:
- Classification: ${trainingResult.classification}
- Days delay: ${trainingResult.daysDelay}
- Justification: ${trainingResult.justification}

Historical data analysis:
- Affected value streams: ${analysis.valueStreams.length > 0 ? analysis.valueStreams.join(', ') : 'Not identified'}
- Risk factors: ${analysis.riskFactors.map(r => r.factor).join(', ') || 'None'}
- Matched keywords: ${Object.entries(analysis.matchedKeywords).filter(([key, keywords]) => keywords.length > 0).map(([key, keywords]) => `${key}: ${keywords.slice(0, 3).join(', ')}`).join('; ') || 'None'}

Please either confirm the primary prediction or provide an enhanced assessment. Respond in JSON format:
{
  "classification": "Minor Change|Significant Change|Major Change",
  "daysDelay": number,
  "justification": "enhanced explanation that builds on historical insights",
  "enhanced": true|false
}`;

        try {
          const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 500,
            messages: [{ role: "user", content: prompt }]
          });

          const response = message.content[0].text;
          const parsedResponse = JSON.parse(response);
          
          // Use Claude-enhanced result
          const enhancedResult = {
            classification: parsedResponse.classification,
            justification: parsedResponse.enhanced ? 
              parsedResponse.justification : 
              trainingResult.justification,
            daysDelay: parsedResponse.daysDelay,
            analysisDetails: {
              valueStreams: analysis.valueStreams,
              riskFactors: analysis.riskFactors.map(r => r.factor),
              complexityScore: Math.round(analysis.complexityScore * 100),
              confidence: Math.round(analysis.confidence * 100),
              matchedKeywords: analysis.matchedKeywords,
              source: 'Training Material + AI Enhanced'
            }
          };
          
          setPrediction(enhancedResult);
          setEditableJustification(enhancedResult.justification);
          setEditableDelay(enhancedResult.daysDelay);
          setEditableClassification(enhancedResult.classification);
          setIsLoading(false);
          return;
        } catch (claudeError) {
          console.warn('Claude enhancement failed, using training data result:', claudeError);
          // Fall back to training data result
        }
      }
      
      // Use primary training material result (either high confidence or Claude unavailable)
      setTimeout(() => {
        const finalResult = {
          ...trainingResult,
          analysisDetails: {
            valueStreams: analysis.valueStreams,
            riskFactors: analysis.riskFactors.map(r => r.factor),
            complexityScore: Math.round(analysis.complexityScore * 100),
            confidence: Math.round(analysis.confidence * 100),
            matchedKeywords: analysis.matchedKeywords,
            source: 'Training Material'
          }
        };
        
        setPrediction(finalResult);
        setEditableJustification(finalResult.justification);
        setEditableDelay(finalResult.daysDelay);
        setEditableClassification(finalResult.classification);
        setIsLoading(false);
      }, 1000); // Shorter delay since we're using local data
      
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
            Our predictor primarily uses training material data from ai_training_material/ (335+ courses, 1,500+ modules) to analyze changes. AI enhancement provides secondary validation when confidence is low, ensuring accurate predictions based on real project outcomes.
          </p>
          <div className="flex flex-col items-center w-full">
            <textarea
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              className="w-full max-w-xl border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2"
              style={{ 
                padding: '12px',
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
              <div className="mt-6 w-full flex gap-4 justify-center items-start">
                {/* Main Results Panel */}
                <div className="p-4 bg-gray-100 rounded-md" style={{ width: '700px' }}>
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
                      Justification:
                    </label>
                    <textarea
                      value={editableJustification}
                      onChange={(e) => setEditableJustification(e.target.value)}
                      className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-sm"
                      style={{ 
                        padding: '12px',
                        focusRingColor: colorPalette.darkBlue,
                        minHeight: '120px',
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
                
                {/* Save and Export Buttons */}
                <div className="mt-6 flex justify-center gap-4">
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
                  
                  <button
                    onClick={exportToExcel}
                    className="btn-primary btn-with-icon"
                    title="Export all prediction data from database to Excel"
                    style={{ width: '140px', minWidth: 'unset', fontSize: '14px' }}
                  >
                    <Download className="btn-icon" size={20} strokeWidth={2.5} />
                    Export Data
                  </button>
                </div>
                </div>
                
                {/* Notification Panel */}
                {(editableClassification === 'Minor Change' || editableClassification === 'Significant Change' || editableClassification === 'Major Change') && (
                  <div className="relative self-start flex-shrink-0" style={{ width: '300px', textAlign: 'left' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100 rounded-xl blur-sm opacity-70"></div>
                    <div className="relative bg-gradient-to-br from-white via-amber-50/80 to-orange-50/60 backdrop-blur-sm border border-amber-200/60 rounded-xl shadow-lg" style={{ padding: '12px', textAlign: 'left' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                          <AlertCircle className="text-white" size={10} strokeWidth={3} />
                        </div>
                        <h5 className="font-extrabold text-amber-900 text-xs tracking-wide uppercase">
                          &nbsp;Action Required
                        </h5>
                      </div>
                      <div className="pl-8 pr-2" style={{ textAlign: 'left' }}>
                        {editableClassification === 'Minor Change' ? (
                          <p className="text-xs text-amber-800 leading-relaxed font-semibold" style={{ textAlign: 'left' }}>
                            <span className="text-amber-700">Notify: VSPO, PO, Lara Gorton, and Training Lead</span>
                          </p>
                        ) : editableClassification === 'Significant Change' ? (
                          <p className="text-xs text-amber-800 leading-relaxed font-semibold" style={{ textAlign: 'left' }}>
                            <span className="text-amber-700">Notify: VSPO, PO, Sarah Gentry, Hala Amer, Chris Fisher, Emily Shin, OCM Lead</span>
                          </p>
                        ) : (
                          <p className="text-xs text-amber-800 leading-relaxed font-semibold" style={{ textAlign: 'left' }}>
                            <span className="text-amber-700">Notify: VSPO, PO, Sarah Gentry, Hala Amer, Chris Fisher, Emily Shin, OCM Lead</span><br/><br/>
                            <span className="text-amber-700">Request VSPO/PO verification</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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