import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 50000,           // Virtual Users (concurrent users)
  duration: '300s',   // Test duration
};

export default function () {
  http.get('http://api.localhost:8080/images');
  sleep(1);
}