# Weather-Forecast-OpenAI

Weather Forecast API with Sports Announcer Style
A dynamic Weather Forecast API that combines OpenWeather data with OpenAI's GPT-3.5 to deliver weather forecasts in an engaging sports announcer style.

# Features

5-day weather forecast with actual temperature data
Sports announcer style narrative
Location-based weather information
Temperature in Fahrenheit
Detailed weather conditions
Geocoding support for worldwide locations

# Demo

API Endpoint: POST http://localhost:3001/forecast

## Sample Request:

json
{
    "location": "Los Angeles, CA, US"
}

## Sample Response:

json
{
    "result": {
        "day1": "Get ready for a scorching game day with a temperature of 59°F and clear skies in Los Angeles!",
        "day2": "The action continues with a temperature of 58°F and some broken clouds rolling in for day two!",
        "day3": "A cool breeze sweeps through the arena on day three with a temperature of 54°F and clear skies overhead!",
        "day4": "Fans, the forecast for day four is a refreshing 55°F with clear skies, perfect for a thrilling matchup!",
        "day5": "As we approach the final day, expect a steady 55°F with clear skies to cheer on your favorite teams in Los Angeles!"
    }
}

# Installation

## Clone the repository:

git clone https://github.com/yourusername/weather-forecast-advanced.git
cd weather-forecast-advanced

## Install dependencies:

npm install

## Create a .env file in the root directory:

OPENAI_API_KEY=your_openai_api_key_here
WEATHER_API_KEY=your_openweather_api_key_here
WEATHER_BASE_URL=https://api.openweathermap.org

## Build and start the server:

npm start
Prerequisites

Node.js (v18 or higher)
OpenAI API key
OpenWeather API key
npm or yarn

## API Usage

Endpoint: /forecast

Method: POST
Content-Type: application/json
Body:

json
{
    "location": "city_name"
}

## Example using curl:

curl -X POST http://localhost:3001/forecast \
-H "Content-Type: application/json" \
-d '{"location":"New York, NY"}'

## Example using Postman:

Create new POST request

URL: http://localhost:3001/forecast
Body: raw, JSON
Enter the location JSON
Send request

# Project Structure

CopyWeather-Forecast-Advanced/
├── src/
│   └── server.ts             # Main server file
├── dist/                     # Compiled JavaScript
├── .env                      # Environment variables
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation

# Technologies Used

TypeScript
Node.js
Express.js
OpenAI API
OpenWeather API
LangChain
Zod for validation

# Environment Variables

Required environment variables:
envCopyOPENAI_API_KEY=    # Your OpenAI API key
WEATHER_API_KEY=          # Your OpenWeather API key
WEATHER_BASE_URL=         # OpenWeather API base URL
Error Handling
The API returns appropriate error messages for:

Missing location
Invalid API keys
Location not found
API rate limits
Server errors

# Contributing

Fork the repository
Create a feature branch
Commit changes
Push to the branch
Create a Pull Request