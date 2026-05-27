import { NextResponse } from 'next/server';

const credentials = {
    apiKey: process.env.AT_API_KEY || '',
    username: process.env.AT_USERNAME || 'sandbox'
};

let africastalking: any = null;

try {
    if (credentials.apiKey && credentials.username) {
        const AfricasTalking = require('africastalking')(credentials);
        africastalking = AfricasTalking.SMS;
    }
} catch (e) {
    console.error("Failed to init", e);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone') || '+256770000000'; // Default mock number

    try {
        if (!africastalking) {
            return NextResponse.json({ error: "Africa's Talking not initialized. Check Env variables." });
        }

        const options = {
            to: [phone],
            message: "This is a test message from SocialPay Africa's Talking integration.",
        };

        const response = await africastalking.send(options);
        return NextResponse.json({ success: true, response });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, fullError: error }, { status: 500 });
    }
}
