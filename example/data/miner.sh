#!/bin/bash


for i in `seq 1 9`
do
  curl "http://finance.yahoo.com/connection/currency-converter-cache?date=201403${i}"
done
for i in `seq 10 31`
do
  curl "http://finance.yahoo.com/connection/currency-converter-cache?date=201403${i}"
done
for i in `seq 1 4`
do
  curl "http://finance.yahoo.com/connection/currency-converter-cache?date=201404${i}"
done
echo "Quotes.BNO("
curl "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22BNO%22)%20and%20startDate%3D%222014-03-01%22%20and%20endDate%3D%222014-04-05%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback="
echo ");
"
echo "Quotes.NASDAQ("
curl "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22%5EIXIC%22)%20and%20startDate%3D%222014-03-01%22%20and%20endDate%3D%222014-04-05%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback="
echo ");
"
echo "Quotes.EUROSTOX("
curl "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22%5ESTOXX50E%22)%20and%20startDate%3D%222014-03-01%22%20and%20endDate%3D%222014-04-05%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback="
echo ");
"
