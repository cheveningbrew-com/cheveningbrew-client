import React from 'react';
import { Helmet } from 'react-helmet';

const MetaTags = () => {
  // Server URL for API and site references
  const serverUrl = process.env.REACT_APP_CHEVENINGBREW_SERVER_URL || 'https://www.cheveningbrew.com';

  // Static assets URL - use PUBLIC_URL in development for local assets
  const staticAssetsUrl = process.env.REACT_APP_ENV === 'local'
    ? process.env.PUBLIC_URL || ''
    : serverUrl;

    const localUrl =  'http://localhost:3001';
  return (
    <Helmet>
      {/* Links for static assets */}
      <link rel="apple-touch-icon" href={`${localUrl}/logo192.png`} />
      <link rel="manifest" href={`${localUrl}/manifest.json`} />
      <link rel="icon" href={`${localUrl}/favicon.ico`} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="CheveningBrew - AI Mock Interviews for Chevening Scholars" />
      <meta property="og:description" content="CheveningBrew helps you prepare for your Chevening Scholarship interview with an AI-driven voice-enabled mock interviewer and expert feedback from Chevening alumni." />
      <meta property="og:url" content={serverUrl} />
      <meta property="og:image" content={`${serverUrl}/logo192.png`} />

      {/* Twitter Card */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content="CheveningBrew - AI Mock Interviews for Chevening Scholars" />
      <meta property="twitter:description" content="Prepare for your Chevening Scholarship interview with AI-powered mock interviews and expert feedback from Chevening alumni." />
      <meta property="twitter:url" content={serverUrl} />
      <meta property="twitter:image" content={`${serverUrl}/logo192.png`} />
    </Helmet>
  );
};

export default MetaTags;