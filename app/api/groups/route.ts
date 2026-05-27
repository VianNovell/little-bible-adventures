import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'global-data.json');

// Helper to get global data safely
function getGlobalData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Give it a default empty state
            fs.writeFileSync(DATA_FILE, JSON.stringify({ groups: [], activities: [] }));
            return { groups: [], activities: [] };
        }
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(fileContent);
    } catch (e) {
        console.error("Error reading data:", e);
        return { groups: [], activities: [] };
    }
}

// GET all groups
export async function GET() {
    const data = getGlobalData();
    return NextResponse.json(data.groups);
}

// POST a new group
export async function POST(request: Request) {
    try {
        const newGroup = await request.json();
        const data = getGlobalData();

        // Add or update
        const existingIndex = data.groups.findIndex((g: any) => g.id === newGroup.id);
        if (existingIndex >= 0) {
            data.groups[existingIndex] = newGroup;
        } else {
            data.groups.push(newGroup);
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        return NextResponse.json({ success: true, group: newGroup });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update groups" }, { status: 500 });
    }
}
