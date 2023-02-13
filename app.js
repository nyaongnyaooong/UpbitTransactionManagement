const axios = require('axios');

async function getMarketData() {
  try {
    const options = {
      method: 'GET',
      url: 'https://api.upbit.com/v1/market/all?isDetails=false',
      headers: {accept: 'application/json'}
    };

    const response = await axios.request(options);
    return response.data;

  } catch(err) {
    console.error(err);
  }

}

async function main() {
  const a = await getMarketData();
  
  console.log(a);
}

main();


//let test = await getMarketData();
  //console.log(test);

/*
  await axios.request(options).then((res) => {
    //console.log(res.data);marketData
    marketData = res.data;
    console.log(marketData);
    numCoins = res.data.length;
    //console.log(numCoins);
  })
  .catch(function (error) {
    console.error(error);
  });
  console.log(marketData);
*/



/*

for(let i = 0; i < numCoins; i++) {
  const option = {
    method: 'GET',
    url: `https://api.upbit.com/v1/candles/minutes/1?market=${res.data[i].market}&count=1`,
    headers: {accept: 'application/json'}
  };

  axios
  .request(options2)
  .then(function (res) {
    console.log(res.data);
  })
  .catch(function (error) {
    console.error(error);
  });

}
*/
/*
const options2 = {
  method: 'GET',
  url: 'https://api.upbit.com/v1/candles/minutes/1?market=KRW-BTC&count=1',
  headers: {accept: 'application/json'}
};

axios
  .request(options2)
  .then(function (res) {
    console.log(res.data);
  })
  .catch(function (error) {
    console.error(error);
  });


*/


/*

<script>
import { onMounted, ref } from "vue";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";  //범용 고유 식별자

export default {
  name: "app-krwmarket",

  setup() {
    let coins = ref([]);
    const symbols = ref([]);

    onMounted(async () => {
      await axios.get("https://api.upbit.com/v1/market/all").then((result) => {
        let newcoins = result.data.filter((result) => {
          return result.market.indexOf("KRW-") != -1;
        }); // BTC마켓은 "BTC-" , USDT마켓은 "USDT-" 로 필터링
        coins.value = newcoins;

        for (let i = 0; i < coins.value.length; i++) {
          symbols.value.push(coins.value[i].market);
        } // 심볼을 가져올 변수를 만듬
      });

      await axios
        .get("https://api.upbit.com/v1/ticker", {
          params: { markets: symbols.value.join(",") },
        })
        .then((result) => {
          for (let i = 0; i < coins.value.length; i++) {
            coins.value[i] = Object.assign(coins.value[i], result.data[i]);
          }
        }); // upbit에서 제공하는 방법으로 요청
        
        // --------------------- 이어서 작성 -------------------------

      const ws = new WebSocket("wss://api.upbit.com/websocket/v1"); // 웹소켓 연결

      ws.onopen = () => {
        ws.send(
          `${JSON.stringify([
            { ticket: uuidv4() },
            { type: "ticker", codes: symbols.value },
          ])}`
        );
      }; //업비트에 보내는 메세지 cdoes, symbols.value 는 받을 데이터의 ex) "KRW-BTC"

      ws.onmessage = async (result) => {
        //보낸 메세지에 따른 실시간 응답
        const ticker = await new Response(result.data).json(); //실시간 데이터를 받음
        const key = Object.keys(coins.value).find(
          (key) => coins.value[key].market == ticker.code
        ); //실시간 데이터를 덮어 씌울 데이터를 찾기위해 key 값 찾기
        if (coins.value[key].market == ticker.code) {
          coins.value[key] = Object.assign(coins.value[key], ticker);
        } //실시간 데이터의 code와 기본데이터의 market이 같으면 덮어 씌움
      };
    });

    return { coins };
  },
};
</script>


*/