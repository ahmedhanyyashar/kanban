// A local .env file fills what the environment has not set; a deployed process gets its values from
// the platform and has no such file. It runs first, because src/env.ts reads the environment on import.
try {
  process.loadEnvFile();
} catch {
  // no .env file: the environment is complete or env.ts says what is missing
}
