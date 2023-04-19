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
  const res = http.get(
    `https://helloacm.com/api/unix-timestamp-converter/?cached&s=${inputDateString}`
  );

  sleep(1);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response body is correct": (r) => r.body.includes(expectedTimestamp),
  });
}
