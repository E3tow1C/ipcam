import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 200,           // Virtual Users (concurrent users)
  duration: '300s',   // Test duration
};

export default function () {
  http.get('http://10.161.112.137:5001/');
  sleep(1);
}