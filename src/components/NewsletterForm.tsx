import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NewsletterForm = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from('newsletters')
      .insert([{ email }]);

    if (insertError) {
      setError('Error subscribing to newsletter: ' + insertError.message);
    } else {
      setSuccess('Thank you for subscribing!');
      setEmail('');
    }

    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Join our Newsletter</h1>
      <h2>Enter your email to receive latest news.</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <label htmlFor="newsletter-email" className="sr-only">Email</label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
      />
      <button type="submit">Subscribe</button>
    </form>
  );
};

export default NewsletterForm;