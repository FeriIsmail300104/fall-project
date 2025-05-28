import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fall_data'
    });

    const [rows] = await connection.execute('SELECT * FROM sensordata ORDER BY id DESC');
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sensor_id, accX, accY, accZ, totalAccel } = body;

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fall_data'
    });

    const [result] = await connection.execute(
      'INSERT INTO sensordata (sensor_id, accX, accY, accZ, totalAccel) VALUES (?, ?, ?, ?, ?)',
      [sensor_id, accX, accY, accZ, totalAccel]
    );

    await connection.end();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 