import 'dotenv/config';
import { z } from 'zod';
import { connectMongo, disconnectMongo } from '../shared/infrastructure/db/mongo';
import { BcryptPasswordHasher } from '../shared/infrastructure/security/password';
import { EMAIL_REGEX } from '../modules/auth/domain/email.vo';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../modules/auth/domain/password.vo';
import { UserModel } from '../modules/auth/infrastructure/UserModel';

const seedSchema = z.object({
  ADMIN_USERNAME: z.string().trim().min(1).max(30),
  ADMIN_EMAIL: z.string().trim().regex(EMAIL_REGEX, 'ADMIN_EMAIL debe terminar en .co o .com'),
  ADMIN_PASSWORD: z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH),
});

async function main(): Promise<void> {
  const parsed = seedSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      'Define ADMIN_USERNAME, ADMIN_EMAIL y ADMIN_PASSWORD válidos en backend/.env antes del seed.',
    );
    process.exitCode = 1;
    return;
  }

  await connectMongo();

  const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = parsed.data;
  const passwordHash = await new BcryptPasswordHasher().hash(ADMIN_PASSWORD);

  const admin = await UserModel.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    {
      $set: {
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: 'admin',
        termsAcceptedAt: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).select('+passwordHash');

  console.log(`[TokenFLY] Administrador listo: ${admin.email}`);
  await disconnectMongo();
}

main().catch(async (error) => {
  console.error('[TokenFLY] Error al crear el administrador:', error);
  await disconnectMongo().catch(() => undefined);
  process.exitCode = 1;
});
