import { NextResponse } from 'next/server';

// Initialize Africa's Talking using environment variables
const credentials = {
    apiKey: process.env.AT_API_KEY || '',
    username: process.env.AT_USERNAME || 'sandbox' // 'sandbox' is the default for testing
};

let africastalking: any = null;

try {
    if (credentials.apiKey && credentials.username) {
        const AfricasTalking = require('africastalking')(credentials);
        africastalking = AfricasTalking.SMS;
    }
} catch (e) {
    console.error("Failed to initialize Africa's Talking", e);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, message } = body;

        if (!to || !message) {
            return NextResponse.json(
                { error: 'Missing phone number or message in request body' },
                { status: 400 }
            );
        }

        // Make sure the "to" parameter is an array since AfricasTalking requires it, or convert a string to an array
        const recipients = Array.isArray(to) ? to : [to];

        if (!africastalking) {
            // Development fallback: If API keys are missing, just simulate the SMS in the console
            console.log(`\n[SMS SIMULATION]`);
            console.log(`To: ${recipients.join(', ')}`);
            console.log(`Message:\n${message}\n`);

            return NextResponse.json({
                success: true,
                simulated: true,
                message: "SMS simulated in console. Please set AT_API_KEY and AT_USERNAME in your .env file to send real messages."
            });
        }

        // Send real SMS
        const options: any = {
            to: recipients,
            message: message,
        };

        // If a custom shortcode or alphanumeric sender ID is defined
        if (process.env.AT_SENDER_ID) {
            options.from = process.env.AT_SENDER_ID;
        }

        const response = await africastalking.send(options);

        return NextResponse.json({ success: true, response });

    } catch (error: any) {
        console.error('SMS sending error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send SMS' },
            { status: 500 }
        );
    }
}
