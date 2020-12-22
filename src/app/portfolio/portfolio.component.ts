import { Component, OnInit } from '@angular/core';
import { AppServiceService } from '../app-service.service';  //sb-added
import { Router} from '@angular/router';  //sb-added	//, NavigationEnd 
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';	//sb-added - for modal
import { FormControl } from '@angular/forms'; //sb-added

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

	pf: any;
	latestPrice: any;
	last: any = {};
	change: any = {};
	marketVal: any = {};
	modalQty = new FormControl();
	regex = /^\d*$/;
	modalTotal = 0.00;
	modalMaxSellQty: any;
	modalContent: any;
	closeResult = '';
	isPFinLS: boolean;
	
  constructor (
		private service : AppServiceService,
		private router: Router,
		private modalService: NgbModal
	) { }

  ngOnInit(): void {
  	this.changeActiveClass();	//sb-added
  	if (localStorage.getItem('pf') === null) {
  		this.isPFinLS = false;
  		document.getElementById("nostock").style.display = "block";
  	}
  	else {
  		this.isPFinLS = true;
  		document.getElementById("nostock").style.display = "none";
  	}
		if (localStorage.getItem('pf') !== null) { //portfolio exists in local storage
			
			var portfolio = Object.entries(JSON.parse(localStorage.getItem('pf')));
			let str:string;
			if(portfolio.length === 1) {
				str = portfolio[0][0];
			}
			else {
				str = portfolio[0][0];
				for(var i=1; i<portfolio.length; i++) {
					str = str+','+portfolio[i][0];
				}
			}
			this.service.getMultipleLP(str).subscribe((response) => {
				this.latestPrice = response;
				this.displayPf(portfolio);
			});
		}
  }

  refreshPg() {
  	if (localStorage.getItem('pf') === null) {
  		this.isPFinLS = false;
  		document.getElementById("nostock").style.display = "block";
  	}
  	else {
  		this.isPFinLS = true;
  		document.getElementById("nostock").style.display = "none";
  	}
  	if (localStorage.getItem('pf') !== null) { //portfolio exists in local storage
			var portfolio = Object.entries(JSON.parse(localStorage.getItem('pf')));
			let str:string;
			if(portfolio.length === 1) {
				str = portfolio[0][0];
			}
			else {
				str = portfolio[0][0];
				for(var i=1; i<portfolio.length; i++) {
					str = str+','+portfolio[i][0];
				}
			}
			this.service.getMultipleLP(str).subscribe((response) => {
				this.latestPrice = response;
				this.displayPf(portfolio);
			});
		}
  }
	
	displayPf(portfolio) {
		for(var i=0; i<this.latestPrice.length; i++) {
			var thisT = this.latestPrice[i].ticker;
			if(!(this.latestPrice[i].last)) {
				this.last[thisT] = ' -';
				this.change[thisT] = ' -';
				this.marketVal[thisT] = ' -';
			}
			else {
				this.last[thisT] = this.latestPrice[i].last;
			}
		}
		for(var i=0; i<portfolio.length; i++) {
			var thisT = portfolio[i][0];
			if(this.last[thisT]!==' -') {
				this.change[thisT] = (parseFloat(this.last[thisT]) - parseFloat(portfolio[i][1].avgC)).toFixed(2);
				this.marketVal[thisT] = (parseFloat(this.last[thisT]) * parseInt(portfolio[i][1].qty)).toFixed(2);
				this.last[thisT] = this.last[thisT].toFixed(2);
			}
		}
		this.pf = portfolio;
	}

	openDetails(ticker) {
		this.router.navigate(['details/'+ticker]); // , {relativeTo: this.route}
	}

	openBuyModal(buycontent, thisTicker) {
		this.modalQty.setValue(0);
		this.modalContent = { 'ticker': thisTicker, 'last': this.last[thisTicker] };
		let newQty;
		this.modalService.open(buycontent, {ariaLabelledBy: 'modal-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    //to put cursor at the end of default value 0
		(<HTMLInputElement>document.getElementById("buyQty")).setAttribute('type', 'text');
		(<HTMLInputElement>document.getElementById("buyQty")).setSelectionRange(1,1); 
		(<HTMLInputElement>document.getElementById("buyQty")).setAttribute('type', 'number');
		
		document.getElementById('buyQty').addEventListener('input', (e) => {
			newQty = (<HTMLTextAreaElement>e.target).value;
			this.modalTotal = newQty * this.last[thisTicker];
		});
		(<HTMLInputElement>document.getElementById("finalBuy")).addEventListener('click', (e) => {
			this.buyStock(newQty, this.modalTotal, thisTicker);
		});
	}

	openSellModal(sellcontent, thisTicker) {
		this.modalQty.setValue(0);
		this.modalContent = { 'ticker': thisTicker, 'last': this.last[thisTicker] };
		let newQty;
		this.modalService.open(sellcontent, {ariaLabelledBy: 'modal-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    //to put cursor at the end of default value 0
		(<HTMLInputElement>document.getElementById("sellQty")).setAttribute('type', 'text');
		(<HTMLInputElement>document.getElementById("sellQty")).setSelectionRange(1,1); 
		(<HTMLInputElement>document.getElementById("sellQty")).setAttribute('type', 'number');

		this.modalMaxSellQty = (JSON.parse(localStorage.getItem('pf')))[thisTicker].qty;
		
		document.getElementById('sellQty').addEventListener('input', (e) => {
			newQty = (<HTMLTextAreaElement>e.target).value;
			this.modalTotal = newQty * this.last[thisTicker];
		});
		(<HTMLInputElement>document.getElementById("finalSell")).addEventListener('click', (e) => {
			this.sellStock(newQty, thisTicker);
		});
	}

	buyStock(newQty, newTot, thisTicker) {
		let pf = JSON.parse(localStorage.getItem('pf'));
		localStorage.removeItem('pf');
		pf[thisTicker].qty = parseInt(pf[thisTicker].qty) + parseInt(newQty);
		pf[thisTicker].totC = parseFloat(pf[thisTicker].totC) + parseFloat(newTot);
		pf[thisTicker].avgC = (parseFloat(pf[thisTicker].totC)/parseInt(pf[thisTicker].qty));
		localStorage.setItem('pf', JSON.stringify(pf));
		this.refreshPg();
	}

	sellStock(newQty, thisTicker) {
		let pf = JSON.parse(localStorage.getItem('pf'));
		localStorage.removeItem('pf');
		if(parseInt(newQty) === parseInt(pf[thisTicker].qty)) {
			document.getElementById("pfcard"+thisTicker).style.display = "none";
			if(Object.keys(pf).length === 1) {
				document.getElementById("nostock").style.display = "block";
				return;
			}
			else {
				delete pf[thisTicker];
			}
		}
		else {
			pf[thisTicker].qty = parseInt(pf[thisTicker].qty) - parseInt(newQty);
			pf[thisTicker].totC = parseFloat(pf[thisTicker].totC) - (parseFloat(pf[thisTicker].avgC) * parseInt(newQty));
		}
		localStorage.setItem('pf', JSON.stringify(pf));
		this.refreshPg();
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

  changeActiveClass() { //sb-added
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById('portfolio').classList.add('active');
  }

}
