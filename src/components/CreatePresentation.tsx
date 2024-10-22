import React, { useState } from 'react';

const CreatePresentation: React.FC = () => {
  const [title, setTitle] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const handleGoogleSignIn = () => {
    // Redirect to Google Sign-In
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?
      client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&
      redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI)}&
      scope=https://www.googleapis.com/auth/presentations&
      response_type=token`;
  };

  const handleCreatePresentation = async () => {
    try {
      const response = await fetch('/api/create-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, accessToken }),
      });
      const data = await response.json();
      console.log('Presentation created:', data);
    } catch (error) {
      console.error('Error creating presentation:', error);
    }
  };

  return (
    <div>
      {!accessToken ? (
        <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      ) : (
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Presentation Title"
          />
          <button onClick={handleCreatePresentation}>Create Presentation</button>
        </>
      )}
    </div>
  );
};

export default CreatePresentation;
