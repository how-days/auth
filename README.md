This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Authentication Demo Project

This is a Next.js project that demonstrates a complete authentication system using NextAuth.js with both credentials (email/password) and GitHub OAuth support.

### Features

- Email/Password authentication
- GitHub OAuth integration
- Protected routes
- Session management
- Password hashing with bcrypt and additional crypto layer
- PostgreSQL database with Prisma ORM
- TypeScript support
- Modern UI with NextUI components

## Setup

### Prerequisites

- Node.js
- Docker and Docker Compose
- PostgreSQL (provided via Docker)

### Environment Variables

Create a `.env` file with the following variables:

```
ENV=development
PASSWORD_HASHER_SECRET=your-secret-key
DATABASE_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/postgres
AUTH_SECRET=your-auth-secret
```

### Database Setup

1. Start the PostgreSQL container:

```bash
make up
```

2. Run Prisma migrations:

```bash
npx prisma migrate deploy
```

## Authentication Flow

### 1. Credentials Authentication

The system supports traditional email/password authentication:

1. Registration:
   - Users can register with email and password
   - Passwords are hashed using a two-layer approach:
     - First layer: HMAC-SHA256 with a secret key
     - Second layer: bcrypt with salt

Reference implementation:

```8:14:src/lib/utils/password.ts
export const saltAndHashPassword = async (value: string) => {
  if (value.length > 100) throw new Error("Password too long");
  const preHashed = crypto
    .HmacSHA256(value, env.PASSWORD_HASHER_SECRET)
    .toString();
  return await bhash(preHashed, saltOrRounds);
};
```

2. Login:
   - Users can login with email and password
   - Credentials are validated against the database
   - Upon successful login, a JWT session is created

Reference implementation:

```11:45:src/lib/auth/credentials.ts
  authorize: async (credentials) => {
    const parsed = signInSchema.safeParse(credentials);
    if (!parsed.success) {
      throw new Error("Invalid credentials.");
    }

    // logic to verify if the user exists
    let user = await prisma.user.findUnique({
      where: {
        email: parsed.data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    // Compare the password hash
    if (user) {
      if (!user.password) {
        throw new Error("User was created with an external provider.");
      }
      if (!(await comparePassword(parsed.data.password, user.password))) {
        user = null;
      }
    }

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    return user;
  },
```

### 2. GitHub OAuth

The system also supports GitHub OAuth authentication:

1. Users can click "Sign in with GitHub"
2. They are redirected to GitHub for authorization
3. Upon successful authorization, they are redirected back with a session

Reference implementation:

```9:33:src/lib/auth/index.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [github, credentials],
  logger: {
    warn(code) {
      logger.warn("warn", code);
    },
    error(error) {
      const { name } = error;
      if (
        ["CredentialsSignin", "JWTSessionError", "CallbackRouteError"].includes(
          name
        )
      )
        return;
      logger.error("Next auth error");
      console.error(error);
    },
  },
});
```

## Protected Routes

Routes under `src/app/(protected)` are automatically protected. Users must be authenticated to access these routes.

Implementation:

```5:12:src/lib/auth/server.ts
export async function getSession() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return session;
}
```

## Database Schema

The database uses Prisma with the following main models:

1. User - Stores user information and credentials
2. Account - Stores OAuth account information
3. Session - Manages user sessions
4. VerificationToken - Handles email verification (if implemented)
5. Authenticator - Supports WebAuthn (if implemented)

Reference schema:

```1:71:prisma/schema/auth.prisma
model User {
    id            String          @id @default(cuid())
    name          String?
    email         String          @unique
    emailVerified DateTime?
    image         String?
    accounts      Account[]
    sessions      Session[]
    // Optional for WebAuthn support
    Authenticator Authenticator[]

    password String?

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model Account {
    userId            String
    type              String
    provider          String
    providerAccountId String
    refresh_token     String?
    access_token      String?
    expires_at        Int?
    token_type        String?
    scope             String?
    id_token          String?
    session_state     String?

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@id([provider, providerAccountId])
}

model Session {
    sessionToken String   @unique
    userId       String
    expires      DateTime
    user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model VerificationToken {
    identifier String
    token      String
    expires    DateTime

    @@id([identifier, token])
}

// Optional for WebAuthn support
model Authenticator {
    credentialID         String  @unique
    userId               String
    providerAccountId    String
    credentialPublicKey  String
    counter              Int
    credentialDeviceType String
    credentialBackedUp   Boolean
    transports           String?

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@id([userId, credentialID])
}
```

## API Routes

The authentication API routes are handled by NextAuth.js:

```1:2:src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

## Security Features

1. Password Security:

   - Two-layer hashing (HMAC-SHA256 + bcrypt)
   - Password length restrictions
   - Secure password comparison

2. Session Security:
   - JWT-based sessions
   - Secure session management
   - Protected route middleware

## Frontend Components

1. Login Page:

```13:42:src/app/login/page.tsx
export default function LoginPage() {
  const [credentialsState, credentialsFormAction] = useActionState(
    loginUser,
    initialState
  );
  const [, githubFormAction] = useActionState(loginWithGitHub, undefined);

  return (
    <main className="flex flex-col h-screen justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Login</h1>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <form action={credentialsFormAction} className="flex flex-col gap-2">
            <Input name="email" label="Email" type="email" />
            <Input name="password" label="Password" type="password" />
            <p aria-live="polite">{credentialsState?.message}</p>
            <Button type="submit" color="primary" className="mt-2">
              Sign In
            </Button>
          </form>
          <form action={githubFormAction}>
            <Button type="submit">Signin with GitHub</Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
```

2. Register Page:

```13:35:src/app/register/page.tsx
export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, initialState);

  return (
    <main className="flex flex-col h-screen justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Register</h1>
        </CardHeader>
        <CardBody>
          <form action={formAction} className="flex flex-col gap-2">
            <Input name="email" label="Email" type="email" />
            <Input name="password" label="Password" type="password" />
            <p aria-live="polite">{state?.message}</p>
            <Button type="submit" color="primary" className="mt-2">
              Create Account
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
```

## Development

1. Start the development environment:

```bash
# Start Docker services
make up

# Start the development server
npm run dev
```

2. Access the application:
   - Main app: http://localhost:3000
   - Login: http://localhost:3000/login
   - Register: http://localhost:3000/register

## Additional Notes

- The project uses NextUI for the user interface components
- Tailwind CSS is used for styling
- TypeScript is used throughout the project for type safety
- Environment variables are validated using Zod
- Prisma Client is configured with query logging for slow queries

This documentation provides an overview of the authentication system. For more detailed information about specific components or features, please refer to the individual files in the codebase.
