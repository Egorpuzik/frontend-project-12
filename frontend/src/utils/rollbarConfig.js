// src/utils/rollbarConfig.js
const rollbarConfig = {
    accessToken: process.env.REACT_APP_ROLLBAR_ACCESS_TOKEN,
    environment: process.env.NODE_ENV || 'development',
    captureUncaught: true,
    captureUnhandledRejections: true,
  };
  
  export default rollbarConfig;
  