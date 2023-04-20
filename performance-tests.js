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

  const dateToTimestampCached = {
    method: "GET",
    url: `https://helloacm.com/api/unix-timestamp-converter/?cached&s=2016-01-01%202:3:22`,
  };

  const timestampToDateCached = {
    method: "GET",
    url: `https://helloacm.com/api/unix-timestamp-converter/?cached&s=1451613802`,
  };

  const invalidDateStringCached = {
    method: "GET",
    url: `https://helloacm.com/api/unix-timestamp-converter/?cached&s=foo`,
  };

  const dateToTimestamp = {
    method: "GET",
    url: `https://helloacm.com/api/unix-timestamp-converter/?cached&s=${inputDateString}`,
  };

  const timestampToDate = {
    method: "GET",
    url: `https://helloacm.com/api/unix-timestamp-converter/?cached&s=${expectedTimestamp}`,
  };

  const invalidDateString = {
    method: "GET",
    url: `https://helloacm.com/api/unix-timestamp-converter/?cached&s=${randomString}`,
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
    "status is 200": (r) => r.status === 200,
    "response body is correct": (r) => r.body.includes(1451613802),
  });

  check(responses[1], {
    "status is 200": (r) => r.status === 200,
    "response body is correct": (r) => r.body.includes("2016-01-01"),
  });

  check(responses[2], {
    "response body is correct": (r) => r.body.includes(false),
  });

  check(responses[3], {
    "status is 200": (r) => r.status === 200,
    "response body is correct": (r) => r.body.includes(expectedTimestamp),
  });

  check(responses[4], {
    "status is 200": (r) => r.status === 200,
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
