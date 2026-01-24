import bcrypt from 'bcrypt'
import { query, pool } from '../config/database.js'

async function seed() {
  console.log('Seeding database...')

  try {
    // Create demo couple
    const coupleResult = await query(
      `INSERT INTO couples (invite_code, theme, settings)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [
        'DEMO2024',
        { name: 'Rose Garden', primary: '#E11D48' },
        {},
      ]
    )
    const coupleId = coupleResult.rows[0].id
    console.log(`Created couple: ${coupleId}`)

    // Create demo users
    const hashedPassword = await bcrypt.hash('demo123', 12)

    const user1Result = await query(
      `INSERT INTO users (email, password_hash, display_name, couple_id, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['alice@demo.com', hashedPassword, 'Alice', coupleId, 'partner_1']
    )
    const user1Id = user1Result.rows[0].id
    console.log(`Created user: alice@demo.com (${user1Id})`)

    const user2Result = await query(
      `INSERT INTO users (email, password_hash, display_name, couple_id, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['bob@demo.com', hashedPassword, 'Bob', coupleId, 'partner_2']
    )
    const user2Id = user2Result.rows[0].id
    console.log(`Created user: bob@demo.com (${user2Id})`)

    // Update couple with paired_at
    await query(
      'UPDATE couples SET paired_at = NOW() WHERE id = $1',
      [coupleId]
    )

    // Create demo map
    const mapResult = await query(
      `INSERT INTO maps (couple_id, name, description, type, center_lat, center_lng, zoom_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        coupleId,
        'Our Love Story',
        'All our special places together',
        'shared',
        40.7128, // NYC
        -74.006,
        12,
      ]
    )
    const mapId = mapResult.rows[0].id
    console.log(`Created map: ${mapId}`)

    // Create demo pins
    const pins = [
      {
        title: 'Where We First Met',
        description: 'The coffee shop where our eyes met for the first time. Best latte of my life!',
        lat: 40.7484,
        lng: -73.9857,
        pinType: 'milestone',
        icon: '💕',
        color: '#E11D48',
        memoryDate: '2023-02-14',
        createdBy: user1Id,
      },
      {
        title: 'First Date',
        description: 'Italian restaurant. You spilled wine on your shirt and I fell in love.',
        lat: 40.7580,
        lng: -73.9855,
        pinType: 'memory',
        icon: '🍝',
        color: '#F59E0B',
        memoryDate: '2023-02-21',
        createdBy: user2Id,
      },
      {
        title: 'Central Park Picnic',
        description: 'Perfect sunny day with sandwiches and champagne',
        lat: 40.7829,
        lng: -73.9654,
        pinType: 'memory',
        icon: '🧺',
        color: '#22C55E',
        memoryDate: '2023-05-15',
        createdBy: user1Id,
      },
      {
        title: 'Brooklyn Bridge Walk',
        description: 'Sunset walk across the bridge. You said you loved me here.',
        lat: 40.7061,
        lng: -73.9969,
        pinType: 'milestone',
        icon: '🌉',
        color: '#8B5CF6',
        memoryDate: '2023-06-20',
        createdBy: user2Id,
      },
      {
        title: 'Dream Apartment',
        description: 'The place we want to live together someday',
        lat: 40.7282,
        lng: -73.7949,
        pinType: 'wishlist',
        icon: '🏠',
        color: '#3B82F6',
        createdBy: user1Id,
      },
      {
        title: 'Japan Trip 2025',
        description: 'Cherry blossom season in Tokyo!',
        lat: 35.6762,
        lng: 139.6503,
        pinType: 'trip',
        icon: '🌸',
        color: '#EC4899',
        createdBy: user2Id,
      },
    ]

    for (const pin of pins) {
      await query(
        `INSERT INTO pins (
          map_id, created_by, title, description, lat, lng,
          location, pin_type, icon, color, memory_date, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          ST_SetSRID(ST_MakePoint($6, $5), 4326)::geography,
          $7, $8, $9, $10, $11
        )`,
        [
          mapId,
          pin.createdBy,
          pin.title,
          pin.description,
          pin.lat,
          pin.lng,
          pin.pinType,
          pin.icon,
          pin.color,
          pin.memoryDate || null,
          {},
        ]
      )
      console.log(`Created pin: ${pin.title}`)
    }

    console.log('\n✅ Seed complete!')
    console.log('\nDemo accounts:')
    console.log('  Email: alice@demo.com  Password: demo123')
    console.log('  Email: bob@demo.com    Password: demo123')
    console.log('\nThey are already paired as a couple with a shared map.')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
