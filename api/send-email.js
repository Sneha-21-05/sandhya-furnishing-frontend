import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // Set CORS headers so the Render backend can talk to it
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { email, subject, message } = req.body;

        if (!email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Missing Vercel environment variables: EMAIL_USER or EMAIL_PASS");
            return res.status(500).json({
                success: false,
                message: 'Server configuration error on Vercel: Missing EMAIL_USER or EMAIL_PASS environment variables.'
            });
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text: message,
        });

        return res.status(200).json({ success: true, message: 'Email sent via Vercel successfully', infoId: info.messageId });

    } catch (error) {
        console.error("Vercel Nodemailer Error:", error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to send email' });
    }
}
