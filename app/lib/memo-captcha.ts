import { createHmac, timingSafeEqual } from 'crypto';

const TTL_MS = 10 * 60 * 1000;

function secret() {
  return process.env.NEXTAUTH_SECRET || process.env.CAPTCHA_SECRET || '';
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function createMemoCaptcha() {
  if (!secret()) {
    throw new Error('Captcha secret is not configured');
  }
  const op = Math.random() < 0.5 ? '+' : '-';
  let a = randomInt(1, 12);
  let b = randomInt(1, 12);
  if (op === '-' && b > a) {
    const swap = a;
    a = b;
    b = swap;
  }
  const exp = Date.now() + TTL_MS;
  const payload = `${a}|${op}|${b}|${exp}`;
  const token = `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
  return {
    question: `What is ${a} ${op} ${b}?`,
    token,
  };
}

export function verifyMemoCaptcha(token: unknown, answer: unknown): boolean {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const expected =
    typeof answer === 'number'
      ? answer
      : typeof answer === 'string'
        ? Number(answer.trim())
        : NaN;
  if (!Number.isInteger(expected)) return false;
  if (!secret()) return false;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;
  let payload = '';
  try {
    payload = Buffer.from(encoded, 'base64url').toString('utf8');
  } catch {
    return false;
  }
  const check = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(check);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;

  const [aRaw, op, bRaw, expRaw] = payload.split('|');
  const a = Number(aRaw);
  const b = Number(bRaw);
  const exp = Number(expRaw);
  if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isFinite(exp)) return false;
  if (Date.now() > exp) return false;
  const result = op === '+' ? a + b : op === '-' ? a - b : NaN;
  return result === expected;
}
