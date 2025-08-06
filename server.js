// server.js

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const { createEvent } = require('ics');
const nodemailer  = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/** ── CONFIG ───────────────────────────────────────────────
 * Replace these with your Gmail address and app password.
 * (Generate an App Password in your Google Account settings.)
 */
const EMAIL_USER = 'musicademy1@gmail.com';
const EMAIL_PASS = 'mahaveer24';

/** ── In-memory store of scheduled sessions ───────────────── */
let sessions = [];

/** ── Teacher: create a new session ──────────────────────── */
app.post('/api/sessions', (req, res) => {
  const { date, startTime, endTime } = req.body;
  if (!date || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing date, startTime, or endTime' });
  }
  const id = uuidv4();
  sessions.push({ id, date, startTime, endTime });
  res.json({ success: true, session: { id, date, startTime, endTime } });
});

/** ── Student: list all sessions or by date ──────────────── */
app.get('/api/sessions', (req, res) => {
  const { date } = req.query;
  if (date) {
    return res.json(sessions.filter(s => s.date === date));
  }
  res.json(sessions);
});

/** ── Student: register for a session & send .ics invites ─── */
app.post('/api/register', async (req, res) => {
  try {
    const { sessionId, studentEmail } = req.body;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Parse date/time into numbers
    const [year, month, day] = session.date.split('-').map(Number);
    const [h1, m1] = session.startTime.split(':').map(Number);
    const [h2, m2] = session.endTime.split(':').map(Number);

    // Build the ICS calendar invite
    const { error: icsError, value: icsContent } = createEvent({
      start:  [year, month, day, h1, m1],
      end:    [year, month, day, h2, m2],
      title:  'Class Session',
      description: `Session on ${session.date} from ${session.startTime} to ${session.endTime}`,
      status: 'CONFIRMED',
      method: 'REQUEST',
      attendees: [
        {
          name:  'Teacher',
          email: 'abhispersonallol@gmail.com',
          rsvp:  true,
          partstat: 'ACCEPTED',
          role: 'REQ-PARTICIPANT'
        },
        {
          name:  'Student',
          email: studentEmail,
          rsvp:  true,
          partstat: 'NEEDS-ACTION',
          role: 'REQ-PARTICIPANT'
        }
      ]
    });
    if (icsError) throw new Error(icsError);

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
      host:   'smtp.gmail.com',
      port:   465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    // Send the email with .ics attachment
    await transporter.sendMail({
      from: EMAIL_USER,
      to:   `${studentEmail},abhispersonallol@gmail.com`,
      subject: 'Class Session Invitation',
      text:    `You’re invited to a class on ${session.date} from ${session.startTime} to ${session.endTime}.`,
      icalEvent: {
        filename: 'invite.ics',
        method:   'REQUEST',
        content:  icsContent
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error in /api/register:', err);
    res.status(500).json({ error: err.message });
  }
});

/** ── Start the server ───────────────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
