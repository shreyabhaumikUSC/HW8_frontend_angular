import { Component, OnInit } from '@angular/core';
import { AppServiceService } from '../app-service.service';  //sb-added
import { ActivatedRoute } from '@angular/router';  //sb-added
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';	//sb-added - for modal
import { FormControl } from '@angular/forms'; //sb-added
import * as Highcharts from 'highcharts/highstock';	//sb-added - for highcharts
import IndicatorsCore from "highcharts/indicators/indicators";
import vbp from "highcharts/indicators/volume-by-price";

IndicatorsCore(Highcharts);
vbp(Highcharts);

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})


export class DetailsComponent implements OnInit {

    desc: any;
    latestPrice: any;
    dailyChartData: any;
    historicalData: any;
    news: any;
    today: any;
    change: any;
    changeAndAll: any;
    timeDiff: any;
    mrktClsDT: any;
    isAllLoaded: boolean;
    isTValid: boolean;
    aCCrmWl: any;	//alert close called for rmWl
		aCCaddWl: any;	//alert close called for addWl
		aCCaddPf: any;	//alert close called for addPf
		alertCC: boolean; //alert close call for all alerts
		isFirstCall: boolean;
		call: any;
		//for news
    articles: any;
		closeResult = '';
		newsModalContent: any;
    tweetURL: any;
    //for watchlist
    isInWL: boolean;
		//for portfolio
		modalQty = new FormControl();
		newQty: any;
		regex = /^\d*$/;
		modalTotal = 0.00;
		//for highcharts
		isHighcharts = typeof Highcharts === 'object';
		Highcharts: typeof Highcharts = Highcharts;
		chartConstructor: string = 'stockChart';
		date_close: any;
		chartOptions1: Highcharts.Options;
		twoYrsAgo: any;
		ohlc: any;
		volume: any;
		chartOptions2: Highcharts.Options;

    constructor(
			private service : AppServiceService,
			private route: ActivatedRoute,
			private modalService: NgbModal
		) { }

    ngOnInit(): void {
      this.removeActiveClass();
      document.getElementById("rmWl").style.display = "none";
      document.getElementById("addWl").style.display = "none";
      document.getElementById("addPf").style.display = "none";
			
  		this.isFirstCall = true;
			this.isTValid = true;
			this.isAllLoaded = false;
			this.newQty = 0;

				let t_frm_url = this.route.snapshot.params.ticker;
				if(!(!(t_frm_url))) {  //if url ticker is not undefined or such... 
					this.service.getTicker(t_frm_url);  //sending ticker from url to service
				}

				this.service.getDetailsOne().subscribe((responseOne) => {		// turn this back on
					this.desc = responseOne[0];
					if (this.desc.hasOwnProperty("detail") && (this.desc.detail === 'Not found.')) {
					 this.isTValid = false;
					}
					else {
					 	this.isTValid = true;
					 	this.latestPrice = responseOne[1][0];
					 	var timestamp = this.latestPrice.timestamp;
					 	timestamp = timestamp.substring(0, timestamp.indexOf('T'));
					 	this.service.getDetailsTwo(timestamp).subscribe((responseTwo) => {
							this.dailyChartData = responseTwo[0];
							this.news = responseTwo[1];
							this.historicalData = responseTwo[2];
							this.articles = this.news.articles;
							this.handlingNews();
							this.handlingSummary();
							this.handlingDailyChart();
							this.handlingHistChart();
							this.isAllLoaded = true;
							if(this.timeDiff<60) {
								this.callAtIntervals();
							}
					 });
					}
				});
  }
	
	ngOnDestroy(): void {
		if(this.timeDiff<60) {clearInterval(this.call);}
		clearInterval(this.aCCrmWl);
		clearInterval(this.aCCaddWl);
		clearInterval(this.aCCaddPf);
	}
	
	callAtIntervals() {
		this.isFirstCall = false;	
		this.call = setInterval(() => {

			this.isTValid = true;
			this.service.getDetailsOne().subscribe((responseOne) => {
				this.desc = responseOne[0];
				if (this.desc.hasOwnProperty("detail") && (this.desc.detail === 'Not found.')) {
				 this.isTValid = false;
				}
				else {
				 this.isTValid = true;
				 this.latestPrice = responseOne[1][0];
				 var timestamp = this.latestPrice.timestamp;
				 timestamp = timestamp.substring(0, timestamp.indexOf('T'));
				 this.service.getDailyChart(timestamp).subscribe((responseThree) => {
					 this.dailyChartData = responseThree;
					 this.handlingSummary();
					 this.handlingDailyChart();
				 });
				}
			});

		}, 15000);
	}

