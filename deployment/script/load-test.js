import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 5000,           // Virtual Users (concurrent users)
  duration: '300s',   // Test duration
};

export default function () {
  http.get('http://fastapi.localhost:8080');
  sleep(0.5);
}