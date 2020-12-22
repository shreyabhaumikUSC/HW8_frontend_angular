import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';	//sb-added
import { Observable, forkJoin } from 'rxjs';	//sb-added
import { map } from 'rxjs/operators';	//sb-added

const options = {
			headers: new HttpHeaders({ "Content-Type": "application/json"})
}

@Injectable({
  providedIn: 'root'
})

export class AppServiceService {

	t:string;
	constructor(private http : HttpClient) {	//sb-edited ...was "constructor() { }"
	}
	
	getTicker(ticker: string) {	// sb-added - to accept ticker from search component and push the ticker using the observable
		this.t = ticker;
	}
	
	getCompanies(inputTxt: string) {	//sb-added
		// return this.http.get('/compsearch/'+inputTxt, options);
//		return this.http.get('http://localhost:3000/compsearch/'+inputTxt, options);
		return this.http.get('https://vkv3zrcik0.execute-api.us-east-1.amazonaws.com/production/compsearch/'+inputTxt, options);
	}

	getDetailsOne() {	//sb-added
		// const compDesc = this.http.get('/compdesc/'+this.t, options);
		// const compLatestPrice = this.http.get('/complatestprice/'+this.t, options);
//		const compDesc = this.http.get('http://localhost:3000/compdesc/'+this.t, options);
//		const compLatestPrice = this.http.get('http://localhost:3000/complatestprice/'+this.t, options);
		const compDesc = this.http.get('https://vkv3zrcik0.execute-api.us-east-1.amazonaws.com/production/compdesc/'+this.t, options);
		const compLatestPrice = this.http.get('https://vkv3zrcik0.execute-api.us-east-1.amazonaws.com/production/complatestprice/'+this.t, options);
		return forkJoin([compDesc, compLatestPrice]);	// , compLatestPrice
	}

	getDetailsTwo(timestamp: string) {
		// const compDailyChartData = this.http.get('/compdailychartdata/'+this.t+'/'+timestamp, options);
		// const compNews = this.http.get('/compnews/'+this.t, options);
//		const compDailyChartData = this.http.get('http://localhost:3000/compdailychartdata/'+this.t+'/'+timestamp, options);
//		const compNews = this.http.get('http://localhost:3000/compnews/'+this.t, options);
		const compDailyChartData = this.http.get('https://vkv3zrcik0.execute-api.us-east-1.amazonaws.com/production/compdailychartdata/'+this.t+'/'+timestamp, options);
		const compNews = this.http.get('https://vkv3zrcik0.execute-api.us-east-1.amazonaws.com/production/compnews/'+this.t, options);
		var s_date = new Date();
		var s_day = s_date.getDate();
		var s_month = s_date.getMonth() + 1; // +1 because getMonth() method returns the month (from 0 to 11)
		var s_year = s_date.getFullYear() - 2; // because we want start-year to be 2 years ago
		var twoYrsAgo: string = s_year.toString()+"-";
		if (s_month < 10) {twoYrsAgo = twoYrsAgo+"0"+s_month.toString()+"-";}
		else {twoYrsAgo = twoYrsAgo+s_month.toString()+"-";}
		if (s_day < 10) {twoYrsAgo = twoYrsAgo+"0"+s_day.toString();}
		else {twoYrsAgo = twoYrsAgo+s_day.toString();}
		// const compHistoricalData = this.http.get('/comphistoricaldata/'+this.t+'/'+twoYrsAgo, options)
//		const compHistoricalData = this.http.get('http://localhost:3000/comphistoricaldata/'+this.t+'/'+twoYrsAgo, options)
		const compHistoricalData = this.http.get('https://vkv3zrcik0.execute-api.us-east-1.amazonaws.com/production/comphistoricaldata/'+this.t+'/'+twoYrsAgo, options)
		return forkJoin([compDailyChartData, compNews, compHistoricalData]);	// compDailyChartData, 
	}

	getDailyChart(timestamp: string) {
		// return this.http.get('/compdailychartdata/'+this.t+'/'+timestamp, options);
//		return this.http.get('http://localhost:3000/compdailychartdata/'+this.t+'/'+timestamp, options);
		return this.http.get('https://vkv3zrcik0.execute-api.us-east-1.amazonaws.com/production/compdailychartdata/'+this.t+'/'+timestamp, options);
	}
	
	getMultipleLP(tickers: string) {
		// return this.http.get('/complatestprice/'+tickers, options);
//		return this.http.get('http://localhost:3000/complatestprice/'+tickers, options);
		return this.http.get('https://vkv3zrcik0.execute-api.us-east-1.amazonaws.com/production/complatestprice/'+tickers, options);
	}

}
