import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';  //sb-added - FormControl for autocomplete
import { AppServiceService } from '../app-service.service';  //sb-added
import { ActivatedRoute, Router } from '@angular/router';  //sb-added

let debounce = function(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

//	options: string[] = ['aapl', 'amd', 'amzn', 'eric', 'ed', 'ge', 'googl', 'nvda', 'wmg', 'wdc'];
	objectOptions: any;
	myFormControl = new FormControl();
	isLoaded: boolean;
	inputTxt: string = '';
	
  constructor(private service : AppServiceService, private route: ActivatedRoute, private router: Router) {  //sb-edited ...was constructor() {}
  }

  ngOnInit(): void {
  	this.changeActiveClass();	//sb-added
		this.isLoaded = false;
		document.getElementById('inputticker').addEventListener('input', this.efficientSearch);
  }

	formDisplay(formIp) {	//sb-added
		return formIp ? formIp.ticker : undefined;
	}	
	
	efficientSearch = debounce((event) => {
		this.isLoaded = false;
		this.objectOptions = null;
		var options;
		this.inputTxt = event.target.value;
		if (this.inputTxt !== '') {
			this.service.getCompanies(this.inputTxt).subscribe((response) => {
				options = response;
				var len = options.length;
				for(var i=0; i<len; i++) {
					if(!(options[i].name) || !(options[i].ticker)) {
						options.splice(i, 1);
						len--;
					}
				}
				this.objectOptions = options;
				this.isLoaded = true;
				this.inputTxt = '';
			});
		}
	},400, undefined);
	
  onSubmit(event: Event) {  //sb-added	//, searchForm: NgForm
    event.preventDefault();
    var t_frm_search = (<HTMLInputElement>document.getElementById('inputticker')).value;
    this.service.getTicker(t_frm_search);
    this.router.navigate(['details/'+t_frm_search], {relativeTo: this.route});
  }

  changeActiveClass() { //sb-added
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById('search').classList.add('active');
  }
}
