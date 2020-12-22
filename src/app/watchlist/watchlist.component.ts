import { Component, OnInit } from '@angular/core';
import { AppServiceService } from '../app-service.service';  //sb-added
import { Router } from '@angular/router';  //sb-added

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
	
	watchlist: any;
	latestPrice: any;
	last: any = {};
	lpc: any = {};
	change: any = {};
	changeAndAll: any = {};
	isWLinLS: boolean;

  constructor(private service : AppServiceService, private router: Router) { }

  ngOnInit(): void {
  	this.changeActiveClass();	//sb-added
		if (localStorage.getItem('watchlist') !== null) {
			this.isWLinLS = true;
  		document.getElementById("nostock").style.display = "none";
			let wl = Object.entries(JSON.parse(localStorage.getItem('watchlist')));
			let str:string;
			if(wl.length === 1) {
				str = wl[0][0];
			}
			else {
				str = wl[0][0];
				for(var i=1; i<wl.length; i++) {
					str = str+','+wl[i][0];
				}
			}
			this.service.getMultipleLP(str).subscribe((response) => {
				this.latestPrice = response;
				this.displayWl(wl);
			});
		}
		else {
			this.isWLinLS = false;
  		document.getElementById("nostock").style.display = "block";
		}
  }

  refreshPg() {
  	if (localStorage.getItem('watchlist') !== null) {
			this.isWLinLS = true;
  		document.getElementById("nostock").style.display = "none";
			let wl = Object.entries(JSON.parse(localStorage.getItem('watchlist')));
			let str:string;
			if(wl.length === 1) {
				str = wl[0][0];
			}
			else {
				str = wl[0][0];
				for(var i=1; i<wl.length; i++) {
					str = str+','+wl[i][0];
				}
			}
			this.service.getMultipleLP(str).subscribe((response) => {
				this.latestPrice = response;
				this.displayWl(wl);
			});
		}
		else {
			this.isWLinLS = false;
  		document.getElementById("nostock").style.display = "block";
		}
  }

	displayWl(wl) {
		//	change and change percentage
		for(var i=0; i<this.latestPrice.length; i++) {
			var thisT = this.latestPrice[i].ticker;
			this.lpc[thisT] = {last: this.latestPrice[i].last, prevClose: this.latestPrice[i].prevClose};
			
		}
		for(var i=0; i<wl.length; i++) {
			var thisT = wl[i][0];
			if(!(this.lpc[thisT].last)) {this.last[thisT] = ' -';}
			else {this.last[thisT] = this.lpc[thisT].last.toFixed(2);}
			if(!(this.lpc[thisT].last) || !(this.lpc[thisT].prevClose)) {
				this.changeAndAll[thisT] = ' -';
			}
			else {
				this.change[thisT] = this.lpc[thisT].last - this.lpc[thisT].prevClose;
				var changePercentage = (this.change[thisT] * 100)/this.lpc[thisT].prevClose;
				this.changeAndAll[thisT] = " " + this.change[thisT].toFixed(2) + " (" + changePercentage.toFixed(2) + "%)";
			}
		}
		this.watchlist = wl;
	}

	openDetails(ticker) {
		this.router.navigate(['details/'+ticker]); // , {relativeTo: this.route}
	}
	
	close(ticker) {
		let wl = JSON.parse(localStorage.getItem('watchlist'));
		localStorage.removeItem('watchlist');
		if (ticker in wl) {
			if (Object.keys(wl).length === 1) {	// means only one element is there and we are deleting it
				document.getElementById("wlcard"+ticker).style.display = "none";
				document.getElementById("nostock").style.display = "block";
				return;
			}
			else {
				delete wl[ticker];
			}
			document.getElementById("wlcard"+ticker).style.display = "none";
		}
		localStorage.setItem('watchlist', JSON.stringify(wl));
		this.refreshPg();
	}

  changeActiveClass() { //sb-added
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById('watchlist').classList.add('active');
  }

}
