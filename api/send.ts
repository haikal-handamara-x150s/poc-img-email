import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createTransport } from 'nodemailer';

function isEmail(value: string) {
    return /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
}

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        if (req.method?.toUpperCase() !== 'POST') {
            res.status(403).json({
                status: false,
                response: 'Invalid method',
            });
        } else if (process.env['MAIL'] !== 'true') {
            res.status(502).json({
                status: false,
                response: 'Account suspended',
            });
        } else if (!req.body.target || typeof(req.body.target) !== 'string' || !isEmail(req.body.target)) {
            res.status(400).json({
                status: false,
                response: 'Invalid body',
            });
        } else {
            const target: string = req.body.target;
            const transport = createTransport({
                service: 'hotmail',
                auth: {
                    user: process.env['MAIL_USER'],
                    pass: process.env['MAIL_PASS'],
                },
            });
            const info = await transport.sendMail({
                from: process.env['MAIL_USER'],
                to: target,
                subject: 'Your QR Code awaits!',
                html: `<p>Here's your QR code<br/>Enjoy!</p><img src="https://poc-img-email.vercel.app/api/generate?q=${Date.now().toString(36)}" alt="QR Code"/>`,
            });
            res.status(202).json({
                status: true,
                data: info,
            });
        }
    } catch (ex) {
        console.error('Error:', ex);
        res.status(500).json({
            status: false,
            data: ex instanceof Error ? ex.stack : (ex as object).toString(),
        });
    }
};
