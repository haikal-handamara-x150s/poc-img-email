import type { VercelRequest, VercelResponse } from '@vercel/node';
import { toBuffer } from 'qrcode';

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        const raw = req.query['q'];
        const code = Array.isArray(raw) ? raw[0] : raw;
        if (!code) {
            res.status(404).send('');
        } else {
            const msg = `Your code is ${code} [${new Date(parseInt(code, 36)).toString()}].`;
            const payload = await toBuffer(msg);
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'image/png');
            }
            res.status(200).send(payload);
        }
    } catch (ex) {
        console.error('Error:', ex);
        res.status(500).json({
            status: false,
            data: ex instanceof Error ? ex.stack : (ex as object).toString(),
        });
    }
};
