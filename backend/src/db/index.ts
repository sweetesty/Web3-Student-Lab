import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { getDatabaseRoleForOperation } from './requestContext.js';

const DEFAULT_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/web3-student-lab?schema=public';

const writeConnectionString =
  process.env.DATABASE_URL ||
  DEFAULT_DATABASE_URL;
const readConnectionString = process.env.READ_DATABASE_URL || writeConnectionString;

const parsePoolOption = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const poolConfig: pg.PoolConfig = {
  max: parsePoolOption(process.env.DB_POOL_MAX, 20),
  idleTimeoutMillis: parsePoolOption(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10000),
  connectionTimeoutMillis: parsePoolOption(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 5000),
};

const hasDedicatedReadReplica = readConnectionString !== writeConnectionString;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaWrite: PrismaClient | undefined;
  prismaRead: PrismaClient | undefined;
  writePool: pg.Pool | undefined;
  readPool: pg.Pool | undefined;
};

const writePool =
  globalForPrisma.writePool ??
  new pg.Pool({
    connectionString: writeConnectionString,
    ...poolConfig,
  });

const readPool = hasDedicatedReadReplica
  ? globalForPrisma.readPool ??
    new pg.Pool({
      connectionString: readConnectionString,
      ...poolConfig,
    })
  : writePool;

const writeAdapter = new PrismaPg(writePool);
const readAdapter = hasDedicatedReadReplica ? new PrismaPg(readPool) : writeAdapter;

const prismaWrite = globalForPrisma.prismaWrite ?? new PrismaClient({ adapter: writeAdapter });
const prismaRead = hasDedicatedReadReplica
  ? globalForPrisma.prismaRead ?? new PrismaClient({ adapter: readAdapter })
  : prismaWrite;

const getClientForOperation = (operation: string): PrismaClient => {
  if (!hasDedicatedReadReplica) {
    return prismaWrite;
  }

  const role = getDatabaseRoleForOperation(operation);
  return role === 'read' ? prismaRead : prismaWrite;
};

const isModelDelegate = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'findUnique' in value && 'create' in value;
};

const createModelDelegateProxy = (modelName: string): object => {
  return new Proxy(
    {},
    {
      get(_target, operationKey: string | symbol) {
        const operationName = String(operationKey);
        const client = getClientForOperation(operationName);
        const delegate = (client as unknown as Record<string, unknown>)[modelName] as
          | Record<string, unknown>
          | undefined;
        const operation = delegate?.[operationKey as keyof typeof delegate];

        if (typeof operation === 'function') {
          return operation.bind(delegate);
        }

        return operation;
      },
    }
  );
};

const prismaProxy = new Proxy(prismaWrite as PrismaClient, {
  get(target, property, receiver) {
    if (property === '$connect') {
      return () => prismaWrite.$connect();
    }

    if (property === '$disconnect') {
      return async () => {
        await prismaWrite.$disconnect();
        if (hasDedicatedReadReplica) {
          await prismaRead.$disconnect();
        }

        await writePool.end();
        if (hasDedicatedReadReplica) {
          await readPool.end();
        }
      };
    }

    if (property === '$queryRaw' || property === '$queryRawUnsafe') {
      const client = getClientForOperation('findMany');
      const operation = (client as unknown as Record<string, unknown>)[property as string];
      if (typeof operation === 'function') {
        return operation.bind(client);
      }

      return operation;
    }

    const value = Reflect.get(target as object, property, receiver);

    if (typeof value === 'function') {
      return value.bind(prismaWrite);
    }

    if (typeof property === 'string' && isModelDelegate(value)) {
      return createModelDelegateProxy(property);
    }

    return value;
  },
});

export const prisma = globalForPrisma.prisma ?? prismaProxy;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaWrite = prismaWrite;
  globalForPrisma.prismaRead = prismaRead;
  globalForPrisma.writePool = writePool;
  globalForPrisma.readPool = readPool;
}

export default prisma;
