#!/usr/bin/env node

// MCP server for weather data using OpenWeatherMap API

const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// OpenWeatherMap API configuration
const API_KEY = process.env.OPENWEATHER_API_KEY || '9e73bbeea31763e60ca6a8dbab64d3d1';
const BASE_URL = 'api.openweathermap.org';

// Helper function to make API requests
function fetchWeather(endpoint, params) {
  return new Promise((resolve, reject) => {
    const queryParams = new URLSearchParams({ ...params, appid: API_KEY }).toString();
    const options = {
      hostname: BASE_URL,
      path: `/data/2.5/${endpoint}?${queryParams}`,
      method: 'GET'
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// MCP Protocol handlers
const tools = [
  {
    name: "get_weather",
    description: "Get current weather for a location",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name or 'City, Country Code'"
        },
        units: {
          type: "string",
          enum: ["metric", "imperial"],
          description: "Temperature units (metric=Celsius, imperial=Fahrenheit)",
          default: "metric"
        }
      },
      required: ["location"]
    }
  },
  {
    name: "get_forecast",
    description: "Get 5-day weather forecast",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name or 'City, Country Code'"
        },
        units: {
          type: "string",
          enum: ["metric", "imperial"],
          description: "Temperature units",
          default: "metric"
        }
      },
      required: ["location"]
    }
  }
];

function handleRequest(request) {
  const { method, params } = request;

  if (method === "initialize") {
    return {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "weather-api",
        version: "1.0.0"
      }
    };
  }

  if (method === "tools/list") {
    return { tools };
  }

  if (method === "tools/call") {
    const { name, arguments: args } = params;
    
    if (name === "get_weather") {
      const location = args.location;
      const units = args.units || "metric";
      
      fetchWeather('weather', { q: location, units })
        .then(data => {
          const temp = Math.round(data.main.temp);
          const unit = units === "imperial" ? "°F" : "°C";
          const response = {
            content: [{
              type: "text",
              text: `Weather in ${data.name}, ${data.sys.country}:\nTemperature: ${temp}${unit}\nFeels like: ${Math.round(data.main.feels_like)}${unit}\nCondition: ${data.weather[0].description}\nHumidity: ${data.main.humidity}%\nWind: ${data.wind.speed} ${units === "imperial" ? "mph" : "m/s"}\nPressure: ${data.main.pressure} hPa`
            }]
          };
          console.log(JSON.stringify(response));
        })
        .catch(err => {
          console.log(JSON.stringify({
            content: [{ type: "text", text: `Error fetching weather: ${err.message}` }],
            isError: true
          }));
        });
      return null; // Async response
    }

    if (name === "get_forecast") {
      const location = args.location;
      const units = args.units || "metric";
      
      fetchWeather('forecast', { q: location, units })
        .then(data => {
          const unit = units === "imperial" ? "°F" : "°C";
          let forecast = `5-Day Forecast for ${data.city.name}, ${data.city.country}:\n\n`;
          
          // Group by day and take one forecast per day
          const dailyForecasts = {};
          data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!dailyForecasts[date]) {
              dailyForecasts[date] = item;
            }
          });
          
          Object.entries(dailyForecasts).slice(0, 5).forEach(([date, item]) => {
            forecast += `${date}: ${item.weather[0].description}, ${Math.round(item.main.temp)}${unit}\n`;
          });
          
          const response = {
            content: [{ type: "text", text: forecast }]
          };
          console.log(JSON.stringify(response));
        })
        .catch(err => {
          console.log(JSON.stringify({
            content: [{ type: "text", text: `Error fetching forecast: ${err.message}` }],
            isError: true
          }));
        });
      return null; // Async response
    }
  }

  return { error: "Unknown method" };
}

// Read JSON-RPC messages
let buffer = '';
rl.on('line', (line) => {
  buffer += line;
  try {
    const request = JSON.parse(buffer);
    const response = handleRequest(request);
    if (response !== null) {
      console.log(JSON.stringify(response));
    }
    buffer = '';
  } catch (e) {
    // Continue buffering
  }
});
