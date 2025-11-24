import { useState } from 'react';
import { Alert, Button, Card, Label, Textarea, TextInput } from 'flowbite-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '', middle_name: '', company: '' });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ state: 'loading', message: '' });
    try {
      const body = new URLSearchParams(form).toString();
      const response = await fetch(`${API_BASE}/contact-bot/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      if (!response.ok) throw new Error('Submission failed');
      setStatus({ state: 'success', message: 'Thanks! Your payload has been logged.' });
      setForm({ name: '', email: '', message: '', middle_name: '', company: '' });
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <header className="space-y-1 text-center">
        <h1 className="text-3xl font-bold">Totally real contact form</h1>
        <p className="text-slate-500">Bots love it. Humans probably shouldn&apos;t submit real data.</p>
      </header>
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name" value="Name" />
            <TextInput id="name" name="name" onChange={handleChange} required value={form.name} />
          </div>
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput id="email" name="email" onChange={handleChange} required type="email" value={form.email} />
          </div>
          <div className="hidden">
            <Label htmlFor="middle_name" value="Middle name" />
            <TextInput id="middle_name" name="middle_name" onChange={handleChange} tabIndex={-1} value={form.middle_name} />
          </div>
          <div className="hidden">
            <Label htmlFor="company" value="Company" />
            <TextInput id="company" name="company" onChange={handleChange} tabIndex={-1} value={form.company} />
          </div>
          <div>
            <Label htmlFor="message" value="Message" />
            <Textarea id="message" name="message" onChange={handleChange} required rows={6} value={form.message} />
          </div>
          <Button color="dark" disabled={status.state === 'loading'} type="submit">
            {status.state === 'loading' ? 'Sending…' : 'Send message'}
          </Button>
        </form>
        {status.state !== 'idle' && (
          <Alert color={status.state === 'success' ? 'success' : 'failure'} className="mt-4">
            {status.message}
          </Alert>
        )}
      </Card>
    </main>
  );
}
