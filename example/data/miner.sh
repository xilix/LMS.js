#!/bin/bash

b=2013-03-30
e=2014-04-05

while [ "$b" != "$e" ]; do
  b=$(date +%Y-%m-%d -d "$b +1 day")
  dat=${b//-}
  echo "$b1"
  curl "http://finance.yahoo.com/connection/currency-converter-cache?date=${dat}"
done
echo "Quotes.BNO("
curl "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22BNO%22)%20and%20startDate%3D%22${b}%22%20and%20endDate%3D%22${e}%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback="
echo ");
"
echo "Quotes.NASDAQ("
curl "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22%5EIXIC%22)%20and%20startDate%3D%22${b}%22%20and%20endDate%3D%22${e}%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback="
echo ");
"
echo "Quotes.EUROSTOX("
curl "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22%5ESTOXX50E%22)%20and%20startDate%3D%22${b}%22%20and%20endDate%3D%22${e}%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback="
echo ");
"
