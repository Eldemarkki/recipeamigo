import { execSync } from "child_process";
import { randomUUID } from "crypto";
import { performance } from "perf_hooks";

const setup = async () => {
  const containerId = execSync(
    `docker run -d --name ${
      "recipeamigo-test-database-" + randomUUID()
    } -p 0:5432 -e POSTGRES_HOST_AUTH_METHOD=trust --rm postgres:15`,
  )
    .toString()
    .trim();

  console.log(`Created container ${containerId}`);

  const port = parseInt(
    execSync(
      `docker inspect ${containerId} --format='{{(index (index .NetworkSettings.Ports "5432/tcp") 0).HostPort}}'`,
    )
      .toString()
      .trim(),
    10,
  );

  const connectionString = `postgresql://postgres@0.0.0.0:${port}/postgres`;
  process.env.DATABASE_URL = connectionString;

  const startTime = performance.now();
  for (let i = 0; i < 100; i++) {
    try {
      const res = execSync(`docker exec ${containerId} pg_isready`);
      if (res.toString().includes("accepting connections")) {
        console.log(
          `Database ready after ${performance.now() - startTime} milliseconds`,
        );

        execSync("prisma migrate deploy");
        console.log("Migrations done");

        return () => execSync(`docker stop ${containerId}`);
      }
    } catch (e) {
      console.log("Database not ready, retrying");
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  console.log(
    `Database wasn't ready after ${
      performance.now() - startTime
    } milliseconds, stopping the container`,
  );

  return () => execSync(`docker stop ${containerId}`);
};

export default setup;
