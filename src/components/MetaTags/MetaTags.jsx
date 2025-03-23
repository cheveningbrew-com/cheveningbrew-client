import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = () => {
  const serverUrl = process.env.REACT_APP_CHEVENINGBREW_SERVER_URL;

  return (
    <Helmet>
      {/* Open Graph */}
      <meta property="og:url" content={serverUrl} />
      <meta property="og:image" content={`${serverUrl}/logo192.png`} />

      {/* Twitter Card */}
      <meta property="twitter:url" content={serverUrl} />
      <meta property="twitter:image" content={`${serverUrl}/logo192.png`} />
    </Helmet>
  );
};

export default MetaTags;