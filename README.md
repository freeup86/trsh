# TRSH - ERP Training Material Change Control Dashboard

A React-based dashboard for managing and visualizing ERP training material change control processes. Features interactive charts, data visualization, and an AI-powered change impact predictor.

## Features

- **Change Classification Dashboard**: Visual overview of Minor, Significant, and Major changes
- **Interactive Charts**: Schedule impact, stakeholder involvement, ripple effects, and resource allocation
- **AI-Powered Impact Predictor**: Uses Anthropic's Claude API to classify change requests and estimate delays
- **Process Flow Visualization**: Clear representation of change control workflows
- **Development Cycle Tracking**: Training material development and review stages
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React 18
- **Charts**: Recharts library
- **Icons**: Lucide React
- **AI Integration**: Anthropic Claude API
- **Styling**: Custom CSS utilities (Tailwind-inspired)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Anthropic API key (optional, falls back to simulation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trsh
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Anthropic API key to `.env.local`:
```
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

5. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Usage

### Change Impact Predictor

1. Navigate to the "Change Impact Predictor" section
2. Enter a description of your proposed change
3. Click "Predict Change Impact"
4. View the AI-generated classification, estimated delay, and justification

**Example inputs:**
- "Fix typo in module 3 screenshot" → Minor Change, 0 days
- "Add new approval workflow process" → Significant Change, 5-9 days  
- "Complete restructure of training strategy" → Major Change, 15-25 days

### Dashboard Components

- **Change Categories**: Overview of Minor, Significant, and Major change types
- **Change Control Flow**: Step-by-step process visualization
- **Impact Charts**: Visual data on timeline delays and stakeholder involvement
- **Development Cycle**: Training material review stages
- **Guiding Principles**: Best practices for change management

## API Configuration

### With Anthropic Claude API

The app uses Claude 3 Haiku for intelligent change impact analysis. To enable:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Add it to your `.env.local` file
3. The predictor will automatically use Claude for analysis

### Without API Key

The app gracefully falls back to a keyword-based simulation system that provides reasonable predictions based on common patterns.

## Project Structure

```
src/
├── ERPChangeControl.js    # Main dashboard component
├── App.js                 # Root component
├── index.js              # Entry point
├── index.css             # Global styles and utility classes
└── App.css               # Component styles
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Notes

- Never commit API keys to version control
- The `.env.local` file is excluded via `.gitignore`
- In production, use a backend proxy instead of direct API calls
- The current setup uses `dangerouslyAllowBrowser: true` for development only

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open a GitHub issue or contact the development team.
