import 'dotenv/config';

export default {
  expo: {
    // Your existing config...
    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
    // If using Google Maps in your app, also add this to restrict API usage:
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    plugins: [
      // Add other plugins you're using...
    ],
  },
};
