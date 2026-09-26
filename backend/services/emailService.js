import nodemailer from "nodemailer";

let transporter;
let verified = false;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_PORT || "587") === "465",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function verifyEmailTransport() {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("[email] SMTP is NOT configured. Emails will not be sent.");
    console.warn("[email] Add SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS to backend/.env");
    return false;
  }
  try {
    await mailer.verify();
    verified = true;
    console.log(`[email] SMTP connection verified for ${process.env.SMTP_USER}`);
    return true;
  } catch (error) {
    verified = false;
    console.error(`[email] SMTP verification failed: ${error.message}`);
    return false;
  }
}

export async function sendEmail({ to, subject, html, text }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(`[email] NOT SENT — SMTP is not configured. Target: ${to}`);
    return { sent: false, skipped: true, reason: "SMTP_NOT_CONFIGURED" };
  }

  try {
    if (!verified) await mailer.verify();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    console.log(`[email] SENT to ${to} | messageId=${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[email] FAILED to ${to}: ${error.message}`);
    return { sent: false, error: error.message };
  }
}

export async function notifyConnectionRequest({ recipient, sender }) {
  return sendEmail({
    to: recipient.email,
    subject: `${sender.name} wants to connect with you on SkillSwap`,
    text: `${sender.name} sent you a SkillSwap connection request. Log in to review it.`,
    html: `<h2>New SkillSwap connection request</h2><p><strong>${escapeHtml(sender.name)}</strong> wants to connect with you.</p><p>Log in to SkillSwap to accept or decline the request.</p>`,
  });
}

export async function notifyConnectionAccepted({ recipient, accepter }) {
  return sendEmail({
    to: recipient.email,
    subject: `${accepter.name} accepted your SkillSwap connection`,
    text: `${accepter.name} accepted your connection request on SkillSwap.`,
    html: `<h2>Connection accepted</h2><p><strong>${escapeHtml(accepter.name)}</strong> accepted your SkillSwap connection request.</p>`,
  });
}

export async function notifyMeeting({ recipient, organizer, meeting }) {
  return sendEmail({
    to: recipient.email,
    subject: `SkillSwap meeting scheduled: ${meeting.title}`,
    text: `${meeting.title} is scheduled for ${meeting.date} at ${meeting.time}. Skill: ${meeting.skill}.`,
    html: `<h2>New SkillSwap meeting</h2><p><strong>${escapeHtml(meeting.title)}</strong></p><p>With ${escapeHtml(organizer.name)} · ${escapeHtml(meeting.skill)}</p><p>${escapeHtml(meeting.date)} at ${escapeHtml(meeting.time)}</p>${meeting.meetingUrl ? `<p>Meeting link: <a href="${escapeHtml(meeting.meetingUrl)}">Join meeting</a></p>` : ""}`,
  });
}

export async function notifyQuizAssigned({ recipient, creator, quiz }) {
  return sendEmail({
    to: recipient.email,
    subject: `${creator.name} assigned you a SkillSwap quiz`,
    text: `${creator.name} assigned you "${quiz.title}" for ${quiz.skill}. Log in to SkillSwap to take it.`,
    html: `<h2>New quiz assigned</h2><p><strong>${escapeHtml(creator.name)}</strong> assigned you <strong>${escapeHtml(quiz.title)}</strong>.</p><p>Skill: ${escapeHtml(quiz.skill)} · Questions: ${quiz.questions.length}</p><p>Log in to SkillSwap to take the test.</p>`,
  });
}

export async function notifyQuizCompleted({ recipient, participant, quiz, score, total }) {
  return sendEmail({
    to: recipient.email,
    subject: `${participant.name} completed your SkillSwap quiz`,
    text: `${participant.name} completed "${quiz.title}" and scored ${score}/${total}.`,
    html: `<h2>Quiz completed</h2><p><strong>${escapeHtml(participant.name)}</strong> completed <strong>${escapeHtml(quiz.title)}</strong>.</p><p>Score: <strong>${score}/${total}</strong></p>`,
  });
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}
