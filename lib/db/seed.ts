import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { genSaltSync, hashSync } from "bcrypt-ts";
import Stripe from "stripe";
import { user, agent, siteConfig } from "./schema";

config({ path: ".env.local" });

function hashPassword(password: string) {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
}

async function createStripeProducts(stripe: Stripe) {
  console.log("Creating Stripe products and prices...");

  const baseProduct = await stripe.products.create({
    name: "Base",
    description: "For individuals getting started",
    metadata: {
      credits_per_month: "100",
      features: "Access to all agents,Email support",
    },
  });

  const basePrice = await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800,
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  await stripe.products.update(baseProduct.id, {
    default_price: basePrice.id,
  });

  console.log(`  Created Base product: ${baseProduct.id}`);

  const plusProduct = await stripe.products.create({
    name: "Plus",
    description: "For power users who need more",
    metadata: {
      credits_per_month: "500",
      features:
        "Access to all agents,Priority support,Early access to features",
    },
  });

  const plusPrice = await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200,
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  await stripe.products.update(plusProduct.id, {
    default_price: plusPrice.id,
  });

  console.log(`  Created Plus product: ${plusProduct.id}`);
}

async function seed() {
  if (!process.env.POSTGRES_URL) {
    console.error("POSTGRES_URL is not set. Run pnpm db:setup first.");
    process.exit(1);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  // 1. Create default admin user
  const email = "test@test.com";
  const password = "admin123";

  console.log("Creating default admin user...");
  await db.insert(user).values({
    email,
    password: hashPassword(password),
    role: "admin",
  });
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);

  // 2. Create default agent
  console.log("Creating default agent...");
  await db.insert(agent).values({
    name: "General Assistant",
    description: "A helpful general-purpose AI assistant.",
    systemPrompt:
      "You are a helpful AI assistant. Answer questions clearly and concisely. Be friendly and professional.",
    suggestions: [
      "What can you help me with?",
      "Tell me about yourself",
      "Help me brainstorm ideas",
    ],
    isPublished: true,
    isDefault: true,
    order: 0,
    documentToolsEnabled: false,
    fileUploadEnabled: false,
  });
  console.log("  Created General Assistant (default)");

  // 3. Set default site name
  console.log("Setting default site config...");
  await db
    .insert(siteConfig)
    .values({
      key: "siteName",
      value: "AI Chatbot",
    })
    .onConflictDoNothing();
  console.log("  Site name: AI Chatbot");

  // 4. Create Stripe products (if Stripe is configured)
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    await createStripeProducts(stripe);
  } else {
    console.log(
      "Skipping Stripe products (STRIPE_SECRET_KEY not set). Run again after configuring Stripe."
    );
  }

  await connection.end();
  console.log("\nSeed completed!");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
