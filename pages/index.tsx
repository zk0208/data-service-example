import useSWR, { Fetcher } from "swr";
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  scales,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState } from "react";
import Link from "next/link";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';


export const config = {
  ssr: false,
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  scales
);

const fetcher: Fetcher<any, any> = (
  input: RequestInfo | URL,
  init?: RequestInit
) => globalThis.fetch(input, init).then((res) => res.json());

interface ResponseData<T> {
  type: "sql_endpoint";
  data: {
    columns: { col: string; data_type: string; nullable: false }[];
    rows: T[];
    result: { code: number };
  };
}

type HotRankingByBaseVolume = ResponseData<{ instid: string; hot_score: string }>;
// prettier-ignore
type CandleSticksByTime = ResponseData<{ time: string; open_price: string; high_price: string; 
  low_price: string; close_price: string; time_interval: string; }>;
// prettier-ignore
type PriceChangeByexchange = ResponseData<{ curr_price: string; update_time: string}>;
// prettier-ignore
type PriceByTime = ResponseData<{ curr_price: string; base_volume: string; update_time: string}>;

type ExchangeByInstID = ResponseData<{ exchange: string }>;

function RankList({
  data,
  bg,
}: {
  bg: string;
  data: { value: number; name: string }[];
}) {
  return (
    <>
      {data.slice(0, 10).map((i, index, array) => (
        <div
          className="flex justify-between items-center my-1 text-sm relative"
          key={index}
        >
          <div
            className={`absolute top-0 left-20 h-full ${bg}`}
            style={{
              width:
                index === 0
                  ? "100%"
                  : `${(Number(i.value) / Number(array[0].value)) * 100}%`,
              maxWidth: "50%",
            }}
          />
          <div className="ml-20 text-md hover:underline z-10">{index+1}</div>
          <div
            className="ml-20 text-md p-1 max-w-[80%] hover:underline z-10"
          >
            <Link rel="stylesheet" href={{pathname:"/price",query:{name:i.name}}}>
              {/* <setIns></> */}
              {i.name}
            </Link>
            {/* {i.name} */}
          </div>
          <div className="mr-20 text-md">{i.value.toLocaleString("en-US")}</div>
        </div>
      ))}
    </>
  );
}

function ExchangeList({
  data,
  bg,
}: {
  bg: string;
  data: { value: number; name: string }[];
}) {
  return (
    <>
      {data.slice(0, 10).map((i, index, array) => (
        <div
          className="flex justify-between items-center my-1 text-sm relative"
          key={index}
        >
          <div
            className={`absolute top-0 left-20 h-full ${bg}`}
            style={{
              width:
                index === 0
                  ? "100%"
                  : `${(Number(i.value) / Number(array[0].value)) * 100}%`,
              maxWidth: "50%",
            }}
          />
          <div className="ml-20 text-md hover:underline z-10">{index+1}</div>
          <div
            className="ml-20 text-md p-1 max-w-[80%] hover:underline z-10"
          >
            {i.name}
          </div>
          <div className="mr-20 text-md">{i.value.toLocaleString("en-US")}</div>
        </div>
      ))}
    </>
  );
}

