export interface ContactFormPayload {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  city?: string;
  language?: 'cs' | 'en';
  timestamp: string;
}

export async function submitContactForm(payload: ContactFormPayload): Promise<void> {
  const response = await fetch('/.netlify/functions/send-contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Contact form submit failed with status ${response.status}: ${errorText}`);
  }

  const result = await response.json() as { success?: boolean; error?: string };

  if (!result.success) {
    throw new Error(result.error || 'Contact form submit failed');
  }
}
