import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  vus: 10, // 10 virtual users
  duration: "30s", // Load duration.
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(95)<200"], // 95% of requests should be below 200ms
  },
};

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

export default function () {
  const BASE_URL = "https://helloacm.com/api/unix-timestamp-converter/";

  const randomString = (Math.random() + 1).toString(36).substring(7);
  const inputDate = randomDate(new Date(1970, 0, 1), new Date());
  const inputDateString =
    inputDate.getUTCFullYear() +
    "-" +
    (inputDate.getUTCMonth() + 1) +
    "-" +
    inputDate.getUTCDate() +
    "%20" +
    inputDate.getUTCHours() +
    ":" +
    inputDate.getUTCMinutes() +
    ":" +
    inputDate.getUTCSeconds();
  const expectedTimestamp = Math.floor(inputDate.getTime() / 1000);

  console.log(inputDateString);
  console.log(expectedTimestamp);
  console.log(randomString);

  // Scenario that use a static value to Date to check the cache mechanism
  const dateToTimestampCached = {
    method: "GET",
    url: `${BASE_URL}?cached&s=2016-01-01%202:3:22`,
  };

  // Scenario that use a static value to Timestamp to check the cache mechanism
  const timestampToDateCached = {
    method: "GET",
    url: `${BASE_URL}?cached&s=1451613802`,
  };

  // Scenario that use a static value to invalid Date string to check the cache mechanism
  const invalidDateStringCached = {
    method: "GET",
    url: `${BASE_URL}?cached&s=foo`,
  };

  // Scenario that use a random value to Date string to avoid cache mechanism
  const dateToTimestamp = {
    method: "GET",
    url: `${BASE_URL}?cached&s=${inputDateString}`,
  };

  // Scenario that use a random value to Timestamp to avoid cache mechanism
  const timestampToDate = {
    method: "GET",
    url: `${BASE_URL}?cached&s=${expectedTimestamp}`,
  };

  // Scenario that use a random value to invalid Date string to avoid cache mechanism
  const invalidDateString = {
    method: "GET",
    url: `${BASE_URL}?cached&s=${randomString}`,
  };

  const responses = http.batch([
    dateToTimestampCached,
    timestampToDateCached,
    invalidDateStringCached,
    dateToTimestamp,
    timestampToDate,
    invalidDateString,
  ]);

  sleep(1);
  check(responses[0], {
    "response body is correct": (r) => r.body.includes(1451613802),
  });

  check(responses[1], {
    "response body is correct": (r) => r.body.includes("2016-01-01"),
  });

  check(responses[2], {
    "response body is correct": (r) => r.body.includes(false),
  });

  check(responses[3], {
    "response body is correct": (r) => r.body.includes(expectedTimestamp),
  });

  check(responses[4], {
    "response body is correct": (r) =>
      r.body.includes(
        inputDate.getUTCFullYear() +
          "-" +
          (inputDate.getUTCMonth() + 1) +
          "-" +
          inputDate.getUTCDate()
      ),
  });

  check(responses[5], {
    "response body is correct": (r) => r.body.includes(false),
  });
}
