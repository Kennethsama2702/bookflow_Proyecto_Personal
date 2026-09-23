type LogValue = unknown;

const SENSITIVE_KEYS =
  /password|secret|token|authorization|cookie|api[-_]?key|cvv/i;

function redact(value: LogValue, key?: string): LogValue {
  if (key && SENSITIVE_KEYS.test(key)) return "[REDACTED]";
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        redact(childValue, childKey),
      ]),
    );
  }
  return value;
}

function write(
  level: "info" | "warn" | "error",
  event: string,
  context: Record<string, LogValue> = {},
) {
  const safeContext = redact(context) as Record<string, LogValue>;
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...safeContext,
  });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (event: string, context?: Record<string, LogValue>) =>
    write("info", event, context),
  warn: (event: string, context?: Record<string, LogValue>) =>
    write("warn", event, context),
  error: (event: string, context?: Record<string, LogValue>) =>
    write("error", event, context),
};

export { redact };
