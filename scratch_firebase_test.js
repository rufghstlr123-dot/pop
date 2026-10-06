const DB_URL = "https://poprent-b205c-default-rtdb.asia-southeast1.firebasedatabase.app";

async function testFirebaseREST() {
  try {
    const res = await fetch(`${DB_URL}/test.json`, {
      method: 'PUT',
      body: JSON.stringify({ message: "Hello from Antigravity!" })
    });
    console.log("Write response:", res.status, await res.text());
    
    const readRes = await fetch(`${DB_URL}/test.json`);
    console.log("Read response:", readRes.status, await readRes.json());
  } catch (err) {
    console.error(err);
  }
}

testFirebaseREST();