  handlingSummary() {
		//star
		if (localStorage.getItem('watchlist') === null) { // if there is no watchlist empty star
      this.isInWL = false;
		}
		else {	// if there is watchlist
			let watchlist = JSON.parse(localStorage.getItem('watchlist'));
			if (this.desc.ticker in watchlist) {	// if ticker is in watchlist full star
        this.isInWL = true;
			}
			else {	// else empty star
        this.isInWL = false;
			}
		}

  	//current time
		var t_date = new Date();
		var t_day = this.addZero(t_date.getDate());
		var t_month = this.addZero(t_date.getMonth() + 1); // +1 because getMonth() method returns the month (from 0 to 11)
		var t_year = t_date.getFullYear();
		var t_h = this.addZero(t_date.getHours());
		var t_m = this.addZero(t_date.getMinutes());
		var t_s = this.addZero(t_date.getSeconds());
		this.today = t_year + "-" + t_month + "-" + t_day + " " + t_h + ":" + t_m + ":" + t_s;

		//	change and change percentage
		if(this.latestPrice.last && this.latestPrice.prevClose) {
			this.change = this.latestPrice.last - this.latestPrice.prevClose;
			var changePercentage = (this.change * 100)/this.latestPrice.prevClose;
      this.changeAndAll = this.change.toFixed(2) + " (" + changePercentage.toFixed(2) + "%)";
		}
		
		// so that modalTotal stays updated even though modal is stale
		this.modalTotal = this.newQty * this.latestPrice.last;

  	//market open/close
  	var jsonTimestamp = new Date(this.latestPrice.timestamp);
  	this.timeDiff = (t_date.valueOf() - jsonTimestamp.valueOf())/1000;
  	if (this.timeDiff >= 60) {	// market open
    	t_day = this.addZero(jsonTimestamp.getDate());
    	t_month = this.addZero(jsonTimestamp.getMonth() + 1); // +1 because getMonth() method returns the month (from 0 to 11)
    	t_year = jsonTimestamp.getFullYear();
    	t_h = this.addZero(jsonTimestamp.getHours());
    	t_m = this.addZero(jsonTimestamp.getMinutes());
    	t_s = this.addZero(jsonTimestamp.getSeconds());
    	this.mrktClsDT = t_year + "-" + t_month + "-" + t_day + " " + t_h + ":" + t_m + ":" + t_s;
  	}
  }

