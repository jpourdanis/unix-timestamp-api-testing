import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  vus: 1, // 10 virtual users
  duration: "5s", // Load duration.
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(95)<200"], // 95% of requests should be below 200ms
  },
};

export default function () {
  const inputDateString = "2016-01-01%202:3:22";
  const expectedTimestamp = 1451613802;
  const res = http.get(
    `https://helloacm.com/api/unix-timestamp-converter/?cached&s=${inputDateString}`
  );
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response body is correct": (r) => r.body.includes(expectedTimestamp),
  });

  sleep(1);
}
