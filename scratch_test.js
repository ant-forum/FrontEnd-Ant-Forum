const fetch = require('node:http');

async function test() {
  const url = 'http://ant-forum.khei.work.gd/api/tags/getTagByName/Vue.js';
  
  try {
    const res = await new Promise((resolve, reject) => {
      require('node:http').get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });
    console.log("RESPONSE:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
