import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

/**
 * Clerk Webhook Handler
 *
 * Syncs user data from Clerk to our local database.
 * Handles user.created, user.updated, and user.deleted events.
 *
 * Setup:
 * 1. In Clerk Dashboard → Webhooks → Add endpoint
 * 2. URL: https://your-domain.com/api/webhook/clerk
 * 3. Subscribe to: user.created, user.updated, user.deleted
 * 4. Copy webhook secret to CLERK_WEBHOOK_SECRET in .env.local
 */
export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the Svix secret from environment
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return new Response('Webhook secret not configured', {
      status: 500,
    });
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;

      console.log(`Creating user in database: ${id}`);

      // Create user in our database
      await db.insert(users).values({
        id: id,
        email: email_addresses[0]?.email_address || '',
        firstName: first_name,
        lastName: last_name,
      });

      console.log(`User created successfully: ${id}`);
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;

      console.log(`Updating user in database: ${id}`);

      // Update user in our database
      await db
        .update(users)
        .set({
          email: email_addresses[0]?.email_address || '',
          firstName: first_name,
          lastName: last_name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      console.log(`User updated successfully: ${id}`);
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      if (!id) {
        console.error('No user ID in delete event');
        return new Response('Invalid delete event', { status: 400 });
      }

      console.log(`Deleting user from database: ${id}`);

      // Delete user from our database (cascade will delete all related data)
      await db.delete(users).where(eq(users.id, id));

      console.log(`User deleted successfully: ${id}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error(`Error processing webhook event ${eventType}:`, error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
