# Weather Power

Get real-time weather information and forecasts for any location worldwide.

## Features

- Current weather conditions
- Temperature in Celsius or Fahrenheit
- Humidity, wind speed, and pressure
- Weather descriptions and conditions
- Simple location-based queries

## Usage

This power provides weather data through a simple API. You can query weather by:

- City name: "London", "New York", "Tokyo"
- City and country: "Paris, FR", "Sydney, AU"
- Coordinates: lat/lon pairs

## Available Tools

### get_weather
Get current weather for a location.

**Parameters:**
- `location` (required): City name or "City, Country Code"
- `units` (optional): "metric" (Celsius) or "imperial" (Fahrenheit), defaults to metric

**Example:**
```
location: "Seattle, US"
units: "imperial"
```

### get_forecast
Get 5-day weather forecast.

**Parameters:**
- `location` (required): City name or "City, Country Code"
- `units` (optional): "metric" or "imperial", defaults to metric

## Notes

This is a demonstration power. In a real implementation, you would:
- Use a real weather API (OpenWeatherMap, WeatherAPI, etc.)
- Add API key configuration
- Include more detailed forecast data
- Add error handling for invalid locations