export default function Home() {
  const [exchange, setExchange] = useState("OKX");
  const [instid, setInstId] = useState("BTC/USDT");
  const [startTime, setStartTime] = useState("2023-08-24 13:41:10");
  const [endTime, setEndTime] = useState("2023-09-01 15:49:26");
  const { data: hotRankingByBaseVolume } = useSWR(
    `/api/gateway/get_hot_ranking`,
    fetcher as Fetcher<HotRankingByBaseVolume, string>
  );
  const { data: priceByTime } = useSWR(
    `/api/gateway/get_trading_data_by_crypto?instid=${instid}&start_time=${startTime}&end_time=${endTime}`,
    fetcher as Fetcher<PriceByTime, string>
  );
  const { data: exchangeByInstID } = useSWR(
    `/api/gateway/get_exchange_by_instid?instid=${instid}`,
    fetcher as Fetcher<ExchangeByInstID, string>
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Crypto price & volume",
      },
    },
  };

  const labels_instid = hotRankingByBaseVolume?.data.rows.map((i) => i.instid);
  const lables_exchange = exchangeByInstID?.data.rows.map((i) => i.exchange);
  const labels = priceByTime?.data.rows.map((i) => i.update_time);
  const datasets = [
    {
      data: priceByTime?.data.rows.map((i) => Number(i.curr_price)),
      label: "Number of Crypto Price",
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
    {
      data: priceByTime?.data.rows.map((i) => Number(i.base_volume)
      ),
      label: "Number of Crypto volume",
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ];

  return (
    <div className="flex flex-col max-w-[780px] min-h-screen mx-auto gap-4 pt-8">
      <header className="text-center font-bold text-xl text-red-600">
        Web3 Application Demo with TCDS
      </header>
      <div className="shadow-xl bg-white rounded p-4 w-full ">
        <header className="flex justify-center">
          <div className="font-bold">Top Cryptocurrency</div>
        </header>
        <div className="flex justify-end text-blue-400">
            <Link rel="stylesheet" href="/price">go details!</Link>
        </div>

        <div className="flex justify-between ml-20 mr-20 mt-3 mb-2 text-xs font-bold text-gray-500">
          <div>index</div>
          <div>Symbol</div>
          <div>Hot_Score</div>
        </div>
        <RankList
          bg="bg-blue-50"
          data={
            hotRankingByBaseVolume?.data.rows.slice(0, 10).map((i) => ({
              name: i.instid,
              value: Number(i.hot_score),
            })) ?? []
          }
        />
      </div>
      {/* <div className="shadow-xl bg-white rounded p-4 w-full ">
        <Line options={options} data={{ labels, datasets }} />
      </div> */}

      <footer className="flex items-center justify-center mt-4">
        <a
          className="flex gap-2"
          href="https://tidbcloud.com/?utm_source=dataservicedemo&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          data-mp-event="Click TiDB Cloud Site Link"
        >
          Powered by{" "}
          <Image
            src="/tidb.svg"
            alt="TiDB Cloud Logo"
            width={138}
            height={24}
            priority
          />
        </a>
      </footer>
    </div>
  );
}

export function Home1() {
  const [exchange, setExchange] = useState("OKX");
  const [instid, setInstId] = useState("BTC/USDT");
  const [startTime, setStartTime] = useState("2023-08-24 13:41:10");
  const [endTime, setEndTime] = useState("2023-09-01 15:49:26");
  

  const { data: hotRankingByBaseVolume } = useSWR(
    `/api/gateway/get_hot_ranking`,
    fetcher as Fetcher<HotRankingByBaseVolume, string>
  );
  const { data: candleSticksByTime} = useSWR(
    `/api/gateway/get_index_candlesticks?exchange=${exchange}&instid=${instid}&min_time=${startTime}&max_time=${endTime}`,
    fetcher as Fetcher<CandleSticksByTime, string>
  );
  const { data: priceChangeByexchange } = useSWR(
    `/api/gateway/get_trading_data_by_exchange?exchange=${exchange}&instid=${instid}`,
    fetcher as Fetcher<PriceChangeByexchange, string>
  );
  const { data: priceByTime } = useSWR(
    `/api/gateway/get_trading_data_by_crypto?instid=${instid}&start_time=${startTime}&end_time=${endTime}`,
    fetcher as Fetcher<PriceByTime, string>
  );
  const { data: exchangeByInstID } = useSWR(
    `/api/gateway/get_exchange_by_instid?instid=${instid}`,
    fetcher as Fetcher<ExchangeByInstID, string>
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Crypto price & volume",
      },
    },
    scales: {
      A: {
        type: 'linear',
        position: 'left',
    },
    B: {
        type: 'linear',
        position: 'right',
    }
  }
  };

  const optionB = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Crypto price",
      },
    },
  };

  const LabelB = priceChangeByexchange?.data.rows.map((i) => i.update_time);
  const labels_instid = hotRankingByBaseVolume?.data.rows.map((i) => i.instid);
  const lables_exchange = exchangeByInstID?.data.rows.map((i) => i.exchange);
  const labels = priceByTime?.data.rows.map((i) => i.update_time);

  const dataB = [
    {
      data: priceChangeByexchange?.data.rows.map((i) => Number(i.curr_price)),
      label: "Number of Crypto Price",
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    }];

  const datasets = [
    {
      data: priceByTime?.data.rows.map((i) => Number(i.curr_price)),
      label: "Number of Crypto Price",
      yAxisID : "A",
      fill : true,
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
    {
      data: priceByTime?.data.rows.map((i) => Number(i.base_volume)
      ),
      label: "Number of Crypto volume",
      yAxisID : "B",
      fill : true,
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ];

  const dataIndex = candleSticksByTime?.data.rows.map((i) => [i.time, Number(i.open_price), Number(i.high_price), Number(i.low_price), Number(i.close_price)])
  console.log(dataIndex)

  const optionINdex:Highcharts.Options ={
    title : {
      text : 'IndexCandleSticks'
    },
    xAxis:{
      categories : candleSticksByTime?.data.rows.map((i) => i.time),
    },
    rangeSelector : {
      buttons :[{
        type :'hour',
        count : 1,
        text : '1h'
      },{
        type :'day',
        count : 1,
        text : '1D'
      },{
        type :'all',
        count : 1,
        text : 'all'
      }],
      selected : 1,
      inputEnabled : true
    },
		tooltip: {
			split: false,
			// shared: true,
		},
    yAxis: [{
			labels: {
				align: 'right',
				x: -3
			},
			title: {
				text: '股价'
			},
			height: '90%',
			resize: {
				enabled: true
			},
			lineWidth: 2
		}],
    plotOptions:{
      candlestick : {
        tooltip: {
          pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {series.name}</b><br/>' +
          '开盘: {point.open}<br/>' +
          '最高: {point.high}<br/>' +
          '最低: {point.low}<br/>' +
          '收盘: {point.close}<br/>'
        }
      }
    },
    series : [{
      type : 'candlestick',
      name : 'candles',
      data : dataIndex,
      color: 'green',
      lineColor: 'green',
      upColor: 'red',
      upLineColor: 'red',
      tooltip: {
        valueDecimals : 3
			},
			id: 'sz'
    },]
  }
  if (typeof Highcharts === 'object') {
    HighchartsMore(Highcharts)
  }
  // const tmp = Highcharts.chart('container',optionINdex)

  return (
    <div className="flex flex-col max-w-[780px] min-h-screen mx-auto gap-4 pt-8">
      <div className="shadow-xl bg-white rounded p-4 w-full ">
        <header className="flex justify-between font-bold">
          <div className="text-xl text-blue-400">
            <Link rel="stylesheet" href="/">go back</Link>
          </div>
          
          <div className="text-xs flex items-center">
            <span className="font-bold mr-1">instid:</span>
            <select value={instid} onChange={(e) => setInstId(e.target.value)}>
              {labels_instid?.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </header>
        <Line options={{
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Crypto price & volume",
      },
    },
    scales: {
      A: {
        type: 'linear',
        position: 'left',
        ticks :{
          color : 'rgb(53, 162, 235)',
        }
    },
    B: {
        type: 'linear',
        position: 'right',
        ticks : {
          color : 'rgb(255, 99, 132)',
        }
    }
  }
  }} data={ { labels, datasets }} />
      </div>
      <div className="shadow-xl bg-white rounded p-4">
        <HighchartsReact
              highcharts = {Highcharts}
              options = {optionINdex}></HighchartsReact>
        </div>

      <div className="flex gap-4 flex-col md:flex-row md:min-h-[392px]">
        <div className="shadow-xl bg-white rounded p-4 flex-1 flex-shrink-0 md:w-[49%]">
          <header className="flex justify-between">
            <div className="font-bold">Exange</div>

            <div className="text-xs flex items-center">
              <span className="font-bold mr-1">exchange:</span>
              <select value={exchange} onChange={(e) => setExchange(e.target.value)}>
                {lables_exchange?.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </header>
          <Line options={optionB} data={{labels: LabelB, datasets: dataB}} />
        </div>
      </div>

      <footer className="flex items-center justify-center mt-4">
        <a
          className="flex gap-2"
          href="https://tidbcloud.com/?utm_source=dataservicedemo&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          data-mp-event="Click TiDB Cloud Site Link"
        >
          Powered by{" "}
          <Image
            src="/tidb.svg"
            alt="TiDB Cloud Logo"
            width={138}
            height={24}
            priority
          />
        </a>
      </footer>
    </div>
  );
}