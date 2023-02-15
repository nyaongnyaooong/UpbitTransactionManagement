const axios = require('axios');

async function getMarketData() {
  try {
    const options = {
      method: 'GET',
      url: 'https://api.upbit.com/v1/market/all?isDetails=false',
      headers: {accept: 'application/json'}
    };

    const { data } = await axios.request(options);
    
    data.marketAll = data[0].market;
    for(i = 1; i < data.length; i++) {
      data.marketAll += ', ' + data[i].market;
    }

    return data;

  } catch(err) {
    console.error(err);
  }

}

async function getCandleData(market, to, count) {
  let url;
  if (count == null) {
    count = 1;
  }

  if (to == 'recent') {
    url = `https://api.upbit.com/v1/candles/minutes/1?market=${ market }&count=${ count }`
  } else {
    url = `https://api.upbit.com/v1/candles/minutes/1?market=${ market }&to=${ to }&count=${ count }`
  }

  try {

    const options = {
      method: 'GET',
      url: url,
      headers: {accept: 'application/json'}
    };

    const response = await axios.request(options);
    return response.data;

  } catch(err) {
    console.error(err);
  }

}


async function getTickerData(markets) {
   try {
    const options = {
      method: 'GET',
      url: `https://api.upbit.com/v1/ticker?markets=${ markets }`,
      headers: {accept: 'application/json'},
    };

    const response = await axios.request(options);
    return response.data;

  } catch(err) {
    console.error(err);
  }

}

function timeConvert(date) {
  date.setHours(date.getHours());
  //const date = new Date(+ new Date + 3240 * 10000);

  //toISOString() 
  //"YYYY-MM-DDTHH:mm:ss.sssZ" 형식으로 시간 정보를 반환하나,
  //UTC 기준으로 출력되므로 +9H 해준다
  return date.toISOString().split(':')[0] + ':' + date.toISOString().split(':')[1] + ':00Z';

}


async function main() {

  /**  -object List-
  market	업비트에서 제공중인 시장 정보	String
  allMarketName
  korean_name	거래 대상 암호화폐 한글명	String
  english_name	거래 대상 암호화폐 영문명	String
  market_warning	유의 종목 여부
  */
  const marketData = await getMarketData();
  let marketTicker = await getTickerData(marketData.marketAll);

  for (i = 0; i < 3; i++) {
    const count = 2;

    const date = new Date();

    date.setMinutes(date.getMinutes() - (count * i));

    const to = timeConvert(date);
    //console.log(to);

    const candle = await getCandleData(marketData[0].market, to, count);
    for(j = 0; j < count; j++) {
      console.log(candle[j].candle_date_time_kst);
      console.log(candle[j].trade_price);
      console.log(candle[j].candle_acc_trade_volume);
    }
  }


/*
  let date = new Date(2019, 0, 1);
  document.write('기준일자 : ' + date + '<br>');
  
  date.setMinutes(date.getMinutes() + 100);
  document.write('100분 후 : ' + date + '<br>');
  
  date = new Date(2019, 0, 1);
  date.setMinutes(date.getMinutes() - 100);
  document.write('100분 전 : ' + date + '<br>');
*/
  //let marketCandle = await getCandleData(marketData[0].market);
  //let marketTicker = await getTickerData(marketData[0].market);
  //console.log(marketTicker);

  //console.log(marketData.length);
  //console.log(marketData.allMarketName);

  //let allMarketName;
  /*
  for(i = 0; i < marketData.length; i++) {
    allMarketName = allMarketName . marketData[i].market;
  }

  */
  //console.log(allMarketName);
/*
  for(let i = 0; i < 50; i++) {
    marketTicker = await getTickerData(marketData[0].market);
    console.log(marketTicker);
  }
  */
}

main();


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
