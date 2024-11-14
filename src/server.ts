import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { StructuredOutputParser } from '@langchain/core/output_parsers';

dotenv.config();

const port = process.env.PORT || 3001;
const openaiKey = process.env.OPENAI_API_KEY;
const weatherApiKey = process.env.WEATHER_API_KEY || "2d6c6dd16cd2173821879b85ec204213";
const weatherBaseUrl = process.env.WEATHER_BASE_URL || "https://api.openweathermap.org";

// Add validation
if (!openaiKey) {
  console.error('Missing OPENAI_API_KEY environment variable');
  process.exit(1);
}

interface WeatherData {
  date: string;
  temp: number;
  description: string;
}

const app = express();
app.use(express.json());

// Initialize the OpenAI model
const model = new OpenAI({
  openAIApiKey: openaiKey,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

// Define the parser for the structured output
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    day1: z.string().describe("First day weather forecast in sports announcer style"),
    day2: z.string().describe("Second day weather forecast in sports announcer style"),
    day3: z.string().describe("Third day weather forecast in sports announcer style"),
    day4: z.string().describe("Fourth day weather forecast in sports announcer style"),
    day5: z.string().describe("Fifth day weather forecast in sports announcer style"),
  })
);

// Get the format instructions from the parser
const formatInstructions = parser.getFormatInstructions();

// Function to fetch coordinates for a location
async function getCoordinates(location: string) {
  try {
    const url = `${weatherBaseUrl}/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${weatherApiKey}`;
    console.log('Geocoding URL:', url.replace(String(weatherApiKey), 'HIDDEN')); // Fixed TypeScript error

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API Error Response:', errorText);
      throw new Error(`Weather API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Geocoding response:', data);

    if (!data || data.length === 0) {
      throw new Error('Location not found');
    }

    return { 
      lat: data[0].lat, 
      lon: data[0].lon,
      name: data[0].name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Failed to get coordinates for ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to fetch weather data
async function getWeatherData(lat: number, lon: number): Promise<WeatherData[]> {
  try {
    const url = `${weatherBaseUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;
    console.log('Weather URL:', url.replace(String(weatherApiKey), 'HIDDEN')); // Also fixed here

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Weather API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Weather data received for coordinates:', { lat, lon });
    
    // Get one forecast per day
    const dailyForecasts = data.list.reduce((acc: WeatherData[], curr: any) => {
      const date = new Date(curr.dt * 1000).toLocaleDateString();
      if (!acc.find(forecast => forecast.date === date)) {
        acc.push({
          date,
          temp: Math.round(curr.main.temp),
          description: curr.weather[0].description
        });
      }
      return acc;
    }, []).slice(0, 5);

    return dailyForecasts;
  } catch (error) {
    console.error('Weather data error:', error);
    throw new Error(`Failed to get weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Rest of your code remains the same...

// Define the prompt template
const prompt = new PromptTemplate({
  template: `You are an enthusiastic sports announcer providing a weather forecast for {location}.
Here is the actual weather data for the next 5 days:
{weatherData}

Give a five-day weather forecast in your energetic sports announcer style using this actual weather data.
Each day should include the provided temperature and conditions in an exciting way.
Make it engaging and fun, like you're announcing a big game!

{format_instructions}`,
  inputVariables: ["location", "weatherData"],
  partialVariables: { format_instructions: formatInstructions },
});

// Create a prompt function that takes the user input and passes it through the call method
const promptFunc = async (location: string) => {
  try {
    // Get coordinates and weather data
    const coords = await getCoordinates(location);
    const weatherData = await getWeatherData(coords.lat, coords.lon);
    
    // Format weather data for the prompt
    const weatherString = weatherData.map((day, i) => 
      `Day ${i + 1}: ${day.date} - Temperature: ${day.temp}°F, Conditions: ${day.description}`
    ).join('\n');

    // Format the prompt with the user input and weather data
    const formatted = await prompt.format({ 
      location: location,
      weatherData: weatherString
    });

    // Call the model with the formatted prompt
    const result = await model.invoke(formatted);

    // Parse and return the result
    return await parser.parse(result);
  } catch (error) {
    console.error('Error in promptFunc:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

// Endpoint to handle request
app.post('/forecast', async (req: Request, res: Response): Promise<void> => {
  try {
    const location: string = req.body.location;
    if (!location) {
      res.status(400).json({
        error: 'Please provide a location in the request body.',
      });
      return;
    }

    const result = await promptFunc(location);
    res.json({ result });
  } catch (error: unknown) {
    console.error('Request error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});