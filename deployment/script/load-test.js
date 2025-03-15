import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 2000,           // Virtual Users (concurrent users)
  duration: '60s',   // Test duration
};

export default function () {
  http.get('http://localhost:8080/');
  sleep(0.5);
}