	handlingDailyChart() {
		this.date_close = []; // to remove previous chart data incase there is no data for next search
		var i=0;
		var len = this.dailyChartData.length;
		var chartColor = 'black';
		if(this.change < 0) { chartColor = 'red'; }
		else if(this.change > 0) { chartColor = 'green'; }
		if(len != 0) { // if there is chart data in current search
			while(i<len) {
				const UTC_date = Date.parse(this.dailyChartData[i].date);
				var temp_close = parseFloat(this.dailyChartData[i].close.toFixed(3));
				this.date_close[i] = [UTC_date, temp_close];
				i++;
			}
			this.chartOptions1 = { 
				chart: {
					height: 400
				},
				responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            }
					}]
				},
				title: {
            text: this.desc.ticker,
						style: {
							color: 'grey'
						}
        },
				rangeSelector: {
						enabled: false
				},
				time: {
					useUTC: false
				},
				series: [{
					name: this.desc.ticker,
					data: this.date_close,
					type: 'line',
					color: chartColor
				}],
				xAxis: {
					type: 'datetime',
					zoomEnabled: true,
					units: [['minute',[30]],['hour',[1]]]
				},
				yAxis: [{
					opposite: true,
					height: '100%',
					offset: 0
				}],
				plotOptions: {
					series: {
						pointPlacement: 'on'
					}
				},
				navigator: {
					series: {
							type: 'area',
							fillColor: chartColor
					}
				}
			};
		}
	}

	handlingHistChart() {
			// split the data set into ohlc and volume
    this.ohlc = [];
    this.volume = [];
		var len = this.historicalData.length;
		
		if(len > 0) { // if there is chart data in current search
			var i=0;
			while(i<len) {
				const UTC_date = Date.parse(this.historicalData[i].date);
				var o = this.historicalData[i].open;
				var h = this.historicalData[i].high;
				var l = this.historicalData[i].low;
				var c = this.historicalData[i].close;
				var v = this.historicalData[i].volume;
        this.ohlc.push([
           UTC_date, // the date
           o, // open
           h, // high
           l, // low
           c // close
        ]);

        this.volume.push([
           UTC_date, // the date
           v // the volume
        ]);
				i++;
    	}
    	// create the chart
				this.chartOptions2 = {

						rangeSelector: {
								selected: 2
						},

						title: {
								text: this.desc.ticker+' Historical'
						},

						subtitle: {
								text: 'With SMA and Volume by Price technical indicators'
						},

						yAxis: [{
								startOnTick: false,
								endOnTick: false,
								labels: {
										align: 'right',
										x: -3
								},
								title: {
										text: 'OHLC'
								},
								height: '60%',
								lineWidth: 2,
								resize: {
										enabled: true
								}
						}, {
								labels: {
										align: 'right',
										x: -3
								},
								title: {
										text: 'Volume'
								},
								top: '65%',
								height: '35%',
								offset: 0,
								lineWidth: 2
						}],

						tooltip: {
								split: true
						},

						plotOptions: {
								series: {
										dataGrouping: {
												units: [
													['day', [1]],
													['week', [1]]
//													['month', [1, 2, 3, 4, 6]]
												]
										}
								}
						},

						series: [{
								type: 'candlestick',
								name: this.desc.ticker,
								id: 'aapl',
								zIndex: 2,
								data: this.ohlc
						}, {
								type: 'column',
								name: 'Volume',
								id: 'volume',
								data: this.volume,
								yAxis: 1
						}, {
								type: 'vbp',
								linkedTo: 'aapl',
								params: {
										volumeSeriesID: 'volume'
								},
								dataLabels: {
										enabled: false
								},
								zoneLines: {
										enabled: false
								}
						}, {
								type: 'sma',
								linkedTo: 'aapl',
								zIndex: 1,
								marker: {
										enabled: false
								}
						}]
				};
		}
	}
  
  handlingNews() {
      var i=0, c=0, len=this.articles.length;
			while(i<len)
			{
				let tFine = this.articles[i].hasOwnProperty("title") && !(!this.articles[i].title); // title
				let utiFine = this.articles[i].hasOwnProperty("urlToImage") && !(!this.articles[i].urlToImage); // urlToImage
				let snFine = this.articles[i].source.hasOwnProperty("name") && !(!this.articles[i].source.name); // source.name
				let paFine = this.articles[i].hasOwnProperty("publishedAt") && !(!this.articles[i].publishedAt); // publishedAt
				let dFine = this.articles[i].hasOwnProperty("description") && !(!this.articles[i].description); // description
				let uFine = this.articles[i].hasOwnProperty("url") && !(!this.articles[i].url); // url
				if(!tFine || !utiFine  || !snFine || !paFine || !dFine || !uFine) {
					this.articles.splice(i,1);
                    len--;
				}
				i++;
			}
  }

	buyStock() {
		let thisTicker = this.desc.ticker;
		if (localStorage.getItem('pf') === null) { // if there is no portfolio make one and add ticker to it
			let pf = {};
			pf[thisTicker] = {'ticker': thisTicker, 'name': this.desc.name, 'qty': this.newQty, 'totC': this.modalTotal, 'avgC': (this.modalTotal/parseInt(this.newQty))};
			localStorage.setItem('pf', JSON.stringify(pf));
		}
		else {	// if there is portfolio
			let pf = JSON.parse(localStorage.getItem('pf'));
			localStorage.removeItem('pf');
			if (thisTicker in pf) {	// if ticker already in portfolio edit it
				pf[thisTicker].qty = parseInt(pf[thisTicker].qty) + parseInt(this.newQty);
				pf[thisTicker].totC = parseFloat(pf[thisTicker].totC) + this.modalTotal;
				pf[thisTicker].avgC = (parseFloat(pf[thisTicker].totC)/parseInt(pf[thisTicker].qty));
			}
			else {	// else add ticker to portfolio
				pf[thisTicker] = {'ticker': thisTicker, 'name': this.desc.name, 'qty': this.newQty, 'totC': this.modalTotal, 'avgC': (this.modalTotal/parseInt(this.newQty))};
				var orderedPf = {};
				Object.keys(pf).sort().forEach(function(key) {
					orderedPf[key] = pf[key];
				});
				pf = orderedPf;
			}
			localStorage.setItem('pf', JSON.stringify(pf));
		}
		this.autoDisappearAlert("addPf");
	}

	setOrRemoveFrmWl() {
		let thisTicker = this.desc.ticker;
		if (localStorage.getItem('watchlist') === null) { // if there is no watchlist make one and add ticker to it
			let watchlist = {};
			watchlist[thisTicker] = {'ticker': thisTicker, 'name': this.desc.name};
			localStorage.setItem('watchlist', JSON.stringify(watchlist));
      this.isInWL = true;
			this.autoDisappearAlert("addWl");
		}
		else {	// if there is watchlist
			let watchlist = JSON.parse(localStorage.getItem('watchlist'));
			localStorage.removeItem('watchlist');
			if (thisTicker in watchlist) {	// if ticker already in watchlist remove it
				if (Object.keys(watchlist).length === 1) {	// means only one element is there and we are deleting it
          this.isInWL = false;
					this.autoDisappearAlert("rmWl");
					return;
				}
				else {
					delete watchlist[thisTicker];
				}
        this.isInWL = false;
				this.autoDisappearAlert("rmWl");
			}
			else {	// else add ticker to watchlist
				watchlist[thisTicker] = {'ticker': thisTicker, 'name': this.desc.name};
        this.isInWL = true;
				this.autoDisappearAlert("addWl");
				var orderedWl = {};
				Object.keys(watchlist).sort().forEach(function(key) {
					orderedWl[key] = watchlist[key];
				});
				watchlist = orderedWl;
			}
			localStorage.setItem('watchlist', JSON.stringify(watchlist));
		}
	}

	openBuyModal(buycontent) {
		this.modalQty.setValue(0);
		this.modalTotal = 0.00;
		this.modalService.open(buycontent, {ariaLabelledBy: 'modal-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
		
		//to put cursor at the end of default value 0
		(<HTMLInputElement>document.getElementById("qty")).setAttribute('type', 'text');
		(<HTMLInputElement>document.getElementById("qty")).setSelectionRange(1,1); 
		(<HTMLInputElement>document.getElementById("qty")).setAttribute('type', 'number');
		
		document.getElementById('qty').addEventListener('input', (e) => {
			this.newQty = (<HTMLTextAreaElement>e.target).value;
			this.modalTotal = this.newQty * this.latestPrice.last;
		});
		(<HTMLInputElement>document.getElementById("finalBuy")).addEventListener('click', (e) => {
			this.buyStock();
		});
	}

	openNewsModal(newscontent, article) {
		this.newsModalContent = article;
		var d = new Date(this.newsModalContent.publishedAt);
		this.newsModalContent.publishedAt = d.toLocaleDateString("en-US", {month:"long", day:"2-digit"})+', '+d.toLocaleDateString("en-US", {year:"numeric"});
    this.modalService.open(newscontent, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  twitterURL() {
    this.tweetURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(this.newsModalContent.title) + '&url=' + encodeURIComponent(this.newsModalContent.url);
  }

	autoDisappearAlert(id) {
		this.alertCC = false;
		document.getElementById(id).style.display = "block";
		if(id === "rmWl") {
			this.aCCrmWl = setTimeout(function() {
        if(!(this.alertCC)) {
  			  document.getElementById(id).style.display = "none";
        }
  		}, 5000);
		}
		if(id === "addWl") {
			this.aCCaddWl = setTimeout(function() {
        if(!(this.alertCC)) {
  			  document.getElementById(id).style.display = "none";
        }
  		}, 5000);
		}
		if(id === "addPf") {
			this.aCCaddPf = setTimeout(function() {
        if(!(this.alertCC)) {
  			  document.getElementById(id).style.display = "none";
        }
  		}, 5000);
		}
	}

  closeAlert(id) {
		this.alertCC = true;
    document.getElementById(id).style.display = "none";
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
	
	isEmpty(value: any) {
		return (value == null || value.length === 0);
	}

	updateHTML(elmId, value) {
  	var elem = document.getElementById(elmId);
  	if(typeof elem !== 'undefined' && elem !== null) {
    	elem.innerHTML = value;
  	}
	}

	addZero(i) {   //sb-added
		if(i < 10) {
			i = "0" + i;
		}
		return i;
	}

  //sb-added
  removeActiveClass() {
  	document.querySelectorAll('.nav-item').forEach(item => {
  		item.classList.remove('active');
  	});
  }
}
